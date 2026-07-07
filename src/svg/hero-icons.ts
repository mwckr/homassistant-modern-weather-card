import { renderSnowflakeMark } from './shapes';

// def fragments composed per icon so each case ships only what it references
const GLOW_DEF = `<filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>`;
const SUN_DEFS = `<linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="30%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>`;
const CLOUD_DEFS = `<linearGradient id="cloudFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>
  <linearGradient id="cloudBack" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#94a3b8" stop-opacity="0.6"/><stop offset="100%" stop-color="#475569" stop-opacity="0.6"/></linearGradient>`;
const STORM_DEFS = `<linearGradient id="stormCloudFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#1e293b"/></linearGradient>
  <linearGradient id="stormCloudBack" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#334155" stop-opacity="0.75"/><stop offset="100%" stop-color="#0f172a" stop-opacity="0.75"/></linearGradient>`;
const BOLT_DEFS = `<filter id="boltGlow" x="-150%" y="-40%" width="400%" height="180%"><feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <linearGradient id="boltGradient" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bfe4ff"/><stop offset="70%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient>`;
const MOON_DEFS = `<linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>`;

const defs = (...fragments: string[]): string => `<defs>${fragments.join('\n  ')}</defs>`;

// tapered double-notch bolt, shared by the dim and lit thunderstorm layers
const BOLT_PATH = 'M41,0 L14,34 L23,34 L4,64 L45,24 L33,24 L52,0 Z';

const generateCloud = (
  xOffset: number,
  yOffset: number,
  scale: number,
  fillCode: string,
): string =>
  `<path d="M20,40 C20,30 28,22 38,22 C41,22 44,23 46,25 C50,15 60,10 70,10 C82,10 92,18 94,30 C100,31 106,37 106,44 C106,51 100,58 92,58 L20,58 C13,58 8,53 8,46 C8,41 13,36 18,36Z" fill="${fillCode}" transform="translate(${xOffset},${yOffset}) scale(${scale * 0.7})"/>`;

const generateSunRays = (innerRadius: number, outerRadius: number, count: number): string => {
  let raysSvg = '';
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360;
    const radians = (angle * Math.PI) / 180;
    const leftRadians = ((angle - 6) * Math.PI) / 180;
    const rightRadians = ((angle + 6) * Math.PI) / 180;
    raysSvg += `<polygon points="${innerRadius * Math.cos(leftRadians)},${innerRadius * Math.sin(leftRadians)} ${outerRadius * Math.cos(radians)},${outerRadius * Math.sin(radians)} ${innerRadius * Math.cos(rightRadians)},${innerRadius * Math.sin(rightRadians)}" fill="#f59e0b" opacity="0.45"/>`;
  }
  return raysSvg;
};

const generateRainDrops = (count: number): string => {
  const cloudBottom = 73;
  const xMin = 18;
  const xSpan = 64;
  // three depth layers: thin/fast background to thick/slow foreground
  const rainLayers = [
    { dropCount: Math.ceil(count * 0.3), strokeWidth: 0.4, opacity: 0.14, speed: 1.3, length: 4 },
    { dropCount: Math.ceil(count * 0.45), strokeWidth: 0.6, opacity: 0.25, speed: 0.85, length: 6 },
    { dropCount: Math.ceil(count * 0.25), strokeWidth: 0.9, opacity: 0.38, speed: 0.55, length: 8 },
  ];
  let dropsSvg = '';

  rainLayers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.dropCount; i++) {
      // deterministic pseudo-random positions via prime-multiplier hashing
      const xPos = xMin + ((i * 31 + layerIndex * 19 + 7) % xSpan);
      const yPos = cloudBottom + ((i * 7 + layerIndex * 3) % 5);
      const duration = layer.speed + ((i * 11) % 5) * 0.06;
      const delay = ((i * 17 + layerIndex * 13) % 18) * 0.06;
      const drift = -1 - layerIndex;
      const fallDistance = 80;

      dropsSvg += `<line x1="${xPos}" y1="${yPos}" x2="${xPos + drift}" y2="${yPos + layer.length}"
        stroke="rgba(180,215,250,${layer.opacity})" stroke-width="${layer.strokeWidth}" stroke-linecap="round" opacity="0">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="${drift * 2},${fallDistance}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;1;1;0"
          keyTimes="0;0.05;0.88;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      </line>`;
    }
  });

  return `<g>${dropsSvg}</g>`;
};

