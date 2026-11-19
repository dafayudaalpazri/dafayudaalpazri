/**
 * Link badges (height 40): HIGH TABLE's pill buttons. The GitHub handle is the gold pill (btn-gold); other
 * links are ink pills on dark and outlined white pills on light (btn-ink / btn-line).
 */
import { el, svgDoc } from '../svg.ts';
import { Typesetter } from '../type.ts';
import { brand, icon, type IconName } from '../parts.ts';
import type { Theme } from '../tokens.ts';

export interface BadgeSpec {
  label: string;
  /** what a screen reader hears */
  aria: string;
  kind: 'primary' | 'secondary';
  glyph: { brand: string } | { icon: IconName };
}

export function badge(t: Theme, b: BadgeSpec): { svg: string; width: number } {
  const ts = new Typesetter();
  const dark = t.name === 'dark';
  const H = 40;
  const size = 15;
  const tw = ts.measure(b.label, 'jakarta800', size);
  const W = Math.ceil(16 + 22 + 10 + tw + 18);
  const primary = b.kind === 'primary';
  const fill = primary ? t.accent : dark ? '#24272b' : '#ffffff';
  const stroke = primary ? 'none' : dark ? '#3a3d42' : '#141618';
  const ink = primary ? '#141618' : dark ? '#f4f2ee' : '#141618';
  const glyphC = primary ? '#141618' : dark ? t.accent : '#141618';
  const g = 'brand' in b.glyph ? brand(b.glyph.brand, 16 + 11, H / 2, 20, glyphC) : icon(b.glyph.icon, 16 + 11, H / 2, 20, glyphC, 2.2);
  const body =
    el('rect', { x: 0.75, y: 0.75, width: W - 1.5, height: H - 1.5, rx: (H - 1.5) / 2, fill, stroke, 'stroke-width': primary ? undefined : 1.5 }) +
    g +
    ts.run(b.label, { font: 'jakarta800', size, x: 16 + 22 + 10, y: H / 2 + size * 0.36, fill: ink });
  return { svg: svgDoc({ width: W, height: H, label: b.aria, defs: ts.defs(), body }), width: W };
}
