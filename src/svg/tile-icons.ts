// thin outline glyphs for the metric tile headers, stroke follows text color
const outlineSvg = (content: string): string =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const TILE_ICONS: Record<string, string> = {
  aqi: outlineSvg(
    `<circle cx="12" cy="12" r="4.2"/>
     <path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6"/>`,
  ),
  cloud: outlineSvg(
    `<path d="M7.2 18.5h9a4.1 4.1 0 0 0 .7-8.2 5.4 5.4 0 0 0-10.5 1.1 3.6 3.6 0 0 0 .8 7.1Z"/>`,
  ),
  humidity: outlineSvg(
    `<path d="M12 3.6s5.8 6.1 5.8 10a5.8 5.8 0 1 1-11.6 0c0-3.9 5.8-10 5.8-10Z"/>`,
  ),
  wind: outlineSvg(
    `<path d="M3.5 8.3h8.8a2.5 2.5 0 1 0-2.5-2.5M3.5 12.2h13.6a2.8 2.8 0 1 1-2.8 2.8M3.5 16.1h6.2"/>`,
  ),
};