const generateSnowFlakes = (count: number): string => {
  const cloudBottom = 74;
  const xMin = 22;
  const xSpan = 56;
  let flakesSvg = '';

  for (let i = 0; i < count; i++) {
    const xPos = xMin + ((i * 29 + 11) % xSpan);
    const radius = 1.6 + ((i * 7) % 3) * 0.5;
    const duration = 3.2 + ((i * 11) % 5) * 0.4;
    const delay = ((i * 17) % 12) * 0.25;
    const driftX = i % 2 ? 7 : -7;
    const spinTo = i % 2 ? 360 : -360;

    flakesSvg += `<g opacity="0">
      <animateTransform attributeName="transform" type="translate"
        from="${xPos},${cloudBottom}" to="${xPos + driftX},${cloudBottom + 60}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.08;0.85;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="${spinTo}" dur="${duration * 0.7}s" repeatCount="indefinite"/>
        ${renderSnowflakeMark(radius)}
      </g>
    </g>`;
  }

  return `<g>${flakesSvg}</g>`;
};

const generateHailStones = (): string => {
  let hailOutput = '';
  const hailConfig: Array<[number, number]> = [
    [25, 0],
    [42, 0.15],
    [60, 0.3],
    [35, 0.5],
    [55, 0.1],
    [75, 0.4],
  ];

  hailConfig.forEach(([xPos, delay]) => {
    const radius = 2 + ((xPos * 7) % 3);
    const duration = 0.6 + ((xPos * 11) % 4) * 0.1;
    hailOutput += `<circle cx="${xPos}" cy="70" r="${radius}" fill="#dce4ed" opacity="0">
      <animateTransform attributeName="transform" type="translate"
        from="0,0" to="-1,50" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;0.85;0.85;0"
        keyTimes="0;0.06;0.84;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
    </circle>`;
  });

  for (let i = 0; i < 4; i++) {
    const splashX = 25 + ((i * 19 + 5) % 50);
    const splashDelay = ((i * 13) % 8) * 0.12;
    hailOutput += `<circle cx="${splashX}" cy="97" r="0" fill="#dce4ed" opacity="0.5">
      <animate attributeName="r" values="0;2.5;0" dur="0.5s" begin="${splashDelay}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" begin="${splashDelay}s" repeatCount="indefinite"/>
    </circle>`;
  }
  return `<g>${hailOutput}</g>`;
};

