import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { HomeAssistant, LovelaceCard, LovelaceCardEditor } from 'custom-card-helpers';

import { CARD_NAME, CONFIG_DEFAULTS, EDITOR_NAME, getForecastIcon } from './const';
import { fireEvent } from './fire-event';
import { getShortForecastText } from './forecast-alert';
import { formatDayLabel, formatTodayLabel } from './format';
import { cardStyles } from './styles';
import { generateSmallForecastIcon, LOCATION_PIN_SVG } from './svg/forecast-icons';
import { generateWeatherIconSVG } from './svg/hero-icons';
import { renderHorizon, renderStars, renderWeatherLayer } from './svg/scene';
import type { ForecastEvent, ForecastItem, ModernWeatherCardConfig, ResolvedConfig } from './types';
import { getSkyPalette, getTimeOfDay, getWeatherMeta } from './weather-meta';

// localize condition slug via HA, fallback to humanized slug
const localizeCondition = (hass: HomeAssistant, condition: string): string => {
  const raw =
    hass.localize(`component.weather.entity_component._.state.${condition}`) ||
    hass.localize(`component.weather.state._.${condition}`) ||
    condition.replaceAll('-', ' ');
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const SUB_RETRY_COOLDOWN_MS = 60000;

type Unsub = () => void | Promise<void>;

@customElement(CARD_NAME)
export class ModernWeatherCard extends LitElement implements LovelaceCard {
  @state() private _config?: ResolvedConfig;
  @state() private _forecast: ForecastItem[] = [];
  @state() private _hourlyForecast: ForecastItem[] = [];
  @state() private _flash = false;

  private _hass?: HomeAssistant;
  private _forecastUnsub?: Unsub;
  private _hourlyUnsub?: Unsub;
  private _subscribedTarget: string | null = null;
  private _subGeneration = 0;
  private _failedSubTarget: string | null = null;
  private _failedSubTime = 0;
  private _activeTimeouts = new Set<number>();
  private _lightningActive = false;
  private _lastSceneKey = '';
  private _tickInterval?: number;

  static override styles = cardStyles;

  // HA lifecycle

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  // custom accessor so irrelevant hass updates don't trigger re-renders
  public set hass(hass: HomeAssistant | undefined) {
    const old = this._hass;
    this._hass = hass;
    if (!hass || !this._config) return;
    const relevant =
      !old ||
      old.states[this._config.entity] !== hass.states[this._config.entity] ||
      old.states[this._config.sun_entity] !== hass.states[this._config.sun_entity] ||
      old.locale?.language !== hass.locale?.language ||
      old.locale?.time_format !== hass.locale?.time_format;
    // gate the subscribe check the same way as the re-render: dashboards push
    // a hass object for every state change anywhere in the house, and our
    // entity updates often enough to drive the failed-subscribe retry
    if (relevant) {
      this._ensureForecastSub();
      this.requestUpdate('hass', old);
    }
  }

  public setConfig(config: ModernWeatherCardConfig): void {
    if (!config.entity) throw new Error('Please define a weather entity');

    const merged: ResolvedConfig = {
      ...CONFIG_DEFAULTS,
      ...config,
      // fallback ordered after spread so a cleared editor field ("") doesn't win
      forecast_entity: config.forecast_entity || config.entity,
    };

    const forecastTargetChanged =
      !this._config ||
      this._config.entity !== merged.entity ||
      this._config.forecast_entity !== merged.forecast_entity;

    this._config = merged;
    // an explicit reconfigure bypasses the failed-subscribe cooldown
    this._failedSubTarget = null;

    if (forecastTargetChanged) {
      this._unsubForecast();
      this._forecast = [];
      this._hourlyForecast = [];
      if (this._hass) this._ensureForecastSub();
    }
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this._ensureForecastSub();
    // restart lightning if scene was active before detach
    if (this._lightningActive) this._scheduleLightning();
    // refresh time-based labels every minute — but only when one is actually
    // on screen (alert text needs hourly data, "Today" needs forecast rows)
    // and the page is visible; hidden dashboards skip the re-render entirely
    window.clearInterval(this._tickInterval);
    this._tickInterval = window.setInterval(() => {
      if (document.hidden) return;
      if (this._hourlyForecast.length === 0 && !this._config?.show_forecast) return;
      this.requestUpdate();
    }, 60000);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsubForecast();
    this._clearAllTimeouts();
    window.clearInterval(this._tickInterval);
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    // the editor is registered by the bundle entry point
    return document.createElement(EDITOR_NAME) as LovelaceCardEditor;
  }

  public static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
    // pick first available weather entity
    const entity = hass
      ? Object.keys(hass.states).find((e) => e.startsWith('weather.')) || 'weather.home'
      : 'weather.home';
    return {
      entity,
      name: 'Weather',
      show_forecast: true,
      show_low_temp: false,
      time_format: 'default',
      alert_lookahead: 12,
    };
  }

  public getCardSize(): number {
    return this._config?.show_forecast ? 5 : 3;
  }

  public getGridOptions(): Record<string, number> {
    return this._config?.show_forecast
      ? { rows: 4, columns: 12, min_rows: 4 }
      : { rows: 2, columns: 12, min_rows: 2 };
  }

  // render

  protected override render(): TemplateResult | typeof nothing {
    if (!this._config || !this._hass) return nothing;
    const config = this._config;
    const hass = this._hass;
    const stateObj = hass.states[config.entity];

    if (!stateObj) {
      return html`
        <ha-card>
          <div class="hero">
            <div class="error-overlay">Entity not found: ${config.entity}</div>
          </div>
        </ha-card>
      `;
    }

    const condition = stateObj.state;
    const rawTemp = stateObj.attributes.temperature;
    const numericTemp =
      rawTemp != null && Number.isFinite(+rawTemp) ? Math.round(+rawTemp) : null;
    const timeOfDay = getTimeOfDay(hass.states[config.sun_entity]);
    const meta = getWeatherMeta(condition, timeOfDay);
    const conditionLabel = localizeCondition(hass, condition);
    // empty string in config hides the pin; undefined falls back to friendly_name
    const locationName =
      config.name !== undefined ? config.name : ((stateObj.attributes.friendly_name as string) ?? '');

    const today: ForecastItem | undefined = this._forecast[0];
    const highTemp = today?.temperature != null ? Math.round(today.temperature) : null;
    const lowTemp = today?.templow != null ? Math.round(today.templow) : null;

    const alertText = getShortForecastText(this._hourlyForecast, condition, {
      lookaheadHours: config.alert_lookahead,
      timeFormat: config.time_format,
      locale: hass.locale,
      localizeCondition: (c) => localizeCondition(hass, c),
    });

    const heroBackground = `linear-gradient(135deg, ${getSkyPalette(condition, timeOfDay).join(', ')})`;
    const tapAction = config.tap_action?.action ?? 'more-info';
    const interactive = tapAction !== 'none';
    const ariaLabel = [locationName, conditionLabel, numericTemp != null ? `${numericTemp}°` : '']
      .filter(Boolean)
      .join(', ');

    return html`
      <ha-card
        role=${interactive ? 'button' : 'region'}
        tabindex=${interactive ? '0' : '-1'}
        data-action=${tapAction}
        aria-label=${ariaLabel}
        @click=${this._handleTap}
        @keydown=${this._handleKeydown}
      >
        <div
          class="hero ${classMap({ 'lightning-flash': this._flash })}"
          style=${styleMap({ background: heroBackground })}
        >
          <div class="stars" aria-hidden="true">
            ${timeOfDay === 'night' ? unsafeHTML(renderStars()) : nothing}
          </div>
          <div class="scene-bg" aria-hidden="true">
            ${meta.scene
              ? unsafeHTML(renderHorizon(meta.scene === 'horizon-dawn' ? 'dawn' : 'dusk'))
              : nothing}
          </div>
          <div
            class="weather-tint"
            aria-hidden="true"
            style=${styleMap({ background: meta.tint || 'none' })}
          ></div>
          <div class="weather-layer" aria-hidden="true">
            ${unsafeHTML(renderWeatherLayer(condition))}
          </div>

          <div class="hero-text">
            ${locationName
              ? html`<div class="loc">${unsafeHTML(LOCATION_PIN_SVG)}<span>${locationName}</span></div>`
              : nothing}
            <div class="temp">${numericTemp != null ? `${numericTemp}°` : '--'}</div>
            <div class="cond">
              ${highTemp != null
                ? `${conditionLabel} · ${highTemp}°${lowTemp != null ? ` / ${lowTemp}°` : ''}`
                : conditionLabel}
            </div>
          </div>

          <div class="hero-center">
            ${alertText ? html`<div class="short-fc">${alertText}</div>` : nothing}
          </div>

          <div class="hero-icon" aria-hidden="true">
            ${unsafeHTML(generateWeatherIconSVG(meta.icon, 120))}
          </div>
        </div>
        ${this._renderForecast()}
      </ha-card>
    `;
  }

  private _renderForecast(): TemplateResult | typeof nothing {
    const config = this._config!;
    const hass = this._hass!;
    if (!config.show_forecast || this._forecast.length === 0) return nothing;

    const days = this._forecast
      .slice(0, config.forecast_days)
      .map((day) => ({ day, date: new Date(day.datetime) }))
      // drop malformed datetimes: Invalid Date would throw inside Intl.format
      .filter(({ date }) => !Number.isNaN(date.getTime()));
    const locale = hass.locale?.language || 'en';
    const todayStr = new Date().toDateString();

    return html`
      <div class="forecast">
        ${days.map(({ day, date }, index) => {
          const iconKey = getForecastIcon(day.condition);
          // label first entry "Today" if it matches current date
          const isToday = index === 0 && date.toDateString() === todayStr;
          const label = isToday ? formatTodayLabel(locale) : formatDayLabel(date, locale);
          const high =
            !config.show_no_temp && day.temperature != null
              ? `${Math.round(day.temperature)}°`
              : null;
          const low =
            config.show_low_temp && !config.show_no_temp && day.templow != null
              ? `${Math.round(day.templow)}°`
              : null;
          return html`
            <div class="fc-day">
              <span class="fc-d">${label}</span>
              <div class="fc-icon" aria-hidden="true">
                ${unsafeHTML(generateSmallForecastIcon(iconKey, 28))}
              </div>
              ${high ? html`<span class="fc-t">${high}</span>` : nothing}
              ${low ? html`<span class="fc-lo">${low}</span>` : nothing}
            </div>
          `;
        })}
      </div>
    `;
  }

  // lightning scene management reacts to condition/time-of-day changes

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!this._config || !this._hass) return;
    const stateObj = this._hass.states[this._config.entity];
    if (!stateObj) return;

    const timeOfDay = getTimeOfDay(this._hass.states[this._config.sun_entity]);
    const sceneKey = `${stateObj.state}|${timeOfDay}`;
    if (sceneKey === this._lastSceneKey) return;

    this._lastSceneKey = sceneKey;
    // clear pending lightning timers from the previous scene
    this._clearAllTimeouts();
    // drop a mid-flash overlay whose removal timer was just cleared
    if (this._flash) this._flash = false;
    this._manageLightning(stateObj.state);
  }

  private _manageLightning(condition: string): void {
    this._lightningActive = condition === 'lightning' || condition === 'lightning-rainy';
    if (this._lightningActive) this._scheduleLightning();
  }

  private _scheduleLightning(): void {
    if (!this.isConnected || !this._lightningActive) return;
    const delay = 4000 + Math.random() * 14000;

    this._safeTimeout(() => {
      if (!this._lightningActive) return;
      this._triggerFlash();
      this._scheduleLightning();
    }, delay);
  }

  private _triggerFlash(): void {
    this._flash = true;
    this._safeTimeout(() => {
      this._flash = false;
    }, 120);

    if (Math.random() > 0.6) {
      this._safeTimeout(() => {
        this._flash = true;
        this._safeTimeout(() => {
          this._flash = false;
        }, 80);
      }, 200);
    }
  }

  // timeout helpers

  private _safeTimeout(callback: () => void, delay: number): void {
    const id = window.setTimeout(() => {
      this._activeTimeouts.delete(id);
      callback();
    }, delay);
    this._activeTimeouts.add(id);
  }

  private _clearAllTimeouts(): void {
    for (const id of this._activeTimeouts) window.clearTimeout(id);
    this._activeTimeouts.clear();
  }

  // tap actions

  private _handleTap(): void {
    this._dispatchAction();
  }

  private _handleKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      this._dispatchAction();
    }
  }

  private _dispatchAction(): void {
    if (!this._config || this._config.tap_action?.action === 'none') return;
    // fire standard HA hass-action event for platform handling
    fireEvent(this, 'hass-action', { config: this._config, action: 'tap' });
  }

  // forecast subscriptions

  private async _ensureForecastSub(): Promise<void> {
    if (!this._hass?.connection || !this._config?.entity) return;
    const target = `${this._config.entity}|${this._config.forecast_entity}`;
    if (this._subscribedTarget === target) return;
    // after a failed subscribe, wait out the cooldown instead of retrying
    // (and churning the hourly sub) on every hass update
    if (
      this._failedSubTarget === target &&
      Date.now() - this._failedSubTime < SUB_RETRY_COOLDOWN_MS
    ) {
      return;
    }

    // mark target before first await to deduplicate concurrent calls
    this._unsubForecast();
    this._subscribedTarget = target;

    // generation token to detect concurrent reconfigures
    const generation = ++this._subGeneration;
    const forecastEntity = this._config.forecast_entity;

    // always attempt daily subscription regardless of supported_features;
    // older integrations may not set the feature bits but still support it
    try {
      const unsub = await this._hass.connection.subscribeMessage<ForecastEvent>(
        (msg) => {
          // a superseded subscription can still deliver until the server-side
          // unsubscribe round-trip completes; never let stale data land
          if (generation === this._subGeneration) this._forecast = msg.forecast ?? [];
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: forecastEntity },
      );

      if (generation !== this._subGeneration || !this.isConnected) {
        // stale sub from concurrent reconfigure or disconnect; discard
        void unsub();
        if (generation === this._subGeneration) this._subscribedTarget = null;
      } else {
        this._forecastUnsub = unsub;
        this._failedSubTarget = null;
      }
    } catch {
      if (generation === this._subGeneration) {
        // clear sentinel so a retry is possible, rate-limited by the cooldown gate
        this._subscribedTarget = null;
        this._failedSubTarget = target;
        this._failedSubTime = Date.now();
        // fall back to legacy entity attribute forecast; guarded by generation
        // so a stale rejection can't overwrite the current entity's data
        const fallback = this._hass.states[forecastEntity];
        if (fallback?.attributes?.forecast) {
          this._forecast = fallback.attributes.forecast as ForecastItem[];
        }
      }
    }

    try {
      const unsub = await this._hass.connection.subscribeMessage<ForecastEvent>(
        (msg) => {
          if (generation === this._subGeneration) this._hourlyForecast = msg.forecast ?? [];
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: forecastEntity },
      );

      if (generation !== this._subGeneration || !this.isConnected) {
        void unsub();
      } else {
        this._hourlyUnsub = unsub;
      }
    } catch {
      // hourly forecast not supported; not an error — but only the current
      // generation may clear data a newer subscription already delivered
      if (generation === this._subGeneration) this._hourlyForecast = [];
    }
  }

  private _unsubForecast(): void {
    if (this._forecastUnsub) {
      void this._forecastUnsub();
      this._forecastUnsub = undefined;
    }
    if (this._hourlyUnsub) {
      void this._hourlyUnsub();
      this._hourlyUnsub = undefined;
    }
    // reset sentinel so the next _ensureForecastSub doesn't short-circuit
    this._subscribedTarget = null;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'modern-weather-card': ModernWeatherCard;
  }
}
