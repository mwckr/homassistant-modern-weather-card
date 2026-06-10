class ZuhauseWeatherCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
    if (this._actionEditor) this._actionEditor.hass = hass;
  }

  _render() {
    if (!this._hass || !this._config) return;

    if (!this._form) {
      this.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 24px; padding: 16px 0;">
          <ha-form id="form"></ha-form>
          <div>
            <h3 style="margin-bottom: 8px; font-weight: 500;">Tap Action</h3>
            <hui-action-editor id="action-editor"></hui-action-editor>
          </div>
        </div>
      `;

      this._form = this.querySelector('#form');
      this._actionEditor = this.querySelector('#action-editor');

      this._form.schema = [
        { name: "entity", selector: { entity: { domain: "weather" } } },
        { name: "forecast_entity", selector: { entity: { domain: "weather" } } },
        { name: "sun_entity", selector: { entity: { domain: "sun" } } },
        { name: "time_format", selector: { select: { options: [{value: "default", label: "System Default"}, {value: "12", label: "12 Hour"}, {value: "24", label: "24 Hour"}], mode: "dropdown" } } },
        { name: "alert_lookahead", selector: { number: { min: 1, max: 24, mode: "slider", step: 1 } } },
        { name: "name", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          schema: [
            { name: "show_low_temp", selector: { boolean: {} } },
            { name: "show_no_temp", selector: { boolean: {} } }
          ]
        }
      ];

      this._form.computeLabel = (schemaProperty) => {
        switch (schemaProperty.name) {
          case 'entity': return 'Weather Entity (Required)';
          case 'forecast_entity': return 'Forecast Entity (Optional)';
          case 'sun_entity': return 'Sun Entity';
          case 'time_format': return 'Time Format Override';
          case 'alert_lookahead': return 'Forecast Alert Lookahead (Hours)';
          case 'name': return 'Location Name';
          case 'show_low_temp': return 'Show low temperature';
          case 'show_no_temp': return 'Show no temperature';
          default: return schemaProperty.name;
        }
      };

      this._form.addEventListener('value-changed', (ev) => this._fireChanged(ev.detail.value));
      
      this._actionEditor.addEventListener('value-changed', (ev) => {
        this._fireChanged({ ...this._config, tap_action: ev.detail.value });
      });
    }

    this._form.hass = this._hass;
    this._form.data = this._config;

    this._actionEditor.hass = this._hass;
    this._actionEditor.config = this._config.tap_action || { action: 'more-info' };
  }

  _fireChanged(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: config },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('zuhause-weather-card-editor', ZuhauseWeatherCardEditor);
