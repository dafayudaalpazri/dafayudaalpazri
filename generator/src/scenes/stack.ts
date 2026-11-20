/**
 * "Accretion": what the public projects are built from (1200 × 420).
 * A small black hole on the left pulls three lanes of chips toward it; the dashes on each lane flow inward.
 * Languages come from GitHub's language data; frameworks and tools from profile.config.ts, each tied to the
 * repos it was found in.
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import { blackHole } from '../blackhole.ts';
import * as D from '../doodles.ts';
import { panel, panelClip, panelColors, brand } from '../parts.ts';
import type { Theme } from '../tokens.ts';
import type { Stats } from '../stats.ts';
import type { StackItem } from '../../profile.config.ts';

const W = 1200;
const H = 420;
const LANG_ICON: Record<string, string> = { JavaScript: 'javascript', TypeScript: 'typescript', CSS: 'css', HTML: 'html5' };

export interface Lane {
  label: string;
  items: { name: string; icon: string | null }[];
}

export function lanes(s: Stats, stack: StackItem[]): Lane[] {
  return [
    { label: 'Languages', items: s.languages.filter((l) => l.share >= 0.004).slice(0, 5).map((l) => ({ name: l.name, icon: LANG_ICON[l.name] ?? null })) },
    { label: 'Frameworks', items: stack.filter((x) => x.ring === 'frameworks') },
    { label: 'Libraries & tools', items: stack.filter((x) => x.ring === 'tools') },
  ];
}

export function stackPanel(t: Theme, s: Stats, stack: StackItem[]): string {
  D.resetIds();
  const ts = new Typesetter();
  const c = panelColors(t);
  const dark = t.name === 'dark';
  const defs: string[] = [];
  const css: string[] = [];
  const body: string[] = [panel(t, W, H, 22, { fill: dark ? '#1b1e22' : '#dde0e4', shadow: dark ? '#9aa3ad' : '#141618' })];
  defs.push(panelClip('p', W, H));

  const inner: string[] = [];
  inner.push(D.starfield(t, { w: W, h: H, count: dark ? 60 : 34, seed: 'stack', avoid: [{ cx: 190, cy: 210, r: 120 }], clear: [[360, 60, 1120, 345], [780, 345, 1100, 410]], twinkle: 0, opacity: dark ? 0.4 : 0.22 }));

  const HX = 190;
  const HY = 210;
  const hole = blackHole({ id: 'sh', cx: HX, cy: HY, R: 48, theme: t, q: 0.3, rin: 1.55, rout: 2.9, haloReach: 0.4, streaks: 12, haloStreaks: 5, sparks: 10, seed: 'stack-hole', period: 9 });
  defs.push(hole.defs);
  css.push(hole.css, D.clawdCss());

  const L = lanes(s, stack);
  const rowY = [112, 214, 316];
  const X0 = 380;
  const lanesSvg: string[] = [];
  const chips: string[] = [];
  L.forEach((lane, i) => {
    const y = rowY[i];
    // lane: from the row back into the hole, so the standard dash flow runs inward
    const ex = HX + 48 * 1.6;
    const ey = HY + (y - HY) * 0.18;
    const d = `M${X0 - 18} ${y}C${X0 - 90} ${y} ${n(ex + 70)} ${n(ey + (y - HY) * 0.25)} ${n(ex)} ${n(ey)}`;
    lanesSvg.push(el('path', { d, stroke: c.text, 'stroke-opacity': dark ? 0.16 : 0.18, 'stroke-width': 1.4 }));
    lanesSvg.push(el('path', { class: 'flow', d, pathLength: 100, stroke: t.accent, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 10', style: `animation-duration:${n(2.6 + i * 0.5)}s` }));
    // glowing bodies ride each lane and fall into the hole
    for (let r = 0; r < 2; r++)
      lanesSvg.push(el('path', { class: 'rider', d, pathLength: 100, stroke: dark ? '#fff1cf' : '#141618', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-dasharray': '0 100', style: `animation-delay:-${n(i * 0.9 + r * 1.6, 2)}s` }));
    chips.push(ts.run(lane.label.toUpperCase(), { font: 'mono500', size: 12, x: X0, y: y - 32, tracking: 0.16, fill: c.faint }));
    let x = X0;
    for (const [k, item] of lane.items.entries()) {
      const p = D.pill(ts, {
        x,
        y,
        text: item.name,
        size: 17,
        h: 42,
        padX: 17,
        fill: c.chip,
        ink: c.text,
        stroke: dark ? '#e9e5db' : '#141618',
        shadow: dark ? (k % 3 === 0 ? '#ff3b30' : '#d9b25a') : '#141618',
        dot: item.icon ? undefined : t.accent,
        icon: item.icon ? (ix, iy, sz) => brand(item.icon!, ix + 2, iy, sz * 1.05, dark ? t.accentHi : '#141618') : undefined,
      });
      // the chip nearest the hole leans toward the pull
      const lean = k === 0 ? g({ transform: `rotate(${n((HY - y) / 40)} ${n(x)} ${n(y)})` }, p.svg) : p.svg;
      chips.push(g({ class: 'chip', style: `animation-delay:-${n((i * 1.3 + k * 0.7) % 4.2, 2)}s` }, lean));
      x += p.w + 12;
    }
  });
  inner.push(g({}, ...lanesSvg));
  // gravitational ripples
  for (let i = 0; i < 2; i++) inner.push(el('ellipse', { class: 'ripple', style: `animation-delay:${n(i * 2, 1)}s`, cx: HX, cy: HY, rx: 70, ry: 58, stroke: dark ? '#fff4d8' : '#141618', 'stroke-width': 1.5, opacity: 0 }));
  inner.push(hole.back, hole.front);
  // a chip being stretched into the hole (spaghettified), over and over
  inner.push(
    g(
      { class: 'suck' },
      el('rect', { x: X0 - 6, y: rowY[1] - 15, width: 96, height: 30, rx: 15, fill: c.chip, stroke: dark ? '#e9e5db' : '#141618', 'stroke-width': 2, opacity: 0.85 }),
      ts.run('???', { font: 'mono500', size: 13, x: X0 + 42, y: rowY[1] + 5, anchor: 'middle', fill: c.text }),
    ),
  );
  inner.push(...chips);
  // cameo: Clawd digging in his heels against the pull
  inner.push(g({ transform: 'rotate(10 336 296)' }, D.cameo(t, 336, 300, 40)));
  inner.push(D.stickyNote(ts, { x: 36, y: 318, w: 150, h: 84, lines: ['everything falls', 'in eventually'], rot: -5, tape: true, size: 20, cls: 'sway', dark }));
  inner.push(D.paperclip(560, -8, 4, '#c9ccd1', 1.2));

  // a handwritten source note, HIGH TABLE style
  inner.push(D.note(ts, { x: 905, y: 388, text: 'read from my public repos', size: 26, rot: -3, fill: dark ? t.accentHi : t.accentDeep }));
  inner.push(D.hook(t, { x: 872, y: 372, size: 40, rot: 20, sw: 2.6 }, dark ? t.accentHi : t.accentDeep));

  body.push(g({ 'clip-path': 'url(#p)' }, ...inner));
  css.push(`.flow{animation:flow 3s linear infinite}@keyframes flow{to{stroke-dashoffset:-12}}`, `.sway{transform-box:fill-box;transform-origin:50% 0;animation:sway 4.5s ease-in-out infinite}@keyframes sway{50%{transform:rotate(-3deg)}}`,
    `.chip{animation:chip 4.2s ease-in-out infinite}@keyframes chip{50%{transform:translateY(-3px)}}`,
    `.rider{opacity:0;animation:rider 3.2s cubic-bezier(.5,0,.9,.6) infinite}@keyframes rider{0%{stroke-dashoffset:0;opacity:0}12%{opacity:1}100%{stroke-dashoffset:-100;opacity:.15}}`,
    `.ripple{transform-origin:${HX}px ${HY}px;animation:ripple 4s ease-out infinite}@keyframes ripple{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(2.4,1.8)}}`,
    `.suck{opacity:0;transform-box:fill-box;transform-origin:right center;animation:suck 5s cubic-bezier(.6,0,.9,.5) 1s infinite}@keyframes suck{0%{opacity:0;transform:translate(0,0)}15%{opacity:.8}75%{opacity:.6;transform:translate(-${X0 - HX - 60}px,-2px) scale(2.6,.35)}100%{opacity:0;transform:translate(-${X0 - HX - 20}px,-4px) scale(3.4,.1)}}`);

  const label = `Accretion: what my public projects are built from. ${L.map((l) => `${l.label}: ${l.items.map((x) => x.name).join(', ')}`).join('. ')}.`;
  return svgDoc({ width: W, height: H, label, style: css.join(''), defs: defs.join('') + ts.defs(), body: body.join('') });
}
