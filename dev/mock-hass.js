// Local preview harness: feeds the real card bundle a mocked Home Assistant
// object so the redesign can be checked in a plain browser, no HA required.
import '../dist/modern-weather-card.js';

// stand-in for HA's <ha-card>; the card's own styles handle the rest
if (!customElements.get('ha-card')) {
  customElements.define('ha-card', class extends HTMLElement {});
}

const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();

// English condition labels; the real card gets these from hass.localize
const CONDITION_LABELS = {
  sunny: 'Sunny',
  'clear-night': 'Clear',
  partlycloudy: 'Partly cloudy',
  cloudy: 'Cloudy',
  fog: 'Foggy',
  rainy: 'Rainy',
  pouring: 'Pouring',
  hail: 'Hail',
  lightning: 'Thunderstorm',
  'lightning-rainy': 'Thunderstorm',
  snowy: 'Snowy',
  'snowy-rainy': 'Sleet',
  windy: 'Windy',
  exceptional: 'Warning',
};

// each scenario: current weather + sun geometry (offsets in hours from now)
// nextRise/nextSet drive the arc marker — for daytime scenes the next rise is
// tomorrow's, so the card derives today's sunrise from it
const SCENARIOS = {
  'Sunny day': {
    condition: 'sunny', temp: 28, humidity: 44, cloud: 5, wind: 11, aqi: 72,
    elevation: 38, rising: false, nextRise: 19, nextSet: 6,
    week: ['sunny', 'partlycloudy', 'sunny', 'rainy', 'cloudy'],
    hours: ['sunny'],
  },
  'Partly cloudy': {
    condition: 'partlycloudy', temp: 24, humidity: 55, cloud: 40, wind: 16, aqi: 58,
    elevation: 30, rising: false, nextRise: 19, nextSet: 6,
    week: ['partlycloudy', 'cloudy', 'rainy', 'partlycloudy', 'sunny'],
    hours: ['partlycloudy'],
  },
  'Cloudy day': {
    condition: 'cloudy', temp: 19, humidity: 70, cloud: 85, wind: 18, aqi: 44,
    elevation: 28, rising: false, nextRise: 19, nextSet: 6,
    week: ['cloudy', 'cloudy', 'partlycloudy', 'rainy', 'sunny'],
    hours: ['cloudy'],
  },
  'Rainy day': {
    condition: 'rainy', temp: 17, humidity: 88, cloud: 92, wind: 26, aqi: 24,
    elevation: 22, rising: false, nextRise: 19, nextSet: 6,
    week: ['rainy', 'rainy', 'partlycloudy', 'cloudy', 'sunny'],
    hours: ['rainy', 'rainy', 'rainy', 'cloudy'], // → "Rainy until …" chip
  },
  'Storm night': {
    condition: 'lightning-rainy', temp: 16, humidity: 90, cloud: 95, wind: 38, aqi: 21,
    elevation: -20, rising: false, nextRise: 7, nextSet: 17,
    week: ['lightning-rainy', 'rainy', 'cloudy', 'partlycloudy', 'sunny'],
    hours: ['lightning-rainy', 'lightning-rainy', 'rainy', 'cloudy'],
  },
  'Snowy day': {
    condition: 'snowy', temp: -2, humidity: 82, cloud: 90, wind: 14, aqi: 33,
    elevation: 15, rising: false, nextRise: 19, nextSet: 6,
    week: ['snowy', 'snowy', 'cloudy', 'partlycloudy', 'sunny'],
    hours: ['snowy', 'snowy', 'cloudy'],
  },
  'Foggy day': {
    condition: 'fog', temp: 9, humidity: 96, cloud: 100, wind: 4, aqi: 47,
    elevation: 12, rising: true, nextRise: 21, nextSet: 8,
    week: ['fog', 'cloudy', 'partlycloudy', 'sunny', 'sunny'],
    hours: ['fog', 'fog', 'cloudy'],
  },
  'Clear night': {
    condition: 'clear-night', temp: 18, humidity: 50, cloud: 8, wind: 6, aqi: 66,
    elevation: -25, rising: false, nextRise: 7, nextSet: 17,
    week: ['sunny', 'sunny', 'partlycloudy', 'cloudy', 'rainy'],
    hours: ['clear-night'],
  },
  'Dusk': {
    condition: 'sunny', temp: 21, humidity: 60, cloud: 20, wind: 9, aqi: 61,
    elevation: 3, rising: false, nextRise: 10.4, nextSet: 0.4,
    week: ['sunny', 'partlycloudy', 'sunny', 'sunny', 'cloudy'],
    hours: ['sunny'],
  },
  'Dawn': {
    condition: 'sunny', temp: 14, humidity: 70, cloud: 12, wind: 5, aqi: 39,
    elevation: 2, rising: true, nextRise: 23.5, nextSet: 13,
    week: ['sunny', 'sunny', 'partlycloudy', 'rainy', 'cloudy'],
    hours: ['sunny'],
  },
};

