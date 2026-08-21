// Processes the raw photos in assets/clouds/ into small alpha-feathered WebP
// data URIs and writes src/assets.gen.ts. Uses a headless Chromium (Brave/
// Edge/Chrome) as the image processor — canvas crop → downscale → elliptical
// alpha feather → WebP — so no native image dependencies are needed. The
// conversion page POSTs its result back to this script over localhost, and
// the browser is then killed (headless Chromium often hangs on exit).
//
//   node tools/build-assets.mjs            (auto-detects a browser)
//   CHROME_BIN="C:\...\chrome.exe" node tools/build-assets.mjs
import { spawn, execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'assets', 'clouds');

// crop: source-fraction rect [x0, y0, x1, y1]
// feather: elliptical alpha falloff — cx/cy/rx/ry as output fractions,
//          alpha 1 inside `inner`·r, fading to 0 at r
const ASSETS = [
  // feather radii must stay ≤ ~0.48 so alpha reaches zero INSIDE the crop —
  // larger radii leave the rectangular crop edge visible as a hard cut line.
  // (The two dense vecteezy renders were retired: too opaque for this look.)
  {
    name: 'CLOUD_FLAT',
    file: 'cloud_PNG112271.png',
    crop: [0, 0, 1, 1],
    outW: 640,
    feather: { cx: 0.5, cy: 0.5, rx: 0.47, ry: 0.48, inner: 0.38 },
    blur: 1.2,
    quality: 0.72,
  },
  {
    // naturally translucent textured cumulus — the lead cloud everywhere
    name: 'CLOUD_AIRY',
    file: 'cloud.png',
    crop: [0, 0, 1, 1],
    outW: 720,
    feather: { cx: 0.5, cy: 0.5, rx: 0.49, ry: 0.49, inner: 0.55 },
    blur: 0,
    quality: 0.78,
  },
  // pre-blurred variants: softness is baked into the sprite so the card
  // never needs a runtime CSS blur() on large layers (GPU-seam prone, costly)
  {
    name: 'CLOUD_FLAT_SOFT',
    file: 'cloud_PNG112271.png',
    crop: [0, 0, 1, 1],
    outW: 520,
    feather: { cx: 0.5, cy: 0.5, rx: 0.47, ry: 0.48, inner: 0.36 },
    blur: 5,
    quality: 0.7,
  },
  {
    name: 'CLOUD_DECK',
    file: 'cloud_PNG112271.png',
    crop: [0, 0, 1, 1],
    outW: 400,
    feather: { cx: 0.5, cy: 0.5, rx: 0.47, ry: 0.48, inner: 0.3 },
    blur: 18,
    quality: 0.68,
  },
  {
    name: 'CLOUD_WISP',
    file: 'vecteezy_white-fluffy-cloud-light-and-delicate-graphic_49572375.png',
    crop: [0.05, 0.05, 0.95, 0.95],
    outW: 700,
    feather: { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, inner: 0.4 },
    blur: 0,
    quality: 0.7,
  },
  {
    name: 'CLOUD_WISP_SOFT',
    file: 'vecteezy_white-fluffy-cloud-light-and-delicate-graphic_49572375.png',
    crop: [0.05, 0.05, 0.95, 0.95],
    outW: 400,
    feather: { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, inner: 0.35 },
    blur: 12,
    quality: 0.68,
  },
  {
    name: 'SUN_FLARE',
    file: 'sun flare.png',
    crop: [0, 0, 1, 1],
    outW: 640,
    feather: { cx: 0.47, cy: 0.5, rx: 0.52, ry: 0.52, inner: 0.55 },
    blur: 0.8,
    saturate: 0.9,
    quality: 0.8,
  },
  {
    name: 'SUN_PLAIN',
    file: 'sun no flare.png',
    crop: [0, 0, 1, 1],
    outW: 560,
    feather: { cx: 0.47, cy: 0.48, rx: 0.49, ry: 0.49, inner: 0.5 },
    blur: 1,
    quality: 0.8,
  },
];

