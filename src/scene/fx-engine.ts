// Canvas precipitation/lightning engine, adapted from the wec.js reference
// card (meteor-style rain streaks, three-depth snow, fractal midpoint-
// displacement lightning with glow+core strokes and double strikes).
// One rAF loop, running only while a scene needs it and the page is visible.

export type FxScene = 'rain' | 'pour' | 'sleet' | 'snow' | 'storm' | 'storm-rain' | null;

// the canvas spans the whole card; precipitation falls across the UI like
// Apple Weather, and each near drop lands with a splash at its own floor
// somewhere on the lower "surface" zone (the tiles and pill live there)
const SKY_FRAC = 0.64;

interface Drop {
  x: number;
  y: number;
  vy: number;
  len: number;
  op: number;
  tilt: number;
  w: number;
  /** y where this drop lands (splashes if `near`) */
  floor: number;
  near: boolean;
}

interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  sine: number;
  sineSpeed: number;
  sineAmp: number;
  op: number;
  layer: 0 | 1 | 2;
  /** y where this flake settles and respawns */
  floor: number;
}

interface BoltPoint {
  x: number;
  y: number;
}

interface Bolt {
  pts: BoltPoint[];
  branches: BoltPoint[][];
  alpha: number;
}

const RAIN_COUNT: Record<string, number> = {
  rain: 90,
  pour: 220,
  'storm-rain': 110,
  sleet: 50,
};

export class FxEngine {
  /** ambient lift 0..~0.45 while lightning lights the scene */
  public onFlash?: (lift: number) => void;

  /** y (canvas px) of the surface rain lands on — the metric tiles' top
      edge, measured by the card; null falls back to a distributed floor */
  public floorProvider?: () => number | null;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private sprite: HTMLCanvasElement | null = null;
  private scene: FxScene = null;
  private drops: Drop[] = [];
  private flakes: Flake[] = [];
  private splashes: Splash[] = [];
  private bolts: Bolt[] = [];
  private flash = 0;
  private nextStrike = 0;
  private floorLine: number | null = null;
  private rafId = 0;
  private running = false;
  private staticDrawn = false;
  private staticBolt: { pts: BoltPoint[]; branches: BoltPoint[][] } | null = null;
  private readonly strikeTimeouts = new Set<number>();
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly onVisibility = (): void => this.sync();

  // re-entrant: called on every card update and on reconnect after destroy()
  public attach(canvas: HTMLCanvasElement | null): void {
    if (canvas && canvas !== this.canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }
    if (!this.canvas) return;
    // duplicate registrations are ignored, so this is safe to repeat
    document.addEventListener('visibilitychange', this.onVisibility);
    this.sync();
  }

  public setScene(scene: FxScene): void {
    if (scene === this.scene) return;
    this.scene = scene;
    this.drops = [];
    this.flakes = [];
    this.bolts = [];
    this.flash = 0;
    this.staticDrawn = false;
    this.staticBolt = null;
    this.nextStrike = performance.now() / 1000 + 0.8 + Math.random() * 1.2;
    for (const id of this.strikeTimeouts) window.clearTimeout(id);
    this.strikeTimeouts.clear();
    if (!scene) this.clear();
    this.sync();
  }

