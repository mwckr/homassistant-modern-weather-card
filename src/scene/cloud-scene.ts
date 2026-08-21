import {
  CLOUD_AIRY,
  CLOUD_DECK,
  CLOUD_FLAT,
  CLOUD_FLAT_SOFT,
  CLOUD_WISP,
  CLOUD_WISP_SOFT,
  SUN_FLARE,
  SUN_PLAIN,
} from '../assets.gen';
import type { TimeOfDay } from '../types';

// photographic sky composition: layered cloud sprites and a sun, sized and
// placed per condition. Rendered through unsafeHTML — the string for a given
// (condition, timeOfDay) is deterministic, so lit never re-parses the DOM and
// the CSS animations run uninterrupted across card re-renders.
//
// Motion comes in two kinds. Drifting clouds start fully off the left edge
// and cross the whole card at a constant speed, then wrap — continuous,
// Apple-like, and fast enough that the compositor never steps them by
// whole pixels. Only the oversized diffuse decks sway in place.
//
// Softness is baked into the sprites (CLOUD_*_SOFT / CLOUD_DECK); the card
// applies no spatial CSS filters to clouds, only brightness and the scene
// tone — large blurred GPU layers are where seams and jank come from.

interface CloudSpec {
  src: string;
  /** percentages of the sky box */
  top: number;
  width: number;
  opacity: number;
  /** per-sprite brightness, used to push layers into the distance */
  bright?: number;
  flip?: boolean;
  /** seconds to cross the card; `left` is ignored for drifting clouds */
  drift?: number;
  /** anchored clouds: position and sway amplitude px / period s */
  left?: number;
  amp?: number;
  dur?: number;
  /** negative delay = phase offset, so the sky is populated at load */
  delay?: number;
  /** underbelly shading strength 0..1 (default 1; diffuse decks use less) */
  shade?: number;
}

interface SunSpec {
  left: number;
  top: number;
  width: number;
  opacity: number;
  src: string;
}

// each cloud is a wrapper (animated, filtered) holding the sprite and a
// shading layer masked by the sprite's own silhouette: a sky-colored
// gradient multiplied in from the bottom gives the cloud an underbelly and
// seats it in the scene instead of floating as a flat white cutout.
// The tone filter is applied PER SPRITE, never on the layer: a filter on
// the shared parent would cut the sun's screen blend off from the sky.
const cloudEl = (c: CloudSpec, tone: string, shade: string): string => {
  const filters: string[] = [];
  if (c.bright !== undefined) filters.push(`brightness(${c.bright})`);
  if (tone) filters.push(tone);
  // travel in container-query units: 100cqw is the card width, so a sprite
  // W% wide moves exactly (100 + W)% — off the left edge to off the right
  const motion =
    c.drift != null
      ? `left:${-c.width}%;--travel:${(100 + c.width).toFixed(1)}cqw;animation:mwc-drift ${c.drift}s linear infinite;`
      : `left:${c.left ?? 0}%;--amp:${c.amp ?? 12}px;--dur:${c.dur ?? 60}s;`;
  const shadeStyle = `--shade:${shade};--shade-k:${c.shade ?? 1};mask-image:url(${c.src});-webkit-mask-image:url(${c.src})`;
  // flip via the standalone `scale` property so it composes with the
  // translateX animation instead of fighting it
  return `<div class="cloud" style="${motion}top:${c.top}%;width:${c.width}%;opacity:${c.opacity};${filters.length ? `filter:${filters.join(' ')};` : ''}${c.flip ? 'scale:-1 1;' : ''}animation-delay:${c.delay ?? 0}s"><img class="cloud-img" src="${c.src}" alt="" draggable="false"/><span class="cloud-shade" style="${shadeStyle}"></span></div>`;
};

// underbelly color: the sky's own mood, so clouds pick up their surroundings
const shadeFor = (condition: string, timeOfDay: TimeOfDay): string => {
  const wet = ['rainy', 'pouring', 'hail', 'snowy-rainy'].includes(condition);
  const storm = condition === 'lightning' || condition === 'lightning-rainy';
  const overcast = wet || storm || condition === 'cloudy' || condition === 'snowy' || condition === 'fog';
  if (timeOfDay === 'night') return 'rgba(6, 10, 22, 0.66)';
  if (timeOfDay === 'dusk') return 'rgba(80, 48, 82, 0.5)';
  if (timeOfDay === 'dawn') return 'rgba(110, 72, 70, 0.42)';
  if (storm) return 'rgba(22, 28, 42, 0.74)';
  if (wet) return 'rgba(36, 46, 64, 0.72)';
  if (overcast) return 'rgba(82, 94, 116, 0.46)';
  return 'rgba(58, 104, 176, 0.44)';
};

