// Modern Weather Card v0.1.1

const CUSTOM_STRINGS = {
  en: { alertUntil: '{condition} until {time}', alertIn: '{condition} in {mins} min', alertFrom: '{condition} from {time}' },
  de: { alertUntil: '{condition} bis {time} Uhr', alertIn: '{condition} in {mins} Min.', alertFrom: '{condition} ab {time} Uhr' }
};

const getLocalText = (localeObj, key, vars = {}) => {
  const lang = (localeObj?.language || navigator.language || 'en').split('-')[0];
  const dict = CUSTOM_STRINGS[lang] || CUSTOM_STRINGS.en;
  let text = dict[key] || CUSTOM_STRINGS.en[key];
  for (const [k, v] of Object.entries(vars)) { text = text.replace(`{${k}}`, v); }
  return text;
};

// locale-aware time formatting
const formatTime = (date, localeObj = {}, configFormat = 'default') => {
  const lang = localeObj.language || navigator.language || 'en';
  const formatPref = (configFormat && configFormat !== 'default') ? configFormat : (localeObj.time_format || 'language');
  const options = { hour: '2-digit', minute: '2-digit' };

  if (formatPref === '24') {
    options.hour12 = false;
    options.hourCycle = 'h23';
  } else if (formatPref === '12') {
    options.hour12 = true;
    options.hourCycle = 'h12';
  } else if (formatPref === 'system') {
    // resolve OS/browser preference via Intl
    const resolved = new Intl.DateTimeFormat().resolvedOptions();
    options.hourCycle = resolved.hourCycle;
  }
  // 'language' / unknown: Intl uses locale default

  return new Intl.DateTimeFormat(lang, options).format(date);
};

const formatDayLabel = (date, locale = 'en') => 
  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);

// conditions that trigger short-forecast alerts
const NOTABLE_CONDITIONS = ['lightning-rainy', 'lightning', 'hail', 'pouring', 'rainy', 'snowy-rainy', 'snowy', 'windy-variant', 'windy'];

// group related conditions for "until" logic
const getConditionGroup = (c) => {
  if (['rainy', 'pouring', 'lightning-rainy', 'hail'].includes(c)) return 'rain';
  if (['snowy', 'snowy-rainy'].includes(c)) return 'snow';
  if (['windy', 'windy-variant'].includes(c)) return 'wind';
  if (c === 'lightning') return 'thunder';
  return c;
};

const FORECAST_ICONS = {
  'sunny': 'sun', 'clear-night': 'moon', 'partlycloudy': 'sun-cloud',
  'cloudy': 'cloud', 'fog': 'cloud', 'rainy': 'rain', 'pouring': 'rain',
  'snowy': 'snow', 'snowy-rainy': 'snow', 'hail': 'rain', 'lightning': 'lightning',
  'lightning-rainy': 'lightning', 'windy': 'cloud', 'windy-variant': 'cloud',
  'exceptional': 'warning'
};

const STYLES = `
  :host { display: block; font-family: Roboto, -apple-system, sans-serif; isolation: isolate; }
  ha-card { background: none !important; border: none !important; box-shadow: none !important; overflow: visible; }
  ha-card[data-action]:not([data-action="none"]) { cursor: pointer; }

  .hero {
    position: relative;
    border-radius: var(--ha-card-border-radius, 20px);
    padding: 24px 26px 22px;
    display: flex; justify-content: space-between; align-items: center;
    overflow: hidden; min-height: 125px;
    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);
    transition: background 1.5s ease-in-out;
  }
  .hero:focus { outline: 2px solid rgba(255,255,255,0.6); outline-offset: 2px; }
  .hero:focus:not(:focus-visible) { outline: none; }
  .hero::after {
    content: ""; position: absolute; inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1), transparent 50%);
    pointer-events: none; z-index: 0;
  }

  .stars        { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
  .scene-bg     { position: absolute; inset: 0; pointer-events: none; z-index: 2; overflow: hidden; border-radius: inherit; }
  .weather-tint { position: absolute; inset: 0; pointer-events: none; z-index: 3; border-radius: inherit; transition: background 1.5s ease; }
  .weather-layer{ position: absolute; inset: 0; pointer-events: none; z-index: 4; overflow: hidden; border-radius: inherit; }

  .hero-text { position: relative; z-index: 5; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .loc { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 2px; letter-spacing: 0.3px; }
  .temp { font-size: 56px; font-weight: 200; line-height: 1.0; color: #ffffff; letter-spacing: -1.5px; }
  .cond { font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.9); margin-top: 6px; }
  
  .hero-center {
    position: relative; z-index: 5;
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6px; padding: 0 12px;
  }

  .short-fc { 
    font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.9); 
    background: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 6px; 
    text-align: center; backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); 
    border: 1px solid rgba(255,255,255,0.1); width: fit-content; max-width: 135px;
  }
  .short-fc:empty { display: none; }

  .hero-icon { position: relative; z-index: 5; flex-shrink: 0; margin-right: -4px; }
  .hero-icon svg { display: block; filter: drop-shadow(0 8px 16px rgba(0,0,0,0.25)); }
  .error { padding: 16px; color: var(--error-color, #ef4444); font-size: 14px; }
  .error-overlay {
    display: none; position: absolute; inset: 0; z-index: 20;
    align-items: center; justify-content: center;
    background: rgba(0,0,0,0.55); border-radius: inherit;
    padding: 16px; color: var(--error-color, #ef4444); font-size: 13px;
    text-align: center;
  }
  .error-overlay[hidden] { display: none !important; }
  .error-overlay:not([hidden]) { display: flex; }

  .hero.lightning-flash::before {
    content: ''; position: absolute; inset: 0;
    background: white; opacity: 0.4;
    z-index: 10; pointer-events: none; border-radius: inherit;
  }

  .forecast { display: flex; gap: 8px; margin-top: 12px; }
  .fc-day {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 12px 6px;
    border-radius: calc(var(--ha-card-border-radius, 20px) - 4px);
    background: var(--card-background-color, rgba(255,255,255,0.06));
    border: 1px solid var(--divider-color, rgba(255,255,255,0.08));
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: transform 0.2s ease, background 0.2s ease;
  }
  @media (hover: hover) {
    .fc-day:hover { background: var(--secondary-background-color, rgba(255,255,255,0.1)); transform: translateY(-1px); }
  }
  .fc-d { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--secondary-text-color, #94a3b8); }
  .fc-icon { height: 28px; display: flex; align-items: center; justify-content: center; }
  .fc-t { font-size: 14px; font-weight: 500; color: var(--primary-text-color, #f8fafc); }
  .fc-lo { font-size: 11px; font-weight: 400; color: var(--secondary-text-color, #64748b); margin-top: -2px; }
`;

