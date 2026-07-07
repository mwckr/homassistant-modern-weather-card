import type { ActionConfig } from 'custom-card-helpers';
import type { SkyClass } from './types';

export const CARD_VERSION = '0.2.0';
export const CARD_NAME = 'modern-weather-card';
export const EDITOR_NAME = 'modern-weather-card-editor';

// config defaults shared by the card and the editor so the form always shows
// the effective values and the two can never drift apart
export const CONFIG_DEFAULTS = {
  show_forecast: true,
  show_low_temp: false,
  show_no_temp: false,
  forecast_days: 5,
  sun_entity: 'sun.sun',
  time_format: 'default' as const,
  alert_lookahead: 12,
  tap_action: { action: 'more-info' } as ActionConfig,
};

// single registry for per-condition behavior. Everything condition-driven
// (forecast icon, sky palette class, alert grouping/notability) derives from
// this table, so a new HA condition value is added in exactly one place.
interface ConditionMeta {
  forecastIcon: string;
  skyClass: SkyClass;
  /** related conditions share a group for the alert "until" logic */
  group?: string;
  /** notable conditions trigger short-forecast alerts */
  notable?: boolean;
}

const CONDITION_META: Record<string, ConditionMeta> = {
  sunny: { forecastIcon: 'sun', skyClass: 'clear' },
  'clear-night': { forecastIcon: 'moon', skyClass: 'clear' },
  partlycloudy: { forecastIcon: 'sun-cloud', skyClass: 'clear' },
  cloudy: { forecastIcon: 'cloud', skyClass: 'cloudy' },
  fog: { forecastIcon: 'cloud', skyClass: 'fog', group: 'fog', notable: true },
  rainy: { forecastIcon: 'rain', skyClass: 'rain', group: 'rain', notable: true },
  pouring: { forecastIcon: 'rain', skyClass: 'rain', group: 'rain', notable: true },
  hail: { forecastIcon: 'rain', skyClass: 'rain', group: 'rain', notable: true },
  lightning: { forecastIcon: 'lightning', skyClass: 'storm', group: 'thunder', notable: true },
  'lightning-rainy': { forecastIcon: 'lightning', skyClass: 'storm', group: 'rain', notable: true },
  snowy: { forecastIcon: 'snow', skyClass: 'snow', group: 'snow', notable: true },
  'snowy-rainy': { forecastIcon: 'snow', skyClass: 'snow', group: 'snow', notable: true },
  windy: { forecastIcon: 'cloud', skyClass: 'clear', group: 'wind', notable: true },
  'windy-variant': { forecastIcon: 'cloud', skyClass: 'clear', group: 'wind', notable: true },
  exceptional: { forecastIcon: 'warning', skyClass: 'clear' },
};

export const isNotableCondition = (condition: string): boolean =>
  CONDITION_META[condition]?.notable ?? false;

export const getConditionGroup = (condition: string): string =>
  CONDITION_META[condition]?.group ?? condition;

export const getForecastIcon = (condition?: string): string =>
  CONDITION_META[condition ?? '']?.forecastIcon ?? 'sun';

export const getSkyClass = (condition: string): SkyClass =>
  CONDITION_META[condition]?.skyClass ?? 'clear';