const sunImg = (s: SunSpec, tone: string): string =>
  `<img class="sun-img" src="${s.src}" alt="" draggable="false" style="left:${s.left}%;top:${s.top}%;width:${s.width}%;--sun-op:${s.opacity};${tone ? `filter:${tone};` : ''}"/>`;

// cloud fleets by coverage level. Drift delays are chosen so sprites sit at
// staggered positions across the card on first paint.
// clear sky: a single faint distant cloudlet, upper right
const FLEET_FEW: CloudSpec[] = [
  { src: CLOUD_FLAT_SOFT, top: 6, width: 42, opacity: 0.5, bright: 1.05, drift: 160, delay: -136 },
];

// airy fair-weather sky: translucent cloudlets at three depths, the back
// ones slow and soft, the front ones quicker — nothing dense
// every sprite's bottom stays above ~50% of the sky: the wisps are square
// (height ≈ 1.17 × width) and would otherwise hang into the fade zone
const FLEET_PARTLY: CloudSpec[] = [
  { src: CLOUD_WISP_SOFT, top: -22, width: 56, opacity: 0.32, bright: 1.02, drift: 150, delay: -67, shade: 0.5 },
  { src: CLOUD_FLAT_SOFT, top: 2, width: 52, opacity: 0.45, bright: 1.02, drift: 115, delay: -80, shade: 0.7 },
  { src: CLOUD_AIRY, top: 10, width: 58, opacity: 0.82, bright: 1.0, drift: 85, delay: -42 },
  { src: CLOUD_WISP, top: 4, width: 36, opacity: 0.45, bright: 1.03, drift: 70, delay: -56, shade: 0.7 },
  { src: CLOUD_AIRY, top: 16, width: 50, opacity: 0.55, bright: 1.0, drift: 58, delay: -35, flip: true },
  { src: CLOUD_FLAT, top: 24, width: 40, opacity: 0.32, bright: 1.0, drift: 50, delay: -45, flip: true },
];

// ── dense skies are generated, not hand-placed ──────────────────────────
// Overcast / rain / storm / snow: two full-bleed diffuse decks embed the
// scene; a CEILING row of big clouds hangs over the top edge (their tops cut
// off by the card, as if the deck continues above it — the Apple look); and
// a SCATTERED field fills the sky below. Every cloud gets its own hashed
// size, height, opacity, brightness and crossing speed, so the layers slide
// past each other at slightly different rates — parallax from many sprites.
// The hash is deterministic, so the composition never changes on re-render.

