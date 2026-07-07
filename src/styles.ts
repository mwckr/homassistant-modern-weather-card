import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
    font-family: Roboto, -apple-system, sans-serif;
    isolation: isolate;
  }
  ha-card {
    background: none !important;
    border: none !important;
    box-shadow: none !important;
    overflow: visible;
  }
  ha-card[data-action]:not([data-action='none']) {
    cursor: pointer;
  }

  .hero {
    position: relative;
    border-radius: var(--ha-card-border-radius, 20px);
    padding: 24px 26px 22px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    min-height: 125px;
    box-shadow:
      0 10px 25px -5px rgba(0, 0, 0, 0.3),
      inset 0 1px 1px rgba(255, 255, 255, 0.15);
    transition: background 1.5s ease-in-out;
  }
  .hero:focus {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
  .hero:focus:not(:focus-visible) {
    outline: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1), transparent 50%);
    pointer-events: none;
    z-index: 0;
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
    border-radius: inherit;
  }
  .weather-tint {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 3;
    border-radius: inherit;
    transition: background 1.5s ease;
  }
  .weather-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    overflow: hidden;
    border-radius: inherit;
  }

  .hero-text {
    position: relative;
    z-index: 5;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .loc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2px;
    letter-spacing: 0.3px;
  }
  .temp {
    font-size: 56px;
    font-weight: 200;
    line-height: 1;
    color: #ffffff;
    letter-spacing: -1.5px;
  }
  .cond {
    font-size: 14px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    margin-top: 6px;
  }

  .hero-center {
    position: relative;
    z-index: 5;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
  }

  .short-fc {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.15);
    padding: 4px 10px;
    border-radius: 6px;
    text-align: center;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    width: fit-content;
    max-width: 135px;
  }

  .hero-icon {
    position: relative;
    z-index: 5;
    flex-shrink: 0;
    margin-right: -4px;
  }
  .hero-icon svg {
    display: block;
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
  }

  .error-overlay {
    display: flex;
    position: absolute;
    inset: 0;
    z-index: 20;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
    border-radius: inherit;
    padding: 16px;
    color: var(--error-color, #ef4444);
    font-size: 13px;
    text-align: center;
  }

  /* the thunderstorm icon ships a dim and a lit bolt; the flash class
     reveals the lit one so the SVG string never changes mid-storm */
  .hero-icon .bolt-lit {
    opacity: 0;
  }
  .hero.lightning-flash .hero-icon .bolt-lit {
    opacity: 1;
  }

  .hero.lightning-flash::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 78% 12%,
      rgba(226, 240, 255, 0.85),
      rgba(148, 190, 250, 0.4) 35%,
      rgba(59, 90, 180, 0.12) 60%,
      transparent 78%
    );
    mix-blend-mode: screen;
    opacity: 0.75;
    z-index: 10;
    pointer-events: none;
    border-radius: inherit;
  }

  @media (prefers-reduced-motion: reduce) {
    .weather-layer {
      display: none;
    }
  }

  .forecast {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }
  .fc-day {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px 6px;
    border-radius: calc(var(--ha-card-border-radius, 20px) - 4px);
    background: var(--card-background-color, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.08));
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    transition:
      transform 0.2s ease,
      background 0.2s ease;
  }
  @media (hover: hover) {
    .fc-day:hover {
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.1));
      transform: translateY(-1px);
    }
  }
  .fc-d {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--secondary-text-color, #94a3b8);
  }
  .fc-icon {
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .fc-t {
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-text-color, #f8fafc);
  }
  .fc-lo {
    font-size: 11px;
    font-weight: 400;
    color: var(--secondary-text-color, #64748b);
    margin-top: -2px;
  }
`;
