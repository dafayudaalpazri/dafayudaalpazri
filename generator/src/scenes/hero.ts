/**
 * Hero: "Event Horizon" title card (1200 × 600).
 *
 * Keeps the original composition (a camera HUD, autofocus hunting through floating distractions, a lock onto
 * the centred name, a typed tagline) and moves it into the black hole: the name sits in the shadow, the
 * distractions orbit and get pulled in when focus locks, and a "LOCKED IN" sticker slaps on, the way
 * HIGH TABLE stamps "PAID!".
 *
 * Choreography (seconds). Every keyframe states only where things come FROM, so the resting state of every
 * element is the designed final frame: that is what reduced motion shows, and what is left after the intro.
 *   0.0  window fades in            0.1–1.0  the hole emerges          0.3–2.3  brackets hunt 4 targets
 *   2.45 LOCK: brackets turn gold, photon ring flares, name punches in, status → LOCKED, needle → SIGNAL
 *   2.55 distractions recede toward the hole      2.65 sticker slaps on      2.75–3.65 tagline types
 *   loops: disk orbits (Kepler), star twinkle, tracking dot, distractions bob
 */
import { n, el, g, svgDoc } from '../svg.ts';
import { Typesetter, metrics } from '../type.ts';
import { blackHole } from '../blackhole.ts';
import * as D from '../doodles.ts';
import { motion, type Theme } from '../tokens.ts';
import type { Stats } from '../stats.ts';

const W = 1200;
const H = 600;
const WIN = { x: 12, y: 50, w: 1176, h: 500, r: 20 };
const CX = 600;
const CY = 300;
const R = 168;
const LOCK = 2.45;
const HUNT_START = 0.3;

type Box = { x0: number; y0: number; x1: number; y1: number };
const box = (cx: number, cy: number, hw: number, hh: number): Box => ({ x0: cx - hw, y0: cy - hh, x1: cx + hw, y1: cy + hh });

