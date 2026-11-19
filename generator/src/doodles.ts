/**
 * The doodle family: HIGH TABLE Pay's hand-drawn critters and marks, redrawn for the event horizon.
 *
 * Same rules as HIGH TABLE's doodles and monsters: one ink line
 * weight with round caps and joins, two pointy horns, big uneven eyes, gold as the only fill, and diagonal
 * hatching on one side for shade. Every doodle is drawn in a 100 × 100 box and placed with `place()`.
 */
import { n, el, g, P } from './svg.ts';
import { rng } from './rng.ts';
import type { Theme } from './tokens.ts';
import type { Typesetter, FontKey } from './type.ts';

export interface Place {
  x: number; // centre
  y: number;
  size: number;
  rot?: number;
  /** final stroke width in px (default 5% of size, HIGH TABLE's 5 / 96) */
  sw?: number;
  flip?: boolean;
  cls?: string;
  opacity?: number;
  id?: string;
}

/** warm white die-cut border for critters on dark surfaces */
const CUT = '#f4f2ee';
/** ink used for critter line art in both themes */
const INK = '#141618';

/** Critter colours. Critters are always ink drawings (HIGH TABLE's monsters only ever sit on light paper);
 *  on dark surfaces they become die-cut stickers instead of switching to white lines. */
function crit(t: Theme) {
  return { line: INK, fill: t.fill, hole: t.name === 'dark' ? '#040405' : INK, paper: '#ffffff', hatch: INK };
}

/**
 * Position a 100 × 100 drawing. `inner` receives the local stroke width. `sil` lists the silhouette paths of a
 * critter: on dark themes they are drawn first, stroked wide in warm white, as a die-cut sticker border.
 */
