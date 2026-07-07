import type { FrontendLocaleData } from 'custom-card-helpers';
import { getConditionGroup, isNotableCondition } from './const';
import { formatTime, getLocalText } from './format';
import type { ForecastItem } from './types';

export interface AlertOptions {
  lookaheadHours: number;
  timeFormat: string;
  locale?: FrontendLocaleData;
  localizeCondition: (condition: string) => string;
}

// short forecast alert text, e.g. "Rain in 40 min" / "Rain until 16:00"
export const getShortForecastText = (
  hourlyForecast: ForecastItem[],
  currentCondition: string,
  { lookaheadHours, timeFormat, locale, localizeCondition }: AlertOptions,
): string => {
  if (!hourlyForecast || hourlyForecast.length === 0) return '';
  if (lookaheadHours <= 0) return '';

  const now = new Date();
  const cutoff = new Date(now.getTime() + lookaheadHours * 3600000);

  const currentNotable = isNotableCondition(currentCondition) ? currentCondition : null;

  for (const hour of hourlyForecast) {
    const targetTime = new Date(hour.datetime);
    // malformed datetime yields Invalid Date, which passes both range checks
    // (NaN compares false) and would throw RangeError inside Intl.format
    if (Number.isNaN(targetTime.getTime())) continue;
    if (targetTime < now) continue;
    if (targetTime > cutoff) break;

    const isHourNotable = !!hour.condition && isNotableCondition(hour.condition);

    if (currentNotable) {
      if (
        !isHourNotable ||
        getConditionGroup(hour.condition!) !== getConditionGroup(currentNotable)
      ) {
        const timeStr = formatTime(targetTime, locale, timeFormat);
        return getLocalText(locale, 'alertUntil', {
          condition: localizeCondition(currentNotable),
          time: timeStr,
        });
      }
    } else if (isHourNotable) {
      const timeStr = formatTime(targetTime, locale, timeFormat);
      const diffMins = Math.round((targetTime.getTime() - now.getTime()) / 60000);
      const condName = localizeCondition(hour.condition!);

      if (diffMins > 0 && diffMins < 60) {
        return getLocalText(locale, 'alertIn', { condition: condName, mins: diffMins });
      }
      return getLocalText(locale, 'alertFrom', { condition: condName, time: timeStr });
    }
  }
  // notable condition persists past lookahead; no useful "until" to show
  return '';
};