  public sync(): void {
    const shouldRun =
      !!this.scene && !!this.ctx && !document.hidden && !!this.canvas?.isConnected;
    if (shouldRun && !this.running) {
      this.running = true;
      this.staticDrawn = false;
      this.loop();
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.rafId);
    }
  }

  public destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    for (const id of this.strikeTimeouts) window.clearTimeout(id);
    this.strikeTimeouts.clear();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private clear(): void {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private loop(): void {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(() => {
      this.draw();
      // reduced motion: render one calm frame, then idle
      if (this.reducedMotion.matches) {
        this.running = false;
        return;
      }
      this.loop();
    });
  }

  private draw(): void {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const scene = this.scene;
    if (!canvas || !ctx || !scene) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (
      canvas.width !== Math.round(rect.width * dpr) ||
      canvas.height !== Math.round(rect.height * dpr)
    ) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.drops = [];
      this.flakes = [];
    }
    const W = rect.width;
    const H = rect.height;
    const t = performance.now() / 1000;
    // measured once per frame; spawns during this frame read the cache
    this.floorLine = this.floorProvider?.() ?? null;
    ctx.clearRect(0, 0, W, H);

    if (this.reducedMotion.matches) {
      if (this.staticDrawn) return;
      this.staticDrawn = true;
      this.drawStaticFrame(ctx, W, H, scene);
      return;
    }

    const rainCount = RAIN_COUNT[scene];
    if (rainCount) this.drawRain(ctx, W, H, rainCount, scene === 'pour');
    if (scene === 'snow' || scene === 'sleet') this.drawSnow(ctx, W, H, scene === 'sleet');
    if (scene === 'storm' || scene === 'storm-rain') this.drawLightning(ctx, W, H, t);
  }

  // ── rain: near streaks that land with a splash, fine drizzle behind ─────

  // landing spot: on the measured surface line (the tiles' top edge) with a
  // little jitter, or distributed over the lower zone when nothing measured.
  // Fine drizzle dies just above the line so it reads as depth, not impact.
  private dropFloor(H: number, near: boolean): number {
    if (this.floorLine != null) {
      return near
        ? this.floorLine + Math.random() * 5 - 1
        : this.floorLine - 3 - Math.random() * 14;
    }
    return near ? H * (0.68 + Math.random() * 0.29) : H * (0.62 + Math.random() * 0.34);
  }

  private drawRain(ctx: CanvasRenderingContext2D, W: number, H: number, count: number, heavy: boolean): void {
    const total = count + Math.round(count * 0.9);
    if (this.drops.length !== total) {
      // opacities are tuned for drops IN MOTION — a paused frame looks
      // heavier than the same values feel live, so keep these bold
      const near = (): Drop => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: (heavy ? 3.6 : 2.8) + Math.random() * 3.4,
        len: 9 + Math.random() * 11,
        op: 0.3 + Math.random() * 0.32,
        tilt: -0.06 - Math.random() * 0.05,
        w: 1.1 + Math.random() * 0.7,
        floor: this.dropFloor(H, true),
        near: true,
      });
      // distant drizzle: short, faint, thin — the depth texture behind
      const fine = (): Drop => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: 2.1 + Math.random() * 1.7,
        len: 4 + Math.random() * 5,
        op: 0.12 + Math.random() * 0.14,
        tilt: -0.05 - Math.random() * 0.04,
        w: 0.8,
        floor: this.dropFloor(H, false),
        near: false,
      });
      this.drops = [
        ...Array.from({ length: Math.round(count * 0.9) }, fine),
        ...Array.from({ length: count }, near),
      ];
      this.splashes = [];
    }

    ctx.save();
    ctx.lineCap = 'round';
    for (const d of this.drops) {
      d.y += d.vy;
      d.x += d.vy * d.tilt;
      if (d.y > d.floor) {
        // impact: near streaks kick up a small crown of droplets
        if (d.near && this.splashes.length < 70) {
          const n = 2 + Math.floor(Math.random() * 2);
          for (let i = 0; i < n; i++) {
            this.splashes.push({
              x: d.x,
              y: d.floor,
              vx: (Math.random() - 0.5) * 1.6,
              vy: -(1.1 + Math.random() * 1.3),
              life: 1,
            });
          }
        }
        d.y = -12;
        d.x = Math.random() * W;
        d.floor = this.dropFloor(H, d.near);
      }
      if (d.x > W + 12) d.x -= W + 24;
      if (d.x < -12) d.x += W + 24;

      // mid-tone streaks stay legible on the dark sky and the light surface
      const hx = d.x - d.tilt * d.len;
      const hy = d.y - d.len;
      const grad = ctx.createLinearGradient(hx, hy, d.x, d.y);
      grad.addColorStop(0, 'rgba(150,180,208,0)');
      grad.addColorStop(0.7, `rgba(170,200,228,${(d.op * 0.8).toFixed(2)})`);
      grad.addColorStop(1, `rgba(196,222,244,${d.op.toFixed(2)})`);
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(d.x, d.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = d.w;
      ctx.stroke();
    }
    ctx.restore();

    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const s = this.splashes[i];
      s.vy += 0.14;
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.055;
      if (s.life <= 0) {
        this.splashes.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190,215,238,${(s.life * 0.55).toFixed(2)})`;
      ctx.fill();
    }
  }

  // snow settles around the surface line with a wide scatter — a hard
  // settle line would read as a shelf
  private flakeFloor(H: number): number {
    return this.floorLine != null
      ? this.floorLine + Math.random() * 18 - 9
      : H * (0.66 + Math.random() * 0.32);
  }

  // ── snow: crisp round flakes with a tight soft edge, no halo ring ───────

  // one shared sprite: solid white core with a short monotonic falloff. The
  // earlier live radial gradients (solid→half→zero) banded into visible
  // rings around every flake; a sprite with a fast falloff reads as a clean
  // slightly-soft snowflake at any draw size.
  private flakeSprite(): HTMLCanvasElement {
    if (this.sprite) return this.sprite;
    const S = 48;
    const sprite = document.createElement('canvas');
    sprite.width = S;
    sprite.height = S;
    const sctx = sprite.getContext('2d')!;
    const g = sctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.62, 'rgba(255,255,255,0.96)');
    g.addColorStop(0.82, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, S, S);
    this.sprite = sprite;
    return sprite;
  }

  private drawSnow(ctx: CanvasRenderingContext2D, W: number, H: number, sparse: boolean): void {
    if (this.flakes.length === 0) {
      const mk = (n: number, layer: 0 | 1 | 2, rBase: number, rVar: number, vyBase: number, vyVar: number, opBase: number, opVar: number): Flake[] =>
        Array.from({ length: sparse ? Math.round(n * 0.55) : n }, () => ({
          layer,
          r: rBase + Math.random() * rVar,
          vy: vyBase + Math.random() * vyVar,
          vx: (Math.random() - 0.5) * 0.15,
          sine: Math.random() * Math.PI * 2,
          sineSpeed: 0.01 + Math.random() * 0.02,
          sineAmp: 0.05 + Math.random() * 0.12,
          op: opBase + Math.random() * opVar,
          x: Math.random() * W,
          y: Math.random() * H,
          floor: this.flakeFloor(H),
        }));
      this.flakes = [
        ...mk(26, 0, 0.6, 0.6, 0.3, 0.5, 0.2, 0.2),
        ...mk(18, 1, 1.0, 0.9, 0.45, 0.8, 0.4, 0.3),
        ...mk(9, 2, 1.6, 1.1, 0.65, 1.0, 0.6, 0.25),
      ];
    }

    const sprite = this.flakeSprite();
    for (const f of this.flakes) {
      f.sine += f.sineSpeed;
      f.x += f.vx + Math.sin(f.sine) * f.sineAmp;
      f.y += f.vy;
      if (f.y > f.floor) {
        // settled: respawn above with a fresh landing spot
        f.y = -5;
        f.x = Math.random() * W;
        f.floor = this.flakeFloor(H);
      }
      if (f.x < -5) f.x = W + 5;
      if (f.x > W + 5) f.x = -5;

      const d = f.r * 2.6;
      ctx.globalAlpha = f.op;
      ctx.drawImage(sprite, f.x - d / 2, f.y - d / 2, d, d);
    }
    ctx.globalAlpha = 1;
  }

  // ── lightning: fractal bolts, glow + core, screen flash ─────────────────

  private drawLightning(ctx: CanvasRenderingContext2D, W: number, H: number, t: number): void {
    if (this.flash > 0) {
      ctx.fillStyle = `rgba(235,238,245,${this.flash.toFixed(3)})`;
      ctx.fillRect(0, 0, W, H);
      this.flash = Math.max(0, this.flash - 0.045);
    }

    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      this.drawBolt(ctx, b.pts, b.alpha);
      for (const br of b.branches) this.drawBolt(ctx, br, b.alpha * 0.6);
      b.alpha -= 0.032;
      if (b.alpha <= 0) this.bolts.splice(i, 1);
    }

    if (t > this.nextStrike) {
      this.strike(W, H);
      this.nextStrike = t + 2 + Math.random() * 4;
    }
  }

  private strike(W: number, H: number): void {
    // the canvas is full-card; bolts stay within the sky zone above the tiles
    const skyH = H * SKY_FRAC;
    const startX = W * 0.15 + Math.random() * W * 0.7;
    const endX = startX + (Math.random() - 0.5) * 60;
    const endY = skyH * (0.5 + Math.random() * 0.38);
    const main = createBolt(startX, 0, endX, endY, W);

    const branches: BoltPoint[][] = [];
    const numBranches = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numBranches; i++) {
      const idx = Math.floor(main.length * 0.3 + Math.random() * main.length * 0.4);
      if (main[idx]) {
        const bx = main[idx].x + (Math.random() - 0.5) * 25;
        const by = main[idx].y + skyH * (0.15 + Math.random() * 0.25);
        branches.push(createBolt(main[idx].x, main[idx].y, bx, by, W));
      }
    }

    this.bolts.push({ pts: main, branches, alpha: 1 });
    this.flash = 0.18 + Math.random() * 0.18;
    this.onFlash?.(Math.min(0.45, 0.2 + Math.random() * 0.15));

    // echo strike: a second fainter bolt moments later, half the time
    if (Math.random() > 0.5) {
      const id = window.setTimeout(() => {
        this.strikeTimeouts.delete(id);
        this.bolts.push({
          pts: createBolt(startX + (Math.random() - 0.5) * 20, 0, endX + (Math.random() - 0.5) * 20, endY, W),
          branches: [],
          alpha: 0.7,
        });
        this.flash = Math.max(this.flash, 0.12);
        this.onFlash?.(0.16);
      }, 90 + Math.random() * 120);
      this.strikeTimeouts.add(id);
    }
  }

  // warm white-yellow channel like the Apple reference: a thin soft halo and
  // a bright core — no broad colored band behind the bolt
  private drawBolt(ctx: CanvasRenderingContext2D, pts: BoltPoint[], alpha: number): void {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = `rgba(255,243,210,${(alpha * 0.5).toFixed(2)})`;
    ctx.lineWidth = 2.6;
    ctx.shadowColor = 'rgba(255,240,200,0.9)';
    ctx.shadowBlur = 12;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = `rgba(255,253,242,${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.3;
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // ── reduced-motion still frame ──────────────────────────────────────────

  private drawStaticFrame(ctx: CanvasRenderingContext2D, W: number, H: number, scene: FxScene): void {
    const rainCount = RAIN_COUNT[scene as string];
    if (rainCount) this.drawRainStatic(ctx, W, H, Math.round(rainCount * 0.5));
    if (scene === 'snow' || scene === 'sleet') {
      this.drawSnow(ctx, W, H, scene === 'sleet');
    }
    if (scene === 'storm' || scene === 'storm-rain') {
      if (!this.staticBolt) {
        const skyH = H * SKY_FRAC;
        const x1 = W * (0.3 + Math.random() * 0.4);
        const y1 = skyH * (0.55 + Math.random() * 0.3);
        const pts = createBolt(x1, 0, x1 + (Math.random() - 0.5) * 60, y1, W);
        const branches: BoltPoint[][] = [];
        const idx = Math.floor(pts.length * 0.4);
        if (pts[idx]) {
          branches.push(
            createBolt(pts[idx].x, pts[idx].y, pts[idx].x + (Math.random() - 0.5) * 25, pts[idx].y + skyH * 0.15, W),
          );
        }
        this.staticBolt = { pts, branches };
      }
      this.drawBolt(ctx, this.staticBolt.pts, 0.65);
      for (const br of this.staticBolt.branches) this.drawBolt(ctx, br, 0.38);
    }
  }

  private drawRainStatic(ctx: CanvasRenderingContext2D, W: number, H: number, count: number): void {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i++) {
      const x = ((i * 71 + 13) % 100) / 100 * W;
      const y = ((i * 37 + 7) % 100) / 100 * H;
      ctx.beginPath();
      ctx.moveTo(x + 1.2, y - 12);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(200,230,255,0.22)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
    ctx.restore();
  }
}

// fractal midpoint displacement — the "super convincing" bolt shape
const createBolt = (x1: number, y1: number, x2: number, y2: number, W: number): BoltPoint[] => {
  let pts: BoltPoint[] = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
  let displacement = W / 8;
  let segmentHeight = Math.abs(y2 - y1);
  while (segmentHeight > 4) {
    const next: BoltPoint[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const s = pts[i];
      const e = pts[i + 1];
      next.push(s, { x: (s.x + e.x) / 2 + (Math.random() * 2 - 1) * displacement, y: (s.y + e.y) / 2 });
    }
    next.push(pts[pts.length - 1]);
    pts = next;
    displacement /= 2;
    segmentHeight /= 2;
  }
  return pts;
};
