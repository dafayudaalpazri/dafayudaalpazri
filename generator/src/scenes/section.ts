/**
 * Section headers (1200 × 170, transparent): the README's separators. Each one is its own little scene, not a
 * template: a different layout, a different rule, a different Clawd pose and its own paper props and motion.
 *
 *   singularity  title left · Clawd reading a sheet, a pinned sticky note, loose sheets fluttering · ticket rule
 *   accretion    title right · a spiral swallowing paper, Clawd with coffee · zigzag rule
 *   orbits       title left · Clawd rides a paper plane along the orbit to a little black hole · planet rule
 *   telemetry    title on graph paper with a clip · Clawd with a magnifier, live weekday bars · ruler rule
 * Below the fold, so only ambient loops (no entrances).
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import * as D from '../doodles.ts';
import type { Theme } from '../tokens.ts';

const W = 1200;
const H = 170;
const INK = '#141618';
const GOLD = '#d9b25a';

export interface SectionSpec {
  index: string;
  title: string;
  note: string;
  variant: 'singularity' | 'accretion' | 'orbits' | 'telemetry';
  /** words on the section's sticky note */
  sticky?: string[];
  /** small bar values (telemetry) */
  bars?: number[];
}

export function section(t: Theme, s: SectionSpec): string {
  D.resetIds();
  const ts = new Typesetter();
  const dark = t.name === 'dark';
  const text = dark ? '#f4f2ee' : INK;
  const accent = dark ? t.accent : t.accentDeep;
  const noteC = dark ? t.accentHi : t.accentDeep;
  const rule = dark ? '#30363d' : '#d0d7de';
  const parts: string[] = [];
  const css: string[] = [D.clawdCss()];

  /** index block + title + handwritten note; returns the title's outer edge */
  const heading = (x: number, align: 'start' | 'end', ink = text, noteInk = noteC): number => {
    const nw = ts.measure(s.index, 'anton', 62) + 30;
    const tw = ts.measure(s.title.toUpperCase(), 'archivo', 54, -0.035);
    const bx = align === 'start' ? x : x - nw;
    const tx = align === 'start' ? bx + nw + 28 : bx - 28 - tw;
    parts.push(
      g(
        { class: 'tilt' },
        el('rect', { x: bx + 6, y: 32, width: nw, height: 80, rx: 10, fill: dark ? '#9aa3ad' : INK }),
        el('rect', { x: bx, y: 26, width: nw, height: 80, rx: 10, fill: GOLD, stroke: INK, 'stroke-width': 3 }),
        ts.run(s.index, { font: 'anton', size: 62, x: bx + nw / 2, y: 92, anchor: 'middle', fill: INK }),
      ),
    );
    parts.push(ts.run(s.title.toUpperCase(), { font: 'archivo', size: 54, x: tx, y: 88, tracking: -0.035, fill: ink }));
    parts.push(D.note(ts, { x: align === 'start' ? tx + 4 : tx + tw, y: 128, text: s.note, size: 28, rot: -2.5, fill: noteInk, anchor: align }));
    return align === 'start' ? tx + tw : tx;
  };

  if (s.variant === 'singularity') {
    const end = heading(24, 'start');
    parts.push(D.flyer({ x: end + 120, y: 52, size: 26, rot: -14, d: 6.5 }));
    if (s.sticky) parts.push(D.stickyNote(ts, { x: 880, y: 18, w: 128, h: 104, lines: s.sticky, rot: 7, pin: true, size: 21, cls: 'sway', dark }));
    parts.push(D.cameo(t, 1104, 78, 104, { pose: 'read' }));
    // ticket rule: perforation with punched ends
    parts.push(el('path', { d: `M30 ${H - 3}H${W - 30}`, stroke: rule, 'stroke-width': 2, 'stroke-dasharray': '10 6' }), el('circle', { cx: 18, cy: H - 3, r: 6, fill: rule }), el('circle', { cx: W - 18, cy: H - 3, r: 6, fill: rule }));
  } else if (s.variant === 'accretion') {
    heading(W - 24, 'end');
    // a spiral swallowing loose sheets
    parts.push(g({ class: 'spin' }, D.spiral(t, { x: 120, y: 82, size: 96, sw: 4.6 }, accent)));
    parts.push(g({ class: 'swallow' }, D.flyer({ x: 205, y: 46, size: 22, rot: 20, d: 5 }), D.flyer({ x: 40, y: 130, size: 18, rot: -30, d: 6, delay: 1 }), D.flyer({ x: 210, y: 128, size: 16, rot: 50, d: 5.5, delay: 2 })));
    parts.push(D.cameo(t, 300, 84, 92, { pose: 'coffee' }));
    if (s.sticky) parts.push(D.stickyNote(ts, { x: 400, y: 30, w: 120, h: 92, lines: s.sticky, rot: -6, tape: true, size: 20, cls: 'sway', dark }));
    let zz = `M24 ${H - 4}`;
    for (let x = 24; x < W - 24; x += 16) zz += `L${x + 8} ${H - 10}L${x + 16} ${H - 4}`;
    parts.push(el('path', { d: zz, stroke: rule, 'stroke-width': 2, 'stroke-linejoin': 'round' }));
  } else if (s.variant === 'orbits') {
    const end = heading(24, 'start');
    const dx = 1110;
    const ox0 = end + 30;
    const orbitD = `M${n(ox0)} 96C${n(ox0 + (dx - ox0) * 0.35)} 40 ${n(ox0 + (dx - ox0) * 0.7)} 130 ${n(dx - 70)} 80`;
    parts.push(el('path', { d: orbitD, stroke: text, 'stroke-opacity': 0.32, 'stroke-width': 1.6, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }));
    parts.push(g({ class: 'float' }, D.orbitGlyph(t, { x: dx, y: 76, size: 150, sw: 4.6 }, { bodies: 3, seed: 'orbits' })));
    // Clawd rides a paper plane across, again and again
    parts.push(g({ class: 'ride' }, D.plane(t, { x: ox0 + 60, y: 92, size: 70, rot: -8 }), D.cameo(t, ox0 + 50, 54, 46, { pose: 'wave' })));
    if (s.sticky) parts.push(D.stickyNote(ts, { x: 770, y: 92, w: 110, h: 70, lines: s.sticky, rot: 5, tape: true, size: 20, cls: 'sway', dark }));
    let dots = '';
    for (let x = 30; x < W - 30; x += 24) dots += `M${x} ${H - 5}h.1`;
    parts.push(el('path', { d: dots, stroke: rule, 'stroke-width': 4, 'stroke-linecap': 'round' }));
    for (const [x, r] of [[300, 6], [700, 4], [1000, 7]] as const) parts.push(el('circle', { cx: x, cy: H - 5, r, fill: GOLD, stroke: INK, 'stroke-width': 1.5 }));
    css.push(`.ride{animation:ride 9s cubic-bezier(.45,0,.55,1) infinite}@keyframes ride{0%{transform:translate(0,0)}50%{transform:translate(${n(dx - ox0 - 260)}px,-22px)}100%{transform:translate(0,0)}}`);
  } else {
    // graph paper under the heading, clipped on; the heading on it is always ink
    parts.push(D.sheet({ x: 14, y: 12, w: 560, h: 136, rot: -1.2, grid: true, fill: '#f7fbff', clip: true, dark }));
    heading(36, 'start', INK, t.accentDeep);
    const bars = s.bars ?? [1, 2, 3, 2, 1, 2, 3];
    const max = Math.max(1, ...bars);
    bars.forEach((v, i) => {
      const h = 10 + (v / max) * 48;
      parts.push(el('rect', { class: `bar b${i % 4}`, x: 690 + i * 22, y: 126 - h, width: 14, height: h, rx: 3, fill: v === max ? GOLD : text, opacity: v === max ? 1 : 0.55, stroke: v === max ? INK : 'none', 'stroke-width': 1.5 }));
    });
    parts.push(ts.run('BY WEEKDAY', { font: 'mono500', size: 10, x: 690, y: 146, tracking: 0.16, fill: text, opacity: 0.6 }));
    parts.push(g({ class: 'float' }, D.eyeball(t, { x: 1124, y: 74, size: 96 })));
    parts.push(D.cameo(t, 980, 86, 96, { pose: 'magnify' }));
    let ticks = '';
    for (let x = 24, i = 0; x < W - 24; x += 12, i++) ticks += `M${x} ${H - 2}v${i % 5 === 0 ? -12 : -6}`;
    parts.push(el('path', { d: ticks, stroke: rule, 'stroke-width': 1.6 }));
    css.push(`.bar{transform-box:fill-box;transform-origin:50% 100%;animation:bar 1.8s ease-in-out infinite alternate}.b1{animation-delay:-.4s}.b2{animation-delay:-.9s}.b3{animation-delay:-1.3s}@keyframes bar{from{transform:scaleY(.7)}}`);
  }

  css.push(
    `.float{animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-4px)}}`,
    `.spin{transform-box:fill-box;transform-origin:center;animation:sp 18s linear infinite}@keyframes sp{to{transform:rotate(-360deg)}}`,
    `.swallow{transform-origin:120px 82px;animation:sw 10s linear infinite}@keyframes sw{to{transform:rotate(-360deg)}}`,
    `.sway{transform-box:fill-box;transform-origin:50% 0;animation:sway 4.5s ease-in-out infinite}@keyframes sway{50%{transform:rotate(-3deg)}}`,
    `.tilt{transform-box:fill-box;transform-origin:center;animation:tilt 5s ease-in-out infinite}@keyframes tilt{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(-4deg)}86%{transform:rotate(3deg)}}`,
  );

  return svgDoc({ width: W, height: H, label: `${s.index} ${s.title}: ${s.note}`, style: css.join(''), defs: ts.defs(), body: parts.join('') });
}
