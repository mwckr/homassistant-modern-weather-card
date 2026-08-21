// water droplets sitting on the card's "glass" during rain — the Apple
// Weather lens effect. Each drop is a small element whose backdrop-filter
// refracts whatever it sits on (tiles, sky, forecast pill); a slow cycle
// fades it in, lets it slide a touch, and rolls it away.

const DROP_CONDITIONS = new Set(['rainy', 'pouring', 'lightning-rainy', 'hail', 'snowy-rainy']);

export const hasGlassDrops = (condition: string): boolean => DROP_CONDITIONS.has(condition);

// deterministic per call — the string never changes, so lit keeps the DOM
// and the stagger of the drop cycles stays uninterrupted across re-renders
export const renderGlassDrops = (): string => {
  const COUNT = 18;
  let out = '';
  for (let i = 0; i < COUNT; i++) {
    // prime-multiplier hashing for an even, non-grid spread
    const left = (i * 53 + 11) % 97;
    const top = 6 + ((i * 37 + 5) % 88);
    const w = 4.5 + ((i * 13) % 8);
    const h = w * (1.12 + ((i * 7) % 3) * 0.14);
    const dur = 9 + ((i * 11) % 9);
    const delay = -(((i * 17) % 20) * 0.7).toFixed(1);
    const slide = 4 + ((i * 5) % 9);
    out += `<span class="rain-drop" style="left:${left}%;top:${top}%;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;--ddur:${dur}s;--ddelay:${delay}s;--dslide:${slide}px"></span>`;
  }
  return out;
};