// main component

class ModernWeatherCard extends HTMLElement {

  constructor() {
    super();
    // init state so cleanup is safe on first setConfig call
    this._activeTimeouts = new Set();
    this._forecastUnsub = null;
    this._hourlyUnsub = null;
    this._subscribedEntity = null;
    this._isConnected = false;
    this._built = false;
    this._tickInterval = null;
    this._lastStateHash = '';
    this._lastSceneKey = '';
    this._lightningActive = false;
    this._forecast = [];
    this._hourlyForecast = [];
    this._subGeneration = 0;
  }

  // HA lifecycle

  setConfig(config) {
    if (!config.entity) throw new Error('Please define a weather entity');

    // reset live state from previous config
    this._clearAllTimeouts();
    this._unsubForecast();

    this._config = {
      name: '',
      show_forecast: true,
      show_low_temp: false,
      show_no_temp: false,
      forecast_days: 5,
      sun_entity: 'sun.sun',
      time_format: 'default',
      alert_lookahead: 12,
      tap_action: { action: 'more-info' },
      ...config
    };

    // fallback after spread so a cleared editor field doesn't win with ""
    if (!this._config.forecast_entity) {
      this._config.forecast_entity = this._config.entity;
    }

    this._forecast = [];
    this._hourlyForecast = [];
    this._lastStateHash = '';
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._built) this._build();

    // skip work when no relevant entity changed
    const relevant =
      !prev ||
      prev.states[this._config?.entity]    !== hass.states[this._config?.entity] ||
      prev.states[this._config?.sun_entity] !== hass.states[this._config?.sun_entity] ||
      prev.locale !== hass.locale;