const options = { forecast: true, metrics: true, sunPath: true, aqi: true };
let currentScenario = 'Sunny day';
let locale = { language: 'en', time_format: '12' };

// forecast subscribers, re-fed on every scenario switch
const forecastSubs = new Set();

const dailyForecast = (s) => {
  const base = new Date();
  return s.week.map((condition, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i, 12);
    const swing = [0, -1, -3, -2, 1][i] ?? 0;
    return {
      datetime: d.toISOString(),
      condition,
      temperature: Math.round(s.temp + 2 + swing),
      templow: Math.round(s.temp - 4 + swing),
    };
  });
};

const hourlyForecast = (s) => {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const condition = s.hours[Math.min(i, s.hours.length - 1)];
    out.push({ datetime: hoursFromNow(i + 1), condition, temperature: s.temp });
  }
  return out;
};

const buildHass = (s) => ({
  states: {
    'weather.demo': {
      state: s.condition,
      attributes: {
        temperature: s.temp,
        humidity: s.humidity,
        cloud_coverage: s.cloud,
        wind_speed: s.wind,
        wind_speed_unit: 'km/h',
        friendly_name: 'Calicut, Kerala',
      },
    },
    'sun.sun': {
      state: s.elevation > -0.833 ? 'above_horizon' : 'below_horizon',
      attributes: {
        elevation: s.elevation,
        rising: s.rising,
        next_rising: hoursFromNow(s.nextRise),
        next_setting: hoursFromNow(s.nextSet),
      },
    },
    'sensor.demo_aqi': {
      state: String(s.aqi),
      attributes: { unit_of_measurement: 'AQI' },
    },
  },
  locale,
  localize: (key) => {
    const slug = key.split('.').pop();
    return CONDITION_LABELS[slug] || '';
  },
  connection: {
    subscribeMessage: (cb, msg) => {
      const sub = { cb, type: msg.forecast_type };
      forecastSubs.add(sub);
      const s = SCENARIOS[currentScenario];
      queueMicrotask(() =>
        cb({ forecast: sub.type === 'daily' ? dailyForecast(s) : hourlyForecast(s) }),
      );
      return Promise.resolve(() => forecastSubs.delete(sub));
    },
  },
});

const card = document.getElementById('card');

const applyConfig = () => {
  card.setConfig({
    entity: 'weather.demo',
    aqi_entity: options.aqi ? 'sensor.demo_aqi' : undefined,
    show_forecast: options.forecast,
    show_metrics: options.metrics,
    show_sun_path: options.sunPath,
    time_format: 'default',
  });
};

const applyScenario = (name) => {
  currentScenario = name;
  const s = SCENARIOS[name];
  card.hass = buildHass(s);
  for (const sub of forecastSubs) {
    sub.cb({ forecast: sub.type === 'daily' ? dailyForecast(s) : hourlyForecast(s) });
  }
  document
    .querySelectorAll('#scenarios .chip')
    .forEach((b) => b.classList.toggle('active', b.textContent === name));
};

// --- toolbar wiring ---------------------------------------------------------

