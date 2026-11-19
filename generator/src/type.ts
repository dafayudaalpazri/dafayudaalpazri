/**
 * Text → vector outlines.
 *
 * GitHub shows README images through <img>, where an SVG cannot load web fonts, so every word in the artwork is
 * set here with the real typefaces and written as paths. Each glyph is defined once per file (<defs>) and placed
 * with <use>, which keeps HUD lines with many repeated characters small.
 *
 * opentype.js' shaper trips over some GSUB lookups (Plus Jakarta Sans), so characters are mapped to glyphs
 * directly and pair kerning is applied by hand. No ligatures are needed for display copy.
 */
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { n, esc, type Attrs, attrs } from './svg.ts';

const require = createRequire(import.meta.url);

export type FontKey =
  | 'archivo'
  | 'anton'
  | 'caveat'
  | 'jakarta500'
  | 'jakarta700'
  | 'jakarta800'
  | 'mono400'
  | 'mono500'
  | 'mono700';

const FILES: Record<FontKey, string> = {
  archivo: '@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff',
  anton: '@fontsource/anton/files/anton-latin-400-normal.woff',
  caveat: '@fontsource/caveat/files/caveat-latin-700-normal.woff',
  jakarta500: '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff',
  jakarta700: '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff',
  jakarta800: '@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff',
  mono400: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
  mono500: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff',
  mono700: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff',
};

const SHORT: Record<FontKey, string> = {
  archivo: 'a', anton: 'n', caveat: 'c', jakarta500: 'j', jakarta700: 'k', jakarta800: 'l', mono400: 'm', mono500: 'o', mono700: 'p',
};

type Font = ReturnType<typeof opentype.parse>;
type Glyph = ReturnType<Font['charToGlyph']>;
const fonts = new Map<FontKey, Font>();

export function font(key: FontKey): Font {
  let f = fonts.get(key);
  if (!f) {
    const buf = readFileSync(require.resolve(FILES[key]));
    f = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    fonts.set(key, f);
  }
  return f;
}

export interface Metrics {
  capHeight: number;
  xHeight: number;
  ascender: number;
  descender: number;
}

/** Font metrics in em */
export function metrics(key: FontKey): Metrics {
  const f = font(key);
  const os2 = f.tables.os2 as { sCapHeight: number; sxHeight: number };
  return {
    capHeight: os2.sCapHeight / f.unitsPerEm,
    xHeight: os2.sxHeight / f.unitsPerEm,
    ascender: f.ascender / f.unitsPerEm,
    descender: f.descender / f.unitsPerEm,
  };
}

interface Placed {
  glyph: Glyph;
  x: number; // in em
}

type Cmd = { type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number };

/**
 * Serialise outline commands ourselves: opentype.js 2.0's toPathData drops the separator before a zero
 * ("M20.2 0L" comes out as "M20.20L"), which corrupts any glyph that touches the baseline.
 * Glyph paths from getPath() are already in SVG (y-down) coordinates.
 */
function pathData(cmds: Cmd[], dp: number): string {
  // relative commands on a rounded grid: shorter numbers, and rounding never accumulates drift
  const p = 10 ** dp;
  const q = (v: number) => Math.round(v * p) / p;
  const nums = (vals: number[]) => {
    let s = '';
    for (const v of vals) {
      const t = n(v, dp);
      s += s === '' || t.startsWith('-') ? t : ' ' + t;
    }
    return s;
  };
  let out = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let first = true;
  for (const c of cmds) {
    if (c.type === 'Z') {
      out += 'z';
      cx = sx;
      cy = sy;
      continue;
    }
    const x = q(c.x!);
    const y = q(c.y!);
    if (c.type === 'M') {
      out += first ? 'M' + nums([x, y]) : 'm' + nums([x - cx, y - cy]);
      sx = x;
      sy = y;
    } else if (c.type === 'L') out += 'l' + nums([x - cx, y - cy]);
    else if (c.type === 'Q') out += 'q' + nums([q(c.x1!) - cx, q(c.y1!) - cy, x - cx, y - cy]);
    else if (c.type === 'C') out += 'c' + nums([q(c.x1!) - cx, q(c.y1!) - cy, q(c.x2!) - cx, q(c.y2!) - cy, x - cx, y - cy]);
    first = false;
    cx = x;
    cy = y;
  }
  return out;
}

