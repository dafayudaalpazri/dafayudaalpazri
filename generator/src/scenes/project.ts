/**
 * "Orbits": one card per featured public repo (1200 × 200). Full width so the type stays readable on phones.
 * The glyph on the left is generated from the repo itself: one orbiting body per language it uses, seeded by
 * its name, so every card's little system is different and stable between builds.
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import * as D from '../doodles.ts';
import { rng } from '../rng.ts';
import { panel, panelColors, icon } from '../parts.ts';
import { fmtMonth } from '../stats.ts';
import type { Theme } from '../tokens.ts';
import type { Repo } from '../data.ts';

const W = 1200;
const H = 200;

function orbitSystem(t: Theme, cx: number, cy: number, repo: Repo): { svg: string; css: string } {
  const r = rng(repo.name);
  const dark = t.name === 'dark';
  const c = panelColors(t);
  const langs = Math.max(1, Math.min(4, Object.keys(repo.languages).length));
  const back: string[] = [];
  const front: string[] = [];
  let css = '';
  for (let i = 0; i < langs; i++) {
    const rx = 50 + i * 14;
    const ry = 16 + i * 5;
    const rot = r.range(-24, 10);
    back.push(el('ellipse', { cx, cy, rx, ry, transform: `rotate(${n(rot)} ${cx} ${cy})`, stroke: c.text, 'stroke-opacity': dark ? 0.28 : 0.3, 'stroke-width': 1.3, 'stroke-dasharray': '1.5 6', 'stroke-linecap': 'round' }));
    // the body rides its ellipse: rotate in a squashed frame, counter-rotate so the dot stays round
    const k = ry / rx;
    const dur = n(9 + i * 5 + r.range(0, 3), 1);
    const phase = n(-r.range(0, 20), 1);
    const cls = `o${i}`;
    css += `.${cls}{animation:rot ${dur}s linear ${phase}s infinite}.${cls}c{animation:crot ${dur}s linear ${phase}s infinite}`;
    const size = i === 0 ? 5.5 : 4;
    front.push(
      g(
        { transform: `translate(${cx} ${cy}) rotate(${n(rot)}) scale(1 ${n(k, 4)})` },
        g({ class: cls }, g({ transform: `translate(${rx} 0)` }, g({ class: `${cls}c` }, el('circle', { r: size, fill: i === 0 ? t.accent : c.text, transform: `scale(1 ${n(1 / k, 4)})` })))),
      ),
    );
  }
  const hole =
    el('circle', { cx, cy, r: 23, fill: t.accent, opacity: 0.18 }) +
    el('circle', { cx, cy, r: 17, fill: "#040405", stroke: t.accent, "stroke-width": 2.8 }) +
    el('path', { d: `M${cx - 10} ${cy - 7}A12 12 0 0 1 ${cx + 6} ${cy - 11}`, stroke: dark ? t.accentHi : t.accentHi, 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0.8 });
  return { svg: back.join('') + hole + front.join(''), css };
}

export function projectCard(t: Theme, repo: Repo, index: number, blurb: string | null): string {
  D.resetIds();
  const ts = new Typesetter();
  const c = panelColors(t);
  const dark = t.name === 'dark';
  const css: string[] = [];
  const LIGHT = ['#ffffff', '#f6dc8f', '#dde0e4', '#ecebe7'];
  const SHADOWS = ['#d9b25a', '#ff3b30', '#9aa3ad', '#f6dc8f'];
  const body: string[] = [panel(t, W, H, 20, dark ? { fill: '#1b1e22', shadow: SHADOWS[index % 4] } : { fill: LIGHT[index % 4] })];

  const sys = orbitSystem(t, 110, 100, repo);
  body.push(sys.svg);
  css.push(D.clawdCss());
  const k = index % 4;
  if (k === 0) body.push(D.paperclip(30, -10, -10, '#c9ccd1', 1.3), D.cameo(t, 1126, 160, 44, { pose: 'laptop' }));
  if (k === 1) body.push(D.stickyNote(ts, { x: 1036, y: 128, w: 112, h: 56, lines: [repo.language ? `${repo.language}!` : 'hello!'], rot: -4, size: 20, dark }));
  if (k === 2) body.push(D.pushpin(W / 2 + 140, 14, '#d9b25a'), D.cameo(t, 1130, 160, 40, { pose: 'coffee' }));
  if (k === 3) body.push(D.cameo(t, 1126, 160, 40, { pose: 'sleep' }));
  css.push(sys.css, `@keyframes rot{to{transform:rotate(360deg)}}@keyframes crot{to{transform:rotate(-360deg)}}`);

  const X = 214;
  body.push(ts.run(`ORBIT ${String(index + 1).padStart(2, '0')}`, { font: 'mono500', size: 12.5, x: X, y: 52, tracking: 0.18, fill: dark ? t.accent : t.accentDeep }));
  const name = ts.runWithWidth(repo.name, { font: 'archivo', size: 44, x: X, y: 98, tracking: -0.025, fill: c.text });
  body.push(name.svg);
  if (blurb) body.push(ts.run(blurb, { font: 'jakarta500', size: 23, x: X, y: 135, fill: c.text2 }));

  // meta row: language · last push · homepage
  let mx = X;
  const my = 168;
  const meta = (glyph: string, text: string) => {
    body.push(glyph);
    const w = ts.measure(text, 'mono500', 14.5, 0.02);
    body.push(ts.run(text, { font: 'mono500', size: 14.5, x: mx + 22, y: my + 5, tracking: 0.02, fill: c.faint }));
    mx += 22 + w + 26;
  };
  if (repo.language) meta(el('circle', { cx: mx + 7, cy: my, r: 6, fill: t.accent, stroke: c.text, 'stroke-opacity': 0.25 }), repo.language);
  meta(icon('clock', mx + 7, my, 16, c.faint, 2), `updated ${fmtMonth(repo.pushedAt)}`);
  if (repo.homepage) meta(icon('link', mx + 7, my, 16, c.faint, 2), repo.homepage.replace(/^https?:\/\//, '').replace(/\/$/, ''));
  if (repo.stars > 0) meta(el('path', { d: `M${mx + 7} ${my - 7}l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z`, fill: c.faint }), `${repo.stars}`);

  // right: the repo button, and a LIVE sticker when the repo has a homepage
  const bfill = dark ? t.accent : '#141618';
  const bink = dark ? '#141618' : '#f4f2ee';
  const tw = ts.measure('View repo', 'jakarta800', 16);
  const bw = 22 + tw + 12 + 18 + 20;
  const bx = W - 44 - bw;
  body.push(
    el('rect', { x: bx, y: 78, width: bw, height: 44, rx: 22, fill: bfill }),
    ts.run('View repo', { font: 'jakarta800', size: 16, x: bx + 22, y: 105.8, fill: bink }),
    icon('arrow', bx + 22 + tw + 12 + 9, 100, 18, bink, 2.6),
  );
  if (repo.homepage) {
    body.push(g({ class: 'live' }, D.sticker(ts, t, { x: bx - 58, y: 70, text: 'Live', size: 22, rot: -8, fill: index % 4 === 1 && !dark ? '#ffffff' : t.accentHi, seed: repo.name })));
    css.push(`.live{transform-box:fill-box;transform-origin:center;animation:live 3.2s ease-in-out infinite}@keyframes live{0%,80%,100%{transform:rotate(0)}86%{transform:rotate(-6deg) scale(1.06)}93%{transform:rotate(4deg)}}`);
  }

  const label = `${repo.name}${blurb ? `: ${blurb}` : ''} ${repo.language ? `Language: ${repo.language}.` : ''} Updated ${fmtMonth(repo.pushedAt)}.${repo.homepage ? ` Live at ${repo.homepage}.` : ''}`;
  return svgDoc({ width: W, height: H, label, style: css.join(''), defs: ts.defs(), body: body.join('') });
}
