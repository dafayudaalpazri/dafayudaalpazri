/**
 * Closing card (1200 × 300): the Singularity waves goodbye, a paper plane carries the signal out of frame,
 * and an "END OF TRANSMISSION" sticker closes the page the way the original's film slate did.
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import * as D from '../doodles.ts';
import { panel, panelClip, panelColors } from '../parts.ts';
import { themes } from '../tokens.ts';
import type { Theme } from '../tokens.ts';
import type { Stats } from '../stats.ts';

const W = 1200;
const H = 300;

export function closing(theme: Theme, s: Stats): string {
  // a gold card in both themes, so its contents are always drawn in ink (the light style)
  const t = { ...themes.light, fill: '#f6f3ea' }; // the mascot's ring and the plane's fold would vanish in gold on gold
  const pageDark = theme.name === 'dark';
  D.resetIds();
  const ts = new Typesetter();
  const c = panelColors(t);
  const dark = t.name === 'dark';
  const accentText = dark ? t.accent : t.accentDeep;
  const defs: string[] = [panelClip('p', W, H)];
  const inner: string[] = [];
  inner.push(D.starfield(t, { w: W, h: H, count: 36, seed: 'end', avoid: [{ cx: 170, cy: 150, r: 130 }], twinkle: 3, opacity: 0.35 }));

  // orbit rings behind the mascot
  for (const [rx, ry, op] of [[150, 40, 0.2], [190, 56, 0.12]] as const)
    inner.push(el('ellipse', { cx: 172, cy: 162, rx, ry, transform: 'rotate(-10 172 162)', stroke: c.text, 'stroke-opacity': op, 'stroke-width': 1.3, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }));
  inner.push(g({ class: 'float' }, D.voidling(t, { x: 172, y: 148, size: 230 }, { wave: true, waveCls: 'wave', blinkCls: 'blink' })));

  const X = 360;
  inner.push(ts.run('THANKS FOR', { font: 'archivo', size: 54, x: X, y: 118, tracking: -0.035, fill: c.text }));
  const l2 = ts.runWithWidth('FALLING IN.', { font: 'archivo', size: 54, x: X, y: 176, tracking: -0.035, fill: c.text });
  inner.push(l2.svg);
  inner.push(D.note(ts, { x: X + 2, y: 226, text: 'see you beyond the horizon', size: 30, rot: -2.5, fill: dark ? t.accentHi : t.accentDeep }));
  inner.push(ts.run(`@${s.login.toUpperCase()} · ON GITHUB SINCE ${s.since} · ART REDRAWN FROM PUBLIC DATA`, { font: 'mono500', size: 11, x: X, y: 266, tracking: 0.12, fill: c.faint }));

  // the paper plane leaves with a dashed trail
  const trail = `M${n(X + l2.width + 30)} 170C${n(X + l2.width + 120)} 210 ${n(930)} 210 990 120`;
  inner.push(el('path', { class: 'trail', d: trail, stroke: c.text, 'stroke-opacity': dark ? 0.4 : 0.45, 'stroke-width': 2, 'stroke-dasharray': '3 9', 'stroke-linecap': 'round' }));
  inner.push(g({ class: 'fly' }, D.plane(t, { x: 1020, y: 98, size: 74, rot: -14 })));
  inner.push(g({ class: 'stamp' }, D.sticker(ts, t, { x: 1062, y: 214, text: ['End of', 'transmission'], size: 25, rot: 6, fill: '#f4f2ee', seed: 'eot' })));

  const body = panel(theme, W, H, 22, { fill: '#d9b25a', shadow: pageDark ? '#9aa3ad' : '#141618' }) + g({ 'clip-path': 'url(#p)' }, ...inner);
  const css = [
    `.float{animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-5px)}}`,
    `.wave{transform-box:fill-box;transform-origin:100% 100%;animation:wv 3.6s ease-in-out infinite}@keyframes wv{0%,55%,100%{transform:rotate(0)}65%,85%{transform:rotate(-16deg)}75%{transform:rotate(10deg)}}`,
    `.blink{transform-box:fill-box;transform-origin:center;animation:bl 5s steps(1) infinite}@keyframes bl{0%,96%{transform:none}97%,99%{transform:scaleY(.1)}}`,
    `.trail{animation:tr 1.6s linear infinite}@keyframes tr{to{stroke-dashoffset:-12}}`,
    `.fly{animation:fy 4.5s ease-in-out infinite}@keyframes fy{50%{transform:translate(6px,-6px)}}`,
    `.tw{animation:tw 3.4s steps(1) infinite}.tw1{animation-delay:-1.1s}.tw2{animation-delay:-2.3s}@keyframes tw{50%{opacity:.15}}`,
  ].join('');
  return svgDoc({ width: W, height: H, label: `Thanks for falling in. See you beyond the horizon. @${s.login}, on GitHub since ${s.since}.`, style: css, defs: defs.join('') + ts.defs(), body });
}
