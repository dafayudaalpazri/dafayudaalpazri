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
import { panel, panelColors, brand } from '../parts.ts';
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
  const body: string[] = [panel(t, W, H)];
  defs.push(el('clipPath', { id: 'p' }, el('rect', { x: 1.5, y: 1.5, width: W - 3, height: H - 3, rx: 27 })));

  const inner: string[] = [];
  inner.push(D.starfield(t, { w: W, h: H, count: dark ? 60 : 34, seed: 'stack', avoid: [{ cx: 190, cy: 210, r: 120 }], clear: [[360, 60, 1120, 345], [780, 345, 1100, 410]], twinkle: 0, opacity: dark ? 0.4 : 0.22 }));

  const HX = 190;
  const HY = 210;
  const hole = blackHole({ id: 'sh', cx: HX, cy: HY, R: 48, theme: t, q: 0.3, rin: 1.55, rout: 2.9, haloReach: 0.4, streaks: 12, haloStreaks: 5, sparks: 10, seed: 'stack-hole', period: 9 });
  defs.push(hole.defs);
  css.push(hole.css);

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
    chips.push(ts.run(lane.label.toUpperCase(), { font: 'mono500', size: 12, x: X0, y: y - 32, tracking: 0.16, fill: c.faint }));
    let x = X0;
    for (const item of lane.items) {
      const p = D.pill(ts, {
        x,
        y,
        text: item.name,
        size: 17,
        h: 42,
        padX: 17,
        fill: c.chip,
        ink: c.text,
        stroke: dark ? c.chipEdge : c.chipEdge,
        dot: item.icon ? undefined : t.accent,
        icon: item.icon ? (ix, iy, sz) => brand(item.icon!, ix + 2, iy, sz * 1.05, dark ? t.accentHi : '#141618') : undefined,
      });
      chips.push(p.svg);
      x += p.w + 12;
    }
  });
  inner.push(g({}, ...lanesSvg));
  inner.push(hole.back, hole.front);
  inner.push(...chips);

  // a handwritten source note, HIGH TABLE style
  inner.push(D.note(ts, { x: 905, y: 388, text: 'read from my public repos', size: 26, rot: -3, fill: dark ? t.accentHi : t.accentDeep }));
  inner.push(D.hook(t, { x: 872, y: 372, size: 40, rot: 20, sw: 2.6 }, dark ? t.accentHi : t.accentDeep));

  body.push(g({ 'clip-path': 'url(#p)' }, ...inner));
  css.push(`.flow{animation:flow 3s linear infinite}@keyframes flow{to{stroke-dashoffset:-12}}`);

  const label = `Accretion: what my public projects are built from. ${L.map((l) => `${l.label}: ${l.items.map((x) => x.name).join(', ')}`).join('. ')}.`;
  return svgDoc({ width: W, height: H, label, style: css.join(''), defs: defs.join('') + ts.defs(), body: body.join('') });
}
