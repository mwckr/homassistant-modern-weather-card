const layerSvg = (content: string, preserveAspect = true): string =>
  `<svg ${preserveAspect ? 'viewBox="0 0 100 100" preserveAspectRatio="none" ' : ''}style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

// the layerSvg helper stretches its 100x100 viewBox non-uniformly to fill the
// card, which smears symmetric shapes (flakes, mist puffs) into wide
// ellipses; the fog layer instead shares this wide viewBox + "slice" svg so
// a unit stays a unit in both axes and shapes render undistorted
const SCENE_ASPECT = 3.2;
const SCENE_VIEW_W = 100 * SCENE_ASPECT;
const sceneX = (percent: number): string => (percent * SCENE_ASPECT).toFixed(1);

const wideSceneSvg = (content: string): string =>
  `<svg viewBox="0 0 ${SCENE_VIEW_W} 100" preserveAspectRatio="xMidYMax slice"
    style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

export const renderStars = (): string => {
  const starPoints: Array<[number, number]> = [
    [15, 12], [72, 8], [88, 24], [26, 6], [42, 14], [80, 32], [10, 28], [52, 8], [38, 22], [94, 10],
    [18, 35], [60, 5], [82, 18], [35, 10], [68, 28], [8, 18], [48, 6], [75, 15], [30, 30], [90, 8],
    [22, 20], [55, 16], [64, 12], [45, 28], [85, 40], [12, 42], [33, 40], [58, 34], [70, 42], [92, 30],
    [5, 8], [28, 14], [50, 20], [78, 6], [96, 18], [40, 5], [65, 22], [20, 26], [86, 14], [7, 36],
    [47, 38], [74, 36],
  ];
  let starsSvg = '';

  for (let i = 0; i < starPoints.length; i++) {
    const [xPos, yPos] = starPoints[i];
    // most stars are pinpricks; every seventh is a brighter beacon
    const bright = i % 7 === 0;
    const radius = (bright ? 0.75 : 0.4) + ((i * 7 + 3) % 6) * 0.08;
    const duration = 2.5 + (i % 5) * 1.1;
    const peak = bright ? 0.95 : 0.7;
    starsSvg += `<circle cx="${xPos}%" cy="${yPos}%" r="${radius}" fill="#fff" opacity="0.6">
      <animate attributeName="opacity" values="0.12;${peak};0.12" dur="${duration}s" begin="${((i * 13) % 30) / 10}s" repeatCount="indefinite"/>
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

// animated svg layer per condition. Rain, snow and lightning are drawn by
// the canvas FxEngine; only the volumetric fog remains an svg scene.
export const renderWeatherLayer = (condition: string): string =>
  condition === 'fog' ? renderVolumetricFog() : '';
