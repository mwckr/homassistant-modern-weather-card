export const generateSmallForecastIcon = (iconKey: string, size: number): string => {
  switch (iconKey) {
    case 'sun':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="7" fill="#fbbf24"/></svg>`;
    case 'moon':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M12,10 A8,8 0 1,0 22,22 A6,6 0 1,1 12,10Z" fill="#94a3b8"/></svg>`;
    case 'sun-cloud':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="20" cy="12" r="5" fill="#fbbf24"/><path d="M8,24 C8,20 12,18 15,18 C17,15 22,15 24,18 C27,18 29,20 29,23 C29,25 27,27 25,27L8,27Z" fill="#cbd5e1"/></svg>`;
    case 'cloud':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M6,22 C6,18 9,16 12,16 C14,13 19,13 21,16 C24,16 26,18 26,21 C26,24 24,25 22,25L6,25Z" fill="#cbd5e1"/></svg>`;
    case 'rain':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><line x1="13" y1="25" x2="11" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><line x1="19" y1="25" x2="17" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'snow':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><circle cx="13" cy="26" r="1" fill="#fff"/><circle cx="19" cy="27" r="1" fill="#fff"/></svg>`;
    case 'lightning':
      // same stop colors as the hero icon's boltGradient so both bolts match
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><defs><linearGradient id="miniBolt" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bfe4ff"/><stop offset="70%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><path d="M8,16 C8,13 11,11 14,11 C16,8 21,8 23,11 C26,11 28,13 28,16 C28,19 26,20 24,20L8,20Z" fill="#334155"/><polygon points="17,18 13,24 16,24 14,30 21,22 18,22" fill="url(#miniBolt)"/></svg>`;
    case 'warning':
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><polygon points="16,3 30,28 2,28" fill="#f59e0b"/><text x="16" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#1c1917">!</text></svg>`;
    default:
      return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#888"/></svg>`;
  }
};

export const LOCATION_PIN_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
