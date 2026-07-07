import { renderSnowflakeMark } from './shapes';

const layerSvg = (content: string, preserveAspect = true): string =>
  `<svg ${preserveAspect ? 'viewBox="0 0 100 100" preserveAspectRatio="none" ' : ''}style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

// the layerSvg helper stretches its 100x100 viewBox non-uniformly to fill the
// card, which smears symmetric shapes (flakes, mist puffs, rain streaks) into
// wide ellipses; atmosphere layers instead share this wide viewBox + "slice"
// svg so a unit stays a unit in both axes and shapes render undistorted
const SCENE_ASPECT = 3.2;
const SCENE_VIEW_W = 100 * SCENE_ASPECT;
const sceneX = (percent: number): string => (percent * SCENE_ASPECT).toFixed(1);

// bottom-anchored (yMax): y=100 always sits on the card's bottom edge, so
// ground-plane content (snow cover, rain splashes) survives the vertical
// crop on cards wider than the scene aspect; only sky gets cropped instead
const wideSceneSvg = (content: string): string =>
  `<svg viewBox="0 0 ${SCENE_VIEW_W} 100" preserveAspectRatio="xMidYMax slice"
    style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const renderStars = (): string => {
  const starPoints: Array<[number, number]> = [
    [15, 12], [72, 8], [88, 24], [26, 6], [42, 14], [80, 32], [10, 28], [52, 8], [38, 22], [94, 10],
    [18, 35], [60, 5], [82, 18], [35, 10], [68, 28], [8, 18], [48, 6], [75, 15], [30, 30], [90, 8],
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
  return layerSvg(starsSvg, false);
};

export const renderHorizon = (type: 'dawn' | 'dusk'): string => {
  const glowColor = type === 'dawn' ? 'rgba(30,27,75,0.4)' : 'rgba(17,24,39,0.5)';
  const animation =
    type === 'dawn'
      ? `<animateTransform attributeName="transform" type="translate" values="0,8; 0,0; 0,8" dur="20s" repeatCount="indefinite"/>`
      : `<animateTransform attributeName="transform" type="translate" values="0,0; 0,8; 0,0" dur="20s" repeatCount="indefinite"/>`;

  return `<svg style="position:absolute;bottom:0;left:0;width:100%;height:45%;pointer-events:none" viewBox="0 0 400 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g>${animation}<path d="M0,80 Q100,50 200,70 T400,60 L400,100 L0,100 Z" fill="${glowColor}"/></g>
  </svg>`;
};

const renderSnowCover = (): string => {
  const w = SCENE_VIEW_W.toFixed(1);
  return `<path d="M0,100 L0,93 Q${sceneX(8)},87 ${sceneX(16)},91 T${sceneX(34)},89 Q${sceneX(42)},85 ${sceneX(50)},90 T${sceneX(68)},88 Q${sceneX(76)},84 ${sceneX(84)},89 T${w},91 L${w},100 Z" fill="#dce6f2" opacity="0.8"/>
  <path d="M0,100 L0,97 Q${sceneX(10)},94 ${sceneX(20)},97 T${sceneX(42)},96 Q${sceneX(55)},93 ${sceneX(65)},97 T${sceneX(88)},96 T${w},97 L${w},100 Z" fill="#f8fafc" opacity="0.95"/>
  <circle cx="${sceneX(14)}" cy="95" r="0.5" fill="#fff" opacity="0.9">
    <animate attributeName="opacity" values="0.9;0.25;0.9" dur="3.4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${sceneX(63)}" cy="94" r="0.4" fill="#fff" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="4.1s" begin="1s" repeatCount="indefinite"/>
  </circle>
  <circle cx="${sceneX(88)}" cy="95.5" r="0.45" fill="#fff" opacity="0.85">
    <animate attributeName="opacity" values="0.85;0.2;0.85" dur="2.8s" begin="0.6s" repeatCount="indefinite"/>
  </circle>`;
};

const renderLayeredSnow = (): string => {
  // three depth layers: large/slow foreground flakes to small/fast distant dots
  const snowLayers = [
    { count: 4, minRadius: 1.3, maxRadius: 1.9, duration: 5, opacity: 0.95, drift: 9, flake: true },
    { count: 6, minRadius: 0.8, maxRadius: 1.2, duration: 8, opacity: 0.6, drift: 6, flake: true },
    { count: 8, minRadius: 0.4, maxRadius: 0.7, duration: 12, opacity: 0.3, drift: 3, flake: false },
  ];

  let svgOutput = '';

  snowLayers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      // deterministic pseudo-random spread via prime-multiplier hashing
      const xPercent = 5 + ((i * 41 + layerIndex * 17 + 7) % 90);
      const radius =
        layer.minRadius + (((i * 13 + layerIndex * 7) % 10) / 10) * (layer.maxRadius - layer.minRadius);
      const fallDuration = layer.duration + ((i * 7) % 4) * 0.5;
      const driftX = layer.drift * ((i + layerIndex) % 2 ? 1 : -1);
      const delay = ((i * 11 + layerIndex * 5) % 10) * 0.3;
      const spinDuration = 4 + ((i * 5 + layerIndex * 3) % 6);
      const spinTo = i % 2 ? 360 : -360;
      const shape = layer.flake
        ? renderSnowflakeMark(radius)
        : `<circle r="${radius.toFixed(1)}" fill="#f0f4f8"/>`;
      const fromX = sceneX(xPercent);
      const toX = sceneX(xPercent + driftX);

      // spawn above and despawn below the viewBox, so no fade-in/out
      // animation is needed to mask pops — static opacity halves the number
      // of continuously ticking SMIL animations per flake
      svgOutput += `<g opacity="${layer.opacity}">
        <animateTransform attributeName="transform" type="translate"
          from="${fromX},-5" to="${toX},105" dur="${fallDuration}s" begin="${delay}s" repeatCount="indefinite"/>
        <g>
          ${layer.flake ? `<animateTransform attributeName="transform" type="rotate" from="0" to="${spinTo}" dur="${spinDuration}s" repeatCount="indefinite"/>` : ''}
          ${shape}
        </g>
      </g>`;
    }
  });

  return wideSceneSvg(`${svgOutput}${renderSnowCover()}`);
};

