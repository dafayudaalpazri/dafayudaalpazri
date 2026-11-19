/** A very small SVG string builder. Every number goes through `n()` so files stay compact and stable. */

export type Attr = string | number | boolean | null | undefined;
export type Attrs = Record<string, Attr>;

/** Format a number with at most `d` decimals, no trailing zeros, no "-0". */
export function n(v: number, d = 2): string {
  if (!Number.isFinite(v)) throw new Error(`non-finite number in SVG: ${v}`);
  const p = 10 ** d;
  let r = Math.round(v * p) / p;
  if (Object.is(r, -0)) r = 0;
  let s = r.toString();
  if (s.includes('e')) s = r.toFixed(d);
  if (s.startsWith('0.')) s = s.slice(1);
  else if (s.startsWith('-0.')) s = '-' + s.slice(2);
  return s;
}

export function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function attrs(a: Attrs): string {
  let out = '';
  for (const [k, v] of Object.entries(a)) {
    if (v === undefined || v === null || v === false) continue;
    if (v === true) out += ` ${k}`;
    else out += ` ${k}="${typeof v === 'number' ? n(v) : esc(v)}"`;
  }
  return out;
}

export function el(tag: string, a: Attrs = {}, ...children: (string | false | null | undefined)[]): string {
  const inner = children.filter(Boolean).join('');
  return inner ? `<${tag}${attrs(a)}>${inner}</${tag}>` : `<${tag}${attrs(a)}/>`;
}

export const g = (a: Attrs, ...c: (string | false | null | undefined)[]) => el('g', a, ...c);

/** Path data helpers */
export const P = {
  M: (x: number, y: number) => `M${n(x)} ${n(y)}`,
  L: (x: number, y: number) => `L${n(x)} ${n(y)}`,
  /** a full circle as a path that starts at 3 o'clock and runs counter-clockwise on screen (top first) */
  circle(cx: number, cy: number, r: number): string {
    return `M${n(cx + r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)}A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)}`;
  },
  /** upper half of an ellipse, right to left (the far side of a disk) */
  upper(cx: number, cy: number, rx: number, ry: number): string {
    return `M${n(cx + rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx - rx)} ${n(cy)}`;
  },
  /** lower half of an ellipse, left to right (the near side of a disk) */
  lower(cx: number, cy: number, rx: number, ry: number): string {
    return `M${n(cx - rx)} ${n(cy)}A${n(rx)} ${n(ry)} 0 0 0 ${n(cx + rx)} ${n(cy)}`;
  },
  /** a polyline through points, optionally closed */
  poly(pts: [number, number][], close = false): string {
    return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join('') + (close ? 'Z' : '');
  },
  /** a smooth curve through points (Catmull-Rom converted to cubic Béziers) */
  smooth(pts: [number, number][], close = false, tension = 1): string {
    if (pts.length < 2) return '';
    const p = close ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
    let d = `M${n(p[1][0])} ${n(p[1][1])}`;
    for (let i = 1; i < p.length - 2; i++) {
      const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
      const t = tension / 6;
      d += `C${n(x1 + (x2 - x0) * t)} ${n(y1 + (y2 - y0) * t)} ${n(x2 - (x3 - x1) * t)} ${n(y2 - (y3 - y1) * t)} ${n(x2)} ${n(y2)}`;
    }
    return d + (close ? 'Z' : '');
  },
};

export interface DocOptions {
  width: number;
  height: number;
  label: string;
  style?: string;
  defs?: string;
  body: string;
}

/**
 * A complete standalone SVG. role="img" + aria-label because GitHub shows it through <img>; the README's alt
 * text carries the same words. Motion stops under prefers-reduced-motion (every animation is written so that
 * its resting state is the designed final frame).
 */
export function svgDoc(o: DocOptions): string {
  const style = o.style
    ? `<style>${o.style}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>`
    : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${n(o.width)}" height="${n(o.height)}" viewBox="0 0 ${n(o.width)} ${n(o.height)}" role="img" aria-label="${esc(o.label)}" fill="none">` +
    `<title>${esc(o.label)}</title>` +
    style +
    (o.defs ? `<defs>${o.defs}</defs>` : '') +
    o.body +
    `</svg>`
  );
}
