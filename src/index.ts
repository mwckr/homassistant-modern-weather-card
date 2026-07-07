import { CARD_NAME, CARD_VERSION } from './const';
import './modern-weather-card';
import './editor';

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_NAME,
  name: 'Modern Weather Card',
  description: 'Layered weather card with atmospheric effects',
  documentationURL: 'https://github.com/mwckr/homassistant-modern-weather-card',
  preview: true,
});

console.info(
  `%c MODERN-WEATHER %c v${CARD_VERSION} `,
  'background:#2563eb;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px',
  'background:#0f172a;color:#f8fafc;padding:2px 6px;border-radius:0 4px 4px 0',
);
