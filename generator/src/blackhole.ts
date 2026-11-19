/**
 * The black hole: shadow, photon ring, lensed halo and an inclined accretion disk.
 *
 * Built from layers so a scene can slide things between them:
 *   back  = glow, far half of the disk, lensed halo, photon ring, shadow
 *   front = near half of the disk (it crosses in front of the shadow)
 *
 * Each band is a continuous gradient fill (the body of the light) with fine streak rings on top (the texture
 * and the motion). Motion is one keyframe for every orbit: each streak is a path with pathLength=1000 whose
 * dash pattern repeats every FLOW units, and the offset slides one pattern per cycle, so every loop is
 * seamless. Durations follow Kepler (T ∝ r^1.5): the inner disk visibly outruns the outer disk.
 *
 * Two renderings share the geometry:
 *   luminous (dark)  light in a night sky: Doppler gradient (approaching left side hotter), soft glow
 *   print (light)    the same object made for paper: gold leaf, engraved lines, ink contours, hatched shade
 */
import { n, P, el, g } from './svg.ts';
import { rng } from './rng.ts';
import type { Theme } from './tokens.ts';

export const FLOW = 100;

const STREAKS = [
  [62, 6, 18, 14],
  [40, 4, 34, 22],
  [86, 14],
  [24, 5, 46, 25],
  [70, 30],
  [33, 7, 41, 19],
  [52, 3, 9, 36],
];

export interface HoleOptions {
  id: string;
  cx: number;
  cy: number;
  /** shadow radius in px */
  R: number;
  theme: Theme;
  /** disk inclination: ry / rx of the projected rings (0 = edge-on, 1 = face-on) */
  q?: number;
  /** inner and outer disk radius, in R */
  rin?: number;
  rout?: number;
  streaks?: number;
  haloStreaks?: number;
  /** degrees, positive = clockwise */
  tilt?: number;
  seed?: string;
  animate?: boolean;
  /** orbital period of the innermost ring, seconds */
  period?: number;
  /** 0..1.2, overall brightness */
  intensity?: number;
  /** how far the lensed halo reaches beyond the shadow, in R */
  haloReach?: number;
  sparks?: number;
  /** skip the soft glow (small sizes) */
  glow?: boolean;
  /** false: shadow, photon ring and lensed halo only, no accretion disk */
  disk?: boolean;
}

export interface Hole {
  defs: string;
  css: string;
  back: string;
  front: string;
  /** outer disk radius in px, for layout */
  extent: number;
}

export function holeCss(): string {
  return `.orb{animation:orb linear infinite}@keyframes orb{to{stroke-dashoffset:-${FLOW}}}`;
}

/** closed half-annulus of an ellipse ring: the far (upper) or near (lower) half */
function halfAnnulus(cx: number, cy: number, rin: number, rout: number, q: number, half: 'upper' | 'lower'): string {
  if (half === 'upper')
    return `M${n(cx + rout)} ${n(cy)}A${n(rout)} ${n(rout * q)} 0 0 0 ${n(cx - rout)} ${n(cy)}L${n(cx - rin)} ${n(cy)}A${n(rin)} ${n(rin * q)} 0 0 1 ${n(cx + rin)} ${n(cy)}Z`;
  return `M${n(cx - rout)} ${n(cy)}A${n(rout)} ${n(rout * q)} 0 0 0 ${n(cx + rout)} ${n(cy)}L${n(cx + rin)} ${n(cy)}A${n(rin)} ${n(rin * q)} 0 0 1 ${n(cx - rin)} ${n(cy)}Z`;
}

function ring(cx: number, cy: number, r1: number, r2: number): string {
  return P.circle(cx, cy, r2) + P.circle(cx, cy, r1);
}

