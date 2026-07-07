import type { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

export interface ModernWeatherCardConfig extends LovelaceCardConfig {
  entity: string;
  name?: string;
  show_forecast?: boolean;
  show_low_temp?: boolean;
  show_no_temp?: boolean;
  forecast_days?: number;
  sun_entity?: string;
  time_format?: 'default' | '12' | '24' | 'system';
  alert_lookahead?: number;
  forecast_entity?: string;
  tap_action?: ActionConfig;
}

// config after setConfig applied defaults
export type ResolvedConfig = ModernWeatherCardConfig &
  Required<
    Pick<
      ModernWeatherCardConfig,
      | 'show_forecast'
      | 'show_low_temp'
      | 'show_no_temp'
      | 'forecast_days'
      | 'sun_entity'
      | 'time_format'
      | 'alert_lookahead'
      | 'forecast_entity'
      | 'tap_action'
    >
  >;

// structural subset of a hass state object; keeps helper modules
// decoupled from the websocket library's types
export interface EntityState {
  state: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes: Record<string, any>;
}

export interface ForecastItem {
  datetime: string;
  condition?: string;
  temperature?: number;
  templow?: number;
}

export interface ForecastEvent {
  forecast: ForecastItem[] | null;
}

export type TimeOfDay = 'day' | 'dawn' | 'dusk' | 'night';

// palette family a condition maps to; weather sets the mood, time of day modulates
export type SkyClass = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'fog';

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      documentationURL?: string;
      preview?: boolean;
    }>;
  }
}
