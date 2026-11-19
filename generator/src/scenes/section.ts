/**
 * Section headers (1200 × 150, transparent): they sit straight on GitHub's page colour and act as the README's
 * separators. Index in Anton, title in Archivo Black, a handwritten note in Caveat, and the section's doodle at
 * the end of an orbit line with a small body riding it. Below the fold, so no entrance: only an ambient loop.
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import * as D from '../doodles.ts';
import type { Theme } from '../tokens.ts';

const W = 1200;
const H = 150;

export interface SectionSpec {
  index: string;
  title: string;
  note: string;
  doodle: 'voidling' | 'spiral' | 'orbit' | 'eye' | 'plane' | 'clawd';
}

export function section(t: Theme, s: SectionSpec): string {
  D.resetIds();
  const ts = new Typesetter();
  const dark = t.name === 'dark';
  const text = dark ? '#f4f2ee' : '#141618';
  const accent = dark ? t.accent : t.accentDeep;
  const noteC = dark ? t.accentHi : t.accentDeep;
  const rule = dark ? '#30363d' : '#d0d7de'; // GitHub's own border colours, so the rule matches the page

  const parts: string[] = [];
  const base = 92;
  // the index sits in a neo-brutalist gold block with a hard shadow
  const nw = ts.measure(s.index, 'anton', 62) + 30;
  const bx = 24, byy = 22, bh = 80;
  parts.push(
    g(
      { class: 'tilt' },
      el('rect', { x: bx + 6, y: byy + 6, width: nw, height: bh, rx: 10, fill: dark ? '#9aa3ad' : '#141618' }),
      el('rect', { x: bx, y: byy, width: nw, height: bh, rx: 10, fill: '#d9b25a', stroke: '#141618', 'stroke-width': 3 }),
      ts.run(s.index, { font: 'anton', size: 62, x: bx + nw / 2, y: byy + 66, anchor: 'middle', fill: '#141618' }),
    ),
  );
  const tx = bx + nw + 28;
  const title = ts.runWithWidth(s.title.toUpperCase(), { font: 'archivo', size: 54, x: tx, y: base - 4, tracking: -0.035, fill: text });
  parts.push(title.svg);
  parts.push(D.note(ts, { x: tx + 4, y: base + 38, text: s.note, size: 29, rot: -2.5, fill: noteC }));

  // orbit line from the title to the doodle, with a body riding it
  const ox0 = tx + title.width + 36;
  const dx = 1112;
  const oy = 70;
  const orbitD = `M${n(ox0)} ${oy + 18}C${n(ox0 + (dx - ox0) * 0.35)} ${oy - 34} ${n(ox0 + (dx - ox0) * 0.7)} ${oy + 44} ${n(dx - 64)} ${oy}`;
  parts.push(el('path', { d: orbitD, stroke: text, 'stroke-opacity': dark ? 0.32 : 0.35, 'stroke-width': 1.6, 'stroke-dasharray': '2 8', 'stroke-linecap': 'round' }));
  parts.push(el('path', { class: 'ride', d: orbitD, pathLength: 1000, stroke: accent, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-dasharray': '0 1000', 'stroke-dashoffset': 0 }));
  parts.push(el('circle', { cx: ox0, cy: oy + 18, r: 4, fill: text, opacity: 0.5 }));

  const p = { x: dx, y: 70, size: 112 };
  if (s.doodle === 'spiral') {
    // only the spiral turns; the sparkles stay put and twinkle
    parts.push(g({ class: 'spin' }, D.spiral(t, { ...p, size: 82, sw: 4.2 }, accent)));
    parts.push(g({ class: 'tw' }, D.sparkle(t, { x: dx + 52, y: 34, size: 28, sw: 2.3 })), g({ class: 'tw tw1' }, D.sparkle(t, { x: dx - 54, y: 110, size: 22, sw: 2 })));
  } else {
    const doodle =
      s.doodle === 'voidling'
        ? D.voidling(t, { ...p, size: 128 }, { wave: true, waveCls: 'wave' })
        : s.doodle === 'orbit'
          ? D.orbitGlyph(t, { ...p, size: 150, sw: 4.6 }, { bodies: 3, seed: 'orbits' })
          : s.doodle === 'clawd'
            ? D.clawd(t, { ...p, size: 104, sw: 3.6 }, { waveCls: 'wave', blinkCls: 'blink' })
          : s.doodle === 'eye'
            ? D.eyeball(t, { ...p, size: 116 })
            : D.plane(t, { ...p, size: 96 });
    parts.push(g({ class: 'float' }, doodle));
    if (s.doodle === 'orbit') parts.push(D.cameo(t, dx - 150, 58, 40));
  }

  parts.push(el('path', { d: `M24 ${H - 1.5}H${W - 24}`, stroke: rule, 'stroke-width': 1.5 }));

  const css = [
    D.clawdCss(),
    // a zero-length dash with a round cap is a dot; sliding the offset by the path length carries it along
    `.ride{animation:ride 9s cubic-bezier(.45,0,.55,1) infinite}@keyframes ride{0%{stroke-dashoffset:0}62%,100%{stroke-dashoffset:-1000}}`,
    `.float{animation:fl 6s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-4px)}}`,
    `.spin{transform-box:fill-box;transform-origin:center;animation:sp 24s linear infinite}@keyframes sp{to{transform:rotate(-360deg)}}`,
    `.tilt{transform-box:fill-box;transform-origin:center;animation:tilt 5s ease-in-out infinite}@keyframes tilt{0%,70%,100%{transform:rotate(0)}78%{transform:rotate(-4deg)}86%{transform:rotate(3deg)}}`,
    `.blink{transform-box:fill-box;transform-origin:center;animation:bl 4.5s steps(1) infinite}@keyframes bl{0%,94%{transform:none}95%,98%{transform:scaleY(.15)}}`,
    `.tw{animation:tw 3.6s steps(1) infinite}.tw1{animation-delay:-1.7s}@keyframes tw{50%{opacity:.35}}`,
    `.wave{transform-box:fill-box;transform-origin:100% 100%;animation:wv 3.2s ease-in-out infinite}@keyframes wv{0%,60%,100%{transform:rotate(0)}70%,90%{transform:rotate(-14deg)}80%{transform:rotate(10deg)}}`,
  ].join('');

  return svgDoc({ width: W, height: H, label: `${s.index} ${s.title}: ${s.note}`, style: css, defs: ts.defs(), body: parts.join('') });
}