// soft mist puffs from radial gradients instead of blur filters: gradient
// falloff renders smoothly at any card size, while a userSpaceOnUse blur
// turned anisotropic (a muddy horizontal smear) once the svg was stretched
const renderVolumetricFog = (): string => {
  const mistGradients = `<defs>
    <radialGradient id="mistBright" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e8edf4" stop-opacity="0.4"/>
      <stop offset="55%" stop-color="#e8edf4" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#e8edf4" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mistMid" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c3ccd8" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="#c3ccd8" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#c3ccd8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mistDeep" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9aa8b8" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#9aa8b8" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#9aa8b8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fogGroundVeil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#aab6c4" stop-opacity="0"/>
      <stop offset="100%" stop-color="#aab6c4" stop-opacity="0.3"/>
    </linearGradient>
  </defs>`;

  // wide soft puffs in three loose rows, drifting on long offset periods so
  // the field never visibly repeats; slower and deeper toward the bottom
  const puffs: Array<{
    x: number; y: number; rx: number; ry: number;
    fill: string; drift: number; dur: number; baseOpacity: number;
  }> = [
    { x: 20, y: 26, rx: 90, ry: 16, fill: 'mistBright', drift: 16, dur: 27, baseOpacity: 0.7 },
    { x: 66, y: 34, rx: 110, ry: 18, fill: 'mistMid', drift: -20, dur: 34, baseOpacity: 0.8 },
    { x: 38, y: 55, rx: 120, ry: 19, fill: 'mistMid', drift: 14, dur: 23, baseOpacity: 0.9 },
    { x: 84, y: 60, rx: 95, ry: 16, fill: 'mistBright', drift: -13, dur: 30, baseOpacity: 0.65 },
    { x: 14, y: 80, rx: 105, ry: 18, fill: 'mistDeep', drift: 18, dur: 38, baseOpacity: 0.95 },
    { x: 60, y: 86, rx: 125, ry: 20, fill: 'mistDeep', drift: -15, dur: 29, baseOpacity: 1 },
  ];

  let fogSvg = '';
  puffs.forEach((p, i) => {
    const driftUnits = (p.drift * SCENE_ASPECT * 0.35).toFixed(1);
    const breatheDur = 8 + (i % 4) * 2.5;
    const lowOpacity = (p.baseOpacity * 0.72).toFixed(2);
    fogSvg += `<ellipse cx="${sceneX(p.x)}" cy="${p.y}" rx="${p.rx}" ry="${p.ry}" fill="url(#${p.fill})" opacity="${p.baseOpacity}">
      <animateTransform attributeName="transform" type="translate" values="${driftUnits},0; ${-p.drift},0; ${driftUnits},0" dur="${p.dur}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="${p.baseOpacity};${lowOpacity};${p.baseOpacity}" dur="${breatheDur}s" repeatCount="indefinite"/>
    </ellipse>`;
  });

  fogSvg += `<rect x="0" y="58" width="${SCENE_VIEW_W}" height="42" fill="url(#fogGroundVeil)"/>`;
  return wideSceneSvg(mistGradients + fogSvg);
};

