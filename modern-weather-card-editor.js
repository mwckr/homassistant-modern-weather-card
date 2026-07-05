const EDITOR_SCHEMA = [
  { name: 'entity',           selector: { entity: { domain: 'weather' } } },
  { name: 'forecast_entity',  selector: { entity: { domain: 'weather' } } },
  { name: 'sun_entity',       selector: { entity: { domain: 'sun'     } } },
  { name: 'name',             selector: { text: {} } },
  {
    name: 'time_format',
    selector: {
      select: {
        options: [
          { value: 'default', label: 'Default (User Profile)' },
          { value: '12',      label: '12 Hour' },
          { value: '24',      label: '24 Hour' },
          { value: 'system',  label: 'System (Browser/OS)' }
        ],
        mode: 'dropdown'
      }
    }
  },
  {
    name: 'forecast_days',
    selector: { number: { min: 1, max: 7, mode: 'slider', step: 1 } }
  },
  {
    name: 'alert_lookahead',
    selector: { number: { min: 0, max: 24, mode: 'slider', step: 1 } }
  },
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'show_forecast', selector: { boolean: {} } },
      { name: 'show_low_temp', selector: { boolean: {} } },
      { name: 'show_no_temp',  selector: { boolean: {} } }
    ]
  },
  // ui_action selector for tap action config
  { name: 'tap_action', selector: { ui_action: {} } }
];

const EDITOR_LABELS = {
  entity:          'Weather Entity (Required)',
  forecast_entity: 'Forecast Entity (Optional)',
  sun_entity:      'Sun Entity',
  time_format:     'Time Format Override',
  forecast_days:   'Forecast Days',
  alert_lookahead: 'Forecast Alert Lookahead (Hours, 0 = off)',
  name:            'Location Name',
  show_forecast:   'Show forecast',
  show_low_temp:   'Show low temperature',
  show_no_temp:    'Show no temperature (overrides low temp)',
  tap_action:      'Tap Action',
};

class ModernWeatherCardEditor extends HTMLElement {
  setConfig(config) {
    // apply same defaults as the main card so sliders/toggles show
    // the effective value rather than blank for older saved configs
    this._config = {
      show_forecast: true,
      show_low_temp: false,
      show_no_temp: false,
      forecast_days: 5,
      sun_entity: 'sun.sun',
      time_format: 'default',
      alert_lookahead: 12,
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // hass may arrive before or after setConfig; render handles both
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) return;

    if (!this._form) {
      this.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; padding: 16px 0;">
          <ha-form id="form"></ha-form>
        </div>
      `;

      this._form = this.querySelector('#form');
      this._form.schema = EDITOR_SCHEMA;
      this._form.computeLabel = (schema) =>
        EDITOR_LABELS[schema.name] ?? schema.name;

      this._form.addEventListener('value-changed', (ev) => {
        // stop propagation to prevent HA dialog double-handling
        ev.stopPropagation();
        this._fireChanged(ev.detail.value);
      });
    }

    this._form.hass = this._hass;
    this._form.data = this._config;
  }

  _fireChanged(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('modern-weather-card-editor', ModernWeatherCardEditor);