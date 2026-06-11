class ModernWeatherCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Call _render() here too: HA does not guarantee that hass is set before
    // setConfig, so the first render attempt in setConfig may be a no-op.
    // _render() guards against double-initialisation, so this is safe.
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

      this._form.schema = [
        { name: 'entity',           selector: { entity: { domain: 'weather' } } },
        { name: 'forecast_entity',  selector: { entity: { domain: 'weather' } } },
        { name: 'sun_entity',       selector: { entity: { domain: 'sun'     } } },
        { name: 'name',             selector: { text: {} } },
        {
          name: 'time_format',
          selector: {
            select: {
              options: [
                { value: 'default', label: 'System Default' },
                { value: '12',      label: '12 Hour' },
                { value: '24',      label: '24 Hour' }
              ],
              mode: 'dropdown'
            }
          }
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
        // Tap action via the supported ui_action selector — avoids depending on
        // the internal and undocumented hui-action-editor element.
        { name: 'tap_action', selector: { ui_action: {} } }
      ];

      this._form.computeLabel = (schemaProperty) => {
        switch (schemaProperty.name) {
          case 'entity':           return 'Weather Entity (Required)';
          case 'forecast_entity':  return 'Forecast Entity (Optional)';
          case 'sun_entity':       return 'Sun Entity';
          case 'time_format':      return 'Time Format Override';
          case 'alert_lookahead':  return 'Forecast Alert Lookahead (Hours, 0 = off)';
          case 'name':             return 'Location Name';
          case 'show_forecast':    return 'Show forecast';
          case 'show_low_temp':    return 'Show low temperature';
          case 'show_no_temp':     return 'Show no temperature (overrides low temp)';
          case 'tap_action':       return 'Tap Action';
          default: return schemaProperty.name;
        }
      };

      this._form.addEventListener('value-changed', (ev) => {
        // Stop propagation before firing our own event so that HA's dialog
        // doesn't also see the raw value-changed from the inner ha-form,
        // which could cause double-handling in future HA releases.
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