// impact ripples along the card's bottom edge: the bottom of the card reads
// as the ground plane the rain lands on. Rings are flattened ellipses
// (perspective on a floor) that expand and fade; every third one adds a tiny
// rebound droplet. Kept faint so the ground stays quieter than the sky.
const renderGroundSplashes = (intensity: number): string => {
  const count = Math.round(11 * intensity);
  let splashSvg = '';

  for (let i = 0; i < count; i++) {
    // deterministic pseudo-random spread via prime-multiplier hashing
    const xUnits = +sceneX((i * 47 + 13) % 100);
    const yPos = 94 + ((i * 7) % 4);
    const maxRadius = 2.2 + ((i * 11) % 4) * 0.4;
    const duration = 0.9 + ((i * 13) % 5) * 0.12;
    const delay = ((i * 29) % 24) * 0.11;
    const peakOpacity = 0.38 + ((i * 5) % 3) * 0.09;

    // the perspective flattening lives in a static scale wrapper, so one
    // radius animation replaces separate rx/ry pairs (fewer live animations)
    splashSvg += `<g transform="translate(${xUnits},${yPos}) scale(1,0.32)">
      <circle r="0" fill="none" stroke="rgba(205,228,255,1)" stroke-width="0.35" stroke-opacity="0">
        <animate attributeName="r" values="0;${maxRadius}" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="stroke-opacity" values="0;${peakOpacity};0" keyTimes="0;0.2;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>
    </g>`;

    if (i % 3 === 0) {
      const bounceX = i % 2 ? 0.9 : -0.9;
      const bounceDur = (duration * 0.45).toFixed(2);
      splashSvg += `<circle cx="${xUnits}" cy="${yPos}" r="0.32" fill="rgba(205,228,255,0.9)" opacity="0">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="${bounceX},-2.4" dur="${bounceDur}s" begin="${delay}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;0.5;0" dur="${bounceDur}s" begin="${delay}s" repeatCount="indefinite"/>
      </circle>`;
    }
  }
  return splashSvg;
};

// full-card rain streaks, quiet and background: thin, translucent, slightly
// slanted, with impact splashes where they meet the bottom of the card
const renderRainStreaks = (intensity: number): string => {
  // three depth layers: faint/short distant streaks to brighter/longer near ones
  const streakLayers = [
    { count: Math.round(9 * intensity), strokeWidth: 0.3, opacity: 0.1, length: 5, speed: 1.5 },
    { count: Math.round(7 * intensity), strokeWidth: 0.45, opacity: 0.16, length: 7, speed: 1.1 },
    { count: Math.round(5 * intensity), strokeWidth: 0.6, opacity: 0.22, length: 9, speed: 0.8 },
  ];

  let streaksSvg = '';
  streakLayers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      // deterministic pseudo-random spread via prime-multiplier hashing
      const xPercent = (i * 37 + layerIndex * 23 + 11) % 102 - 1;
      const xUnits = +sceneX(xPercent);
      const duration = layer.speed + ((i * 13 + layerIndex * 7) % 6) * 0.07;
      const delay = ((i * 17 + layerIndex * 11) % 20) * 0.09;
      const slant = -(1.2 + layerIndex * 0.5);
      const dropX2 = (xUnits + slant * (layer.length / 10)).toFixed(1);

      // streaks start above the viewBox and end below it, so they need no
      // fade animation — one translate per streak is the whole cost
      streaksSvg += `<line x1="${xUnits}" y1="-10" x2="${dropX2}" y2="${-10 + layer.length}"
        stroke="rgba(205,228,255,${layer.opacity})" stroke-width="${layer.strokeWidth}" stroke-linecap="round">
        <animateTransform attributeName="transform" type="translate"
          from="0,0" to="${slant * 12},120" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/>
      </line>`;
    }
  });

  return wideSceneSvg(streaksSvg + renderGroundSplashes(intensity));
};

// animated background layer per condition
export const renderWeatherLayer = (condition: string): string => {
  switch (condition) {
    case 'rainy':
    case 'hail':
      return renderRainStreaks(1);
    case 'pouring':
      return renderRainStreaks(1.7);
    case 'lightning-rainy':
      return renderRainStreaks(1);
    case 'lightning':
      return renderRainStreaks(0.5);
    case 'snowy':
    case 'snowy-rainy':
      return renderLayeredSnow();
    case 'fog':
      return renderVolumetricFog();
    default:
      return '';
  }
};