const findBrowser = () => {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const home = process.env.LOCALAPPDATA || '';
  const pf = process.env.ProgramFiles || 'C:\\Program Files';
  const pf86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const candidates = [
    join(home, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome',
  ];
  const hit = candidates.find((c) => existsSync(c));
  if (!hit) throw new Error('No Chromium browser found; set CHROME_BIN');
  return hit;
};

const page = `<!doctype html><meta charset="utf-8"><body><script>
const TASKS = ${JSON.stringify(ASSETS.map((a, i) => ({ ...a, src: `/img/${i}` })))};
(async () => {
  const results = [];
  for (const t of TASKS) {
    const img = new Image();
    img.src = t.src;
    await img.decode();
    const sw = img.naturalWidth, sh = img.naturalHeight;
    const cx0 = Math.round(t.crop[0] * sw), cy0 = Math.round(t.crop[1] * sh);
    const cw = Math.round(t.crop[2] * sw) - cx0, ch = Math.round(t.crop[3] * sh) - cy0;
    const outW = t.outW, outH = Math.round(outW * ch / cw);
    const c = document.createElement('canvas');
    c.width = outW; c.height = outH;
    const ctx = c.getContext('2d');
    const filters = [];
    if (t.blur) filters.push('blur(' + t.blur + 'px)');
    if (t.saturate) filters.push('saturate(' + t.saturate + ')');
    if (filters.length) ctx.filter = filters.join(' ');
    ctx.drawImage(img, cx0, cy0, cw, ch, 0, 0, outW, outH);
    ctx.filter = 'none';
    if (t.alphaCut) {
      // smoothstep alpha remap: zero below lo, untouched above hi — kills
      // low-alpha mask artifacts without hard-edging the remaining cloud
      const [lo, hi] = t.alphaCut;
      const image = ctx.getImageData(0, 0, outW, outH);
      const px = image.data;
      for (let i = 3; i < px.length; i += 4) {
        const a = px[i];
        if (a <= lo) px[i] = 0;
        else if (a < hi) {
          const s = (a - lo) / (hi - lo);
          px[i] = Math.round(a * s * s * (3 - 2 * s));
        }
      }
      ctx.putImageData(image, 0, 0);
    }
    if (t.feather) {
      const f = t.feather;
      ctx.globalCompositeOperation = 'destination-in';
      ctx.save();
      ctx.translate(f.cx * outW, f.cy * outH);
      ctx.scale(f.rx * outW, f.ry * outH);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(f.inner, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-2, -2, 4, 4);
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';
    }
    // guarantee: alpha reaches exactly zero along every sprite border with a
    // smooth ramp over the outer margin, whatever the crop/feather did — a
    // straight edge can never survive into the card
    const margin = t.edgeFade ?? 0.07;
    if (margin > 0) {
      const image = ctx.getImageData(0, 0, outW, outH);
      const px = image.data;
      const mx = outW * margin, my = outH * margin;
      for (let y = 0; y < outH; y++) {
        const fy = Math.min(1, Math.min(y, outH - 1 - y) / my);
        for (let x = 0; x < outW; x++) {
          const fx = Math.min(1, Math.min(x, outW - 1 - x) / mx);
          const f = Math.min(fx, fy);
          if (f < 1) {
            const i = (y * outW + x) * 4 + 3;
            px[i] = Math.round(px[i] * f * f * (3 - 2 * f));
          }
        }
      }
      ctx.putImageData(image, 0, 0);
    }
    results.push({ name: t.name, uri: c.toDataURL('image/webp', t.quality), w: outW, h: outH });
  }
  await fetch('/result', { method: 'POST', body: JSON.stringify(results) });
})().catch(e => fetch('/result', { method: 'POST', body: JSON.stringify({ error: String(e) }) }));
</script></body>`;

const resultPromise = new Promise((resolveResult, rejectResult) => {
  const timer = setTimeout(() => rejectResult(new Error('timeout after 90s')), 90000);
  const server = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(page);
    }
    const imgMatch = /^\/img\/(\d+)$/.exec(req.url || '');
    if (imgMatch) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      return res.end(readFileSync(join(srcDir, ASSETS[+imgMatch[1]].file)));
    }
    if (req.url === '/result' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        res.writeHead(200);
        res.end('ok');
        clearTimeout(timer);
        server.close();
        resolveResult(JSON.parse(body));
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const browser = findBrowser();
    console.log(`processing ${ASSETS.length} assets with ${browser}`);
    const profile = join(tmpdir(), `mwc-assets-profile-${Date.now()}`);
    const child = spawn(
      browser,
      [
        '--headless=new', '--disable-gpu', '--no-first-run', '--mute-audio',
        `--user-data-dir=${profile}`,
        `http://127.0.0.1:${port}/`,
      ],
      { stdio: 'ignore' },
    );
    const killBrowser = () => {
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: 'ignore' });
        } else {
          child.kill('SIGKILL');
        }
      } catch { /* already gone */ }
    };
    resultPromise.finally(killBrowser);
  });
});

const results = await resultPromise;
if (results.error) throw new Error(`conversion failed in page: ${results.error}`);

let ts = `// AUTO-GENERATED by tools/build-assets.mjs — do not edit by hand.
// Photographic sky sprites (cropped, alpha-feathered, WebP) from assets/clouds/.
`;
let total = 0;
for (const r of results) {
  const kb = Math.round((r.uri.length * 3) / 4 / 1024);
  total += kb;
  console.log(`  ${r.name.padEnd(12)} ${r.w}x${r.h}  ~${kb} KB`);
  ts += `\nexport const ${r.name} = '${r.uri}';\n`;
}
writeFileSync(join(root, 'src', 'assets.gen.ts'), ts);
console.log(`wrote src/assets.gen.ts (~${total} KB of image data)`);
