import type { FrontendLocaleData } from 'custom-card-helpers';
import { getLocalText } from './format';
import type { EntityState } from './types';

// data for one glass metric tile below the sky: a headline value plus a
// meter — the AQI tile gets the graded rainbow scale with a thumb, everything
// else a plain fill bar
export interface TileData {
  title: string;
  icon: 'aqi' | 'cloud' | 'humidity' | 'wind';
  value: string;
  unit?: string;
  label: string;
  meter: { kind: 'scale' | 'fill'; pct: number; color?: string };
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const clampPct = (v: number): number => Math.min(100, Math.max(0, v));

// US EPA AQI buckets
const aqiLevelKey = (v: number): string => {
  if (v <= 50) return 'aqiGood';
  if (v <= 100) return 'aqiModerate';
  if (v <= 150) return 'aqiSensitive';
  if (v <= 200) return 'aqiUnhealthy';
  if (v <= 300) return 'aqiVeryUnhealthy';
  return 'aqiHazardous';
};

const humidityLevelKey = (v: number): string => {
  if (v < 30) return 'levelDry';
  if (v <= 60) return 'levelComfortable';
  return 'levelHumid';
};

const cloudLevelKey = (v: number): string => {
  if (v <= 10) return 'cloudClear';
  if (v <= 45) return 'cloudScattered';
  if (v <= 80) return 'cloudMostly';
  return 'cloudOvercast';
};

const windLevelKey = (kmh: number): string => {
  if (kmh < 1) return 'windCalm';
  if (kmh < 20) return 'windLight';
  if (kmh < 39) return 'windBreezy';
  if (kmh < 62) return 'windWindy';
  return 'windStormy';
};

const toKmh = (speed: number, unit: string): number => {
  if (unit === 'm/s') return speed * 3.6;
  if (unit === 'mph') return speed * 1.60934;
  if (unit === 'kn') return speed * 1.852;
  return speed;
};

// pick up to two tiles with graceful fallbacks: AQI sensor → humidity for the
// left slot, cloud coverage → wind for the right one. Weather integrations
// vary a lot in which attributes they expose; missing data drops the tile
// instead of rendering a blank.
export const resolveTiles = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrs: Record<string, any>,
  aqiState: EntityState | undefined,
  locale?: FrontendLocaleData,
): TileData[] => {
  const t = (key: string): string => getLocalText(locale, key);
  const tiles: TileData[] = [];

  const aqi = aqiState ? Number(aqiState.state) : NaN;
  if (Number.isFinite(aqi)) {
    tiles.push({
      title: t('tileAqi'),
      icon: 'aqi',
      value: String(Math.round(aqi)),
      label: t(aqiLevelKey(aqi)),
      // thumb position over the 0–300 span of the graded scale, kept just
      // inside the rounded track caps so the thumb never overhangs the ends
      meter: { kind: 'scale', pct: Math.min(96.5, Math.max(3.5, (aqi / 300) * 100)) },
    });
  } else if (isNum(attrs.humidity)) {
    tiles.push({
      title: t('tileHumidity'),
      icon: 'humidity',
      value: String(Math.round(attrs.humidity)),
      unit: '%',
      label: t(humidityLevelKey(attrs.humidity)),
      meter: { kind: 'fill', pct: clampPct(attrs.humidity), color: '#38bdf8' },
    });
  }

  if (isNum(attrs.cloud_coverage)) {
    tiles.push({
      title: t('tileCloud'),
      icon: 'cloud',
      value: String(Math.round(attrs.cloud_coverage)),
      unit: '%',
      label: t(cloudLevelKey(attrs.cloud_coverage)),
      meter: { kind: 'fill', pct: clampPct(attrs.cloud_coverage), color: '#60a5fa' },
    });
  } else if (isNum(attrs.wind_speed)) {
    const unit = (attrs.wind_speed_unit as string) || 'km/h';
    const kmh = toKmh(attrs.wind_speed, unit);
    tiles.push({
      title: t('tileWind'),
      icon: 'wind',
      value: String(Math.round(attrs.wind_speed)),
      unit,
      label: t(windLevelKey(kmh)),
      // full bar at gale force (62 km/h)
      meter: { kind: 'fill', pct: clampPct((kmh / 62) * 100), color: '#818cf8' },
    });
  }

  return tiles.slice(0, 2);
};
