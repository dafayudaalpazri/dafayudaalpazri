/** Shared pieces: panels, brand icons, small UI glyphs. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { el, g, n } from './svg.ts';
import type { Theme } from './tokens.ts';

const require = createRequire(import.meta.url);

/** Panel colours: HIGH TABLE's ink panels on dark, warm paper panels on light (GitHub's page is white). */
export function panelColors(t: Theme) {
  return t.name === 'dark'
    ? { bg: '#141618', bg2: '#1b1d20', edge: '#2a2d31', text: '#f4f2ee', text2: '#c9c5bb', faint: '#8a867d', rule: '#2f3236', chip: '#24272b', chipEdge: '#34373c' }
    : { bg: '#ecebe7', bg2: '#f4f3f0', edge: '#d6d4cd', text: '#141618', text2: '#3a3a3a', faint: '#7c796f', rule: '#d3d1ca', chip: '#ffffff', chipEdge: '#141618' };
}

/** Neo-brutalist hard shadow offset: panels are drawn 8 px smaller than the canvas and the shadow fills the rest. */
export const SHADOW = 8;

export interface PanelStyle {
  /** panel fill; defaults to the theme's panel colour */
  fill?: string;
  /** hard shadow colour; defaults to ink on light, gold on dark */
  shadow?: string;
}

/** A neo-brutalist panel: flat fill, thick outline (ink on light, warm white on dark), hard offset shadow. */
export function panel(t: Theme, w: number, h: number, r = 22, s: PanelStyle = {}): string {
  const c = panelColors(t);
  const dark = t.name === 'dark';
  return (
    el('rect', { x: SHADOW, y: SHADOW, width: w - SHADOW, height: h - SHADOW, rx: r, fill: s.shadow ?? (dark ? '#d9b25a' : '#141618') }) +
    el('rect', { x: 1.5, y: 1.5, width: w - SHADOW - 3, height: h - SHADOW - 3, rx: r, fill: s.fill ?? c.bg, stroke: dark ? '#e9e5db' : '#141618', 'stroke-width': 3 })
  );
}

/** clip path matching the inside of panel() */
export function panelClip(id: string, w: number, h: number, r = 22): string {
  return el('clipPath', { id }, el('rect', { x: 3, y: 3, width: w - SHADOW - 6, height: h - SHADOW - 6, rx: r - 1.5 }));
}

/** A simple-icons brand mark (24 × 24) placed at (x, y) centre with size s. CC0 icon data. */
export function brand(slug: string, x: number, y: number, s: number, fill: string): string {
  const svg = readFileSync(require.resolve(`simple-icons/icons/${slug}.svg`), 'utf8');
  const d = svg.match(/ d="([^"]+)"/)?.[1];
  if (!d) throw new Error(`simple-icons: no path for ${slug}`);
  const k = s / 24;
  return el('path', { d, fill, transform: `translate(${n(x - s / 2)} ${n(y - s / 2)}) scale(${n(k, 4)})` });
}

/** Small line icons in HIGH TABLE's icon style (24 × 24, 2.2 stroke, round). */
const ICON = {
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 7l-10 6L2 7',
  heart: 'M12 20s-7-4.4-9.2-8.8C1.3 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.3 5.4 3.4 1.8-2.1 3.3-3.4 5.4-3.4 3.6 0 5.3 3.7 3.8 6.7C19 15.6 12 20 12 20Z',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  repo: 'M5 4.5A2.5 2.5 0 0 1 7.5 2H19v16H7.5A2.5 2.5 0 0 0 5 20.5v-16ZM5 20.5A2.5 2.5 0 0 0 7.5 23H19v-5',
};
export type IconName = keyof typeof ICON;

export function icon(name: IconName, x: number, y: number, s: number, color: string, sw = 2.2): string {
  const k = s / 24;
  return el('path', { d: ICON[name], stroke: color, 'stroke-width': n(sw, 2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', transform: `translate(${n(x - s / 2)} ${n(y - s / 2)}) scale(${n(k, 4)})` });
}

/** HIGH TABLE's brand mark shape: an ink disc with a gold ring (used as the black-hole bullet) */
export function holeDot(x: number, y: number, r: number, t: Theme): string {
  return g({}, el('circle', { cx: x, cy: y, r: r * 1.35, fill: t.accent, opacity: 0.25 }), el('circle', { cx: x, cy: y, r, fill: '#040405', stroke: t.accent, 'stroke-width': n(Math.max(1.2, r * 0.22)) }));
}
