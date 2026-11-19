/**
 * Hero: "Event Horizon" title card (1200 × 600), neo-brutalist edition.
 *
 * Keeps the original composition (a camera HUD, autofocus hunting through floating distractions, a lock onto
 * the centred name, a typed tagline) inside a black hole: the name sits in the shadow, the distractions orbit
 * and get pulled in when focus locks. The device is a gold neo-brutalist frame (thick ink outline, hard
 * shadow); the floating cards are flat, outlined and hard-shadowed too.
 *
 * Personal props come from profile.config.ts: the sticky note (quote), the "Now playing" card (song). The
 * elevator LED panel nods to the profile photo.
 *
 * Choreography (seconds). Keyframes only say where things come FROM, so every element rests on its designed
 * final frame (what reduced motion shows, and what stays after the intro).
 *   0.0  window fades in, cards pop in one by one     0.1–1.0 the hole emerges
 *   0.3–2.45 brackets hunt 4 targets, camera shakes, the name glitches in red/cyan
 *   2.45 LOCK: brackets turn gold, photon ring flares, name punches in, status → LOCKED
 *   2.55 distractions recede toward the hole      2.65 sticker slaps on      2.75–3.65 tagline types
 *   loops: disk orbits (Kepler), vinyl spins, equalizer, song progress, bokeh and cards drift, stars twinkle,
 *          LED arrow blinks, terminal caret blinks, tracking dot
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter, metrics } from '../type.ts';
import { blackHole } from '../blackhole.ts';
import * as D from '../doodles.ts';
import { motion, type Theme } from '../tokens.ts';
import type { Stats } from '../stats.ts';

const W = 1200;
const H = 600;
const FW = 1190; // frame; the hard shadow fills the last 10 px
const FH = 590;
const WIN = { x: 14, y: 48, w: 1162, h: 488, r: 14 };
const CX = 595;
const CY = 292;
const R = 156;
const LOCK = 2.45;
const HUNT_START = 0.3;

const INK = '#141618';
const GOLD = '#d9b25a';
const LED = '#ff3b30';
const STEEL = '#9aa3ad';

type Box = { x0: number; y0: number; x1: number; y1: number };
const box = (cx: number, cy: number, hw: number, hh: number): Box => ({ x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh });

export interface HeroExtras {
  song: { title: string; artist: string } | null;
  quote: string | null;
}

/** neo-brutalist card: hard shadow, flat fill, thick outline */
function nb(x: number, y: number, w: number, h: number, fill: string, o: { r?: number; sh?: number; shadow?: string; stroke?: string; sw?: number } = {}): string {
  const r = o.r ?? 12;
  const sh = o.sh ?? 6;
  return (
    el('rect', { x: x + sh, y: y + sh, width: w, height: h, rx: r, fill: o.shadow ?? INK }) +
    el('rect', { x, y, width: w, height: h, rx: r, fill, stroke: o.stroke ?? INK, 'stroke-width': o.sw ?? 3 })
  );
}

