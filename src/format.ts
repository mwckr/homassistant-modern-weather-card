import type { FrontendLocaleData } from 'custom-card-helpers';

const CUSTOM_STRINGS: Record<string, Record<string, string>> = {
  en: {
    alertUntil: '{condition} until {time}',
    alertIn: '{condition} in {mins} min',
    alertFrom: '{condition} from {time}',
    tileAqi: 'Air Quality Index',
    tileCloud: 'Cloud Cover',
    tileHumidity: 'Humidity',
    tileWind: 'Wind',
    aqiGood: 'Good',
    aqiModerate: 'Moderate',
    aqiSensitive: 'Sensitive',
    aqiUnhealthy: 'Unhealthy',
    aqiVeryUnhealthy: 'Very unhealthy',
    aqiHazardous: 'Hazardous',
    levelDry: 'Dry',
    levelComfortable: 'Comfortable',
    levelHumid: 'Humid',
    cloudClear: 'Clear',
    cloudScattered: 'Scattered',
    cloudMostly: 'Mostly cloudy',
    cloudOvercast: 'Overcast',
    windCalm: 'Calm',
    windLight: 'Light',
    windBreezy: 'Breezy',
    windWindy: 'Windy',
    windStormy: 'Stormy',
  },
  de: {
    alertUntil: '{condition} bis {time} Uhr',
    alertIn: '{condition} in {mins} Min.',
    alertFrom: '{condition} ab {time} Uhr',
    tileAqi: 'Luftqualität',
    tileCloud: 'Bewölkung',
    tileHumidity: 'Luftfeuchtigkeit',
    tileWind: 'Wind',
    aqiGood: 'Gut',
    aqiModerate: 'Mäßig',
    aqiSensitive: 'Sensibel',
    aqiUnhealthy: 'Ungesund',
    aqiVeryUnhealthy: 'Sehr ungesund',
    aqiHazardous: 'Gefährlich',
    levelDry: 'Trocken',
    levelComfortable: 'Angenehm',
    levelHumid: 'Feucht',
    cloudClear: 'Klar',
    cloudScattered: 'Aufgelockert',
    cloudMostly: 'Stark bewölkt',
    cloudOvercast: 'Bedeckt',
    windCalm: 'Windstill',
    windLight: 'Leicht',
    windBreezy: 'Frisch',
    windWindy: 'Windig',
    windStormy: 'Stürmisch',
  },
};

export const getLocalText = (
  localeObj: FrontendLocaleData | undefined,
  key: string,
  vars: Record<string, string | number> = {},
): string => {
  const lang = (localeObj?.language || navigator.language || 'en').split('-')[0];
  const dict = CUSTOM_STRINGS[lang] || CUSTOM_STRINGS.en;
  let text = dict[key] || CUSTOM_STRINGS.en[key];
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, String(v));
  }
  return text;
};

// locale-aware time formatting
export const formatTime = (
  date: Date,
  localeObj: FrontendLocaleData | undefined,
  configFormat = 'default',
): string => {
  const lang = localeObj?.language || navigator.language || 'en';
  const formatPref =
    configFormat && configFormat !== 'default'
      ? configFormat
      : localeObj?.time_format || 'language';
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

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

// medium date for the sun-path row, e.g. "Feb 2, 2025" / "2. Feb. 2025"
export const formatDate = (date: Date, locale = 'en'): string =>
  new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

export const formatDayLabel = (date: Date, locale = 'en'): string =>
  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);

export const formatTodayLabel = (locale = 'en'): string =>
  new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
