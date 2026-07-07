import { getSkyClass } from './const';
import type { EntityState, SkyClass, TimeOfDay } from './types';

export interface WeatherMeta {
  icon: string;
  tint: string;
  scene: 'horizon-dawn' | 'horizon-dusk' | null;
}

// time of day from sun entity, hour-based fallback
export const getTimeOfDay = (sunState?: EntityState): TimeOfDay => {
  if (!sunState?.attributes || sunState.attributes.elevation == null) {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour < 18) return 'day';
    if (currentHour >= 18 && currentHour < 21) return 'dusk';
    if (currentHour >= 5 && currentHour < 7) return 'dawn';
    return 'night';
  }
  const elevation = sunState.attributes.elevation as number;
  const rising = sunState.attributes.rising as boolean | undefined;
  // twilight: >6 day, -6..6 dawn/dusk, <-6 night
  if (elevation > 6) return 'day';
  if (elevation > -6) {
    if (rising != null) return rising ? 'dawn' : 'dusk';
    // rising attribute missing (non-core sun integration): infer from clock
    // instead of defaulting to dusk, which would paint every dawn as sunset
    return new Date().getHours() < 12 ? 'dawn' : 'dusk';
  }
  return 'night';
};

// condition-first sky palettes: weather sets the mood, time of day only
// modulates it. A thunderstorm is dark slate at any hour; fog is desaturated
// gray with at most a warm blush at dawn — never the full clear-sky sunset.
// The condition → class mapping lives in the condition registry (const.ts).
const SKY_PALETTES: Record<SkyClass, Record<TimeOfDay, string[]>> = {
  clear: {
    day: ['#38bdf8', '#2563eb'],
    dawn: ['#2e1b4b', '#b45309', '#f59e0b'],
    dusk: ['#111827', '#6b21a8', '#db2777'],
    night: ['#030712', '#0b1329', '#111827'],
  },
  cloudy: {
    day: ['#7d93ab', '#5b708e', '#465b73'],
    dawn: ['#413a56', '#6b5d66', '#8a7266'],
    dusk: ['#272c3d', '#3e3a54', '#514660'],
    night: ['#0a0e18', '#141927', '#1d2331'],
  },
  rain: {
    day: ['#5b718c', '#42566f', '#2e3f55'],
    dawn: ['#39364f', '#4d475e', '#655a63'],
    dusk: ['#232838', '#33344e', '#443f5c'],
    night: ['#0a0e17', '#141b29', '#1d2536'],
  },
  storm: {
    day: ['#414c61', '#2d3646', '#1e2430'],
    dawn: ['#2b2839', '#38304a', '#453853'],
    dusk: ['#1e2130', '#2c2842', '#3b2c4e'],
    night: ['#0a0d15', '#12141f', '#1a1c2b'],
  },
  snow: {
    day: ['#8ea6bf', '#6f88a2', '#566b84'],
    dawn: ['#4c4a63', '#6f6878', '#8d7f80'],
    dusk: ['#2b3145', '#42435f', '#565270'],
    night: ['#0d1220', '#182135', '#232c44'],
  },
  fog: {
    day: ['#9aa6b3', '#8592a1', '#6d7988'],
    dawn: ['#6b6a7a', '#847d89', '#9a8d88'],
    dusk: ['#454455', '#585568', '#696274'],
    night: ['#151922', '#20242f', '#292d39'],
  },
};

export const getSkyPalette = (condition: string, timeOfDay: TimeOfDay): string[] =>
  SKY_PALETTES[getSkyClass(condition)][timeOfDay];

// icon/tint/scene selection per condition and time of day
export const getWeatherMeta = (condition: string, timeOfDay: TimeOfDay): WeatherMeta => {
  const isNight = timeOfDay === 'night';
  const isDawn = timeOfDay === 'dawn';
  const isDusk = timeOfDay === 'dusk';

  let icon: string;
  let tint = '';
  let scene: WeatherMeta['scene'] = null;

  // the sky palette now carries the condition mood, so tints are reduced to
  // subtle top-down scrims that add depth without recoloring the gradient
  switch (condition) {
    case 'lightning':
    case 'lightning-rainy':
      icon = 'thunderstorm';
      tint = 'linear-gradient(180deg, rgba(5,8,18,0.35), transparent 60%)';
      break;
    case 'pouring':
      icon = 'rain-heavy';
      tint = 'linear-gradient(180deg, rgba(10,16,28,0.3), transparent 65%)';
      break;
    case 'rainy':
      icon = 'rain';
      tint = 'linear-gradient(180deg, rgba(15,23,42,0.2), transparent 60%)';
      break;
    case 'hail':
      icon = 'hail';
      tint = 'linear-gradient(180deg, rgba(15,23,42,0.2), transparent 60%)';
      break;
    case 'snowy':
    case 'snowy-rainy':
      icon = 'snow';
      break;
    case 'fog':
      icon = 'fog';
      break;
    case 'windy':
    case 'windy-variant':
      icon = 'wind';
      break;
    case 'cloudy':
      icon = 'overcast';
      break;
    case 'partlycloudy':
      icon = isNight ? 'cloud-moon' : 'partly-cloudy';
      if (!isNight) tint = 'linear-gradient(180deg, rgba(51,65,85,0.1), transparent)';
      if (isDawn) scene = 'horizon-dawn';
      if (isDusk) scene = 'horizon-dusk';
      break;
    case 'clear-night':
      icon = 'moon';
      break;
    default:
      if (condition === 'exceptional') {
        icon = 'warning';
        tint = 'linear-gradient(180deg, rgba(120,53,15,0.4), rgba(180,83,9,0.2))';
      } else if (isNight) {
        icon = 'moon';
      } else if (isDawn) {
        icon = 'sunrise';
        scene = 'horizon-dawn';
      } else if (isDusk) {
        icon = 'sunset';
        scene = 'horizon-dusk';
      } else {
        icon = 'sun';
      }
      break;
  }

  return { icon, tint, scene };
};
