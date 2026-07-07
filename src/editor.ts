import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';

import { CONFIG_DEFAULTS, EDITOR_NAME } from './const';
import { fireEvent } from './fire-event';
import type { ModernWeatherCardConfig } from './types';

const EDITOR_SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'weather' } } },
  { name: 'forecast_entity', selector: { entity: { domain: 'weather' } } },
  { name: 'sun_entity', selector: { entity: { domain: 'sun' } } },
  { name: 'name', selector: { text: {} } },
  {
    name: 'time_format',
    selector: {
      select: {
        options: [
          { value: 'default', label: 'Default (User Profile)' },
          { value: '12', label: '12 Hour' },
          { value: '24', label: '24 Hour' },
          { value: 'system', label: 'System (Browser/OS)' },
        ],
        mode: 'dropdown',
      },
    },
  },
  {
    name: 'forecast_days',
    selector: { number: { min: 1, max: 7, mode: 'slider', step: 1 } },
  },
  {
    name: 'alert_lookahead',
    selector: { number: { min: 0, max: 24, mode: 'slider', step: 1 } },
  },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'show_forecast', selector: { boolean: {} } },
      { name: 'show_low_temp', selector: { boolean: {} } },
      { name: 'show_no_temp', selector: { boolean: {} } },
    ],
  },
  { name: 'tap_action', selector: { ui_action: {} } },
];

const EDITOR_LABELS: Record<string, string> = {
  entity: 'Weather Entity (Required)',
  forecast_entity: 'Forecast Entity (Optional)',
  sun_entity: 'Sun Entity',
  time_format: 'Time Format Override',
  forecast_days: 'Forecast Days',
  alert_lookahead: 'Forecast Alert Lookahead (Hours, 0 = off)',
  name: 'Location Name',
  show_forecast: 'Show forecast',
  show_low_temp: 'Show low temperature',
  show_no_temp: 'Show no temperature (overrides low temp)',
  tap_action: 'Tap Action',
};

@customElement(EDITOR_NAME)
export class ModernWeatherCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: ModernWeatherCardConfig;

  public setConfig(config: ModernWeatherCardConfig): void {
    // same shared defaults as the card, so sliders/toggles show the
    // effective value rather than blank for older saved configs
    this._config = { ...CONFIG_DEFAULTS, ...config };
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${EDITOR_SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel = (schema: { name: string }): string =>
    EDITOR_LABELS[schema.name] ?? schema.name;

  private _valueChanged(ev: CustomEvent): void {
    // stop propagation to prevent HA dialog double-handling
    ev.stopPropagation();
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'modern-weather-card-editor': ModernWeatherCardEditor;
  }
}