function wrap(ts: Typesetter, text: string, font: 'caveat', size: number, width: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ts.measure(next, font, size) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export function hero(t: Theme, s: Stats, extras: HeroExtras): string {
  D.resetIds();
  const ts = new Typesetter();
  const dark = t.name === 'dark';
  const css: string[] = [];
  const kf = (name: string, body: string) => css.push(`@keyframes ${name}{${body}}`);

  const hudText = INK;
  const hudFaint = '#5e4917';
  const hudAccent = LED;
  const night = { bg: '#0b0c0e', lift: '#1b1d22', text: '#f4f2ee', text2: '#c9c5bb' };
  const sky: Theme = dark ? t : { ...t, name: 'dark', bg: night.bg, bgLift: night.lift, text: night.text, text2: night.text2, line: night.text, star: '#fae7ad', starOpacity: 0.55, hole: '#040405', ring: '#fff4d8', diskHot: '#fff1cf', diskMid: '#e6c470', diskCool: '#e0782f', glowOpacity: 0.16, fill: GOLD, hatch: '#f4f2ee' };

  const defs: string[] = [];
  const body: string[] = [];

  // ---- device: gold frame, hard shadow (ink on light pages, steel on dark ones) ----------------------------
  body.push(el('rect', { x: 10, y: 10, width: FW, height: FH, rx: 24, fill: dark ? STEEL : INK }));
  body.push(el('rect', { x: 1.5, y: 1.5, width: FW - 3, height: FH - 3, rx: 23, fill: GOLD, stroke: INK, 'stroke-width': 3 }));
  defs.push(
    el('clipPath', { id: 'win' }, el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: WIN.r })),
    el('radialGradient', { id: 'lift', cx: CX, cy: CY, r: 640, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${CX} ${CY}) scale(1 .62) translate(${-CX} ${-CY})` }, el('stop', { offset: 0, 'stop-color': night.lift }), el('stop', { offset: 1, 'stop-color': night.bg })),
    el('radialGradient', { id: 'vig', cx: CX, cy: CY, r: 760, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${CX} ${CY}) scale(1 .6) translate(${-CX} ${-CY})` }, el('stop', { offset: 0.5, 'stop-color': '#000', 'stop-opacity': 0 }), el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0.6 })),
    el('linearGradient', { id: 'flareL', x1: 0, x2: 1 }, el('stop', { offset: 0, 'stop-color': '#fff4d8', 'stop-opacity': 0 }), el('stop', { offset: 0.5, 'stop-color': '#ffffff' }), el('stop', { offset: 1, 'stop-color': '#fff4d8', 'stop-opacity': 0 })),
  );
  for (const [id, c] of [['bkG', GOLD], ['bkR', LED], ['bkS', '#8fb3d9'], ['bkC', '#f6dc8f']] as const)
    defs.push(el('radialGradient', { id }, el('stop', { offset: 0, 'stop-color': c, 'stop-opacity': 0.1 }), el('stop', { offset: 0.8, 'stop-color': c, 'stop-opacity': 0.16 }), el('stop', { offset: 0.92, 'stop-color': c, 'stop-opacity': 0.26 }), el('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 })));

  const win: string[] = [];
  win.push(el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: 'url(#lift)' }));

  // the camera shakes while it hunts; everything in the window rides on it
  const cam: string[] = [];

  // bokeh: out-of-focus lights drifting behind everything
  const bokeh: [number, number, number, string, number][] = [
    [120, 300, 70, 'bkG', 7.4], [300, 470, 54, 'bkC', 9.2], [470, 110, 46, 'bkC', 8.1], [760, 470, 62, 'bkG', 10.3], [1010, 250, 58, 'bkC', 8.8], [1120, 500, 44, 'bkG', 7.9],
  ];
  cam.push(g({ class: 'fade', style: 'mix-blend-mode:screen' }, ...bokeh.map(([x, y, r, id, d], i) => g({ class: `bob b${3 + (i % 4)}`, style: `animation-duration:${d}s;animation-delay:-${i * 1.3}s` }, el('circle', { cx: x, cy: y, r, fill: `url(#${id})` })))));

  const field: string[] = [];
  field.push(D.starfield(sky, { x: WIN.x, y: WIN.y, w: WIN.w, h: WIN.h, count: 150, seed: 'hero-stars', avoid: [{ cx: CX, cy: CY, r: R * 1.55 }], twinkle: 8 }));
  for (const o of [{ rx: 590, ry: 160, rot: -5, op: 0.1 }, { rx: 660, ry: 215, rot: 4, op: 0.08 }, { rx: 520, ry: 255, rot: -12, op: 0.06 }])
    field.push(el('ellipse', { cx: CX, cy: CY, rx: o.rx, ry: o.ry, transform: `rotate(${o.rot} ${CX} ${CY})`, stroke: sky.text, 'stroke-opacity': o.op, 'stroke-width': 1.2, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' }));
  cam.push(g({ class: 'fade' }, ...field));

  // ---- the black hole --------------------------------------------------------------------------------
  const hole = blackHole({ id: 'bh', cx: CX, cy: CY, R, theme: sky, q: 0.26, rin: 1.5, rout: 3.0, haloReach: 0.38, seed: `hole-${s.login}`, period: 22 });
  defs.push(hole.defs);
  css.push(hole.css, D.clawdCss());
  cam.push(g({ class: 'emerge' }, hole.back), g({ class: 'emerge' }, hole.front));
  cam.push(el('circle', { class: 'flare', cx: CX, cy: CY, r: R * 1.02, stroke: '#ffffff', 'stroke-width': 7, opacity: 0 }));
  cam.push(el('rect', { class: 'streak', x: CX - 470, y: CY - 1.5, width: 940, height: 3, rx: 1.5, fill: 'url(#flareL)', opacity: 0 }));

  // ---- the name: red/cyan ghosts glitch while the camera hunts, the real name punches in at lock --------------
  const NS = 80;
  const cap = metrics('archivo').capHeight * NS;
  const nameRun = ts.runWithWidth(s.name.toUpperCase(), { font: 'archivo', size: NS, x: CX, y: CY + cap / 2, anchor: 'middle', tracking: -0.03 });
  defs.push(nameRun.svg.replace('<g ', '<g id="nm" '));
  cam.push(g({ style: 'mix-blend-mode:screen' }, g({ class: 'cr' }, el('use', { href: '#nm', fill: GOLD, opacity: 0.8 })), g({ class: 'cb' }, el('use', { href: '#nm', fill: '#fff1cf', opacity: 0.55 }))));
  cam.push(g({ class: 'punch' }, el('use', { href: '#nm', fill: night.text })));

  // ---- distractions -------------------------------------------------------------------------------------------
  type Debris = { svg: string; hunt?: Box; pull: [number, number]; bob: [number, number, number]; op?: number; enter: string; delay: number };
  const debris: Debris[] = [];

  // sticky note: the quote
  if (extras.quote) {
    const sx = 32, sy = 66, sw = 206, sh = 156;
    const lines = wrap(ts, extras.quote, 'caveat', 23, sw - 34);
    const lh = 26;
    const top = sy + (sh - 22 - lines.length * lh) / 2 + 22;
    const note =
      nb(sx, sy, sw, sh, '#f6dc8f', { r: 4, shadow: '#8a6a24' }) +
      el('rect', { x: sx + sw / 2 - 30, y: sy - 9, width: 60, height: 20, fill: '#fffef4', opacity: 0.75, transform: `rotate(-4 ${sx + sw / 2} ${sy})` }) +
      lines.map((l, i) => ts.run(l, { font: 'caveat', size: 23, x: sx + 17, y: top + i * lh, fill: INK })).join('') +
      ts.run(`— ${s.name}`, { font: 'caveat', size: 17, x: sx + sw - 16, y: sy + sh - 12, anchor: 'end', fill: '#7a5a10' });
    debris.push({ svg: g({ transform: `rotate(-5 ${sx + sw / 2} ${sy + sh / 2})` }, note), hunt: box(sx + sw / 2, sy + sh / 2, sw / 2 + 14, sh / 2 + 14), pull: [-16, -10], bob: [8.4, 0.4, 3], op: 0.96, enter: 'slapIn', delay: 0.55 });
  }

  // now playing
  if (extras.song) {
    const px = 890, py = 64, pw = 268, ph = 100;
    const vx = px + 50, vy = py + ph / 2;
    let grooves = '';
    for (const r of [16, 20, 24, 28]) grooves += el('circle', { cx: vx, cy: vy, r, stroke: '#3a3d42', 'stroke-width': 1 });
    const vinyl = g(
      { class: 'spin', style: `transform-origin:${vx}px ${vy}px` },
      el('circle', { cx: vx, cy: vy, r: 34, fill: '#08090a', stroke: INK, 'stroke-width': 2 }),
      grooves,
      el('path', { d: `M${vx - 26} ${vy - 14}A30 30 0 0 1 ${vx - 6} ${vy - 29}`, stroke: '#ffffff', 'stroke-opacity': 0.35, 'stroke-width': 3, 'stroke-linecap': 'round' }),
      el('circle', { cx: vx, cy: vy, r: 11, fill: GOLD, stroke: INK, 'stroke-width': 1.5 }),
      el('circle', { cx: vx + 4, cy: vy - 3, r: 2, fill: INK }),
      el('circle', { cx: vx, cy: vy, r: 2.5, fill: '#08090a' }),
    );
    const tx = px + 98;
    let eq = '';
    for (let i = 0; i < 4; i++) eq += el('rect', { class: `eq eq${i}`, x: px + pw - 46 + i * 8, y: py + 14, width: 5, height: 22, rx: 1.5, fill: i % 2 ? GOLD : INK });
    const card =
      nb(px, py, pw, ph, '#f4f2ee', { shadow: '#8a6a24' }) +
      vinyl +
      ts.run('NOW PLAYING', { font: 'mono500', size: 10, x: tx, y: py + 26, tracking: 0.16, fill: '#6b6860' }) +
      ts.run(extras.song.title, { font: 'archivo', size: 26, x: tx, y: py + 56, tracking: -0.02, fill: INK }) +
      ts.run(extras.song.artist, { font: 'jakarta700', size: 13.5, x: tx, y: py + 74, fill: '#3a3a3a' }) +
      g({ class: 'eqs' }, eq) +
      el('rect', { x: tx, y: py + 84, width: pw - 98 - 18, height: 5, rx: 2.5, fill: '#d6d4cd' }) +
      el('rect', { class: 'prog', x: tx, y: py + 84, width: pw - 98 - 18, height: 5, rx: 2.5, fill: INK });
    debris.push({ svg: card, hunt: box(px + pw / 2, py + ph / 2, pw / 2 + 14, ph / 2 + 14), pull: [18, -10], bob: [7.2, 0.8, 3], op: 0.96, enter: 'slide', delay: 0.3 });
    debris.push({ svg: D.note(ts, { x: px + 118, y: py + ph + 40, text: 'on repeat', size: 26, rot: -4, fill: '#f6dc8f' }), pull: [14, -6], bob: [6.6, 0.3, 3], enter: 'fade', delay: 0.9 });
  }

  // terminal: a translucent glass pane, tipped toward the hole; its letters peel off and fall in
  {
    const tx = 40, ty = 444, tw = 250, th = 62;
    const cmd = 'npm run build';
    const cmdX = tx + 34;
    const cmdY = ty + 44;
    const glass =
      el('rect', { x: tx, y: ty, width: tw, height: th, rx: 12, fill: '#ffffff', 'fill-opacity': 0.06, stroke: '#f4f2ee', 'stroke-opacity': 0.45, 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }) +
      el('path', { d: `M${tx + 12} ${ty + 1.5}H${tx + tw - 40}`, stroke: '#ffffff', 'stroke-opacity': 0.35, 'stroke-width': 2, 'stroke-linecap': 'round' }) +
      [0, 1, 2].map((i) => el('circle', { cx: tx + 16 + i * 12, cy: ty + 14, r: 3.4, fill: '#f4f2ee', opacity: 0.35 })).join('') +
      ts.run('$', { font: 'mono500', size: 14, x: tx + 16, y: cmdY, fill: GOLD, opacity: 0.85 }) +
      ts.run(cmd, { font: 'mono500', size: 14, x: cmdX, y: cmdY, fill: '#f4f2ee', opacity: 0.75 }) +
      el('rect', { class: 'cur', x: cmdX + ts.measure(cmd, 'mono500', 14) + 6, y: ty + 32, width: 8, height: 15, fill: '#f4f2ee', opacity: 0.7 });
    // ghost letters stretched toward the disk (spaghettification), looping one after another
    let peel = '';
    const letters = Array.from('build');
    const startX = cmdX + ts.measure('npm run ', 'mono500', 14);
    letters.forEach((ch, i) => {
      const lx = startX + ts.measure('build'.slice(0, i), 'mono500', 14);
      peel += g({ class: 'peel', style: `animation-delay:${n(3.2 + i * 0.55, 2)}s` }, ts.run(ch, { font: 'mono500', size: 14, x: lx, y: cmdY, fill: GOLD }));
    });
    kf('peel', `0%{opacity:0;transform:translate(0,0) scaleX(1)}8%{opacity:.9}70%{opacity:.5;transform:translate(${CX - 230 - startX}px,${CY + 60 - cmdY}px) scaleX(3.2) scaleY(.4)}100%{opacity:0;transform:translate(${CX - 150 - startX}px,${CY + 30 - cmdY}px) scaleX(5) scaleY(.15)}`);
    css.push(`.peel{opacity:0;transform-box:fill-box;transform-origin:left center;animation:peel 2.8s cubic-bezier(.5,0,.9,.6) infinite}`);
    debris.push({ svg: g({ transform: `skewX(-6) translate(${n(ty * 0.105)} 0)` }, glass) + peel, hunt: box(tx + tw / 2, ty + th / 2, tw / 2 + 14, th / 2 + 14), pull: [-18, 12], bob: [6.2, 0.2, 3], op: 0.95, enter: 'fade', delay: 0.75 });
  }

  // notification
  {
    const ping = D.pill(ts, { x: 44, y: 400, text: 'new notification', size: 14.5, fill: '#f4f2ee', ink: INK, dot: GOLD, stroke: INK });
    debris.push({ svg: g({ transform: `rotate(-4 ${n(44 + ping.w / 2)} 400)` }, ping.svg), pull: [-14, 8], bob: [5.8, 0.4, 4], op: 0.88, enter: 'pop', delay: 1.0 });
  }

  // ---- the hole pulls on everything ---------------------------------------------------------------------------
  // tidal streams: faint dashed light running from each card into the disk
  const streams: [number, number, number, number][] = [
    [238, 150, CX - 300, CY - 20],
    [890, 120, CX + 290, CY - 30],
    [290, 470, CX - 260, CY + 70],
    [960, 330, CX + 330, CY + 10],
  ];
  for (const [x0, y0, x1, y1] of streams) {
    const d = `M${x0} ${y0}Q${n((x0 + x1) / 2 + (x1 > x0 ? 40 : -40))} ${n((y0 + y1) / 2 + 60)} ${x1} ${y1}`;
    cam.push(el('path', { class: 'tide', d, pathLength: 100, stroke: GOLD, 'stroke-opacity': 0.4, 'stroke-width': 1.6, 'stroke-dasharray': '1 7', 'stroke-linecap': 'round' }));
  }
  css.push(`.tide{animation:tide 2.4s linear infinite}@keyframes tide{to{stroke-dashoffset:-8}}`);
  // infalling particles: each spirals in on a squashed orbit and fades as it crosses the disk
  const fall: string[] = [];
  for (let i = 0; i < 12; i++) {
    const r0 = 300 + (i % 4) * 50;
    const dur = 5 + (i % 5) * 1.3;
    fall.push(
      g(
        { transform: `translate(${CX} ${CY}) scale(1 .3)` },
        g({ class: 'swirl', style: `animation-duration:${n(dur)}s;animation-delay:-${n(i * 0.83, 2)}s` }, g({ class: 'sink', style: `animation-duration:${n(dur)}s;animation-delay:-${n(i * 0.83, 2)}s` }, el('circle', { cx: r0, cy: 0, r: i % 3 ? 2.2 : 3.2, fill: i % 4 ? '#fff1cf' : GOLD, transform: 'scale(1 3.3)' }))),
      ),
    );
  }
  // particles pass behind the shadow, never across it
  defs.push(el('mask', { id: 'nohole', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, el('rect', { width: W, height: H, fill: '#fff' }), el('circle', { cx: CX, cy: CY, r: R * 1.02, fill: '#000' })));
  cam.push(g({ class: 'fade', mask: 'url(#nohole)' }, ...fall));
  css.push(`.swirl{animation:swirl 6s linear infinite}@keyframes swirl{to{transform:rotate(-720deg)}}`, `.sink{animation:sink 6s cubic-bezier(.55,0,1,.6) infinite}@keyframes sink{0%{transform:translateX(0);opacity:0}10%{opacity:1}85%{opacity:.9}100%{transform:translateX(-240px);opacity:0}}`);
  // gravitational waves: a ripple leaves the horizon every few seconds
  for (let i = 0; i < 2; i++) cam.push(el('ellipse', { class: 'wave', style: `animation-delay:${n(3 + i * 2.5, 1)}s`, cx: CX, cy: CY, rx: R * 1.1, ry: R * 1.1, stroke: '#fff4d8', 'stroke-width': 2, opacity: 0 }));
  css.push(`.wave{transform-origin:${CX}px ${CY}px;animation:gw 5s ease-out infinite}@keyframes gw{0%{opacity:.5;transform:scale(1)}100%{opacity:0;transform:scale(2.6,1.5)}}`);

  // critters and marks
  debris.push({ svg: D.ghost(sky, { x: 922, y: 304, size: 76, rot: -4 }, { stretch: 1 }), hunt: box(918, 302, 58, 42), pull: [30, 4], bob: [6.8, 1.2, 4], enter: 'pop', delay: 0.9 });
  debris.push({ svg: D.tabCritter(sky, { x: 330, y: 104, size: 70, rot: -9 }), pull: [-12, -10], bob: [6.5, 0, 5], enter: 'pop', delay: 1.3 });
  debris.push({ svg: D.note(ts, { x: 935, y: 508, text: 'one more idea…', size: 28, rot: -5, fill: t.accentHi, underline: true }), pull: [14, 16], bob: [7.6, 0.2, 3], enter: 'fade', delay: 1.4 });
  debris.push({ svg: D.hook(sky, { x: 905, y: 466, size: 50, rot: -6, sw: 3 }, t.accentHi), pull: [12, 12], bob: [7.6, 0.2, 3], enter: 'fade', delay: 1.4 });
  // cameo: Clawd riding the notification pill
  debris.push({ svg: D.cameo(sky, 196, 368, 44), pull: [-12, 8], bob: [5.8, 0.4, 4], op: 0.95, enter: 'pop', delay: 1.6 });
  debris.push({ svg: D.crown(sky, { x: 780, y: 92, size: 44, rot: 14, sw: 2.8 }), pull: [10, -12], bob: [8.4, 1.5, 4], enter: 'pop', delay: 1.1 });
  debris.push({ svg: D.sparkle(sky, { x: 452, y: 82, size: 28, sw: 2.2 }), pull: [-10, -10], bob: [5.2, 0.6, 3], enter: 'pop', delay: 1.2 });
  debris.push({ svg: D.sparkle(sky, { x: 1120, y: 250, size: 22, sw: 2 }), pull: [10, 8], bob: [6.1, 0.9, 3], enter: 'pop', delay: 1.25 });
  debris.push({ svg: D.sparkle(sky, { x: 66, y: 300, size: 20, sw: 2 }), pull: [-10, 0], bob: [5.5, 0.3, 3], enter: 'pop', delay: 1.35 });

  debris.forEach((d, i) => {
    kf(`rc${i}`, `from{opacity:1;transform:translate(${n(d.pull[0])}px,${n(d.pull[1])}px)}`);
    css.push(`.rc${i}{animation:rc${i} 1.2s ${motion.easeOut} ${LOCK + 0.1 + i * 0.03}s both}`);
    const [dur, delay, amp] = d.bob;
    cam.push(
      g(
        { class: `rc${i}`, opacity: d.op ?? 0.82 },
        g({ class: `bob b${Math.round(amp)}`, style: `animation-duration:${n(dur)}s;animation-delay:-${n(delay)}s` }, g({ class: d.enter, style: `animation-delay:${n(d.delay)}s` }, d.svg)),
      ),
    );
  });

  // LOCKED IN sticker, slapped on next to the name at lock
  cam.push(g({ class: 'slap' }, D.sticker(ts, sky, { x: 836, y: 206, text: 'Locked in', size: 25, rot: 7, fill: GOLD, seed: 'locked' })));

  // ---- autofocus brackets ----------------------------------------------------------------------------------
  const hw = nameRun.width / 2 + 14;
  const hh = cap / 2 + 15;
  const F = box(CX, CY, hw, hh);
  const targets = debris.filter((d) => d.hunt).map((d) => d.hunt!);
  while (targets.length < 4) targets.push(box(CX + (targets.length % 2 ? 300 : -300), CY - 150, 60, 40));
  const ARM = 30;
  const corners: { name: string; at: (b: Box) => [number, number]; d: (x: number, y: number) => string }[] = [
    { name: 'tl', at: (b) => [b.x0, b.y0], d: (x, y) => `M${n(x)} ${n(y + ARM)}V${n(y)}H${n(x + ARM)}` },
    { name: 'tr', at: (b) => [b.x1, b.y0], d: (x, y) => `M${n(x - ARM)} ${n(y)}H${n(x)}V${n(y + ARM)}` },
    { name: 'br', at: (b) => [b.x1, b.y1], d: (x, y) => `M${n(x)} ${n(y - ARM)}V${n(y)}H${n(x - ARM)}` },
    { name: 'bl', at: (b) => [b.x0, b.y1], d: (x, y) => `M${n(x + ARM)} ${n(y)}H${n(x)}V${n(y - ARM)}` },
  ];
  const stops = [[0, 0], [14, 0], [22, 1], [36, 1], [44, 2], [58, 2], [66, 3], [82, 3]];
  const brackets: string[] = [];
  corners.forEach((c, ci) => {
    const [fx, fy] = c.at(F);
    let k = '';
    for (const [pct, ti] of stops) {
      const [tx, ty] = c.at(targets[ti]);
      k += `${pct}%{transform:translate(${n(tx - fx)}px,${n(ty - fy)}px)${pct === 0 ? ';opacity:0' : ''}}`;
    }
    const sx = c.name.includes('l') ? -1 : 1;
    const sy = c.name.includes('t') ? -1 : 1;
    k += `4%{opacity:1}94%{transform:translate(${n(-sx * 3)}px,${n(-sy * 3)}px)}`;
    kf(`k${ci}`, k);
    brackets.push(el('path', { class: `k${ci}`, d: c.d(fx, fy), stroke: GOLD, 'stroke-width': 4, 'stroke-linecap': 'square' }));
  });
  cam.push(g({}, ...brackets));

  // ---- tagline, typed under the disk -----------------------------------------------------------------------
  const tag = `${s.tagline}`.trim();
  const tagRun = ts.runWithWidth(tag, { font: 'mono500', size: 19, x: CX, y: 500, anchor: 'middle', fill: night.text2 });
  defs.push(el('clipPath', { id: 'typed' }, el('rect', { class: 'type', x: tagRun.x0 - 2, y: 478, width: tagRun.width + 4, height: 34 })));
  cam.push(g({ 'clip-path': 'url(#typed)' }, tagRun.svg));
  cam.push(el('rect', { class: 'caret', x: tagRun.x0 + tagRun.width + 6, y: 484, width: 10, height: 20, fill: GOLD }));
  css.push(`.type{transform-box:fill-box;transform-origin:left center;animation:type .9s steps(${Math.max(1, tag.length)}) ${LOCK + 0.3}s both}`);
  css.push(`.caret{animation:hide ${LOCK + 1.2}s step-end both,blink 1s steps(1) ${LOCK + 1.2}s 4}`);

  win.push(g({ class: 'shake' }, ...cam));
  win.push(el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: 'url(#vig)' }));
  body.push(g({ 'clip-path': 'url(#win)' }, ...win));
  body.push(el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: WIN.r, stroke: INK, 'stroke-width': 3 }));

  // ---- HUD on the gold frame -----------------------------------------------------------------------------------
  const label = (x: number, y: number, text: string, anchor: 'start' | 'end' = 'start') => ts.run(text.toUpperCase(), { font: 'mono500', size: 9.5, x, y, anchor, tracking: 0.16, fill: hudFaint });
  const value = (x: number, y: number, text: string, anchor: 'start' | 'end' = 'start', fill = hudText) => ts.run(text, { font: 'mono500', size: 12.5, x, y, anchor, tracking: 0.04, fill });
  const sep = (x: number, y: number) => el('path', { d: `M${n(x)} ${y - 10}V${y + 10}`, stroke: INK, 'stroke-opacity': 0.35, 'stroke-width': 1.5 });
  const hud: string[] = [];
  hud.push(el('circle', { class: 'rec', cx: 32, cy: 24, r: 5.5, fill: hudAccent, stroke: INK, 'stroke-width': 1.5 }));
  hud.push(ts.run('TRACKING', { font: 'mono500', size: 11.5, x: 46, y: 28.5, tracking: 0.14, fill: INK }));
  let x = 164;
  for (const [l, v] of [['target', `@${s.login}`], ['mode', 'AUTOFOCUS'], ['lens', 'GRAVITATIONAL']] as const) {
    hud.push(sep(x - 18, 24), label(x, 19, l), value(x, 36, v));
    x += Math.max(ts.measure(v, 'mono500', 12.5, 0.04), ts.measure(l.toUpperCase(), 'mono500', 9.5, 0.16)) + 40;
  }
  hud.push(label(1172, 19, 'data', 'end'), value(1172, 36, s.updated, 'end'), sep(1064, 24), label(1046, 19, 'since', 'end'), value(1046, 36, `${s.since}`, 'end'));

  const by = 562;
  hud.push(label(30, by - 4, 'focus'), value(30, by + 13, 'AF-C'));
  const sx0 = 108;
  const sx1 = 368;
  let ticks = '';
  for (let i = 0; i <= 26; i++) ticks += `M${n(sx0 + ((sx1 - sx0) * i) / 26)} ${i % 13 === 0 ? by - 8 : by - 3}V${by + 3}`;
  hud.push(el('path', { d: ticks, stroke: INK, 'stroke-opacity': 0.55, 'stroke-width': 1.2 }));
  hud.push(ts.run('NOISE', { font: 'mono500', size: 8.5, x: sx0, y: by + 16, tracking: 0.16, fill: hudFaint }));
  hud.push(ts.run('SIGNAL', { font: 'mono500', size: 8.5, x: sx1, y: by + 16, anchor: 'end', tracking: 0.16, fill: hudFaint }));
  hud.push(el('path', { class: 'needle', d: `M${sx1} ${by - 4}l-6 -10h12Z`, fill: hudAccent, stroke: INK, 'stroke-width': 1.2 }));
  kf('needle', [0, 0.18, 0.06, 0.42, 0.3, 0.63, 0.52, 0.86, 0.79].map((u, i, a) => `${n((i / (a.length - 1)) * 92)}%{transform:translateX(${n((u - 1) * (sx1 - sx0))}px)}`).join(''));

  hud.push(sep(408, by + 2), label(428, by - 4, 'status'));
  hud.push(g({ class: 'searching' }, el('circle', { cx: 433, cy: by + 9, r: 3.5, fill: hudFaint }), value(442, by + 13, 'SEARCHING', 'start', hudFaint)));
  hud.push(g({ class: 'locked' }, el('circle', { cx: 433, cy: by + 9, r: 3.5, fill: hudAccent }), value(442, by + 13, 'LOCKED', 'start', INK)));

  const counters: [string, string][] = [['repos', String(s.publicRepos).padStart(2, '0')], ['contrib · 12 mo', String(s.total)], ['active days', String(s.activeDays)], ['best run', `${s.longestStreak} D`]];
  let cx = 1172;
  for (let i = counters.length - 1; i >= 0; i--) {
    const [l, v] = counters[i];
    hud.push(label(cx, by - 4, l, 'end'), value(cx, by + 13, v, 'end'));
    cx -= Math.max(ts.measure(l.toUpperCase(), 'mono500', 9.5, 0.16), ts.measure(v, 'mono500', 12.5, 0.04)) + 34;
    if (i) hud.push(sep(cx + 17, by + 2));
  }
  body.push(g({}, ...hud));

  // ---- motion ------------------------------------------------------------------------------------------------------
  css.push(
    `.fade{animation:fade .8s ${motion.easeOut} both}`,
    `.pop{transform-box:fill-box;transform-origin:center;animation:pop .5s ${motion.easeSlap} both}`,
    `.slide{animation:slide .7s ${motion.easeOut} both}`,
    `.slapIn{transform-box:fill-box;transform-origin:center;animation:slapIn .55s ease-out both}`,
    `.emerge{transform-origin:${CX}px ${CY}px;animation:emerge 1.1s ${motion.easeOut} .1s both}`,
    `.shake{transform-origin:${CX}px ${CY}px;animation:shake ${LOCK}s ease-in-out both}`,
    `.cr{animation:jitA ${LOCK - 0.3}s cubic-bezier(.6,0,.2,1) .3s both}.cb{animation:jitB ${LOCK - 0.3}s cubic-bezier(.6,0,.2,1) .3s both}`,
    ...[0, 1, 2, 3].map((i) => `.k${i}{animation:k${i} ${LOCK - HUNT_START}s cubic-bezier(.6,0,.2,1) ${HUNT_START}s both,lockc ${LOCK}s step-end both}`),
    `.flare{transform-box:fill-box;transform-origin:center;animation:flare 1.3s ${motion.easeOut} ${LOCK}s both}`,
    `.streak{transform-box:fill-box;transform-origin:center;animation:streak 1.1s ${motion.easeOut} ${LOCK}s both}`,
    `.punch{transform-box:fill-box;transform-origin:center;animation:punch .65s ${motion.easeOut} ${LOCK - 0.02}s both}`,
    `.slap{transform-box:fill-box;transform-origin:center;animation:slap .5s ${motion.easeSlap} ${LOCK + 0.2}s both}`,
    `.needle{animation:needle ${LOCK - HUNT_START}s cubic-bezier(.6,0,.2,1) ${HUNT_START}s both}`,
    `.searching{opacity:0;animation:show ${LOCK}s step-end both}`,
    `.locked{animation:hide ${LOCK}s step-end both}`,
    `.rec,.ledup{animation:blink 1.2s steps(1) infinite}.cur{animation:blink 1s steps(1) infinite}`,
    `.spin{animation:spin 2.4s linear infinite}`,
    `.eq{transform-box:fill-box;transform-origin:50% 100%;animation:eq .9s ease-in-out infinite alternate}.eq1{animation-duration:.7s;animation-delay:-.3s}.eq2{animation-duration:1.1s;animation-delay:-.5s}.eq3{animation-duration:.8s;animation-delay:-.2s}`,
    `.prog{transform-box:fill-box;transform-origin:0 50%;animation:prog 26s linear infinite}`,
    `.bob{animation:b4 6s ease-in-out infinite}.b3{animation-name:b3}.b5{animation-name:b5}.b6{animation-name:b6}`,
    `.tw{animation:tw 3.4s steps(1) infinite}.tw1{animation-delay:-1.1s;animation-duration:4.1s}.tw2{animation-delay:-2.3s;animation-duration:2.9s}`,
  );
  kf('fade', 'from{opacity:0}');
  kf('pop', 'from{opacity:0;transform:scale(.6)}');
  kf('slide', 'from{opacity:0;transform:translateX(60px)}');
  kf('slapIn', '0%{opacity:0;transform:scale(1.6) rotate(-10deg)}55%{opacity:1;transform:scale(.95) rotate(1deg)}');
  kf('emerge', 'from{opacity:0;transform:scale(.9)}');
  kf('shake', '0%{transform:translate(1px,-3px) rotate(-.05deg)}8%{transform:translate(-4px,2px) rotate(-.03deg)}16%{transform:translate(1px,-2px) rotate(.2deg)}24%{transform:translate(1px,1px) rotate(.2deg)}32%{transform:translate(-3px,0) rotate(-.18deg)}40%{transform:translate(-3px,1px) rotate(.1deg)}50%{transform:translate(1px,-2px)}60%{transform:translate(-2px,-1px)}72%{transform:translate(0,-1px)}84%{transform:translate(-1px,0)}92%{transform:translate(0,1px)}');
  kf('jitA', '0%{transform:translate(-40px,0);opacity:0}6%{opacity:.9}10%{transform:translate(-52px,-4px)}21%{transform:translate(-40px,3px)}33%{transform:translate(-38px,-4px)}44%{transform:translate(-30px,-2px)}56%{transform:translate(-24px,1px)}67%{transform:translate(-17px,-3px)}79%{transform:translate(-15px,-1px)}90%{transform:translate(-7px,-2px)}');
  kf('jitB', '0%{transform:translate(30px,0);opacity:0}6%{opacity:.9}10%{transform:translate(33px,0)}21%{transform:translate(42px,-3px)}33%{transform:translate(22px,-1px)}44%{transform:translate(18px,0)}56%{transform:translate(16px,-2px)}67%{transform:translate(18px,-1px)}79%{transform:translate(8px,2px)}90%{transform:translate(7px,-1px)}');
  kf('lockc', `from{stroke:${night.text}}`);
  kf('flare', '0%{opacity:0;transform:scale(1)}14%{opacity:.95}100%{opacity:0;transform:scale(1.06)}');
  kf('streak', '0%{opacity:0;transform:scaleX(.1)}20%{opacity:1;transform:scaleX(1.02)}100%{opacity:0;transform:scaleX(1.1)}');
  kf('punch', 'from{opacity:0;transform:scale(1.08)}');
  kf('slap', 'from{opacity:0;transform:scale(1.8) rotate(-8deg)}');
  kf('type', 'from{transform:scaleX(0)}');
  kf('show', 'from{opacity:1}');
  kf('hide', 'from{opacity:0}');
  kf('blink', '50%{opacity:0}');
  kf('spin', 'to{transform:rotate(360deg)}');
  kf('eq', 'from{transform:scaleY(.25)}');
  kf('prog', 'from{transform:scaleX(0)}');
  for (const a of [3, 4, 5, 6]) kf(`b${a}`, `50%{transform:translate(${n(a * 0.8)}px,${-a}px)}`);
  kf('tw', '50%{opacity:.15}');

  const extra = [extras.quote ? `a sticky note reads "${extras.quote}"` : '', extras.song ? `a "Now playing" card spins ${extras.song.title} by ${extras.song.artist}` : ''].filter(Boolean).join('; ');
  const label_ = `${s.name} (@${s.login}): ${tag}. Title card: an autofocus HUD hunts through floating cards (${extra}; a terminal, a notification, an elevator floor display), then locks onto the name inside a black hole's shadow. Data as of ${s.updated}: ${s.publicRepos} public repos, ${s.total} contributions in the last 12 months.`;
  return svgDoc({ width: W, height: H, label: label_, style: css.join(''), defs: defs.join('') + ts.defs(), body: body.join('') });
}