const hash = (i: number, k: number): number => {
  const x = Math.sin(i * 12.9898 + k * 78.233 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// soft, translucent sprites only — the dense renders are gone for good.
// Equal weights: variety of silhouette is what makes a field read as many
// different clouds instead of one sprite repeated.
const CEILING_SPRITES = [CLOUD_AIRY, CLOUD_FLAT_SOFT, CLOUD_WISP_SOFT, CLOUD_FLAT];
const FIELD_SPRITES = [CLOUD_AIRY, CLOUD_FLAT_SOFT, CLOUD_FLAT, CLOUD_WISP];

interface DenseOpts {
  seed: number;
  ceiling: number;
  scattered: number;
  ceilWidth: [number, number];
  ceilOpacity: [number, number];
  fieldTop: [number, number];
  fieldWidth: [number, number];
  fieldOpacity: [number, number];
  bright: [number, number];
}

// stratified placement: cloud i owns vertical band i/n (jittered), so the
// sky fills top to bottom with no vacuum; horizontal phases follow the
// golden ratio, so the clouds are evenly spread across the card at any
// moment; sizes span small puffs to large banks, skewed toward small
const GOLDEN = 0.618034;

// sprite height as a fraction of its width, in sky-box percent units
// (the sky box is ~0.85× as tall as the card is wide)
const aspectOf = (src: string): number =>
  src === CLOUD_WISP || src === CLOUD_WISP_SOFT ? 1.17 : 0.65;

const denseFleet = (o: DenseOpts): CloudSpec[] => {
  const specs: CloudSpec[] = [];
  for (let i = 0; i < o.ceiling; i++) {
    const s = o.seed + i;
    const drift = lerp(100, 180, hash(s, 6));
    const phase = (i * GOLDEN + hash(s, 7) * 0.25) % 1;
    const src = CEILING_SPRITES[(i + Math.floor(hash(s, 1) * 3)) % CEILING_SPRITES.length];
    const width = lerp(o.ceilWidth[0], o.ceilWidth[1], hash(s, 3));
    // position from the cloud's own height: 25–50% of it hides above the
    // card, the rest drapes into the top third of the sky
    const height = width * aspectOf(src);
    specs.push({
      src,
      top: -height * lerp(0.25, 0.5, hash(s, 2)),
      width,
      opacity: lerp(o.ceilOpacity[0], o.ceilOpacity[1], hash(s, 4)),
      bright: lerp(o.bright[0], o.bright[1], hash(s, 5)),
      drift,
      delay: -phase * drift,
      flip: hash(s, 8) > 0.5,
      shade: lerp(0.5, 0.85, hash(s, 9)),
    });
  }
  for (let i = 0; i < o.scattered; i++) {
    const s = o.seed + 100 + i;
    const drift = lerp(60, 160, hash(s, 6));
    const phase = (i * GOLDEN + hash(s, 7) * 0.25) % 1;
    const band = (i + hash(s, 2)) / o.scattered;
    const size = Math.pow(hash(s, 3), 1.4);
    specs.push({
      src: FIELD_SPRITES[(i + Math.floor(hash(s, 1) * 3)) % FIELD_SPRITES.length],
      // later clouds sit lower AND paint in front — natural perspective;
      // the field is biased upward and lower clouds are smaller, so the
      // density sits under the ceiling instead of piling onto the text
      top: lerp(o.fieldTop[0], o.fieldTop[1], band),
      width: lerp(o.fieldWidth[0], o.fieldWidth[1], size) * (1 - 0.3 * band),
      opacity: lerp(o.fieldOpacity[0], o.fieldOpacity[1], hash(s, 4)),
      bright: lerp(o.bright[0], o.bright[1], hash(s, 5)),
      drift,
      delay: -phase * drift,
      flip: hash(s, 8) > 0.5,
      shade: lerp(0.7, 1, hash(s, 9)),
    });
  }
  return specs;
};

const FLEET_BROKEN: CloudSpec[] = [
  { src: CLOUD_DECK, left: -30, top: -34, width: 160, opacity: 0.55, bright: 1.0, amp: 30, dur: 64, delay: -40, shade: 0.35 },
  { src: CLOUD_DECK, left: -12, top: -14, width: 150, opacity: 0.5, bright: 1.04, amp: 26, dur: 52, delay: -12, flip: true, shade: 0.35 },
  ...denseFleet({
    seed: 11,
    ceiling: 8,
    scattered: 9,
    ceilWidth: [55, 105],
    ceilOpacity: [0.55, 0.85],
    fieldTop: [-10, 32],
    fieldWidth: [20, 60],
    fieldOpacity: [0.4, 0.8],
    bright: [0.96, 1.04],
  }),
];

// heavy sky for rain/storm/snow: the structure lives in a dense, wide
// ceiling (plus a third deck across the top); the field below is only
// small faint texture — no solitary cumulus wandering through the rain
const FLEET_HEAVY: CloudSpec[] = [
  { src: CLOUD_DECK, left: -35, top: -38, width: 170, opacity: 0.5, bright: 0.86, amp: 30, dur: 66, delay: -44, shade: 0.35 },
  { src: CLOUD_DECK, left: -15, top: -16, width: 160, opacity: 0.45, bright: 0.8, amp: 26, dur: 54, delay: -16, flip: true, shade: 0.35 },
  { src: CLOUD_DECK, left: -25, top: -44, width: 150, opacity: 0.5, bright: 0.78, amp: 22, dur: 58, delay: -30, shade: 0.35 },
  ...denseFleet({
    seed: 37,
    ceiling: 10,
    scattered: 8,
    ceilWidth: [60, 110],
    ceilOpacity: [0.65, 0.95],
    fieldTop: [-8, 26],
    fieldWidth: [16, 46],
    fieldOpacity: [0.3, 0.62],
    bright: [0.96, 1.08],
  }),
];

const FLEET_FOG: CloudSpec[] = [
  { src: CLOUD_FLAT_SOFT, top: 24, width: 70, opacity: 0.4, bright: 1.04, drift: 150, delay: -60 },
  { src: CLOUD_FLAT_SOFT, top: 40, width: 66, opacity: 0.35, bright: 1.02, drift: 170, delay: -119, flip: true },
];

const dayFleet = (condition: string): CloudSpec[] => {
  switch (condition) {
    case 'sunny':
    case 'clear-night':
      return FLEET_FEW;
    case 'partlycloudy':
    case 'windy':
    case 'windy-variant':
      return FLEET_PARTLY;
    case 'cloudy':
      return FLEET_BROKEN;
    case 'fog':
      return FLEET_FOG;
    case 'rainy':
    case 'pouring':
    case 'hail':
    case 'lightning':
    case 'lightning-rainy':
    case 'snowy':
    case 'snowy-rainy':
      return FLEET_HEAVY;
    case 'exceptional':
      return FLEET_PARTLY;
    default:
      return FLEET_FEW;
  }
};

// global pace: fleet numbers are tuned relative to each other; this scales
// every crossing/sway period (delays scale with it so phases are unchanged)
const PACE = 1.5;
// windy scenes drive the same fleet faster
const WINDY_FACTOR = 0.45;

const sunFor = (condition: string, timeOfDay: TimeOfDay): SunSpec | null => {
  if (timeOfDay === 'night') return null;
  // low sun sits where the day arc meets the horizon: east at dawn, west at
  // dusk — clear of the temperature block on the left
  const lowSun = timeOfDay === 'dawn' || timeOfDay === 'dusk';
  const lowLeft = timeOfDay === 'dawn' ? 14 : 56;
  switch (condition) {
    case 'sunny':
      return lowSun
        ? { src: SUN_PLAIN, left: lowLeft, top: 34, width: 44, opacity: 0.9 }
        : { src: SUN_FLARE, left: -6, top: -10, width: 58, opacity: 0.95 };
    case 'partlycloudy':
    case 'windy':
    case 'windy-variant':
      return lowSun
        ? { src: SUN_PLAIN, left: lowLeft, top: 32, width: 40, opacity: 0.8 }
        : { src: SUN_PLAIN, left: -4, top: -8, width: 44, opacity: 0.92 };
    // overcast scenes get no sun disc — like Apple's gray skies
    default:
      return null;
  }
};

export const renderPhotoScene = (condition: string, timeOfDay: TimeOfDay): string => {
  const windy = condition === 'windy' || condition === 'windy-variant';
  const sun = sunFor(condition, timeOfDay);
  const rawTone = getPhotoTone(condition, timeOfDay);
  const tone = rawTone === 'none' ? '' : rawTone;
  // the sun is a light source: it takes the tone's color cast (sepia/hue)
  // but never its dimming — a darkened screen-blend reads as mud, not glow
  const sunTone = tone.replace(/brightness\([^)]*\)\s*/g, '').trim();
  const shade = shadeFor(condition, timeOfDay);
  const pace = windy ? PACE * WINDY_FACTOR : PACE;
  const clouds = dayFleet(condition)
    .map((c) => ({
      ...c,
      dur: c.dur === undefined ? undefined : Math.max(14, c.dur * pace),
      drift: c.drift === undefined ? undefined : Math.max(18, c.drift * pace),
      delay: (c.delay ?? 0) * pace,
    }))
    .map((c) => cloudEl(c, tone, shade))
    .join('');
  return `${sun ? sunImg(sun, sunTone) : ''}${clouds}`;
};

// tone filter per sprite: time of day and weather mood
const getPhotoTone = (condition: string, timeOfDay: TimeOfDay): string => {
  const wet = ['rainy', 'pouring', 'hail', 'snowy-rainy'].includes(condition);
  const storm = condition === 'lightning' || condition === 'lightning-rainy';

  // clouds stay relatively light so their tops read against dark skies —
  // the underbelly shade (shadeFor) carries the darkness and the structure
  if (timeOfDay === 'night') {
    if (storm) return 'brightness(0.46) saturate(0.7)';
    if (wet) return 'brightness(0.48) saturate(0.72)';
    return 'brightness(0.5) saturate(0.75)';
  }
  if (timeOfDay === 'dawn') {
    return 'brightness(0.88) sepia(0.22) hue-rotate(-14deg) saturate(1.05)';
  }
  if (timeOfDay === 'dusk') {
    if (storm || wet) return 'brightness(0.52) sepia(0.18) hue-rotate(-16deg) saturate(0.85)';
    return 'brightness(0.62) sepia(0.28) hue-rotate(-22deg)';
  }
  // day
  if (storm) return 'brightness(0.66) saturate(0.78)';
  if (wet) return 'brightness(0.82) saturate(0.85)';
  if (condition === 'snowy') return 'brightness(0.92) saturate(0.9)';
  if (condition === 'cloudy') return 'brightness(0.97)';
  return 'none';
};