export function blackHole(o: HoleOptions): Hole {
  const t = o.theme;
  const print = t.name === 'light';
  const { cx, cy, R, id } = o;
  const q = o.q ?? 0.3;
  const rin = (o.rin ?? 1.5) * R;
  const rout = (o.rout ?? 3.0) * R;
  const reach = (o.haloReach ?? 0.42) * R;
  const animate = o.animate ?? true;
  const T0 = o.period ?? 18;
  const k = o.intensity ?? 1;
  const r = rng(o.seed ?? id);
  const hr1 = R * 1.03;
  const hr2 = R * 1.03 + reach;

  const defs: string[] = [];
  const back: string[] = [];
  const front: string[] = [];
  const tilt = o.tilt ? `rotate(${n(o.tilt)} ${n(cx)} ${n(cy)})` : undefined;
  const box = { x: cx - rout - 20, y: cy - Math.max(hr2, rout * q) - 20, w: rout * 2 + 40, h: Math.max(hr2, rout * q) * 2 + 40 };

  // ---- paints ------------------------------------------------------------------------------------
  // Doppler: the approaching (left) side of the disk is brighter and hotter than the receding side
  if (print) {
    defs.push(
      el('linearGradient', { id: `${id}-dop` }, stop(0, t.diskHot), stop(0.42, t.diskMid), stop(1, t.diskCool)),
      el('linearGradient', { id: `${id}-str` }, stop(0, t.hatch, 0.2), stop(1, t.hatch, 0.5)),
      el('pattern', { id: `${id}-hat`, width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(38)' }, el('path', { d: 'M0 0V7', stroke: t.hatch, 'stroke-width': 1.6 })),
      el('linearGradient', { id: `${id}-hg`, x1: cx - rout * 0.1, x2: cx + rout, y1: 0, y2: 0, gradientUnits: 'userSpaceOnUse' }, stop(0, '#fff', 0), stop(0.55, '#fff', 0.05), stop(1, '#fff', 0.9)),
      el('mask', { id: `${id}-hgm`, maskUnits: 'userSpaceOnUse', x: box.x, y: box.y, width: box.w, height: box.h }, el('rect', { x: box.x, y: box.y, width: box.w, height: box.h, fill: `url(#${id}-hg)` })),
    );
  } else {
    defs.push(
      el('linearGradient', { id: `${id}-dop` }, stop(0, '#ffffff'), stop(0.22, t.diskHot), stop(0.55, t.diskMid), stop(1, t.diskCool)),
      el('linearGradient', { id: `${id}-str` }, stop(0, '#ffffff'), stop(0.4, t.diskHot), stop(1, t.diskMid, 0.7)),
    );
    if (o.glow !== false)
      defs.push(
        el(
          'radialGradient',
          { id: `${id}-glow`, cx, cy, r: rout * 1.25, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${n(cx)} ${n(cy)}) scale(1 .55) translate(${n(-cx)} ${n(-cy)})` },
          stop(0, t.glow, t.glowOpacity * 2.4),
          stop(0.32, t.glow, t.glowOpacity),
          stop(0.7, t.diskCool, t.glowOpacity * 0.3),
          stop(1, t.diskCool, 0),
        ),
      );
  }
  // radial falloff of the disk body (elliptical), as a luminance mask
  const f = rin / rout;
  defs.push(
    el(
      'radialGradient',
      { id: `${id}-rad`, cx, cy, r: rout, gradientUnits: 'userSpaceOnUse', gradientTransform: `translate(${n(cx)} ${n(cy)}) scale(1 ${n(q, 4)}) translate(${n(-cx)} ${n(-cy)})` },
      ...(print
        ? [stop(0, '#fff'), stop(f, '#fff'), stop(f + (1 - f) * 0.6, '#fff', 0.92), stop(1, '#fff', 0.55)]
        : [stop(0, '#fff'), stop(f, '#fff'), stop(f + (1 - f) * 0.1, '#fff', 0.72), stop(f + (1 - f) * 0.45, '#fff', 0.3), stop(1, '#fff', 0)]),
    ),
    el('mask', { id: `${id}-radm`, maskUnits: 'userSpaceOnUse', x: box.x, y: box.y, width: box.w, height: box.h }, el('rect', { x: box.x, y: box.y, width: box.w, height: box.h, fill: `url(#${id}-rad)` })),
  );
  // lensed halo: radial falloff away from the shadow, and a vertical shape (bright over the top, nearly gone
  // at the equator, a thin faint secondary image underneath)
  const hy1 = cy - hr2;
  const hy2 = cy + hr2;
  defs.push(
    el(
      'radialGradient',
      { id: `${id}-hr`, cx, cy, r: hr2, gradientUnits: 'userSpaceOnUse' },
      stop(0, '#fff', 0),
      stop(R / hr2, '#fff', 1),
      stop(hr1 / hr2 + 0.02, '#fff', 1),
      stop((hr1 + reach * 0.35) / hr2, '#fff', print ? 0.9 : 0.55),
      stop(1, '#fff', 0),
    ),
    el(
      'linearGradient',
      { id: `${id}-hv`, x1: 0, y1: hy1, x2: 0, y2: hy2, gradientUnits: 'userSpaceOnUse' },
      stop(0, '#fff', 1),
      stop(0.3, '#fff', 0.92),
      stop(0.47, '#fff', 0.18),
      stop(0.52, '#fff', 0.04),
      stop(0.6, '#fff', 0.08),
      stop(0.8, '#fff', 0.3),
      stop(1, '#fff', 0.34),
    ),
    el('mask', { id: `${id}-hrm`, maskUnits: 'userSpaceOnUse', x: cx - hr2, y: hy1, width: hr2 * 2, height: hr2 * 2 }, el('rect', { x: cx - hr2, y: hy1, width: hr2 * 2, height: hr2 * 2, fill: `url(#${id}-hr)` })),
    el('mask', { id: `${id}-hvm`, maskUnits: 'userSpaceOnUse', x: cx - hr2, y: hy1, width: hr2 * 2, height: hr2 * 2 }, el('rect', { x: cx - hr2, y: hy1, width: hr2 * 2, height: hr2 * 2, fill: `url(#${id}-hv)` })),
  );

  const anim = (radius: number) => {
    if (!animate) return {};
    const T = T0 * Math.pow(radius / rin, 1.5);
    return { class: 'orb', style: `animation-duration:${n((T * FLOW) / 1000, 2)}s` };
  };

  // ---- glow -------------------------------------------------------------------------------------
  if (!print && o.glow !== false && o.disk !== false) back.push(el('ellipse', { cx, cy, rx: rout * 1.25, ry: rout * 1.25 * 0.55, fill: `url(#${id}-glow)` }));

  // ---- disk body + streaks ----------------------------------------------------------------------
  const S = o.streaks ?? 20;
  const streaks: { rad: number; w: number; a: number; pat: number[]; off: number; dark?: boolean }[] = [];
  for (let i = 0; i < S; i++) {
    const u = (i + 0.5) / S;
    const rad = rin + (rout - rin) * Math.pow(u, 1.5);
    const a = print ? 0.55 - 0.3 * u : Math.min(1, k * 0.95 * Math.pow(rin / rad, 1.4));
    const w = print ? r.range(0.7, 1.6) : r.range(1, 2.6) * (1.25 - u * 0.6);
    streaks.push({ rad, w, a, pat: STREAKS[i % STREAKS.length], off: r.range(0, FLOW) });
    if (!print && (i === 4 || i === 9 || i === 13)) streaks.push({ rad: rad + 3, w: 2.4 + u * 4, a: 0.5, pat: [58, 42], off: r.range(0, FLOW), dark: true });
  }
  const streakPath = (half: 'upper' | 'lower', s: (typeof streaks)[number]) =>
    el('path', {
      d: half === 'upper' ? P.upper(cx, cy, s.rad, s.rad * q) : P.lower(cx, cy, s.rad, s.rad * q),
      pathLength: 1000,
      stroke: s.dark ? t.hole : print ? `url(#${id}-str)` : `url(#${id}-str)`,
      'stroke-width': n(s.w),
      'stroke-opacity': n(s.a, 3),
      'stroke-linecap': 'round',
      'stroke-dasharray': s.pat.join(' '),
      'stroke-dashoffset': n(s.off, 1),
      ...anim(s.rad),
    });
  const body = (half: 'upper' | 'lower') =>
    el('path', { d: halfAnnulus(cx, cy, rin, rout, q, half), fill: `url(#${id}-dop)`, mask: `url(#${id}-radm)`, opacity: print ? undefined : n(Math.min(1, 0.9 * k), 2) });

  const farDisk: string[] = [body('upper'), ...streaks.map((s) => streakPath('upper', s))];
  const nearDisk: string[] = [body('lower'), ...streaks.map((s) => streakPath('lower', s))];

  if (print) {
    // hatched shade on the receding side, ink contours on both edges
    farDisk.push(el('path', { d: halfAnnulus(cx, cy, rin, rout, q, 'upper'), fill: `url(#${id}-hat)`, mask: `url(#${id}-hgm)`, opacity: 0.5 }));
    nearDisk.push(el('path', { d: halfAnnulus(cx, cy, rin, rout, q, 'lower'), fill: `url(#${id}-hat)`, mask: `url(#${id}-hgm)`, opacity: 0.5 }));
    farDisk.push(el('path', { d: P.upper(cx, cy, rin, rin * q), stroke: t.hatch, 'stroke-width': 1.8 }), el('path', { d: P.upper(cx, cy, rout, rout * q), stroke: t.hatch, 'stroke-width': 1.2, 'stroke-opacity': 0.45 }));
    nearDisk.push(el('path', { d: P.lower(cx, cy, rin, rin * q), stroke: t.hatch, 'stroke-width': 1.8 }), el('path', { d: P.lower(cx, cy, rout, rout * q), stroke: t.hatch, 'stroke-width': 1.2, 'stroke-opacity': 0.45 }));
  } else {
    // white-hot inner edge
    farDisk.push(el('path', { d: P.upper(cx, cy, rin, rin * q), stroke: '#fff', 'stroke-width': 1.3, 'stroke-opacity': 0.7 }));
    nearDisk.push(el('path', { d: P.lower(cx, cy, rin, rin * q), stroke: '#fff', 'stroke-width': 1.5, 'stroke-opacity': 0.9 }));
  }

  // sparks: tiny pixels riding the disk
  const sparks = o.sparks ?? 24;
  for (let i = 0; i < sparks; i++) {
    const rad = r.range(rin * 1.05, rout * 0.9);
    const th = r.range(0, Math.PI * 2);
    const x = cx + Math.cos(th) * rad;
    const y = cy + Math.sin(th) * rad * q;
    const s = r.pick([1.5, 2, 2, 2.5, 3]);
    const sq = el('rect', { x: x - s / 2, y: y - s / 2, width: s, height: s, fill: print ? t.hatch : '#fff', opacity: n(print ? r.range(0.3, 0.7) : r.range(0.4, 0.95), 2) });
    (Math.sin(th) < 0 ? farDisk : nearDisk).push(sq);
  }

  const withDisk = o.disk !== false;
  if (withDisk) back.push(g({ transform: tilt }, ...farDisk));

  // ---- lensed halo ------------------------------------------------------------------------------
  const H = o.haloStreaks ?? 8;
  const halo: string[] = [el('path', { d: ring(cx, cy, R * 0.99, hr2), 'fill-rule': 'evenodd', fill: `url(#${id}-dop)`, mask: `url(#${id}-hrm)` })];
  for (let i = 0; i < H; i++) {
    const u = (i + 0.5) / H;
    const hr = hr1 + reach * Math.pow(u, 1.2) * 0.92;
    halo.push(
      el('path', {
        d: P.circle(cx, cy, hr),
        pathLength: 1000,
        stroke: `url(#${id}-str)`,
        'stroke-width': n(print ? r.range(0.7, 1.3) : r.range(1, 2.2)),
        'stroke-opacity': n(print ? 0.5 - 0.25 * u : k * (0.85 - 0.6 * u), 3),
        'stroke-linecap': 'round',
        'stroke-dasharray': STREAKS[(i * 3 + 1) % STREAKS.length].join(' '),
        'stroke-dashoffset': n(r.range(0, FLOW), 1),
        ...anim(hr * 1.2),
      }),
    );
  }
  back.push(g({ mask: `url(#${id}-hvm)` }, ...halo));

  // ---- photon ring + shadow -----------------------------------------------------------------------
  if (print) {
    back.push(el('circle', { cx, cy, r: R * 1.03, stroke: t.ring, 'stroke-width': n(R * 0.045) }));
    back.push(el('circle', { cx, cy, r: R, fill: t.hole }));
    back.push(el('circle', { cx, cy, r: R * 1.055, stroke: t.hatch, 'stroke-width': 1.5, 'stroke-opacity': 0.8 }));
  } else {
    back.push(el('circle', { cx, cy, r: R * 1.02, stroke: t.ring, 'stroke-width': n(R * 0.1), 'stroke-opacity': 0.07 }));
    back.push(el('circle', { cx, cy, r: R * 1.02, stroke: t.ring, 'stroke-width': n(R * 0.035), 'stroke-opacity': 0.3 }));
    back.push(el('circle', { cx, cy, r: R * 1.014, stroke: t.ring, 'stroke-width': n(Math.max(1.5, R * 0.012)) }));
    back.push(el('circle', { cx, cy, r: R, fill: t.hole }));
  }

  if (withDisk) front.push(g({ transform: tilt }, ...nearDisk));

  return { defs: defs.join(''), css: holeCss(), back: back.join(''), front: front.join(''), extent: rout };
}

function stop(offset: number, color: string, opacity = 1): string {
  return el('stop', { offset: n(offset, 3), 'stop-color': color, 'stop-opacity': opacity === 1 ? undefined : n(opacity, 3) });
}