const scenarioGroup = document.getElementById('scenarios');
for (const name of Object.keys(SCENARIOS)) {
  const btn = document.createElement('button');
  btn.className = 'chip';
  btn.textContent = name;
  btn.addEventListener('click', () => applyScenario(name));
  scenarioGroup.appendChild(btn);
}

const widthGroup = document.getElementById('widths');
for (const w of [340, 420, 500]) {
  const btn = document.createElement('button');
  btn.className = 'chip' + (w === 420 ? ' active' : '');
  btn.textContent = `${w}px`;
  btn.addEventListener('click', () => {
    document.getElementById('stage').style.width = `${w}px`;
    widthGroup.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', b === btn));
  });
  widthGroup.appendChild(btn);
}

const optionGroup = document.getElementById('options');
const OPTION_LABELS = { forecast: 'Forecast', metrics: 'Tiles', sunPath: 'Sun path', aqi: 'AQI' };
for (const key of Object.keys(OPTION_LABELS)) {
  const label = document.createElement('label');
  label.className = 'toggle';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = options[key];
  box.addEventListener('change', () => {
    options[key] = box.checked;
    applyConfig();
    applyScenario(currentScenario);
  });
  label.append(box, OPTION_LABELS[key]);
  optionGroup.appendChild(label);
}

const localeGroup = document.getElementById('locales');
for (const [name, loc] of [
  ['EN 12h', { language: 'en', time_format: '12' }],
  ['DE 24h', { language: 'de', time_format: '24' }],
]) {
  const btn = document.createElement('button');
  btn.className = 'chip' + (loc.language === 'en' ? ' active' : '');
  btn.textContent = name;
  btn.addEventListener('click', () => {
    locale = loc;
    applyScenario(currentScenario);
    localeGroup.querySelectorAll('.chip').forEach((b) => b.classList.toggle('active', b === btn));
  });
  localeGroup.appendChild(btn);
}

// --- boot -------------------------------------------------------------------

applyConfig();
const params = new URLSearchParams(location.search);
const fromUrl = params.get('scenario');
applyScenario(SCENARIOS[fromUrl] ? fromUrl : 'Sunny day');
const widthParam = Number(params.get('width'));
if (widthParam) document.getElementById('stage').style.width = `${widthParam}px`;

// debug aid: ?hide=sun,clouds,child4,... hides scene layers inside the card
// shadow root to bisect visual artifacts (childN = photo-layer child N)
const hideParam = params.get('hide');
if (hideParam) {
  const map = {
    sun: '.sun-img',
    clouds: '.cloud',
    photo: '.photo-layer',
    canvas: '.fx-canvas',
    drops: '.drops-layer',
    arc: '.sun-arc',
  };
  const sels = hideParam
    .split(',')
    .map((k) => map[k] || (k.startsWith('child') ? `.photo-layer > *:nth-child(${k.slice(5)})` : null))
    .filter(Boolean);
  if (sels.length) {
    const st = document.createElement('style');
    st.textContent = `${sels.join(',')} { display: none !important; }`;
    card.renderRoot.appendChild(st);
  }
}

// debug aid: ?fx=strike fires lightning every 300ms so screenshots always
// catch a bolt (reaches into the card's TS-private engine — harness only)
if (params.get('fx') === 'strike') {
  setInterval(() => {
    const fx = card._fx;
    const canvas = card.renderRoot?.querySelector('.fx-canvas');
    if (fx && canvas && String(fx.scene || '').startsWith('storm')) {
      fx.strike(canvas.clientWidth, canvas.clientHeight);
    }
  }, 300);
}

// reload when the watcher rewrites the bundle
let bundleStamp = null;
setInterval(async () => {
  if (document.hidden) return;
  try {
    const res = await fetch('../dist/modern-weather-card.js', { method: 'HEAD', cache: 'no-store' });
    const stamp = `${res.headers.get('last-modified')}|${res.headers.get('content-length')}`;
    if (bundleStamp && stamp !== bundleStamp) location.reload();
    bundleStamp = stamp;
  } catch {
    /* server briefly unavailable during rebuild */
  }
}, 1500);