// note: the string returned for a given (weatherType, size) is deliberately
// deterministic — the card binds it through unsafeHTML, which skips DOM
// replacement on identical strings, keeping SMIL animations running smoothly
// across re-renders. Runtime state (e.g. the lightning flash) must therefore
// be applied via CSS on wrapper elements, never baked into this markup.
export const generateWeatherIconSVG = (weatherType: string, size = 100): string => {
  switch (weatherType) {
    case 'sun':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(GLOW_DEF, SUN_DEFS)}
        <g filter="url(#iconGlow)"><g transform="translate(50,50)">
          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="50s" repeatCount="indefinite"/>${generateSunRays(20, 36, 8)}</g>
          <circle cx="0" cy="0" r="20" fill="url(#sunGradient)"/>
          <circle cx="0" cy="0" r="20" fill="url(#sunGradient)" opacity="0.35"><animate attributeName="r" values="20;23;20" dur="4s" repeatCount="indefinite"/></circle>
        </g></g></svg>`;

    case 'partly-cloudy':
      return `<svg width="${size}" height="${size}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${defs(GLOW_DEF, SUN_DEFS, CLOUD_DEFS)}
        <g filter="url(#iconGlow)"><g transform="translate(75,30)">
          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/>${generateSunRays(14, 28, 8)}</g>
          <circle cx="0" cy="0" r="15" fill="url(#sunGradient)"/>
        </g></g>
        <g><animateTransform attributeName="transform" type="translate" values="-3,0; 3,0; -3,0" dur="7s" repeatCount="indefinite"/>${generateCloud(20, 42, 0.9, 'url(#cloudBack)')}</g>
        <g><animateTransform attributeName="transform" type="translate" values="0,0; 1.5,-1; 0,0" dur="5s" repeatCount="indefinite"/>${generateCloud(10, 48, 1.0, 'url(#cloudFront)')}</g>
      </svg>`;

    case 'cloud-moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${defs(GLOW_DEF, MOON_DEFS, CLOUD_DEFS)}
        <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="8s" repeatCount="indefinite"/>
          <path d="M65,15 A18,18 0 1,0 85,38 A14,14 0 1,1 65,15 Z" fill="url(#moonGradient)"/></g>
        <g><animateTransform attributeName="transform" type="translate" values="-2,0; 2,0; -2,0" dur="8s" repeatCount="indefinite"/>${generateCloud(22, 44, 0.9, 'url(#cloudBack)')}</g>
        ${generateCloud(12, 50, 1.0, 'url(#cloudFront)')}
      </svg>`;

    case 'overcast':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(CLOUD_DEFS)}
        <g><animateTransform attributeName="transform" type="translate" values="3,2; -3,-1; 3,2" dur="12s" repeatCount="indefinite"/>${generateCloud(5, 34, 1.05, 'url(#cloudBack)')}</g>
        <g><animateTransform attributeName="transform" type="translate" values="-2,-2; 2,1; -2,-2" dur="9s" repeatCount="indefinite"/>${generateCloud(12, 44, 1.15, 'url(#cloudFront)')}</g>
      </svg>`;

    case 'rain':
    case 'rain-heavy': {
      const isIntense = weatherType === 'rain-heavy';
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${defs(CLOUD_DEFS)}
        <g opacity="0.5"><animateTransform attributeName="transform" type="translate" values="2,1; -2,-1; 2,1" dur="10s" repeatCount="indefinite"/>${generateCloud(8, 26, 0.95, 'url(#cloudBack)')}</g>
        <g><animateTransform attributeName="transform" type="translate" values="-1,0; 1.5,-0.5; -1,0" dur="7s" repeatCount="indefinite"/>${generateCloud(10, 32, 1.0, 'url(#cloudFront)')}</g>
        ${generateRainDrops(isIntense ? 16 : 8)}
      </svg>`;
    }

    case 'thunderstorm':
      // filled tapered bolt (a thin stroked zigzag read as a scratch mark at
      // card size). Two stacked copies: a dim always-visible one, and a lit
      // glowing one revealed via CSS (.lightning-flash .bolt-lit) in sync
      // with the card's flash timer — keeping this string flash-independent
      // so the SVG (and its running animations) is never re-parsed mid-storm
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${defs(STORM_DEFS, BOLT_DEFS)}
        <g opacity="0.7">${generateCloud(8, 20, 1.0, 'url(#stormCloudBack)')}</g>
        ${generateCloud(10, 26, 1.1, 'url(#stormCloudFront)')}
        <g transform="translate(46,60) scale(0.55)">
          <path d="${BOLT_PATH}" fill="url(#boltGradient)" opacity="0.35"/>
          <path class="bolt-lit" d="${BOLT_PATH}" fill="url(#boltGradient)" filter="url(#boltGlow)"/>
        </g>
        ${generateRainDrops(10)}
      </svg>`;

    case 'snow':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${defs(CLOUD_DEFS)}
        <g opacity="0.45">${generateCloud(8, 24, 0.95, 'url(#cloudBack)')}</g>
        ${generateCloud(10, 30, 1.0, 'url(#cloudFront)')}
        ${generateSnowFlakes(7)}
      </svg>`;

    case 'hail':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${defs(CLOUD_DEFS)}
        <g opacity="0.5">${generateCloud(8, 24, 0.95, 'url(#cloudBack)')}</g>
        ${generateCloud(10, 30, 1.0, 'url(#cloudFront)')}
        ${generateHailStones()}
      </svg>`;

    case 'fog':
      // cloud with rounded mist bars drifting beneath it (the classic
      // cloud-fog glyph): reads as "fog" at a glance, whereas the previous
      // stack of edge-to-edge blurred ellipses rendered as broken gray stripes
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(CLOUD_DEFS)}
        <g opacity="0.55">${generateCloud(16, 16, 0.8, 'url(#cloudBack)')}</g>
        ${generateCloud(10, 20, 0.95, 'url(#cloudFront)')}
        <g stroke-linecap="round" fill="none">
          <line x1="26" y1="70" x2="80" y2="70" stroke="#e8edf4" stroke-width="5" opacity="0.85">
            <animateTransform attributeName="transform" type="translate" values="-5,0; 4,0; -5,0" dur="9s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.85;0.6;0.85" dur="6s" repeatCount="indefinite"/>
          </line>
          <line x1="18" y1="80" x2="68" y2="80" stroke="#cbd5e1" stroke-width="5" opacity="0.6">
            <animateTransform attributeName="transform" type="translate" values="4,0; -6,0; 4,0" dur="11s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0.42;0.6" dur="7s" repeatCount="indefinite"/>
          </line>
          <line x1="30" y1="90" x2="74" y2="90" stroke="#aeb9c8" stroke-width="5" opacity="0.45">
            <animateTransform attributeName="transform" type="translate" values="-4,0; 5,0; -4,0" dur="8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.45;0.3;0.45" dur="5.5s" repeatCount="indefinite"/>
          </line>
        </g>
      </svg>`;

    case 'wind':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round">
          <path d="M10,35 Q35,25 55,35 T90,35" stroke-dasharray="40 100"><animate attributeName="stroke-dashoffset" values="140;-140" dur="3.5s" repeatCount="indefinite"/></path>
          <path d="M5,52 Q30,60 60,48 T95,52" stroke-dasharray="50 90"><animate attributeName="stroke-dashoffset" values="140;-140" dur="2.8s" repeatCount="indefinite"/></path>
          <path d="M15,68 Q40,60 60,68 T85,64" stroke-dasharray="30 110"><animate attributeName="stroke-dashoffset" values="140;-140" dur="4.2s" repeatCount="indefinite"/></path>
        </g></svg>`;

    case 'moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(GLOW_DEF, MOON_DEFS)}
        <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; -2,-3; 0,0" dur="10s" repeatCount="indefinite"/>
          <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="url(#moonGradient)"/>
          <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="#fff" opacity="0.12"/></g>
      </svg>`;

    case 'warning':
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(GLOW_DEF)}
        <g filter="url(#iconGlow)">
          <polygon points="50,8 94,88 6,88" fill="#f59e0b" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
          </polygon>
          <text x="50" y="74" text-anchor="middle" font-size="38" font-weight="bold" fill="#1c1917">!</text>
        </g>
      </svg>`;

    case 'sunrise':
    case 'sunset': {
      const isSunset = weatherType === 'sunset';
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs(SUN_DEFS)}
        <g transform="translate(50,70)">
          <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="80s" repeatCount="indefinite"/>${generateSunRays(15, 34, 8)}</g>
          <circle cx="0" cy="0" r="16" fill="url(#sunGradient)">${!isSunset ? '<animateTransform attributeName="transform" type="translate" from="0,15" to="0,0" dur="3.5s" fill="freeze"/>' : ''}</circle>
        </g>
      </svg>`;
    }

    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="#888"/></svg>`;
  }
};