export function hero(t: Theme, s: Stats): string {
  D.resetIds();
  const ts = new Typesetter();
  const dark = t.name === 'dark';
  const css: string[] = [];
  const kf = (name: string, body: string) => css.push(`@keyframes ${name}{${body}}`);

  // palette for this card: the window is a night sky in both themes; the device around it follows the page
  const frameBg = dark ? '#111214' : t.bg;
  const hudText = dark ? t.text : t.text;
  const hudFaint = dark ? '#77736a' : '#8d8a81';
  const hudAccent = dark ? t.accent : t.accentDeep;
  const night = { bg: '#0b0c0e', lift: '#191b1f', text: '#f4f2ee', text2: '#b9b5ab' };
  const sky: Theme = dark ? t : { ...t, name: 'dark', bg: night.bg, bgLift: night.lift, text: night.text, text2: night.text2, line: night.text, star: '#fae7ad', starOpacity: 0.55, hole: '#040405', ring: '#fff4d8', diskHot: '#fff1cf', diskMid: '#e6c470', diskCool: '#e0782f', glowOpacity: 0.16, fill: '#d9b25a', hatch: '#f4f2ee' };

  const defs: string[] = [];
  const body: string[] = [];

  // ---- device frame + night window -------------------------------------------------------------
  body.push(el('rect', { width: W, height: H, rx: 28, fill: frameBg }));
  if (!dark) body.push(el('rect', { x: 0.75, y: 0.75, width: W - 1.5, height: H - 1.5, rx: 27.25, stroke: t.edge, 'stroke-width': 1.5 }));
  defs.push(
    el('clipPath', { id: 'win' }, el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, rx: WIN.r })),
    el(
      'radialGradient',
      { id: 'lift', cx: CX, cy: CY, r: 640, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${CX} ${CY}) scale(1 .62) translate(${-CX} ${-CY})` },
      el('stop', { offset: 0, 'stop-color': night.lift }),
      el('stop', { offset: 1, 'stop-color': night.bg }),
    ),
    el(
      'radialGradient',
      { id: 'vig', cx: CX, cy: CY, r: 760, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${CX} ${CY}) scale(1 .6) translate(${-CX} ${-CY})` },
      el('stop', { offset: 0.45, 'stop-color': '#000', 'stop-opacity': 0 }),
      el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': 0.72 }),
    ),
    el('linearGradient', { id: 'flareL', x1: 0, x2: 1 }, el('stop', { offset: 0, 'stop-color': '#fff4d8', 'stop-opacity': 0 }), el('stop', { offset: 0.5, 'stop-color': '#ffffff' }), el('stop', { offset: 1, 'stop-color': '#fff4d8', 'stop-opacity': 0 })),
  );

  const win: string[] = [];
  win.push(el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: 'url(#lift)' }));

  // stars and orbital trajectories fade in first
  const field: string[] = [];
  field.push(D.starfield(sky, { x: WIN.x, y: WIN.y, w: WIN.w, h: WIN.h, count: 150, seed: 'hero-stars', avoid: [{ cx: CX, cy: CY, r: R * 1.55 }], twinkle: 7 }));
  const orbits = [
    { rx: 590, ry: 160, rot: -5, op: 0.1 },
    { rx: 660, ry: 215, rot: 4, op: 0.08 },
    { rx: 520, ry: 255, rot: -12, op: 0.06 },
  ];
  for (const o of orbits)
    field.push(el('ellipse', { cx: CX, cy: CY, rx: o.rx, ry: o.ry, transform: `rotate(${o.rot} ${CX} ${CY})`, stroke: sky.text, 'stroke-opacity': o.op, 'stroke-width': 1.2, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round' }));
  win.push(g({ class: 'fade' }, ...field));

  // ---- the black hole --------------------------------------------------------------------------------
  const hole = blackHole({ id: 'bh', cx: CX, cy: CY, R, theme: sky, q: 0.26, rin: 1.5, rout: 3.0, haloReach: 0.38, seed: `hole-${s.login}`, period: 22 });
  defs.push(hole.defs);
  css.push(hole.css);
  win.push(g({ class: 'emerge' }, hole.back));

  // distractions that pass BEHIND the near side of the disk
  // (none at the moment: everything sits in front so the eye can read it)

  win.push(g({ class: 'emerge' }, hole.front));

  // photon flare at lock: a ring flash and an anamorphic streak
  win.push(el('circle', { class: 'flare', cx: CX, cy: CY, r: R * 1.02, stroke: '#ffffff', 'stroke-width': 7, opacity: 0 }));
  win.push(el('rect', { class: 'streak', x: CX - 470, y: CY - 1.5, width: 940, height: 3, rx: 1.5, fill: 'url(#flareL)', opacity: 0 }));

  // ---- the name, in the shadow ---------------------------------------------------------------------------
  const NS = 84;
  const cap = metrics('archivo').capHeight * NS;
  const nameRun = ts.runWithWidth(s.name.toUpperCase(), { font: 'archivo', size: NS, x: CX, y: CY + cap / 2, anchor: 'middle', tracking: -0.03, fill: night.text });
  win.push(g({ class: 'punch' }, nameRun.svg));

  // ---- distractions ------------------------------------------------------------------------------------------
  type Debris = { svg: string; at: [number, number]; hunt?: Box; pull: [number, number]; bob: [number, number, number] };
  const debris: Debris[] = [];
  debris.push({ svg: D.tabCritter(sky, { x: 172, y: 152, size: 92, rot: -9 }), at: [172, 152], hunt: box(172, 152, 56, 48), pull: [-16, -10], bob: [6.5, 0, 5] });
  debris.push({ svg: D.asker(sky, { x: 1036, y: 150, size: 100, rot: 8 }), at: [1036, 150], hunt: box(1040, 150, 58, 52), pull: [18, -10], bob: [7.2, 0.8, 6] });
  const ping = D.pill(ts, { x: 92, y: 468, text: 'new notification', size: 15, fill: '#ffffff', ink: '#141618', dot: '#ff5cad' });
  debris.push({ svg: g({ transform: `rotate(-5 ${n(92 + ping.w / 2)} 468)` }, ping.svg), at: [92 + ping.w / 2, 468], hunt: box(92 + ping.w / 2, 468, ping.w / 2 + 18, 30), pull: [-18, 12], bob: [5.8, 0.4, 4] });
  debris.push({ svg: D.ghost(sky, { x: 930, y: 320, size: 80, rot: -4 }, { stretch: 1 }), at: [930, 320], hunt: box(926, 318, 62, 44), pull: [30, 4], bob: [6.8, 1.2, 4] });
  debris.push({ svg: D.note(ts, { x: 950, y: 494, text: 'one more idea…', size: 30, rot: -5, fill: t.accentHi, underline: true }), at: [990, 488], pull: [14, 16], bob: [7.6, 0.2, 3] });
  debris.push({ svg: D.hook(sky, { x: 920, y: 448, size: 54, rot: -6, sw: 3.2 }, t.accentHi), at: [868, 452], pull: [12, 12], bob: [7.6, 0.2, 3] });
  debris.push({ svg: D.crown(sky, { x: 800, y: 96, size: 44, rot: 14, sw: 2.8 }), at: [800, 96], pull: [10, -12], bob: [8.4, 1.5, 4] });
  debris.push({ svg: D.sparkle(sky, { x: 335, y: 104, size: 30, sw: 2.2 }), at: [335, 104], pull: [-10, -10], bob: [5.2, 0.6, 3] });
  debris.push({ svg: D.sparkle(sky, { x: 1110, y: 420, size: 22, sw: 2 }), at: [1110, 420], pull: [10, 8], bob: [6.1, 0.9, 3] });
  debris.push({ svg: D.sparkle(sky, { x: 66, y: 300, size: 20, sw: 2 }), at: [66, 300], pull: [-10, 0], bob: [5.5, 0.3, 3] });

  debris.forEach((d, i) => {
    kf(`rc${i}`, `from{opacity:1;transform:translate(${n(d.pull[0])}px,${n(d.pull[1])}px)}`);
    css.push(`.rc${i}{animation:rc${i} 1.2s ${motion.easeOut} ${LOCK + 0.1 + i * 0.03}s both}`);
    const [dur, delay, amp] = d.bob;
    win.push(
      g(
        { class: `rc${i}`, opacity: 0.8 },
        g({ class: `bob b${Math.round(amp)}`, style: `animation-duration:${n(dur)}s;animation-delay:-${n(delay)}s` }, d.svg),
      ),
    );
  });

  // LOCKED IN sticker, slapped on next to the name at lock
  win.push(g({ class: 'slap' }, D.sticker(ts, sky, { x: 872, y: 206, text: 'Locked in', size: 25, rot: 7, fill: t.accent, seed: 'locked' })));

  // ---- autofocus brackets ----------------------------------------------------------------------------------
  // the locked box stays inside the shadow: the void is the frame
  const hw = nameRun.width / 2 + 14;
  const hh = cap / 2 + 15;
  const F = box(CX, CY, hw, hh);
  const targets = debris.filter((d) => d.hunt).map((d) => d.hunt!);
  const ARM = 30;
  const corners: { name: string; at: (b: Box) => [number, number]; d: (x: number, y: number) => string }[] = [
    { name: 'tl', at: (b) => [b.x0, b.y0], d: (x, y) => `M${n(x)} ${n(y + ARM)}V${n(y)}H${n(x + ARM)}` },
    { name: 'tr', at: (b) => [b.x1, b.y0], d: (x, y) => `M${n(x - ARM)} ${n(y)}H${n(x)}V${n(y + ARM)}` },
    { name: 'br', at: (b) => [b.x1, b.y1], d: (x, y) => `M${n(x)} ${n(y - ARM)}V${n(y)}H${n(x - ARM)}` },
    { name: 'bl', at: (b) => [b.x0, b.y1], d: (x, y) => `M${n(x + ARM)} ${n(y)}H${n(x)}V${n(y - ARM)}` },
  ];
  // keyframe stops: arrive, hold, arrive, hold ... then the final lock (with a 2 px overshoot)
  const stops = [
    [0, 0],
    [14, 0],
    [22, 1],
    [36, 1],
    [44, 2],
    [58, 2],
    [66, 3],
    [82, 3],
  ];
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
    brackets.push(el('path', { class: `ck k${ci}`, d: c.d(fx, fy), stroke: t.accent, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  });
  win.push(g({}, ...brackets));

  // ---- tagline, typed under the disk -----------------------------------------------------------------------
  const tag = `${s.tagline}`.trim();
  const TS = 19;
  const tagRun = ts.runWithWidth(tag, { font: 'mono500', size: TS, x: CX, y: 492, anchor: 'middle', fill: night.text2 });
  defs.push(el('clipPath', { id: 'typed' }, el('rect', { class: 'type', x: tagRun.x0 - 2, y: 470, width: tagRun.width + 4, height: 34 })));
  win.push(g({ 'clip-path': 'url(#typed)' }, tagRun.svg));
  win.push(el('rect', { class: 'caret', x: tagRun.x0 + tagRun.width + 6, y: 476, width: 10, height: 20, fill: t.accent }));
  css.push(`.type{transform-box:fill-box;transform-origin:left center;animation:type .9s steps(${Math.max(1, tag.length)}) ${LOCK + 0.3}s both}`);
  css.push(`.caret{animation:hide ${LOCK + 1.2}s step-end both,blink 1s steps(1) ${LOCK + 1.2}s 4}`);

  win.push(el('rect', { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, fill: 'url(#vig)' }));
  body.push(g({ 'clip-path': 'url(#win)' }, ...win));
  body.push(el('rect', { x: WIN.x + 0.5, y: WIN.y + 0.5, width: WIN.w - 1, height: WIN.h - 1, rx: WIN.r, stroke: dark ? '#2a2c30' : '#141618', 'stroke-opacity': dark ? 1 : 0.85, 'stroke-width': 1 }));

  // ---- HUD: top band ---------------------------------------------------------------------------------------------
  const label = (x: number, y: number, text: string, anchor: 'start' | 'end' = 'start') => ts.run(text.toUpperCase(), { font: 'mono500', size: 9.5, x, y, anchor, tracking: 0.16, fill: hudFaint });
  const value = (x: number, y: number, text: string, anchor: 'start' | 'end' = 'start', fill = hudText) => ts.run(text, { font: 'mono500', size: 12.5, x, y, anchor, tracking: 0.04, fill });
  const hud: string[] = [];
  hud.push(el('circle', { class: 'rec', cx: 36, cy: 25, r: 5, fill: hudAccent }));
  hud.push(ts.run('TRACKING', { font: 'mono500', size: 11.5, x: 50, y: 29.5, tracking: 0.14, fill: hudAccent }));
  const topFields: [string, string][] = [
    ['target', `@${s.login}`],
    ['mode', 'AUTOFOCUS'],
    ['lens', 'GRAVITATIONAL'],
  ];
  let x = 168;
  for (const [l, v] of topFields) {
    hud.push(el('path', { d: `M${x - 18} 15V35`, stroke: hudFaint, 'stroke-opacity': 0.5 }));
    hud.push(label(x, 21, l), value(x, 38, v));
    x += Math.max(ts.measure(v, 'mono500', 12.5, 0.04), ts.measure(l.toUpperCase(), 'mono500', 9.5, 0.16)) + 40;
  }
  hud.push(label(1168, 21, 'data', 'end'), value(1168, 38, s.updated, 'end'));
  hud.push(el('path', { d: `M1060 15V35`, stroke: hudFaint, 'stroke-opacity': 0.5 }));
  hud.push(label(1042, 21, 'since', 'end'), value(1042, 38, `${s.since}`, 'end'));

  // ---- HUD: bottom band ----------------------------------------------------------------------------------------
  const by = 575;
  hud.push(label(32, by - 4, 'focus'), value(32, by + 13, 'AF-C'));
  const sx0 = 112;
  const sx1 = 372;
  let ticks = '';
  for (let i = 0; i <= 26; i++) {
    const tx = sx0 + ((sx1 - sx0) * i) / 26;
    ticks += `M${n(tx)} ${i % 13 === 0 ? by - 8 : by - 3}V${by + 3}`;
  }
  hud.push(el('path', { d: ticks, stroke: hudFaint, 'stroke-width': 1 }));
  hud.push(ts.run('NOISE', { font: 'mono500', size: 8.5, x: sx0, y: by + 16, tracking: 0.16, fill: hudFaint }));
  hud.push(ts.run('SIGNAL', { font: 'mono500', size: 8.5, x: sx1, y: by + 16, anchor: 'end', tracking: 0.16, fill: hudFaint }));
  hud.push(el('path', { class: 'needle', d: `M${sx1} ${by - 4}l-5 -9h10Z`, fill: hudAccent }));
  const needleKf = [0, 0.18, 0.06, 0.42, 0.3, 0.63, 0.52, 0.86, 0.79]
    .map((u, i, a) => `${n((i / (a.length - 1)) * 92)}%{transform:translateX(${n((u - 1) * (sx1 - sx0))}px)}`)
    .join('');
  kf('needle', needleKf);

  hud.push(el('path', { d: `M412 ${by - 12}V${by + 12}`, stroke: hudFaint, 'stroke-opacity': 0.5 }));
  hud.push(label(432, by - 4, 'status'));
  hud.push(g({ class: 'searching' }, el('circle', { cx: 437, cy: by + 9, r: 3.5, fill: hudFaint }), value(446, by + 13, 'SEARCHING', 'start', hudFaint)));
  hud.push(g({ class: 'locked' }, el('circle', { cx: 437, cy: by + 9, r: 3.5, fill: hudAccent }), value(446, by + 13, 'LOCKED', 'start', hudAccent)));

  const counters: [string, string][] = [
    ['repos', String(s.publicRepos).padStart(2, '0')],
    ['contrib · 12 mo', String(s.total)],
    ['active days', String(s.activeDays)],
    ['best run', `${s.longestStreak} D`],
  ];
  let cx = 1168;
  for (let i = counters.length - 1; i >= 0; i--) {
    const [l, v] = counters[i];
    hud.push(label(cx, by - 4, l, 'end'), value(cx, by + 13, v, 'end'));
    const w = Math.max(ts.measure(l.toUpperCase(), 'mono500', 9.5, 0.16), ts.measure(v, 'mono500', 12.5, 0.04));
    cx -= w + 34;
    if (i) hud.push(el('path', { d: `M${n(cx + 17)} ${by - 12}V${by + 12}`, stroke: hudFaint, 'stroke-opacity': 0.5 }));
  }
  body.push(g({}, ...hud));

  // ---- motion ------------------------------------------------------------------------------------------------------
  css.push(
    `.fade{animation:fade .8s ${motion.easeOut} both}`,
    `.emerge{transform-origin:${CX}px ${CY}px;animation:emerge 1.1s ${motion.easeOut} .1s both}`,
    ...[0, 1, 2, 3].map((i) => `.k${i}{animation:k${i} ${LOCK - HUNT_START}s cubic-bezier(.6,0,.2,1) ${HUNT_START}s both,lockc ${LOCK}s step-end both}`),
    `.flare{transform-box:fill-box;transform-origin:center;animation:flare 1.3s ${motion.easeOut} ${LOCK}s both}`,
    `.streak{transform-box:fill-box;transform-origin:center;animation:streak 1.1s ${motion.easeOut} ${LOCK}s both}`,
    `.punch{transform-box:fill-box;transform-origin:center;animation:punch .65s ${motion.easeOut} ${LOCK - 0.02}s both}`,
    `.slap{transform-box:fill-box;transform-origin:center;animation:slap .5s ${motion.easeSlap} ${LOCK + 0.2}s both}`,
    `.needle{animation:needle ${LOCK - HUNT_START}s cubic-bezier(.6,0,.2,1) ${HUNT_START}s both}`,
    `.searching{opacity:0;animation:show ${LOCK}s step-end both}`,
    `.locked{animation:hide ${LOCK}s step-end both}`,
    `.rec{animation:blink 1.2s steps(1) infinite}`,
    `.bob{animation:b4 6s ease-in-out infinite}.b3{animation-name:b3}.b5{animation-name:b5}.b6{animation-name:b6}`,
    `.tw{animation:tw 3.4s steps(1) infinite}.tw1{animation-delay:-1.1s;animation-duration:4.1s}.tw2{animation-delay:-2.3s;animation-duration:2.9s}`,
  );
  kf('fade', 'from{opacity:0}');
  kf('emerge', 'from{opacity:0;transform:scale(.9)}');
  kf('lockc', `from{stroke:${night.text}}`);
  kf('flare', '0%{opacity:0;transform:scale(1)}14%{opacity:.95}100%{opacity:0;transform:scale(1.06)}');
  kf('streak', '0%{opacity:0;transform:scaleX(.1)}20%{opacity:1;transform:scaleX(1.02)}100%{opacity:0;transform:scaleX(1.1)}');
  kf('punch', 'from{opacity:0;transform:scale(1.08)}');
  kf('slap', 'from{opacity:0;transform:scale(1.8) rotate(-8deg)}');
  kf('type', 'from{transform:scaleX(0)}');
  kf('show', 'from{opacity:1}');
  kf('hide', 'from{opacity:0}');
  kf('blink', '50%{opacity:0}');
  for (const a of [3, 4, 5, 6]) kf(`b${a}`, `50%{transform:translate(${n(a * 0.8)}px,${-a}px)}`);
  kf('tw', '50%{opacity:.15}');

  const label_ = `${s.name} (@${s.login}): ${tag} Title card: an autofocus HUD hunts through drifting tabs, a notification and a stray idea, then locks onto the name inside a black hole's shadow. Data as of ${s.updated}: ${s.publicRepos} public repos, ${s.total} contributions in the last 12 months.`;
  return svgDoc({ width: W, height: H, label: label_, style: css.join(''), defs: defs.join('') + ts.defs(), body: body.join('') });
}
