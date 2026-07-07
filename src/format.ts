import type { FrontendLocaleData } from 'custom-card-helpers';

const CUSTOM_STRINGS: Record<string, Record<string, string>> = {
  en: {
    alertUntil: '{condition} until {time}',
    alertIn: '{condition} in {mins} min',
    alertFrom: '{condition} from {time}',
  },
  de: {
    alertUntil: '{condition} bis {time} Uhr',
    alertIn: '{condition} in {mins} Min.',
    alertFrom: '{condition} ab {time} Uhr',
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

export const formatDayLabel = (date: Date, locale = 'en'): string =>
  new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);

export const formatTodayLabel = (locale = 'en'): string =>
  new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'day');
