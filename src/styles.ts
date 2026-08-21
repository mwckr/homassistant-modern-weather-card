import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    font-family: 'Segoe UI Variable Display', 'Segoe UI', Roboto, -apple-system, sans-serif;
    isolation: isolate;
    container-type: inline-size;
  }
  ha-card {
    display: block;
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    overflow: visible;
  }
  ha-card[data-action]:not([data-action='none']) {
    cursor: pointer;
  }
  ha-card:focus {
    outline: none;
  }
  ha-card:focus-visible .frame {
    outline: 2px solid rgba(255, 255, 255, 0.65);
    outline-offset: 3px;
  }

  /* the frame is the whole card: sky on top fading into a surface zone that
     hosts the glass tiles and the forecast pill. Surface tone tracks time of
     day (bright by day, slate at night), not the dashboard theme, so the
     card stays one self-contained scene. */
  .frame {
    position: relative;
    border-radius: var(--modern-weather-radius, 34px);
    background: var(--mwc-surface);
    overflow: hidden;
    min-height: 120px;
    box-shadow:
      0 18px 40px -14px rgba(15, 23, 42, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.2);
    /* no background transition: the sky-fade gradient above it can't
       animate, so an animating surface color would split from it at the
       sky's bottom edge for the whole transition */
  }
  .frame.mode-light {
    --mwc-surface: #eef1f6;
    --mwc-ink: #1a2232;
    --mwc-ink-soft: rgba(26, 34, 50, 0.58);
    --mwc-tile-bg: rgba(255, 255, 255, 0.72);
    --mwc-tile-border: rgba(255, 255, 255, 0.85);
    --mwc-pill-bg: rgba(255, 255, 255, 0.82);
    --mwc-track: rgba(26, 34, 50, 0.1);
  }
  .frame.mode-dark {
    --mwc-surface: #0c111e;
    --mwc-ink: #edf2fa;
    --mwc-ink-soft: rgba(237, 242, 250, 0.6);
    --mwc-tile-bg: rgba(148, 163, 184, 0.1);
    --mwc-tile-border: rgba(255, 255, 255, 0.07);
    --mwc-pill-bg: rgba(148, 163, 184, 0.1);
    --mwc-track: rgba(237, 242, 250, 0.16);
  }

  /* sky scene: gradient, photographic cloud/sun sprites, and the canvas
     precipitation layer, softened into the surface by the fade overlay.
     --storm-lit is pulsed by the lightning engine to light the whole scene. */
  /* isolation keeps the sky's internal z-indexes (fade, layers) contained
     so they can never paint over the content; without it (and without the
     old filter that used to create this context) they would escape */
  .sky {
    position: absolute;
    inset: 0 0 auto 0;
    height: 64%;
    isolation: isolate;
    transition: background 1.5s ease-in-out;
  }
  /* lightning lift: one card-wide overlay that fades out toward the bottom,
     so a strike lights sky AND surface continuously — an overlay confined
     to the sky box drew a hard line along its bottom edge on every flash.
     Plain overlay, never a filter on the sky (permanent render surface). */
  .frame::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 4;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgb(222, 230, 246) 0%,
      rgb(222, 230, 246) 42%,
      rgba(222, 230, 246, 0) 88%
    );
    opacity: var(--storm-lit, 0);
    transition: opacity 0.45s ease-out;
  }
  .frame.storm-lit::after {
    transition: none;
  }
  .stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }
  .scene-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }
  /* no filter on this layer, ever — it would isolate the stacking context
     and sever the sun's screen blend from the sky (tones are per sprite) */
  .photo-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    overflow: hidden;
  }
  /* no will-change: forcing a composited layer per cloud multiplies GPU
     surfaces (seam-prone on fractional DPR) for no gain — transform
     animations are promoted automatically */
  .cloud {
    position: absolute;
    animation: mwc-sway var(--dur, 45s) ease-in-out infinite alternate;
  }
  .cloud-img {
    display: block;
    width: 100%;
    height: auto;
  }
  /* underbelly: a sky-colored gradient masked by the cloud's own alpha and
     multiplied onto it — bright top, shaded base, like a lit volume */
  .cloud-shade {
    position: absolute;
    inset: 0;
    pointer-events: none;
    mix-blend-mode: multiply;
    opacity: var(--shade-k, 1);
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 26%, var(--shade) 100%);
    mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
  }
  @keyframes mwc-drift {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(var(--travel, 150cqw));
    }
  }
  /* breathe via opacity only: scaling the photographic starburst resamples
     its rays every frame and shimmers ("janks in a star pattern"). The
     radial mask guarantees the sprite fades out before its own rectangle,
     so no straight seam can appear on the sky. */
  .sun-img {
    position: absolute;
    mix-blend-mode: screen;
    opacity: var(--sun-op, 1);
    mask-image: radial-gradient(closest-side, #000 55%, transparent 97%);
    -webkit-mask-image: radial-gradient(closest-side, #000 55%, transparent 97%);
    animation: mwc-breathe 11s ease-in-out infinite;
  }
  @keyframes mwc-sway {
    from {
      transform: translateX(calc(-1 * var(--amp, 12px)));
    }
    to {
      transform: translateX(var(--amp, 12px));
    }
  }
  @keyframes mwc-breathe {
    50% {
      opacity: calc(var(--sun-op, 1) * 0.84);
    }
  }
  .weather-tint {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    transition: background 1.5s ease;
  }
  .weather-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 6;
    overflow: hidden;
  }
  .sky-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 58%;
    pointer-events: none;
    z-index: 7;
    background: linear-gradient(180deg, transparent, var(--mwc-surface) 94%);
    transition: background 1.5s ease-in-out;
  }

  .content {
    position: relative;
    z-index: 6;
    display: flex;
    flex-direction: column;
    padding: 18px 22px 22px;
  }

  .top-row {
    display: flex;
    justify-content: center;
  }
  .loc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
    letter-spacing: 0.3px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  /* upper scene band: sun-path arc behind, weather icon top-left, big
     temperature bottom-left — mirrors the reference layout */
  .upper {
    position: relative;
    height: 174px;
    margin-top: 4px;
  }
  .sun-arc {
    position: absolute;
    left: -22px;
    right: -22px;
    top: 4px;
    height: 190px;
    pointer-events: none;
  }
  .sun-dot {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow:
      0 0 0 7px rgba(255, 255, 255, 0.22),
      0 0 22px 6px rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition:
      left 1.5s ease,
      top 1.5s ease;
  }

  .hero-icon {
    position: absolute;
    top: -8px;
    left: -10px;
  }
  .hero-icon svg {
    display: block;
    width: 96px;
    height: 96px;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
  }

  .temp-block {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 2;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  }
  .temp {
    font-size: 64px;
    font-weight: 200;
    line-height: 1;
    color: #ffffff;
    letter-spacing: -2px;
  }
  .cond {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
    margin-top: 5px;
  }
  .short-fc {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.16);
    padding: 4px 10px;
    border-radius: 999px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    width: fit-content;
    max-width: 180px;
    margin-top: 9px;
  }

  /* clock + date row sitting where the arc meets the surface */
  .meta-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: baseline;
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.92);
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.22);
  }
  .mr-time {
    grid-column: 2;
    font-size: 14px;
    font-weight: 500;
  }
  .mr-date {
    grid-column: 3;
    justify-self: end;
    font-size: 13px;
    font-weight: 500;
  }
  .frame.mode-light .meta-row {
    color: rgba(38, 48, 68, 0.72);
    text-shadow: none;
  }

  /* glass metric tiles */
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }
  .tile {
    background: var(--mwc-tile-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--mwc-tile-border);
    border-radius: 22px;
    padding: 13px 16px 15px;
    color: var(--mwc-ink);
    box-shadow: 0 12px 26px -18px rgba(15, 23, 42, 0.45);
  }
  .tile-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--mwc-ink-soft);
  }
  .tile-head span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-head svg {
    flex-shrink: 0;
  }
  .tile-value {
    margin-top: 7px;
    font-size: 30px;
    font-weight: 650;
    letter-spacing: -0.8px;
    line-height: 1;
  }
  .tile-unit {
    font-size: 15px;
    font-weight: 500;
    color: var(--mwc-ink-soft);
    letter-spacing: 0;
    margin-left: 1px;
  }
  .tile-foot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }
  .tile-label {
    font-size: 12.5px;
    font-weight: 500;
    color: var(--mwc-ink-soft);
    white-space: nowrap;
  }
  .meter {
    position: relative;
    flex: 1;
    min-width: 40px;
    height: 8px;
    border-radius: 999px;
  }
  .meter.scale {
    background: linear-gradient(
      90deg,
      #34d399,
      #fbbf24 30%,
      #fb923c 48%,
      #ef4444 65%,
      #c084fc 82%,
      #9f1239
    );
  }
  .meter-thumb {
    position: absolute;
    top: 50%;
    width: 6px;
    height: 16px;
    border-radius: 3px;
    background: #ffffff;
    box-shadow: 0 1px 4px rgba(15, 23, 42, 0.35);
    transform: translate(-50%, -50%);
  }
  .meter.fill {
    background: var(--mwc-track);
    overflow: hidden;
  }
  .meter-fill {
    height: 100%;
    border-radius: inherit;
    min-width: 8px;
  }

  /* full-card precipitation canvas BEHIND the content: rain falls past the
     text and splashes on the tiles' top edge, but never over the boxes */
  .fx-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
  }

  /* water beads on the card glass during rain: each drop refracts what it
     sits on via backdrop-filter and cycles in, slides, and rolls away.
     Deliberately faint — they should be discovered, not noticed. */
  .drops-layer {
    position: absolute;
    inset: 0;
    z-index: 8;
    pointer-events: none;
  }
  .rain-drop {
    position: absolute;
    border-radius: 46% 54% 58% 42% / 52% 46% 54% 48%;
    background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.16),
      rgba(255, 255, 255, 0.04) 55%,
      rgba(90, 110, 140, 0.06)
    );
    box-shadow:
      inset 0 -1px 1.5px rgba(255, 255, 255, 0.22),
      inset 0 1px 1px rgba(15, 23, 42, 0.1),
      0 1px 1.5px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(1.8px) brightness(1.07) saturate(1.06);
    -webkit-backdrop-filter: blur(1.8px) brightness(1.07) saturate(1.06);
    opacity: 0;
    animation: mwc-drop var(--ddur, 11s) linear infinite;
    animation-delay: var(--ddelay, 0s);
  }
  @keyframes mwc-drop {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0.5);
    }
    5% {
      opacity: 0.7;
      transform: translateY(0) scale(1);
    }
    72% {
      opacity: 0.7;
      transform: translateY(var(--dslide, 6px)) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(calc(var(--dslide, 6px) * 2.4)) scale(0.94);
    }
  }

  .error-overlay {
    display: flex;
    position: absolute;
    inset: 0;
    z-index: 20;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    padding: 16px;
    color: var(--error-color, #ef4444);
    font-size: 13px;
    text-align: center;
  }

  /* forecast chips inside a floating pill, the reference's bottom bar */
  .forecast {
    display: flex;
    gap: 6px;
    margin-top: 14px;
    padding: 11px 16px 12px;
    border-radius: 30px;
    background: var(--mwc-pill-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--mwc-tile-border);
    box-shadow: 0 14px 28px -20px rgba(15, 23, 42, 0.5);
  }
  .fc-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 2px 0;
    transition: transform 0.2s ease;
  }
  @media (hover: hover) {
    .fc-day:hover {
      transform: translateY(-2px);
    }
  }
  .fc-d {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: var(--mwc-ink-soft);
  }
  .fc-d.today {
    color: var(--modern-weather-accent, #f59e0b);
  }
  .fc-icon {
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .fc-t {
    font-size: 13px;
    font-weight: 600;
    color: var(--mwc-ink);
  }
  .fc-lo {
    font-size: 11px;
    font-weight: 400;
    color: var(--mwc-ink-soft);
    margin-top: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .weather-layer {
      display: none;
    }
    .cloud,
    .sun-img {
      animation: none;
    }
    .rain-drop {
      animation: none;
      opacity: 0.55;
    }
    .sun-dot {
      transition: none;
    }
  }

  /* narrow columns: shrink the scene band so the arc stays graceful */
  @container (max-width: 380px) {
    .content {
      padding: 16px 18px 18px;
    }
    .upper {
      height: 148px;
    }
    .sun-arc {
      left: -18px;
      right: -18px;
      height: 162px;
    }
    .temp {
      font-size: 54px;
    }
    .hero-icon svg {
      width: 80px;
      height: 80px;
    }
    .tile-value {
      font-size: 26px;
    }
    /* keep "Air Quality Index" on one line in half-width tiles */
    .tile-head {
      font-size: 11.5px;
    }
    .tile-head svg {
      display: none;
    }
  }
`;