function place(p: Place, inner: (sw: number) => string, sil?: { t: Theme; d: string[] }): string {
  const s = p.size / 100;
  const sw = (p.sw ?? p.size * 0.05) / s;
  const tf = `translate(${n(p.x - p.size / 2)} ${n(p.y - p.size / 2)}) scale(${n(s, 4)})${p.rot ? ` rotate(${n(p.rot)} 50 50)` : ''}${p.flip ? ' translate(100 0) scale(-1 1)' : ''}`;
  const cut = sil && sil.t.name === 'dark' ? g({ fill: CUT, stroke: CUT, 'stroke-width': n(sw * 3.4) }, ...sil.d.map((d) => `<path d="${d}"/>`)) : '';
  return g({ id: p.id, class: p.cls, opacity: p.opacity }, g({ transform: tf, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cut + inner(sw)));
}

let uid = 0;
const nextId = (pre: string) => `${pre}${(uid++).toString(36)}`;
export function resetIds() {
  uid = 0;
}

/** diagonal hatching clipped to a shape, only on its right side (x > from) */
function hatch(shape: string, from: number, color: string, sw: number, gap = 7, to = 100): string {
  const id = nextId('ht');
  let lines = '';
  for (let x = from - 60; x < to + 10; x += gap) lines += `M${n(x)} 100L${n(x + 70)} 0`;
  return el('clipPath', { id }, el('path', { d: shape })) + el('path', { d: lines, stroke: color, 'stroke-width': n(sw * 0.62), 'clip-path': `url(#${id})`, opacity: 0.9 });
}

/** big round eye with a pupil looking toward (dx, dy) */
function eye(cx: number, cy: number, r: number, line: string, sw: number, dx = 0.35, dy = -0.2, white = '#fff'): string {
  return (
    el('circle', { cx, cy, r, fill: white, stroke: line, 'stroke-width': n(sw) }) +
    el('circle', { cx: cx + r * dx, cy: cy + r * dy, r: n(r * 0.42), fill: '#111' })
  );
}

// ---------------------------------------------------------------------------------------------------
// critters

/** The Singularity: a horned black hole wearing its accretion disk like a tutu. The profile's mascot. */
export function voidling(t: Theme, p: Place, o: { wave?: boolean; waveCls?: string; blinkCls?: string } = {}): string {
  const c = crit(t);
  const body = 'M50 34a24 24 0 1 1 -.1 0Z';
  const hornL = 'M33 41C29 34 27 26 27 17C33 23 38 29 42 35Z';
  const hornR = 'M67 41C71 34 74 25 75 16C68 22 62 28 58 35Z';
  const ringBack = 'M7 60A43 11 0 0 1 93 60';
  const ringFront = 'M93 60A43 11 0 0 1 7 60';
  const armL = o.wave ? 'M28 62C20 58 15 50 12 41M12 41l-4-4M12 41l-1-6M12 41l4-4' : 'M28 64C21 66 16 70 13 76M13 76l-5 1M13 76l-2 4M13 76l3 3';
  const armR = 'M72 64C79 66 84 70 87 76M87 76l5 1M87 76l2 4M87 76l-3 3';
  return place(
    p,
    (sw) =>
      el('path', { d: ringBack, stroke: c.fill, 'stroke-width': n(sw * 1.25) }) +
      el('path', { d: hornL, fill: c.hole, stroke: c.line, 'stroke-width': n(sw) }) +
      el('path', { d: hornR, fill: c.hole, stroke: c.line, 'stroke-width': n(sw) }) +
      el('path', { d: body, fill: c.hole, stroke: c.line, 'stroke-width': n(sw) }) +
      // photon rim on the body
      el('path', { d: 'M33 46A24 24 0 0 1 64 38', stroke: c.fill, 'stroke-width': n(sw * 0.55), opacity: 0.9 }) +
      g({ class: o.blinkCls }, eye(41, 53, 7.5, c.line, sw * 0.8, 0.3, -0.25), eye(59, 51, 9.5, c.line, sw * 0.8, 0.3, -0.25)) +
      el('path', { d: 'M41 67l3 3 3-3 3 3 3-3 3 3', stroke: '#fff', 'stroke-width': n(sw * 0.7) }) +
      el('path', { d: ringFront, stroke: c.fill, 'stroke-width': n(sw * 1.25) }) +
      el('path', { d: ringFront, stroke: c.line, 'stroke-width': n(sw * 0.35), opacity: 0.55, transform: 'translate(0 3.2)' }) +
      g({ class: o.waveCls }, el('path', { d: armL, stroke: c.line, 'stroke-width': n(sw) })) +
      el('path', { d: armR, stroke: c.line, 'stroke-width': n(sw) }),
    { t, d: [body, hornL, hornR, ringBack, ringFront, armL, armR] },
  );
}

/** HIGH TABLE's little ghost, horned, optionally being stretched toward a black hole (spaghettified) */
export function ghost(t: Theme, p: Place, o: { stretch?: number } = {}): string {
  const c = crit(t);
  const st = o.stretch ?? 0;
  const shape = 'M27 82V46a23 23 0 0 1 46 0v36l-7-6-6 6-7-6-6 6-7-6-6 6Z';
  const hornL = 'M33 30C31 24 31 19 33 13C36 18 39 22 41 25Z';
  const hornR = 'M67 30C69 24 69 19 67 13C64 18 61 22 59 25Z';
  const warp = st ? `translate(50 50) skewX(${n(-8 * st)}) scale(${n(1 + st * 0.35)} ${n(1 - st * 0.18)}) translate(-50 -50)` : undefined;
  const speed = st ? [0, 1, 2].map((i) => `M${n(84 + i * 3)} ${n(40 + i * 12)}h${n(8 + st * 14 - i * 4)}`).join('') : '';
  return place(p, (sw) => {
    // the die-cut border has to live inside the warp, so it is drawn here rather than by place()
    const cut = t.name === 'dark' ? g({ fill: CUT, stroke: CUT, 'stroke-width': n(sw * 3.4) }, ...[shape, hornL, hornR].map((d) => `<path d="${d}"/>`)) : '';
    return (
      g(
        { transform: warp },
        cut,
        el('path', { d: shape, fill: c.paper, stroke: c.line, 'stroke-width': n(sw) }),
        hatch(shape, 58, c.hatch, sw),
        el('path', { d: shape, stroke: c.line, 'stroke-width': n(sw) }),
        el('path', { d: hornL, fill: c.line }),
        el('path', { d: hornR, fill: c.line }),
        eye(41, 46, 7, c.line, sw * 0.8, -0.35, 0),
        eye(58, 45, 9, c.line, sw * 0.8, -0.35, 0),
        el('path', { d: 'M42 61c3 5 10 5 13 0', stroke: c.line, 'stroke-width': n(sw * 0.9) }),
      ) + (speed ? el('path', { d: speed, stroke: t.name === 'dark' ? CUT : c.line, 'stroke-width': n(sw * 0.8), opacity: 0.75 }) : '')
    );
  });
}

/** HIGH TABLE's speech-bubble critter, asking "what if?" (curiosity) */
export function asker(t: Theme, p: Place): string {
  const c = crit(t);
  const shape = 'M24 30h52a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10H40l-14 14 3-14h-5a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10Z';
  const hornL = 'M30 32C27 25 27 19 30 12C33 18 37 23 40 27Z';
  const hornR = 'M70 32C73 25 73 19 70 12C67 18 63 23 60 27Z';
  const q = 'M84 14c0-6 9-7 9-1 0 5-6 5-6 10M87 30v.5';
  return place(
    p,
    (sw) =>
      el('path', { d: hornL, fill: c.line }) +
      el('path', { d: hornR, fill: c.line }) +
      el('path', { d: shape, fill: c.paper, stroke: c.line, 'stroke-width': n(sw) }) +
      hatch(shape, 70, c.hatch, sw) +
      el('path', { d: shape, stroke: c.line, 'stroke-width': n(sw) }) +
      eye(49, 49, 10, c.line, sw * 0.8, 0.25, -0.35) +
      el('path', { d: 'M40 65c3-3 5 3 8 0s5 3 8 0 5 3 8 0', stroke: c.line, 'stroke-width': n(sw * 0.8) }) +
      el('path', { d: q, stroke: t.name === 'dark' ? t.fill : t.accentDeep, 'stroke-width': n(sw * 1.1) }),
    { t, d: [shape, hornL, hornR] },
  );
}

/** an open browser tab, horned (one of the distractions being pulled in) */
export function tabCritter(t: Theme, p: Place): string {
  const c = crit(t);
  const shape = 'M14 78L20 40Q22 31 31 31H69Q78 31 80 40L86 78Z';
  const hornL = 'M30 33C27 26 27 20 29 13C32 19 36 24 39 28Z';
  const hornR = 'M70 33C73 26 73 20 71 13C68 19 64 24 61 28Z';
  return place(
    p,
    (sw) =>
      el('path', { d: hornL, fill: c.line }) +
      el('path', { d: hornR, fill: c.line }) +
      el('path', { d: shape, fill: c.fill, stroke: c.line, 'stroke-width': n(sw) }) +
      hatch(shape, 64, c.hatch, sw) +
      el('path', { d: shape, stroke: c.line, 'stroke-width': n(sw) }) +
      eye(40, 56, 7, c.line, sw * 0.8, 0.3, 0.2) +
      eye(57, 55, 8.5, c.line, sw * 0.8, 0.3, 0.2) +
      el('path', { d: 'M44 70q5 4 10 0', stroke: c.line, 'stroke-width': n(sw * 0.8) }) +
      el('path', { d: 'M66 40l6 6M72 40l-6 6', stroke: c.line, 'stroke-width': n(sw * 0.75) }),
    { t, d: [shape, hornL, hornR] },
  );
}

/** HIGH TABLE's eyeball with lashes: observation */
export function eyeball(t: Theme, p: Place): string {
  const c = crit(t);
  const shape = 'M50 30a24 24 0 1 1-.1 0Z';
  const lashes = 'M32 28l-5-9M50 22v-10M68 28l5-9';
  return place(
    p,
    (sw) =>
      el('path', { d: shape, fill: c.paper, stroke: c.line, 'stroke-width': n(sw) }) +
      hatch(shape, 62, c.hatch, sw) +
      el('path', { d: shape, stroke: c.line, 'stroke-width': n(sw) }) +
      el('circle', { cx: 56, cy: 56, r: 10, fill: c.fill, stroke: c.line, 'stroke-width': n(sw * 0.7) }) +
      el('circle', { cx: 58, cy: 55, r: 4.5, fill: '#111' }) +
      el('path', { d: lashes, stroke: c.line, 'stroke-width': n(sw) }),
    { t, d: [shape, lashes] },
  );
}

// ---------------------------------------------------------------------------------------------------
// marks

export function sparkle(t: Theme, p: Place, fill?: string): string {
  return place(p, (sw) =>
    el('path', { d: 'M50 8C53 37 63 47 92 50C63 53 53 63 50 92C47 63 37 53 8 50C37 47 47 37 50 8Z', fill: fill ?? t.fill, stroke: t.line, 'stroke-width': n(sw) }),
  );
}

export function crown(t: Theme, p: Place): string {
  return place(p, (sw) =>
    el('path', { d: 'M14 64L21 26L39 47L50 18L61 47L79 26L86 64Z', fill: t.fill, stroke: t.line, 'stroke-width': n(sw) }) +
    el('path', { d: 'M16 76H84', stroke: t.line, 'stroke-width': n(sw) }),
  );
}

export function spiral(t: Theme, p: Place, color?: string): string {
  return place(p, (sw) =>
    el('path', { d: 'M47 50a3 3 0 1 1 6 0a7 7 0 1 1-14 0a11 11 0 1 1 22 0a15 15 0 1 1-30 0a19 19 0 1 1 38 0a23 23 0 1 1-46 0', stroke: color ?? t.line, 'stroke-width': n(sw) }),
  );
}

/** a tiny black hole with one orbiting body */
export function orbitGlyph(t: Theme, p: Place, o: { bodies?: number; seed?: string } = {}): string {
  const r = rng(o.seed ?? 'orbit');
  const bodies = o.bodies ?? 1;
  return place(p, (sw) => {
    let out = '';
    const orbits: string[] = [];
    const front: string[] = [];
    for (let i = 0; i < bodies; i++) {
      const rx = 30 + i * 9;
      const ry = 9 + i * 3;
      const rot = -16 + i * 7;
      const th = r.range(0.2, Math.PI - 0.2) + (i % 2 ? Math.PI : 0);
      const bx = 50 + Math.cos(th) * rx;
      const by = 52 + Math.sin(th) * ry;
      orbits.push(el('ellipse', { cx: 50, cy: 52, rx, ry, stroke: t.line, 'stroke-width': n(sw * 0.55), 'stroke-dasharray': `${n(sw * 0.2)} ${n(sw * 1.4)}`, transform: `rotate(${rot} 50 52)` }));
      const dot = el('circle', { cx: bx, cy: by, r: n(4.2 - i * 0.6), fill: i === 0 ? t.fill : t.line, stroke: t.line, 'stroke-width': n(sw * 0.5), transform: `rotate(${rot} 50 52)` });
      (Math.sin(th) > 0 ? front : orbits).push(dot);
    }
    out += orbits.join('');
    out += el('circle', { cx: 50, cy: 52, r: 13, fill: t.hole, stroke: t.line, 'stroke-width': n(sw) });
    out += el('path', { d: 'M40 45A13 13 0 0 1 57 41', stroke: t.fill, 'stroke-width': n(sw * 0.5) });
    out += front.join('');
    return out;
  });
}

/** HIGH TABLE's hand-drawn arrow (a curve and a chevron head) */
export function arrow(t: Theme, p: Place, color?: string): string {
  return place(p, (sw) =>
    el('path', { d: 'M8 66C27 22 60 18 90 40', stroke: color ?? t.line, 'stroke-width': n(sw) }) +
    el('path', { d: 'M73 28L91 41L71 50', stroke: color ?? t.line, 'stroke-width': n(sw) }),
  );
}

/** a hooked arrow that swings up and to the left (pointing from a note into the middle of a scene) */
export function hook(t: Theme, p: Place, color?: string): string {
  return place(p, (sw) =>
    el('path', { d: 'M92 82C70 86 40 74 20 30', stroke: color ?? t.line, 'stroke-width': n(sw) }) +
    el('path', { d: 'M8 46L19 28L37 38', stroke: color ?? t.line, 'stroke-width': n(sw) }),
  );
}

export function squiggle(t: Theme, p: Place, color?: string): string {
  return place(p, (sw) => el('path', { d: 'M4 50C14 30 24 70 34 50S54 30 64 50 84 70 96 50', stroke: color ?? t.line, 'stroke-width': n(sw) }));
}

/** a paper plane: a signal leaving (closing card) */
export function plane(t: Theme, p: Place): string {
  const c = crit(t);
  const shape = 'M8 52L92 18L66 86L50 60Z';
  const fold = 'M92 18L50 60L46 80L58 66';
  return place(
    p,
    (sw) => el('path', { d: shape, fill: c.paper, stroke: c.line, 'stroke-width': n(sw) }) + el('path', { d: fold, fill: c.fill, stroke: c.line, 'stroke-width': n(sw) }),
    { t, d: [shape, fold] },
  );
}

// ---------------------------------------------------------------------------------------------------
// paper things: torn stickers, pills, handwritten notes

/** a torn paper sticker with condensed caps (HIGH TABLE .sticker) */
export function sticker(
  ts: Typesetter,
  t: Theme,
  o: { x: number; y: number; text: string | string[]; size?: number; rot?: number; fill?: string; ink?: string; seed?: string; cls?: string; pad?: number },
): string {
  const lines = Array.isArray(o.text) ? o.text : [o.text];
  const size = o.size ?? 26;
  const lh = size * 0.95;
  const pad = o.pad ?? size * 0.5;
  const w = Math.max(...lines.map((l) => ts.measure(l.toUpperCase(), 'anton', size, 0.01))) + pad * 2;
  const h = lh * lines.length + pad * 1.1;
  const r = rng(o.seed ?? lines.join());
  // jagged top and bottom edges, gently wavy sides (HIGH TABLE --torn)
  const pts: [number, number][] = [];
  const steps = Math.max(6, Math.round(w / 16));
  for (let i = 0; i <= steps; i++) pts.push([-w / 2 + (w * i) / steps, -h / 2 + (i % 2 ? r.range(2.5, 5) : r.range(0, 1.2))]);
  pts.push([w / 2 - r.range(0, 2), 0]);
  for (let i = steps; i >= 0; i--) pts.push([-w / 2 + (w * i) / steps, h / 2 - (i % 2 ? r.range(2.5, 5) : r.range(0, 1.2))]);
  pts.push([-w / 2 + r.range(0, 2), 0]);
  const ink = o.ink ?? t.stickerInk;
  const text = lines
    .map((l, i) => ts.run(l.toUpperCase(), { font: 'anton', size, x: 0, y: -((lines.length - 1) * lh) / 2 + i * lh + size * 0.43, anchor: 'middle', tracking: 0.01, fill: ink }))
    .join('');
  return g(
    { class: o.cls, transform: `translate(${n(o.x)} ${n(o.y)}) rotate(${n(o.rot ?? -6)})` },
    el('path', { d: P.poly(pts, true), fill: o.fill ?? t.sticker }),
    text,
  );
}

/** a pill chip: rounded, with a label and an optional leading dot */
export function pill(
  ts: Typesetter,
  o: { x: number; y: number; text: string; size?: number; fill: string; ink: string; stroke?: string; font?: FontKey; dot?: string; anchor?: 'start' | 'middle'; cls?: string; h?: number; padX?: number; icon?: (x: number, y: number, s: number) => string; shadow?: string },
): { svg: string; w: number; h: number } {
  const size = o.size ?? 15;
  const font = o.font ?? 'jakarta700';
  const h = o.h ?? size * 2.1;
  const padX = o.padX ?? size * 0.95;
  const lead = o.icon ? size * 1.6 : o.dot ? size * 1.15 : 0;
  const tw = ts.measure(o.text, font, size);
  const w = tw + padX * 2 + lead;
  const x0 = o.anchor === 'middle' ? o.x - w / 2 : o.x;
  const cy = o.y;
  let inner = o.shadow ? el('rect', { x: x0 + 3.5, y: cy - h / 2 + 3.5, width: w, height: h, rx: h / 2, fill: o.shadow }) : '';
  inner += el('rect', { x: x0, y: cy - h / 2, width: w, height: h, rx: h / 2, fill: o.fill, stroke: o.stroke, 'stroke-width': o.stroke ? (o.shadow ? 2.5 : 1.5) : undefined });
  if (o.icon) inner += o.icon(x0 + padX + size * 0.42, cy, size * 0.95);
  else if (o.dot) inner += el('circle', { cx: x0 + padX + size * 0.3, cy, r: size * 0.3, fill: o.dot });
  inner += ts.run(o.text, { font, size, x: x0 + padX + lead, y: cy + size * 0.36, fill: o.ink });
  return { svg: g({ class: o.cls }, inner), w, h };
}

/** a handwritten note (Caveat), slightly rotated, with an optional scribbled underline */
export function note(ts: Typesetter, o: { x: number; y: number; text: string; size?: number; rot?: number; fill: string; anchor?: 'start' | 'middle' | 'end'; underline?: boolean; cls?: string }): string {
  const size = o.size ?? 30;
  const { svg, width, x0 } = ts.runWithWidth(o.text, { font: 'caveat', size, x: 0, y: 0, anchor: o.anchor ?? 'start', fill: o.fill });
  const ul = o.underline ? el('path', { d: `M${n(x0 - 2)} ${n(size * 0.28)}C${n(x0 + width * 0.25)} ${n(size * 0.12)} ${n(x0 + width * 0.6)} ${n(size * 0.4)} ${n(x0 + width + 4)} ${n(size * 0.2)}`, stroke: o.fill, 'stroke-width': n(size * 0.09), 'stroke-linecap': 'round' }) : '';
  return g({ class: o.cls, transform: `translate(${n(o.x)} ${n(o.y)}) rotate(${n(o.rot ?? -4)})` }, svg, ul);
}

/** pixel stars (HIGH TABLE's "night sky in the emoji"): squares and a few plus-shaped twinklers */
export function starfield(
  t: Theme,
  o: {
    w: number;
    h: number;
    x?: number;
    y?: number;
    count: number;
    seed: string;
    avoid?: { cx: number; cy: number; r: number }[];
    /** rectangles to keep clear (text), as [x0, y0, x1, y1] */
    clear?: [number, number, number, number][];
    twinkle?: number;
    color?: string;
    opacity?: number;
  },
): string {
  const r = rng(o.seed);
  const out: string[] = [];
  const tw: string[] = [];
  const color = o.color ?? t.star;
  // small square stars are packed into one path per opacity step (a few elements instead of hundreds)
  const buckets = new Map<string, string>();
  let placed = 0;
  let guard = 0;
  while (placed < o.count && guard++ < o.count * 20) {
    const x = (o.x ?? 0) + r() * o.w;
    const y = (o.y ?? 0) + r() * o.h;
    if (o.avoid?.some((a) => Math.hypot((x - a.cx) / 1, (y - a.cy) / 0.6) < a.r)) continue;
    if (o.clear?.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1)) continue;
    placed++;
    const big = r.chance(0.07);
    const s = big ? 2 : r.pick([1, 1.5, 1.5, 2, 2.5]);
    const op = (o.opacity ?? t.starOpacity) * r.range(0.35, 1);
    if (big) {
      const d = `M${n(x - s / 2)} ${n(y - s * 1.5)}h${n(s)}v${n(s)}h${n(s)}v${n(s)}h${n(-s)}v${n(s)}h${n(-s)}v${n(-s)}h${n(-s)}v${n(-s)}h${n(s)}Z`;
      const item = el('path', { d, fill: color, opacity: n(Math.min(1, op * 1.4), 2) });
      if (tw.length < (o.twinkle ?? 0)) tw.push(g({ class: `tw tw${tw.length % 3}` }, item));
      else out.push(item);
    } else {
      const key = n(Math.round(op * 10) / 10, 1);
      buckets.set(key, (buckets.get(key) ?? '') + `M${n(x, 1)} ${n(y, 1)}h${n(s)}v${n(s)}h${n(-s)}z`);
    }
  }
  for (const [op, d] of buckets) out.push(el('path', { d, fill: color, opacity: op }));
  return out.join('') + tw.join('');
}
