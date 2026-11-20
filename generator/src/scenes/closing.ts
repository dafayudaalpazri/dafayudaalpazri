/**
 * Closing card (1200 × 300): quiet and tidy. Clawd (Claude's mascot) waves next to a small black hole, the sign-off
 * sits on one clean left edge, and a paper plane leaves along a dashed trail.
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import * as D from '../doodles.ts';
import { panel, panelClip, panelColors } from '../parts.ts';
import type { Theme } from '../tokens.ts';
import type { Stats } from '../stats.ts';

const W = 1200;
const H = 300;

export function closing(t: Theme, s: Stats): string {
  D.resetIds();
  const ts = new Typesetter();
  const c = panelColors(t);
  const dark = t.name === 'dark';
  const accent = dark ? t.accentHi : t.accentDeep;
  const defs: string[] = [panelClip('p', W, H)];
  const inner: string[] = [];
  inner.push(D.starfield(t, { w: W, h: H, count: dark ? 40 : 24, seed: 'end', clear: [[300, 60, 900, 260]], twinkle: 3, opacity: dark ? 0.4 : 0.22 }));

  // home: a small black hole with one orbit, and Clawd waving beside it
  inner.push(el('ellipse', { cx: 180, cy: 150, rx: 140, ry: 38, transform: 'rotate(-8 180 150)', stroke: c.text, 'stroke-opacity': 0.18, 'stroke-width': 1.3, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }));
  inner.push(g({ class: 'orbit' }, D.orbitGlyph(t, { x: 248, y: 88, size: 92, sw: 3.4 }, { bodies: 2, seed: 'home' })));
  inner.push(g({ class: 'hop' }, D.clawd(t, { x: 140, y: 168, size: 150, sw: 4.5 }, { waveCls: 'wave', blinkCls: 'blink' })));

  // the sign-off, one left edge
  const X = 370;
  inner.push(D.note(ts, { x: X + 2, y: 84, text: 'thanks for falling in', size: 27, rot: -2, fill: accent }));
  inner.push(ts.run('See you beyond', { font: 'archivo', size: 50, x: X, y: 146, tracking: -0.035, fill: c.text }));
  const l2 = ts.runWithWidth('the horizon.', { font: 'archivo', size: 50, x: X, y: 200, tracking: -0.035, fill: c.text });
  inner.push(l2.svg);
  inner.push(el('path', { d: `M${X} 226H${n(X + 520)}`, stroke: c.rule, 'stroke-width': 1.5 }));
  inner.push(ts.run(`@${s.login.toUpperCase()}  ·  ON GITHUB SINCE ${s.since}  ·  WITH CLAUDE`, { font: 'mono500', size: 11, x: X, y: 252, tracking: 0.14, fill: c.faint }));

  // the paper plane leaves
  const trail = `M${n(X + l2.width + 26)} 186C${n(X + l2.width + 110)} 210 ${n(1000)} 200 1040 128`;
  inner.push(el('path', { class: 'trail', d: trail, stroke: c.text, 'stroke-opacity': dark ? 0.35 : 0.4, 'stroke-width': 1.8, 'stroke-dasharray': '3 9', 'stroke-linecap': 'round' }));
  inner.push(g({ class: 'plane' }, D.plane(t, { x: 1068, y: 106, size: 66, rot: -14, sw: 3.2 })));

  inner.push(D.stickyNote(ts, { x: 950, y: 170, w: 120, h: 84, lines: ['see ya!'], rot: 7, pin: true, size: 26, dark }));
  const body = panel(t, W, H, 22, { fill: dark ? '#15171a' : '#f4f3f0' }) + g({ 'clip-path': 'url(#p)' }, ...inner);
  const css = [
    D.clawdCss(),
    `.hop{animation:hop 3.2s ease-in-out infinite}@keyframes hop{0%,70%,100%{transform:translateY(0)}80%{transform:translateY(-6px)}}`,
    `.wave{transform-box:fill-box;transform-origin:0 100%;animation:wv 2.6s ease-in-out infinite}@keyframes wv{0%,50%,100%{transform:rotate(0)}65%,85%{transform:rotate(-24deg)}75%{transform:rotate(-8deg)}}`,
    `.blink{transform-box:fill-box;transform-origin:center;animation:bl 4.5s steps(1) infinite}@keyframes bl{0%,94%{transform:none}95%,98%{transform:scaleY(.15)}}`,
    `.orbit{transform-box:fill-box;transform-origin:center;animation:ob 7s ease-in-out infinite}@keyframes ob{50%{transform:translateY(-4px) rotate(4deg)}}`,
    `.trail{animation:tr 1.6s linear infinite}@keyframes tr{to{stroke-dashoffset:-12}}`,
    `.plane{animation:fy 4.5s ease-in-out infinite}@keyframes fy{50%{transform:translate(6px,-6px)}}`,
    `.tw{animation:tw 3.4s steps(1) infinite}.tw1{animation-delay:-1.1s}.tw2{animation-delay:-2.3s}@keyframes tw{50%{opacity:.15}}`,
  ].join('');
  return svgDoc({ width: W, height: H, label: `Thanks for falling in. See you beyond the horizon. Clawd, Claude's mascot, waves next to a small black hole. @${s.login}, on GitHub since ${s.since}.`, style: css, defs: defs.join('') + ts.defs(), body });
}
