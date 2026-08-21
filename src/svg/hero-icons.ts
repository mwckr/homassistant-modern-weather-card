// def fragments composed per icon so each case ships only what it references.
// Since the photographic sky scene took over sun/cloud/precipitation
// rendering, only the glyphs with no photo counterpart remain: the crescent
// moon for clear nights and the warning triangle for 'exceptional'.
const GLOW_DEF = `<filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>`;
const MOON_DEFS = `<linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>`;

const defs = (...fragments: string[]): string => `<defs>${fragments.join('\n  ')}</defs>`;

// note: the string returned for a given (weatherType, size) is deliberately
// deterministic — the card binds it through unsafeHTML, which skips DOM
// replacement on identical strings, keeping SMIL animations running smoothly
// across re-renders.
export const generateWeatherIconSVG = (weatherType: string, size = 100): string => {
  switch (weatherType) {
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

    default:
      return '';
  }
};