    if (relevant) this._update();
    this._ensureForecastSub();
  }

  connectedCallback() {
    this._isConnected = true;
    this._ensureForecastSub();
    // restart lightning if scene was active before detach
    if (this._lightningActive) this._scheduleLightning();
    // refresh short-forecast text every minute
    clearInterval(this._tickInterval);
    this._tickInterval = setInterval(() => {
      this._lastStateHash = '';
      this._update();
    }, 60000);
  }
  
  disconnectedCallback() {
    this._isConnected = false;
    this._unsubForecast();
    this._clearAllTimeouts();
    clearInterval(this._tickInterval);
    // click listener targets shadow DOM — GC'd with the element, no removal needed
  }

  static async getConfigElement() {
    await import('./modern-weather-card-editor.js');
    return document.createElement('modern-weather-card-editor');
  }
  static getStubConfig(hass) {
    // pick first available weather entity
    const entity = hass
      ? Object.keys(hass.states).find(e => e.startsWith('weather.')) || 'weather.home'
      : 'weather.home';
    return { entity, name: 'Modern', show_forecast: true, show_low_temp: false, time_format: 'default', alert_lookahead: 12 };
  }
  getCardSize()    { return this._config?.show_forecast ? 5 : 3; }
  getGridOptions() {
    return this._config?.show_forecast
      ? { rows: 4, columns: 12, min_rows: 4 }
      : { rows: 2, columns: 12, min_rows: 2 };
  }

  // timeout helpers

  _safeTimeout(callback, delay) {
    const id = setTimeout(() => {
      this._activeTimeouts.delete(id);
      callback();
    }, delay);
    this._activeTimeouts.add(id);
    return id;
  }

  _clearAllTimeouts() {
    for (const id of this._activeTimeouts) clearTimeout(id);
    this._activeTimeouts.clear();
  }

  // shadow DOM

  _build() {
    // guard on shadowRoot to prevent double attachShadow
    if (this.shadowRoot) return;
    this._built = true;

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      <ha-card role="button" tabindex="0">
        <div class="hero" id="hero">
          <div class="stars" id="stars" aria-hidden="true"></div>
          <div class="scene-bg" id="sceneBg" aria-hidden="true"></div>
          <div class="weather-tint" id="weatherTint" aria-hidden="true"></div>
          <div class="weather-layer" id="weatherLayer" aria-hidden="true"></div>
          
          <div class="hero-text">
            <div class="loc" id="loc">
               <span id="locIcon"></span>
               <span id="locName"></span>
            </div>
            <div class="temp" id="temp"></div>
            <div class="cond" id="cond"></div>
          </div>
          
          <div class="hero-center">
            <div class="short-fc" id="shortFc"></div>
          </div>
          
          <div class="hero-icon" id="heroIcon"></div>
          <div class="error-overlay" id="errorOverlay" hidden></div>
        </div>
        <div class="forecast" id="forecast"></div>
      </ha-card>
    `;
    
    this._clickHandler = () => this._handleAction(this._config.tap_action);
    const card = this.shadowRoot.querySelector('ha-card');
    card.addEventListener('click', this._clickHandler);
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        this._handleAction(this._config.tap_action);
      }
    });
  }

  // tap actions

  _handleAction(actionConfig) {
    if (!actionConfig || actionConfig.action === 'none') return;

    // fire standard HA hass-action event for platform handling
    this.dispatchEvent(new CustomEvent('hass-action', {
      detail: {
        config: { ...this._config, tap_action: actionConfig },
        action: 'tap'
      },
      bubbles: true,
      composed: true
    }));
  }

  // state update and render

  _update() {
    if (!this._hass || !this._config || !this._built) return;
    const entity = this._hass.states[this._config.entity];
    
    if (!entity) {
      // show error overlay; uses textContent to prevent XSS
      const overlay = this.shadowRoot.getElementById('errorOverlay');
      overlay.textContent = `Entity not found: ${this._config.entity}`;
      overlay.removeAttribute('hidden');
      // reset hashes so card re-renders when entity appears
      this._lastStateHash = '';
      this._lastSceneKey = '';
      return;
    }
    this.shadowRoot.getElementById('errorOverlay').setAttribute('hidden', '');

    const currentCondition = entity.state;
    const rawTemp = entity.attributes.temperature;
    const numericTemp = (rawTemp != null && Number.isFinite(+rawTemp)) ? Math.round(rawTemp) : null;
    const sunState = this._hass.states[this._config.sun_entity];
    const timeOfDay = this._getTimeOfDay(sunState);
    const weatherMeta = this._getWeatherMeta(currentCondition, timeOfDay);
    // empty string in config hides the pin; undefined falls back to friendly_name
    const locationName = this._config.name !== undefined ? this._config.name : (entity.attributes.friendly_name || '');

    const todayForecast = (this._forecast || [])[0] || {};
    const highTemp = todayForecast.temperature != null ? Math.round(todayForecast.temperature) : '';
    const lowTemp = todayForecast.templow != null ? Math.round(todayForecast.templow) : '';

    const shortFcText = this._getShortForecastText(currentCondition);

    // deep compare to prevent DOM thrashing
    const currentStateHash = JSON.stringify({
      currentCondition, numericTemp, timeOfDay, locationName, highTemp, lowTemp,
      shortFcText, locale: this._hass.locale,
      forecast: this._forecast.slice(0, this._config.forecast_days)
    });

    if (this._lastStateHash === currentStateHash) return;
    this._lastStateHash = currentStateHash;

    // keep aria-label current for screen readers
    const ariaLabel = [locationName, weatherMeta.label, numericTemp != null ? `${numericTemp}°` : '']
      .filter(Boolean).join(', ');
    const card = this.shadowRoot.querySelector('ha-card');
    card.setAttribute('aria-label', ariaLabel);

    const tapAction = this._config.tap_action?.action || 'more-info';
    card.setAttribute('data-action', tapAction);
    card.setAttribute('tabindex', tapAction !== 'none' ? '0' : '-1');
    card.setAttribute('role', tapAction !== 'none' ? 'button' : 'region');

    const sceneKey = `${currentCondition}|${timeOfDay}`;
    const sceneChanged = sceneKey !== this._lastSceneKey;
    if (sceneChanged) {
      this._lastSceneKey = sceneKey;
      // clear pending lightning timers from previous scene
      this._clearAllTimeouts();
    }

    const hero = this.shadowRoot.getElementById('hero');
    const skyPalette = this._getSkyPalette(timeOfDay);
    hero.style.background = skyPalette.length === 3
      ? `linear-gradient(135deg, ${skyPalette[0]}, ${skyPalette[1]}, ${skyPalette[2]})`
      : `linear-gradient(135deg, ${skyPalette[0]}, ${skyPalette[1]})`;

    if (sceneChanged) {
      const isNight = (timeOfDay === 'night');
      this.shadowRoot.getElementById('stars').innerHTML = isNight ? this._renderStars() : '';
      this.shadowRoot.getElementById('sceneBg').innerHTML = weatherMeta.sceneSvg || '';
      this.shadowRoot.getElementById('weatherTint').style.background = weatherMeta.tint || 'none';
      this.shadowRoot.getElementById('weatherLayer').innerHTML = this._renderWeatherLayer(currentCondition);
      this.shadowRoot.getElementById('heroIcon').innerHTML = this._generateWeatherIconSVG(weatherMeta.icon, 120);
      this._manageLightning(currentCondition);
    }

    this.shadowRoot.getElementById('locIcon').innerHTML = locationName 
      ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>` 
      : '';
    this.shadowRoot.getElementById('locName').textContent = locationName;
    
    this.shadowRoot.getElementById('temp').textContent = numericTemp != null ? `${numericTemp}°` : '--';
    this.shadowRoot.getElementById('cond').textContent = highTemp !== ''
      ? `${weatherMeta.label} · ${highTemp}°${lowTemp !== '' ? ' / ' + lowTemp + '°' : ''}`
      : weatherMeta.label;

    this.shadowRoot.getElementById('shortFc').textContent = shortFcText;

    this._renderForecast();
  }

  // time of day from sun entity

  _getTimeOfDay(sunState) {
    if (!sunState?.attributes || sunState.attributes.elevation == null) {
      const currentHour = new Date().getHours();
      if (currentHour >= 7 && currentHour < 18) return 'day';
      if (currentHour >= 18 && currentHour < 21) return 'dusk';
      if (currentHour >= 5  && currentHour < 7)  return 'dawn';
      return 'night';
    }
    const elevation = sunState.attributes.elevation;
    const isRising  = sunState.attributes.rising ?? false;
    // twilight: >6 day, -6..6 dawn/dusk, <-6 night
    if (elevation > 6)  return 'day';
    if (elevation > -6) return isRising ? 'dawn' : 'dusk';
    return 'night';
  }

  // short forecast alert text

  _getShortForecastText(currentCondition) {
    if (!this._hourlyForecast || this._hourlyForecast.length === 0) return '';

    const lookahead = this._config.alert_lookahead !== undefined ? this._config.alert_lookahead : 12;
    if (lookahead <= 0) return '';

    const now    = new Date();
    const cutoff = new Date(now.getTime() + lookahead * 3600000);

    const currentNotable = NOTABLE_CONDITIONS.includes(currentCondition) ? currentCondition : null;

    for (const hour of this._hourlyForecast) {
      const targetTime = new Date(hour.datetime);
      if (targetTime < now)    continue;
      if (targetTime > cutoff) break;

      const isHourNotable = NOTABLE_CONDITIONS.includes(hour.condition);

      if (currentNotable) {
        if (!isHourNotable || getConditionGroup(hour.condition) !== getConditionGroup(currentNotable)) {
          const timeStr = formatTime(targetTime, this._hass.locale, this._config.time_format);
          return getLocalText(this._hass.locale, 'alertUntil', { condition: this._localizeCondition(currentNotable), time: timeStr });
        }
      } else {
        if (isHourNotable) {
          const timeStr  = formatTime(targetTime, this._hass.locale, this._config.time_format);
          const diffMins = Math.round((targetTime - now) / 60000);
          const condName = this._localizeCondition(hour.condition);

          if (diffMins > 0 && diffMins < 60) {
            return getLocalText(this._hass.locale, 'alertIn', { condition: condName, mins: diffMins });
          }
          return getLocalText(this._hass.locale, 'alertFrom', { condition: condName, time: timeStr });
        }
      }
    }
    // notable condition persists past lookahead; no useful "until" to show
    return '';
  }

  // sky gradients

  _getSkyPalette(timeOfDay) {
    switch (timeOfDay) {
      case 'dawn':  return ['#2e1b4b', '#b45309', '#f59e0b'];
      case 'dusk':  return ['#111827', '#6b21a8', '#db2777'];
      case 'night': return ['#030712', '#0b1329', '#111827'];
      default:      return ['#38bdf8', '#2563eb'];
    }
  }

  // weather metadata for icon/tint/scene selection

  _getWeatherMeta(condition, timeOfDay) {
    const isNight = timeOfDay === 'night';
    const isDawn = timeOfDay === 'dawn';
    const isDusk = timeOfDay === 'dusk';

    let icon, tint = '', sceneSvg = '';
    
    switch (condition) {
      case 'lightning': 
      case 'lightning-rainy':
        icon = 'thunderstorm';
        tint = 'linear-gradient(180deg, rgba(15,23,42,0.55), rgba(30,41,59,0.35))';
        break;
      case 'pouring':
        icon = 'rain-heavy';
        tint = 'linear-gradient(180deg, rgba(15,23,42,0.5), rgba(30,41,59,0.35))';
        break;
      case 'rainy':
        icon = 'rain';
        tint = 'linear-gradient(180deg, rgba(30,41,59,0.4), rgba(51,65,85,0.25))';
        break;
      case 'hail':
        icon = 'hail';
        tint = 'linear-gradient(180deg, rgba(15,23,42,0.4), rgba(30,41,59,0.2))';
        break;
      case 'snowy': 
      case 'snowy-rainy':
        icon = 'snow';
        tint = 'linear-gradient(180deg, rgba(100,116,139,0.2), rgba(148,163,184,0.1))';
        break;
      case 'fog':
        icon = 'fog';
        tint = 'linear-gradient(180deg, rgba(148,163,184,0.3), rgba(100,116,139,0.15))';
        break;
      case 'windy': 
      case 'windy-variant':
        icon = 'wind'; 
        break;
      case 'cloudy':
        icon = 'overcast';
        tint = 'linear-gradient(180deg, rgba(51,65,85,0.25), rgba(71,85,105,0.1))';
        break;
      case 'partlycloudy':
        icon = isNight ? 'cloud-moon' : 'partly-cloudy';
        if (!isNight) tint = 'linear-gradient(180deg, rgba(51,65,85,0.1), transparent)';
        if (isDawn || isDusk) sceneSvg = this._renderHorizon(timeOfDay);
        break;
      case 'clear-night':
        icon = 'moon'; 
        break;
      default:
        if (condition === 'exceptional') {
          icon = 'warning';
          tint = 'linear-gradient(180deg, rgba(120,53,15,0.4), rgba(180,83,9,0.2))';
        } else if (isNight) icon = 'moon';
        else if (isDawn) { icon = 'sunrise'; sceneSvg = this._renderHorizon('dawn'); }
        else if (isDusk) { icon = 'sunset';  sceneSvg = this._renderHorizon('dusk'); }
        else icon = 'sun';
        break;
    }
    
    const localizedLabel = this._localizeCondition(condition);

    return { icon, tint, sceneSvg, label: localizedLabel };
  }

  // localize condition slug via HA, fallback to humanized slug
  _localizeCondition(condition) {
    const raw =
      this._hass.localize(`component.weather.entity_component._.state.${condition}`) ||
      this._hass.localize(`component.weather.state._.${condition}`) ||
      condition.replaceAll('-', ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // background weather layers

  _renderWeatherLayer(condition) {
      switch (condition) {
        case 'rainy':
        case 'pouring':
        case 'lightning':
        case 'lightning-rainy':
        case 'hail':            return this._renderRainSplashes(condition === 'pouring' ? 10 : 6);
        case 'snowy':           
        case 'snowy-rainy':     return this._renderLayeredSnow();
        case 'fog':             return this._renderVolumetricFog();
        default:                return '';
      }
    }

  _renderLayeredSnow() {
    // three depth layers: large/slow foreground to small/fast background
    const snowLayers = [
      { count: 4, minRadius: 1.8, maxRadius: 2.8, duration: 4,  opacity: 0.9,  drift: 8  },
      { count: 6, minRadius: 1.0, maxRadius: 1.8, duration: 7,  opacity: 0.5,  drift: 5  },
      { count: 8, minRadius: 0.5, maxRadius: 1.0, duration: 11, opacity: 0.25, drift: 3  },
    ];

    let svgOutput = '';

    snowLayers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.count; i++) {
        // deterministic pseudo-random spread via prime-multiplier hashing
        const xPos = 5 + ((i * 41 + layerIndex * 17 + 7) % 90);
        const radius = layer.minRadius + ((i * 13 + layerIndex * 7) % 10) / 10 * (layer.maxRadius - layer.minRadius);
        const animationDuration = layer.duration + ((i * 7) % 4) * 0.5;
        const driftX = layer.drift * (((i + layerIndex) % 2) ? 1 : -1);
        const delay = ((i * 11 + layerIndex * 5) % 10) * 0.3;
        
        svgOutput += `<circle cx="${xPos}" cy="0" r="${radius.toFixed(1)}" fill="#f0f4f8" opacity="0">
          <animateTransform attributeName="transform" type="translate"
            from="0,-5" to="${driftX},105" dur="${animationDuration}s" begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;${layer.opacity};${layer.opacity};0"
            keyTimes="0;0.06;0.82;1" dur="${animationDuration}s" begin="${delay}s" repeatCount="indefinite"/>
        </circle>`;
      }
    });

    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${svgOutput}</svg>`;
  }

  _renderVolumetricFog() {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.25">
        <ellipse cx="20" cy="50" rx="35" ry="10" fill="#cbd5e1">
          <animateTransform attributeName="transform" type="translate" values="-12,0; 22,0; -12,0" dur="24s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="75" cy="65" rx="40" ry="12" fill="#94a3b8">
          <animateTransform attributeName="transform" type="translate" values="18,0; -18,0; 18,0" dur="30s" repeatCount="indefinite"/>
        </ellipse>
        <ellipse cx="45" cy="38" rx="30" ry="8" fill="#e2e8f0">
          <animateTransform attributeName="transform" type="translate" values="-8,2; 15,-2; -8,2" dur="20s" repeatCount="indefinite"/>
        </ellipse>
      </g>
      <g opacity="0.12">
        <ellipse cx="60" cy="80" rx="50" ry="14" fill="#f1f5f9">
          <animateTransform attributeName="transform" type="translate" values="10,0; -20,0; 10,0" dur="36s" repeatCount="indefinite"/>
        </ellipse>
      </g>
    </svg>`;
  }

  _renderRainSplashes(count) {
    const xMin = 76, xSpan = 17;
    let svg = '';
    for (let i = 0; i < count; i++) {
      const splashX = xMin + ((i * 23 + 5) % xSpan);
      const splashDuration = 0.45 + ((i * 7) % 4) * 0.1;
      const splashDelay = ((i * 11) % 14) * 0.08;
      svg += `<ellipse cx="${splashX}" cy="95" rx="0" ry="0" fill="none" stroke="rgba(210,230,255,0.5)" stroke-width="0.4">
        <animate attributeName="rx" values="0;3;0" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="0;0.8;0" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="${splashX}" cy="95" r="0.4" fill="rgba(210,230,255,0.45)" opacity="0">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="${((i%2)?1.5:-1.5)},-3.5" dur="${splashDuration*0.4}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.6;0" dur="${splashDuration*0.4}s" begin="${splashDelay}s" repeatCount="indefinite"/>
      </circle>`;
    }
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  }

  // lightning

  _manageLightning(condition) {
    const isLightning = (condition === 'lightning' || condition === 'lightning-rainy');
    
    this._lightningActive = isLightning;
    if (!isLightning) return;
    this._scheduleLightning();
  }

  _scheduleLightning() {
    if (!this._isConnected || !this._lightningActive) return;
    const delay = 4000 + Math.random() * 14000;
    
    this._safeTimeout(() => {
      if (!this._lightningActive) return;
      this._triggerFlash();
      this._scheduleLightning();
    }, delay);
  }

  _triggerFlash() {
    const hero = this.shadowRoot?.getElementById('hero');
    if (!hero) return;
    
    hero.classList.add('lightning-flash');
    this._safeTimeout(() => hero.classList.remove('lightning-flash'), 120);
    
    if (Math.random() > 0.6) {
      this._safeTimeout(() => {
        hero.classList.add('lightning-flash');
        this._safeTimeout(() => hero.classList.remove('lightning-flash'), 80);
      }, 200);
    }
  }

  // weather icon SVGs

  _generateWeatherIconSVG(weatherType, size = 100) {
    const svgDefs = `<defs>
      <filter id="iconGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
      <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fffbeb"/><stop offset="30%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#ea580c"/></linearGradient>
      <linearGradient id="cloudFront" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#cbd5e1"/></linearGradient>
      <linearGradient id="cloudBack" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#94a3b8" stop-opacity="0.6"/><stop offset="100%" stop-color="#475569" stop-opacity="0.6"/></linearGradient>
      <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
    </defs>`;

    switch (weatherType) {
      case 'sun':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g filter="url(#iconGlow)"><g transform="translate(50,50)">
            <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="50s" repeatCount="indefinite"/>${this._generateSunRays(20, 36, 8)}</g>
            <circle cx="0" cy="0" r="20" fill="url(#sunGradient)"/>
            <circle cx="0" cy="0" r="20" fill="url(#sunGradient)" opacity="0.35"><animate attributeName="r" values="20;23;20" dur="4s" repeatCount="indefinite"/></circle>
          </g></g></svg>`;

      case 'partly-cloudy':
        return `<svg width="${size}" height="${size}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g filter="url(#iconGlow)"><g transform="translate(75,30)">
            <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite"/>${this._generateSunRays(14, 28, 8)}</g>
            <circle cx="0" cy="0" r="15" fill="url(#sunGradient)"/>
          </g></g>
          <g><animateTransform attributeName="transform" type="translate" values="-3,0; 3,0; -3,0" dur="7s" repeatCount="indefinite"/>${this._generateCloud(20, 42, 0.9, 'url(#cloudBack)')}</g>
          <g><animateTransform attributeName="transform" type="translate" values="0,0; 1.5,-1; 0,0" dur="5s" repeatCount="indefinite"/>${this._generateCloud(10, 48, 1.0, 'url(#cloudFront)')}</g>
        </svg>`;

      case 'cloud-moon':
        return `<svg width="${size}" height="${size}" viewBox="0 0 110 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="8s" repeatCount="indefinite"/>
            <path d="M65,15 A18,18 0 1,0 85,38 A14,14 0 1,1 65,15 Z" fill="url(#moonGradient)"/></g>
          <g><animateTransform attributeName="transform" type="translate" values="-2,0; 2,0; -2,0" dur="8s" repeatCount="indefinite"/>${this._generateCloud(22, 44, 0.9, 'url(#cloudBack)')}</g>
          ${this._generateCloud(12, 50, 1.0, 'url(#cloudFront)')}
        </svg>`;

      case 'overcast':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g><animateTransform attributeName="transform" type="translate" values="3,2; -3,-1; 3,2" dur="12s" repeatCount="indefinite"/>${this._generateCloud(5, 34, 1.05, 'url(#cloudBack)')}</g>
          <g><animateTransform attributeName="transform" type="translate" values="-2,-2; 2,1; -2,-2" dur="9s" repeatCount="indefinite"/>${this._generateCloud(12, 44, 1.15, 'url(#cloudFront)')}</g>
        </svg>`;

      case 'rain': 
      case 'rain-heavy': {
        const isIntense = (weatherType === 'rain-heavy');
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g opacity="0.5"><animateTransform attributeName="transform" type="translate" values="2,1; -2,-1; 2,1" dur="10s" repeatCount="indefinite"/>${this._generateCloud(8, 26, 0.95, 'url(#cloudBack)')}</g>
          <g><animateTransform attributeName="transform" type="translate" values="-1,0; 1.5,-0.5; -1,0" dur="7s" repeatCount="indefinite"/>${this._generateCloud(10, 32, 1.0, 'url(#cloudFront)')}</g>
          ${this._generateRainDrops(isIntense ? 16 : 8)}
        </svg>`; 
      }

      case 'thunderstorm':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g opacity="0.5">${this._generateCloud(8, 22, 0.95, 'url(#cloudBack)')}</g>
          ${this._generateCloud(10, 28, 1.05, 'url(#cloudFront)')}
          <polygon points="52,52 42,68 49,68 43,84 62,62 53,62 60,52" fill="#fde047" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.12;0.85;0.1;0.9;0.9;0.8;0.12;0.85;0.9" dur="2.5s" repeatCount="indefinite"/></polygon>
          ${this._generateRainDrops(10)}
        </svg>`;

      case 'snow':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g opacity="0.45">${this._generateCloud(8, 24, 0.95, 'url(#cloudBack)')}</g>
          ${this._generateCloud(10, 30, 1.0, 'url(#cloudFront)')}
        </svg>`;

      case 'hail':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" overflow="visible" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g opacity="0.5">${this._generateCloud(8, 24, 0.95, 'url(#cloudBack)')}</g>
          ${this._generateCloud(10, 30, 1.0, 'url(#cloudFront)')}
          ${this._generateHailStones()}
        </svg>`;

      case 'fog':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g><animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="6s" repeatCount="indefinite"/>
          ${this._generateCloud(10, 30, 1.0, 'url(#cloudFront)')}</g>
        </svg>`;

      case 'wind':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="3" stroke-linecap="round">
            <path d="M10,35 Q35,25 55,35 T90,35" stroke-dasharray="40 100"><animate attributeName="stroke-dashoffset" values="140;-140" dur="3.5s" repeatCount="indefinite"/></path>
            <path d="M5,52 Q30,60 60,48 T95,52" stroke-dasharray="50 90"><animate attributeName="stroke-dashoffset" values="140;-140" dur="2.8s" repeatCount="indefinite"/></path>
            <path d="M15,68 Q40,60 60,68 T85,64" stroke-dasharray="30 110"><animate attributeName="stroke-dashoffset" values="140;-140" dur="4.2s" repeatCount="indefinite"/></path>
          </g></svg>`;

      case 'moon':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g filter="url(#iconGlow)"><animateTransform attributeName="transform" type="translate" values="0,0; -2,-3; 0,0" dur="10s" repeatCount="indefinite"/>
            <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="url(#moonGradient)"/>
            <path d="M35,25 A24,24 0 1,0 65,58 A19,19 0 1,1 35,25 Z" fill="#fff" opacity="0.12"/></g>
        </svg>`;

      case 'warning':
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g filter="url(#iconGlow)">
            <polygon points="50,8 94,88 6,88" fill="#f59e0b" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>
            </polygon>
            <text x="50" y="74" text-anchor="middle" font-size="38" font-weight="bold" fill="#1c1917">!</text>
          </g>
        </svg>`;

      case 'sunrise': 
      case 'sunset': {
        const isSunset = weatherType === 'sunset';
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgDefs}
          <g transform="translate(50,70)">
            <g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="80s" repeatCount="indefinite"/>${this._generateSunRays(15, 34, 8)}</g>
            <circle cx="0" cy="0" r="16" fill="url(#sunGradient)">${!isSunset ? '<animateTransform attributeName="transform" type="translate" from="0,15" to="0,0" dur="3.5s" fill="freeze"/>' : ''}</circle>
          </g>
        </svg>`; 
      }

      default:
        return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="20" fill="#888"/></svg>`;
    }
  }

  // SVG shape helpers

  _generateCloud(xOffset, yOffset, scale, fillCode) {
    return `<path d="M20,40 C20,30 28,22 38,22 C41,22 44,23 46,25 C50,15 60,10 70,10 C82,10 92,18 94,30 C100,31 106,37 106,44 C106,51 100,58 92,58 L20,58 C13,58 8,53 8,46 C8,41 13,36 18,36Z" fill="${fillCode}" transform="translate(${xOffset},${yOffset}) scale(${scale * 0.7})"/>`;
  }

  _generateSunRays(innerRadius, outerRadius, count) {
    let raysSvg = '';
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 360;
      const radians = angle * Math.PI / 180;
      const leftRadians = (angle - 6) * Math.PI / 180;
      const rightRadians = (angle + 6) * Math.PI / 180;
      raysSvg += `<polygon points="${innerRadius*Math.cos(leftRadians)},${innerRadius*Math.sin(leftRadians)} ${outerRadius*Math.cos(radians)},${outerRadius*Math.sin(radians)} ${innerRadius*Math.cos(rightRadians)},${innerRadius*Math.sin(rightRadians)}" fill="#f59e0b" opacity="0.45"/>`;
    }
    return raysSvg;
  }

  _generateRainDrops(count) {
    const cloudBottom = 73;
    const xMin = 18, xSpan = 64;
    // three depth layers: thin/fast background to thick/slow foreground
    const rainLayers = [
      { dropCount: Math.ceil(count * 0.3),  strokeWidth: 0.4, opacity: 0.14, speed: 1.3,  length: 4 },
      { dropCount: Math.ceil(count * 0.45), strokeWidth: 0.6, opacity: 0.25, speed: 0.85, length: 6 },
      { dropCount: Math.ceil(count * 0.25), strokeWidth: 0.9, opacity: 0.38, speed: 0.55, length: 8 },
    ];
    let dropsSvg = '', splashesSvg = '';

    rainLayers.forEach((layer, layerIndex) => {
      for (let i = 0; i < layer.dropCount; i++) {
        // deterministic pseudo-random positions via prime-multiplier hashing
        const xPos = xMin + ((i * 31 + layerIndex * 19 + 7) % xSpan);
        const yPos = cloudBottom + ((i * 7 + layerIndex * 3) % 5);
        const duration = layer.speed + ((i * 11) % 5) * 0.06;
        const delay = ((i * 17 + layerIndex * 13) % 18) * 0.06;
        const drift = -1 - layerIndex;
        const fallDistance = 80;
        
        dropsSvg += `<line x1="${xPos}" y1="${yPos}" x2="${xPos + drift}" y2="${yPos + layer.length}"
          stroke="rgba(180,215,250,${layer.opacity})" stroke-width="${layer.strokeWidth}" stroke-linecap="round" opacity="0">
          <animateTransform attributeName="transform" type="translate"
            from="0,0" to="${drift * 2},${fallDistance}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0;1;1;0"
            keyTimes="0;0.05;0.88;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
        </line>`;
      }
    });

    const splashCount = Math.min(count, 8);
    for (let i = 0; i < splashCount; i++) {
      const splashX = xMin + ((i * 23 + 5) % xSpan);
      const splashDuration = 0.45 + ((i * 7) % 4) * 0.1;
      const splashDelay = ((i * 11) % 14) * 0.08;
      
      splashesSvg += `<ellipse cx="${splashX}" cy="97" rx="0" ry="0" fill="none" stroke="rgba(210,230,255,0.5)" stroke-width="0.5">
        <animate attributeName="rx" values="0;3;0" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="0;0.8;0" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="${splashDuration}s" begin="${splashDelay}s" repeatCount="indefinite"/>
      </ellipse>
      <circle cx="${splashX}" cy="97" r="0.5" fill="rgba(210,230,255,0.45)" opacity="0">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="${((i%2)?1.5:-1.5)},-4" dur="${splashDuration*0.4}s" begin="${splashDelay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.6;0" dur="${splashDuration*0.4}s" begin="${splashDelay}s" repeatCount="indefinite"/>
      </circle>`;
    }
    return `<g>${dropsSvg}</g>`;
    }

  _generateHailStones() {
    let hailOutput = '';
    const hailConfig = [[25,0], [42,0.15], [60,0.3], [35,0.5], [55,0.1], [75,0.4]];
    
    hailConfig.forEach(([xPos, delay]) => {
      const radius = 2 + ((xPos * 7) % 3);
      const duration = 0.6 + ((xPos * 11) % 4) * 0.1;
      hailOutput += `<circle cx="${xPos}" cy="70" r="${radius}" fill="#dce4ed" opacity="0">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="-1,50" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.85;0.85;0"
          keyTimes="0;0.06;0.84;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`;
    });

    for (let i = 0; i < 4; i++) {
        const splashX = 25 + ((i * 19 + 5) % 50);
        const splashDelay = ((i * 13) % 8) * 0.12;
        hailOutput += `<circle cx="${splashX}" cy="97" r="0" fill="#dce4ed" opacity="0.5">
          <animate attributeName="r" values="0;2.5;0" dur="0.5s" begin="${splashDelay}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="0.5s" begin="${splashDelay}s" repeatCount="indefinite"/>
        </circle>`;
    }
    return `<g>${hailOutput}</g>`;
  }

  _renderStars() {
    const starPoints = [
        [15,12], [72,8], [88,24], [26,6], [42,14], [80,32], [10,28], [52,8], [38,22], [94,10], 
        [18,35], [60,5], [82,18], [35,10], [68,28], [8,18], [48,6], [75,15], [30,30], [90,8]
    ];
    let starsSvg = '';
    
    for (let i = 0; i < starPoints.length; i++) {
      const [xPos, yPos] = starPoints[i];
      const radius = 0.5 + ((i * 7 + 3) % 6) * 0.1;
      const duration = 2.5 + (i % 4) * 1.1;
      starsSvg += `<circle cx="${xPos}%" cy="${yPos}%" r="${radius}" fill="#fff" opacity="0.6">
        <animate attributeName="opacity" values="0.15;0.8;0.15" dur="${duration}s" repeatCount="indefinite"/>
      </circle>`;
    }
    return `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${starsSvg}</svg>`;
  }

  _renderHorizon(type) {
    const glowColor = type === 'dawn' ? 'rgba(30,27,75,0.4)' : 'rgba(17,24,39,0.5)';
    const animation = type === 'dawn'
      ? `<animateTransform attributeName="transform" type="translate" values="0,8; 0,0; 0,8" dur="20s" repeatCount="indefinite"/>`
      : `<animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="20s" repeatCount="indefinite"/>`;
    
    return `<svg style="position:absolute;bottom:0;left:0;width:100%;height:45%;pointer-events:none" viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <g>${animation}<path d="M0,80 Q100,50 200,70 T400,60 L400,100 L0,100 Z" fill="${glowColor}"/></g>
    </svg>`;
  }

  // forecast rendering

  _renderForecast() {
    const forecastElement = this.shadowRoot.getElementById('forecast');
    if (!this._config.show_forecast || !this._forecast || this._forecast.length === 0) { 
        forecastElement.innerHTML = ''; 
        return; 
    }
    
    const sliceCount = this._config.forecast_days;
    const viewableForecast = this._forecast.slice(0, sliceCount);
    const locale = this._hass.locale?.language || 'en';
    const todayDateStr = new Date().toDateString();

    let htmlOutput = '';

    viewableForecast.forEach((dayData, index) => {
        const matchingIconKey = FORECAST_ICONS[dayData.condition] || 'sun';
        const fcDate = new Date(dayData.datetime);
        // label first entry "Today" if it matches current date
        const isToday = index === 0 && fcDate.toDateString() === todayDateStr;
        const dayLabel = isToday
          ? (this._hass.localize('ui.components.calendar.event.today') || 'Today')
          : formatDayLabel(fcDate, locale);
        
        const stringHigh = this._config.show_no_temp ? '' :
          (dayData.temperature != null ? `${Math.round(dayData.temperature)}°` : '');
        const stringLow = (this._config.show_low_temp && dayData.templow != null && !this._config.show_no_temp)
                 ? `<span class="fc-lo">${Math.round(dayData.templow)}°</span>` : '';
                 
        const tempHtml = stringHigh ? `<span class="fc-t">${stringHigh}</span>` : '';

        htmlOutput += `<div class="fc-day">
            <span class="fc-d">${dayLabel}</span>
            <div class="fc-icon">${this._generateSmallForecastIcon(matchingIconKey, 28)}</div>
            ${tempHtml}${stringLow}
        </div>`;
    });
    
    forecastElement.innerHTML = htmlOutput;
  }

  _generateSmallForecastIcon(iconKey, size) {
    switch(iconKey) {
      case 'sun': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="7" fill="#fbbf24"/></svg>`;
      case 'moon': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M12,10 A8,8 0 1,0 22,22 A6,6 0 1,1 12,10Z" fill="#94a3b8"/></svg>`;
      case 'sun-cloud': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="20" cy="12" r="5" fill="#fbbf24"/><path d="M8,24 C8,20 12,18 15,18 C17,15 22,15 24,18 C27,18 29,20 29,23 C29,25 27,27 25,27L8,27Z" fill="#cbd5e1"/></svg>`;
      case 'cloud': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M6,22 C6,18 9,16 12,16 C14,13 19,13 21,16 C24,16 26,18 26,21 C26,24 24,25 22,25L6,25Z" fill="#cbd5e1"/></svg>`;
      case 'rain': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><line x1="13" y1="25" x2="11" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/><line x1="19" y1="25" x2="17" y2="29" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/></svg>`;
      case 'snow': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M8,18 C8,15 11,13 14,13 C16,10 21,10 23,13 C26,13 28,15 28,18 C28,21 26,22 24,22L8,22Z" fill="#94a3b8"/><circle cx="13" cy="26" r="1" fill="#fff"/><circle cx="19" cy="27" r="1" fill="#fff"/></svg>`;
      case 'lightning': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M8,16 C8,13 11,11 14,11 C16,8 21,8 23,11 C26,11 28,13 28,16 C28,19 26,20 24,20L8,20Z" fill="#475569"/><polygon points="17,18 13,24 16,24 14,30 21,22 18,22" fill="#fde047"/></svg>`;
      case 'warning': return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><polygon points="16,3 30,28 2,28" fill="#f59e0b"/><text x="16" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#1c1917">!</text></svg>`;
      default: return `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="6" fill="#888"/></svg>`;
    }
  }

  // forecast subscriptions

  async _ensureForecastSub() {
    if (!this._hass?.connection || !this._config?.entity) return;
    const targetSub = `${this._config.entity}|${this._config.forecast_entity}`;
    if (this._subscribedEntity === targetSub) return;

    // mark target before first await to deduplicate concurrent calls
    this._unsubForecast();
    this._subscribedEntity = targetSub;

    // generation token to detect concurrent reconfigures
    const generation = ++this._subGeneration;

    // always attempt daily subscription regardless of supported_features;
    // older integrations may not set the feature bits but still support it
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          this._forecast = msg.forecast || [];
          if (this._isConnected) this._update();
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'daily', entity_id: this._config.forecast_entity }
      );

      if (generation !== this._subGeneration || !this._isConnected) {
        // stale sub from concurrent reconfigure or disconnect; discard
        unsub();
        if (generation === this._subGeneration) this._subscribedEntity = null;
      } else {
        this._forecastUnsub = unsub;
      }
    } catch {
      // subscription failed; clear sentinel so next hass update retries
      if (generation === this._subGeneration) this._subscribedEntity = null;
      // fall back to legacy entity attribute forecast
      const fallback = this._hass.states[this._config.forecast_entity];
      if (fallback?.attributes?.forecast) {
        this._forecast = fallback.attributes.forecast;
        if (this._isConnected) this._update();
      }
    }

    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          this._hourlyForecast = msg.forecast || [];
          if (this._isConnected) this._update();
        },
        { type: 'weather/subscribe_forecast', forecast_type: 'hourly', entity_id: this._config.forecast_entity }
      );

      if (generation !== this._subGeneration || !this._isConnected) {
        unsub();
      } else {
        this._hourlyUnsub = unsub;
      }
    } catch {
      // hourly forecast not supported; not an error
      this._hourlyForecast = [];
    }
  }

  _unsubForecast() {
    if (this._forecastUnsub) { this._forecastUnsub(); this._forecastUnsub = null; }
    if (this._hourlyUnsub)   { this._hourlyUnsub();   this._hourlyUnsub = null;   }
    // reset sentinel so next _ensureForecastSub doesn't short-circuit
    this._subscribedEntity = null;
  }
}

customElements.define('modern-weather-card', ModernWeatherCard);
globalThis.customCards = globalThis.customCards || [];
globalThis.customCards.push({
  type: 'modern-weather-card',
  name: 'Modern Weather Card',
  description: 'Layered weather card with atmospheric effects',
  documentationURL: 'https://github.com/mwckr/homassistant-modern-weather-card',
  preview: true
});
console.info('%c MODERN-WEATHER %c v0.1.1 ','background:#2563eb;color:#fff;font-weight:bold;padding:2px 6px;border-radius:4px 0 0 4px','background:#0f172a;color:#f8fafc;padding:2px 6px;border-radius:0 4px 4px 0');