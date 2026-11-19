/**
 * "Telemetry": the last 12 months of public activity (1200 × 640). Every number is computed in stats.ts from
 * the contribution calendar and repo data GitHub publishes.
 *
 * Left: the year as a ring orbiting a black hole. One tick per day, clockwise from the top; active days are
 * gold spikes, longer for busier days. A slow scanner sweeps the ring.
 * Right: counters, the weekday spread and the language share (each original repo weighted equally, so one
 * bundled file can't decide it).
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import { blackHole } from '../blackhole.ts';
import * as D from '../doodles.ts';
import { panel, panelClip, panelColors } from '../parts.ts';
import { MONTHS, WEEKDAYS, fmtDate, fmtMonth, type Stats } from '../stats.ts';
import type { Theme } from '../tokens.ts';

const W = 1200;
const H = 640;
const CX = 318;
const CY = 336;
const R0 = 150; // inner radius of the day ring
const R1 = 236; // tallest spike
const GAP = 7; // degrees left open at the top between the oldest and the newest day

export function telemetry(t: Theme, s: Stats): string {
  D.resetIds();
  const ts = new Typesetter();
  const c = panelColors(t);
  const dark = t.name === 'dark';
  const accent = t.accent;
  const accentText = dark ? t.accent : t.accentDeep;
  const defs: string[] = [];
  const css: string[] = [];
  const body: string[] = [panel(t, W, H, 22, { fill: dark ? '#15171a' : '#f4f3f0' })];
  defs.push(panelClip('p', W, H));
  const inner: string[] = [];
  inner.push(D.starfield(t, { w: W, h: H, count: dark ? 70 : 34, seed: 'tele', avoid: [{ cx: CX, cy: CY, r: 260 }], clear: [[620, 40, W - 30, H - 20]], opacity: dark ? 0.35 : 0.2 }));

  // ---- the year ring -------------------------------------------------------------------------------------
  const N = s.days.length;
  const ang = (i: number) => ((-90 + GAP / 2 + ((360 - GAP) * (i + 0.5)) / N) * Math.PI) / 180;
  const max = Math.max(1, ...s.days.map((d) => d.count));
  let quiet = '';
  const spikes: string[] = [];
  s.days.forEach((d, i) => {
    const a = ang(i);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    if (d.count === 0) quiet += `M${n(CX + cos * R0, 1)} ${n(CY + sin * R0, 1)}l${n(cos * 6, 1)} ${n(sin * 6, 1)}`;
    else {
      const len = 16 + (d.count / max) * (R1 - R0 - 16);
      spikes.push(el('path', { d: `M${n(CX + cos * (R0 - 2))} ${n(CY + sin * (R0 - 2))}L${n(CX + cos * (R0 + len))} ${n(CY + sin * (R0 + len))}`, stroke: accent, 'stroke-width': 5, 'stroke-linecap': 'round' }));
      spikes.push(el('circle', { cx: CX + cos * (R0 + len + 9), cy: CY + sin * (R0 + len + 9), r: 3, fill: dark ? t.accentHi : t.accentDeep }));
      spikes.push(el('circle', { class: 'ping', style: `animation-delay:-${n((i % 7) * 0.4, 1)}s`, cx: CX + cos * (R0 + len + 9), cy: CY + sin * (R0 + len + 9), r: 3, stroke: '#ff3b30', 'stroke-width': 2, opacity: 0 }));
    }
  });
  inner.push(el('path', { d: quiet, stroke: c.text, 'stroke-opacity': dark ? 0.34 : 0.4, 'stroke-width': 1.3, 'stroke-linecap': 'round' }));
  // month boundaries and labels (inside the ring)
  let monthTicks = '';
  s.days.forEach((d, i) => {
    if (d.date.slice(8) !== '01') return;
    const a = ang(i);
    monthTicks += `M${n(CX + Math.cos(a) * (R0 - 14), 1)} ${n(CY + Math.sin(a) * (R0 - 14), 1)}L${n(CX + Math.cos(a) * (R0 - 5), 1)} ${n(CY + Math.sin(a) * (R0 - 5), 1)}`;
  });
  inner.push(el('path', { d: monthTicks, stroke: c.text, 'stroke-opacity': 0.5, 'stroke-width': 1.5, 'stroke-linecap': 'round' }));
  // label each month at its middle
  const months = new Map<string, number[]>();
  s.days.forEach((d, i) => months.set(d.date.slice(0, 7), [...(months.get(d.date.slice(0, 7)) ?? []), i]));
  for (const [ym, idx] of months) {
    if (idx.length < 12) continue;
    const a = ang(idx[Math.floor(idx.length / 2)]);
    const lr = R0 - 30;
    const m = MONTHS[Number(ym.slice(5)) - 1].toUpperCase();
    inner.push(ts.run(m, { font: 'mono500', size: 11, x: CX + Math.cos(a) * lr, y: CY + Math.sin(a) * lr + 4, anchor: 'middle', tracking: 0.1, fill: c.faint }));
  }
  // the scanner
  const sweep = `M${CX} ${CY}L${n(CX + Math.cos(-Math.PI / 2) * (R1 + 6))} ${n(CY - R1 - 6)}A${R1 + 6} ${R1 + 6} 0 0 1 ${n(CX + Math.cos((-90 + 16) * (Math.PI / 180)) * (R1 + 6))} ${n(CY + Math.sin((-90 + 16) * (Math.PI / 180)) * (R1 + 6))}Z`;
  defs.push(
    el(
      'linearGradient',
      { id: 'sw', x1: 1, y1: 0, x2: 0, y2: 0.3 },
      el('stop', { offset: 0, 'stop-color': accent, 'stop-opacity': dark ? 0.22 : 0.26 }),
      el('stop', { offset: 1, 'stop-color': accent, 'stop-opacity': 0 }),
    ),
  );
  inner.push(g({ class: 'scan' }, el('path', { d: sweep, fill: 'url(#sw)' }), el('path', { d: `M${CX} ${CY - 70}V${CY - R1 - 6}`, stroke: accent, 'stroke-opacity': 0.55, 'stroke-width': 1.4 })));
  inner.push(...spikes);

  // ends of the year, at the gap
  const a0 = ang(0);
  const a1 = ang(N - 1);
  inner.push(ts.run(fmtMonth(s.windowStart).toUpperCase(), { font: 'mono500', size: 11, x: CX + Math.cos(a0) * (R1 + 22) + 6, y: CY + Math.sin(a0) * (R1 + 22), tracking: 0.12, fill: c.faint }));
  inner.push(ts.run('NOW', { font: 'mono500', size: 11, x: CX + Math.cos(a1) * (R1 + 22) - 6, y: CY + Math.sin(a1) * (R1 + 22), anchor: 'end', tracking: 0.14, fill: accentText }));
  inner.push(el('path', { d: `M${CX} ${CY - R1 - 4}v-14`, stroke: accentText, 'stroke-width': 2, 'stroke-linecap': 'round' }));

  // the black hole in the middle, holding the year's total
  const hole = blackHole({ id: 'th', cx: CX, cy: CY, R: 66, theme: t, disk: false, haloReach: 0.42, haloStreaks: 6, seed: 'tele-hole', period: 10 });
  defs.push(hole.defs);
  css.push(hole.css, D.clawdCss());
  inner.push(hole.back, hole.front);
  const big = ts.runWithWidth(String(s.total), { font: 'anton', size: 56, x: CX, y: CY + 12, anchor: 'middle', fill: '#f4f2ee' });
  inner.push(big.svg);
  inner.push(ts.run('CONTRIBUTIONS', { font: 'mono500', size: 9, x: CX, y: CY + 30, anchor: 'middle', tracking: 0.16, fill: '#c9c5bb' }));

  // notes, HIGH TABLE style
  inner.push(D.cameo(t, 268, 598, 42));
  inner.push(D.note(ts, { x: 30, y: 612, text: 'each tick is one day', size: 26, rot: -3, fill: dark ? t.accentHi : t.accentDeep }));
  inner.push(D.hook(t, { x: 148, y: 560, size: 48, rot: -8, flip: true, sw: 2.6 }, dark ? t.accentHi : t.accentDeep));
  if (s.biggestDay) {
    const bi = s.days.findIndex((d) => d.date === s.biggestDay!.date);
    const a = ang(bi);
    const tip = R0 + 16 + (s.biggestDay.count / max) * (R1 - R0 - 16) + 22;
    const x = CX + Math.cos(a) * tip;
    const y = CY + Math.sin(a) * tip;
    inner.push(D.note(ts, { x: x + 20, y: y - 6, text: 'busiest day', size: 25, rot: -5, fill: dark ? t.accentHi : t.accentDeep }));
  }

  // ---- right column ------------------------------------------------------------------------------------
  const X = 640;
  inner.push(ts.run('SIGNAL LOG', { font: 'mono500', size: 13, x: X, y: 70, tracking: 0.16, fill: accentText }));
  inner.push(ts.run(`${fmtDate(s.windowStart).toUpperCase()} — ${fmtDate(s.windowEnd).toUpperCase()}`, { font: 'mono500', size: 13, x: X + 128, y: 70, tracking: 0.08, fill: c.faint }));
  inner.push(el('path', { d: `M${X} 88H${W - 44}`, stroke: c.rule, 'stroke-width': 1.5 }));

  const counter = (cx: number, top: number, label: string, value: string, sub: string) => {
    inner.push(ts.run(label.toUpperCase(), { font: 'mono500', size: 11, x: cx, y: top, tracking: 0.16, fill: c.faint }));
    inner.push(ts.run(value, { font: 'anton', size: 58, x: cx, y: top + 66, fill: c.text }));
    if (sub) inner.push(ts.run(sub, { font: 'mono500', size: 12.5, x: cx, y: top + 90, fill: c.text2 }));
  };
  const cols = [X, X + 180, X + 360];
  counter(cols[0], 124, 'active days', String(s.activeDays), `of ${s.days.length}`);
  counter(cols[1], 124, 'longest streak', String(s.longestStreak), s.longestStreak === 1 ? 'day' : 'days in a row');
  counter(cols[2], 124, 'biggest day', String(s.biggestDay?.count ?? 0), s.biggestDay ? fmtDate(s.biggestDay.date) : '—');
  counter(cols[0], 246, 'busiest month', s.busiestMonth ? MONTHS[Number(s.busiestMonth.month.slice(5)) - 1].toUpperCase() : '—', s.busiestMonth ? `${s.busiestMonth.month.slice(0, 4)} · ${s.busiestMonth.count}` : '');
  counter(cols[1], 246, 'public repos', String(s.publicRepos), `${s.originals.length} original`);
  counter(cols[2], 246, 'on github since', String(s.since), `${s.years} years`);

  // weekday spread (contributions per weekday): label, then bars with their value above, then day names
  const wy = 384;
  inner.push(ts.run('BY WEEKDAY', { font: 'mono500', size: 11, x: X, y: wy, tracking: 0.16, fill: c.faint }));
  const wmax = Math.max(1, ...s.weekdays);
  const bw = 46;
  const base = wy + 84; // bars stand on this line
  s.weekdays.forEach((v, i) => {
    const x = X + i * (bw + 14);
    const h = v ? 6 + (v / wmax) * 38 : 3;
    const busiest = i === s.busiestWeekday;
    inner.push(el('rect', { x, y: base - h, width: bw, height: h, rx: Math.min(6, h / 2), fill: busiest ? accent : c.text, opacity: busiest ? 1 : v ? (dark ? 0.55 : 0.6) : dark ? 0.22 : 0.25 }));
    inner.push(ts.run(WEEKDAYS[i].toUpperCase(), { font: 'mono500', size: 11, x: x + bw / 2, y: base + 20, anchor: 'middle', tracking: 0.1, fill: busiest ? accentText : c.faint }));
    if (v) inner.push(ts.run(String(v), { font: 'mono500', size: 11.5, x: x + bw / 2, y: base - h - 7, anchor: 'middle', fill: busiest ? accentText : c.text2 }));
  });

  // language share
  const ly = 520;
  inner.push(ts.run('LANGUAGES · BY CODE SIZE, EACH REPO WEIGHTED EQUALLY', { font: 'mono500', size: 11, x: X, y: ly, tracking: 0.12, fill: c.faint }));
  const BW = W - 44 - X;
  const top = s.languages.filter((l) => l.share >= 0.02).slice(0, 3);
  const rest = 1 - top.reduce((a, l) => a + l.share, 0);
  const segs = [...top, ...(rest > 0.0005 ? [{ name: 'Other', share: rest }] : [])];
  const fills = [accent, dark ? t.accentHi : '#f6dc8f', dark ? '#6e6a62' : '#9a978f', dark ? '#3a3d42' : '#c9c6bd'];
  let sx = X;
  defs.push(el('clipPath', { id: 'lb' }, el('rect', { x: X, y: ly + 16, width: BW, height: 16, rx: 8 })));
  const bars: string[] = [];
  segs.forEach((sg, i) => {
    const w = sg.share * BW;
    bars.push(el('rect', { x: sx, y: ly + 16, width: Math.max(2, w - 2), height: 16, fill: fills[i] }));
    sx += w;
  });
  inner.push(g({ 'clip-path': 'url(#lb)' }, ...bars));
  let lx = X;
  segs.forEach((sg, i) => {
    const pct = sg.share < 0.01 ? '<1%' : `${Math.round(sg.share * 100)}%`;
    const name = sg.name === 'Other' ? `${s.languages.filter((l) => l.share < 0.02).map((l) => l.name).join(', ')}` : sg.name;
    inner.push(el('circle', { cx: lx + 6, cy: ly + 55, r: 5.5, fill: fills[i] }));
    const label = `${name} ${pct}`;
    inner.push(ts.run(label, { font: 'mono500', size: 13, x: lx + 18, y: ly + 60, fill: c.text2 }));
    lx += 18 + ts.measure(label, 'mono500', 13) + 26;
  });

  inner.push(ts.run(`PUBLIC GITHUB DATA · UPDATED ${s.updated}`, { font: 'mono500', size: 10.5, x: W - 44, y: H - 30, anchor: 'end', tracking: 0.12, fill: c.faint }));

  body.push(g({ 'clip-path': 'url(#p)' }, ...inner));
  css.push(
    `.scan{transform-origin:${CX}px ${CY}px;animation:scan 14s linear infinite}@keyframes scan{to{transform:rotate(360deg)}}`,
    // each active day sends out a radar ping
    `.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.8s ease-out infinite}@keyframes ping{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(4)}}`,
  );

  const label = `Telemetry, ${fmtDate(s.windowStart)} to ${fmtDate(s.windowEnd)}: ${s.total} contributions on ${s.activeDays} active days. Longest streak ${s.longestStreak} days. Biggest day ${s.biggestDay ? `${s.biggestDay.count} on ${fmtDate(s.biggestDay.date)}` : 'none'}. Busiest month ${s.busiestMonth ? fmtMonth(s.busiestMonth.month) : 'none'}. ${s.publicRepos} public repos, on GitHub since ${s.since}. Languages: ${s.languages.slice(0, 4).map((l) => `${l.name} ${Math.round(l.share * 100)}%`).join(', ')}.`;
  return svgDoc({ width: W, height: H, label, style: css.join(''), defs: defs.join('') + ts.defs(), body: body.join('') });
}