function layout(text: string, key: FontKey, tracking = 0): { placed: Placed[]; width: number } {
  const f = font(key);
  const upm = f.unitsPerEm;
  const placed: Placed[] = [];
  let x = 0;
  let prev: Glyph | null = null;
  const chars = Array.from(text);
  chars.forEach((ch, i) => {
    const glyph = f.charToGlyph(ch);
    if (!glyph || glyph.index === 0) throw new Error(`Font ${key} has no glyph for "${ch}" (U+${ch.codePointAt(0)!.toString(16)}) in "${text}"`);
    if (prev) x += f.getKerningValue(prev, glyph) / upm;
    placed.push({ glyph, x });
    x += (glyph.advanceWidth ?? 0) / upm;
    if (i < chars.length - 1) x += tracking;
    prev = glyph;
  });
  return { placed, width: x };
}

export function measure(text: string, key: FontKey, size: number, tracking = 0): number {
  return layout(text, key, tracking).width * size;
}

export interface RunOptions {
  font: FontKey;
  size: number;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
  /** letter spacing in em */
  tracking?: number;
  fill?: string;
  opacity?: number;
  cls?: string;
  id?: string;
  /** a stroke drawn under the fill (paint-order), in px at the final size */
  outline?: { color: string; width: number; opacity?: number };
  attrs?: Attrs;
}

/** One per SVG document: collects the glyph outlines it uses. */
export class Typesetter {
  private glyphDefs = new Map<string, string>();

  private glyphId(key: FontKey, g: Glyph): string {
    const id = `${SHORT[key]}${g.index}`;
    if (!this.glyphDefs.has(id)) {
      const d = pathData(g.getPath(0, 0, 100).commands, 1);
      this.glyphDefs.set(id, d);
    }
    return id;
  }

  measure(text: string, key: FontKey, size: number, tracking = 0): number {
    return measure(text, key, size, tracking);
  }

  /** A run of text as <use> elements inside one positioned, scaled <g>. Returns markup and its width. */
  run(text: string, o: RunOptions): string {
    return this.runWithWidth(text, o).svg;
  }

  runWithWidth(text: string, o: RunOptions): { svg: string; width: number; x0: number } {
    const { placed, width } = layout(text, o.font, o.tracking ?? 0);
    const w = width * o.size;
    const x0 = o.anchor === 'middle' ? o.x - w / 2 : o.anchor === 'end' ? o.x - w : o.x;
    const s = o.size / 100;
    let uses = '';
    for (const p of placed) {
      const path = p.glyph.path;
      if (!path || !path.commands || path.commands.length === 0) continue; // spaces
      const id = this.glyphId(o.font, p.glyph);
      const gx = p.x * 100;
      uses += gx ? `<use href="#${id}" x="${n(gx, 1)}"/>` : `<use href="#${id}"/>`;
    }
    const a: Attrs = {
      id: o.id,
      class: o.cls,
      transform: `translate(${n(x0)} ${n(o.y)}) scale(${n(s, 4)})`,
      fill: o.fill,
      opacity: o.opacity,
      ...o.attrs,
    };
    if (o.outline) {
      a.stroke = o.outline.color;
      a['stroke-width'] = n(o.outline.width / s, 2);
      a['stroke-linejoin'] = 'round';
      a['paint-order'] = 'stroke';
      if (o.outline.opacity !== undefined) a['stroke-opacity'] = o.outline.opacity;
    }
    return { svg: `<g${attrs(a)}>${uses}</g>`, width: w, x0 };
  }

  /** Outline path data for a run, in final coordinates. For clip paths and masks. */
  pathD(text: string, o: Pick<RunOptions, 'font' | 'size' | 'x' | 'y' | 'anchor' | 'tracking'>): string {
    const { placed, width } = layout(text, o.font, o.tracking ?? 0);
    const w = width * o.size;
    const x0 = o.anchor === 'middle' ? o.x - w / 2 : o.anchor === 'end' ? o.x - w : o.x;
    return placed.map((p) => pathData(p.glyph.getPath(x0 + p.x * o.size, o.y, o.size).commands, 2)).join('');
  }

  defs(): string {
    let out = '';
    for (const [id, d] of this.glyphDefs) if (d) out += `<path id="${id}" d="${d}"/>`;
    return out;
  }
}

export { esc };
