/**
 * Event Horizon design tokens.
 *
 * The base palette is HIGH TABLE Pay's (ink black, warm paper, crown gold, champagne).
 * The black-hole extensions (void, flare, ember) are the only
 * additions: a deeper black for the shadow, a white-gold for the photon ring and a hot orange for the
 * inner accretion disk, all sitting inside the same warm family.
 */

export const base = {
  paper: '#ecebe7',
  paper2: '#f4f3f0',
  surface: '#ffffff',
  chip: '#e6e5e1',
  lineSoft: '#dcdbd6',
  ink: '#141618',
  ink2: '#1d2023',
  ink3: '#2c2f33',
  onInk: '#f4f2ee',
  onInk2: '#a9a59c',
  text2: '#3a3a3a',
  muted: '#626262',
  gold: '#d9b25a',
  goldHi: '#e6c470',
  goldSoft: '#f8eed3',
  goldDark: '#8a6a24',
  champagne: '#f6dc8f',
  champagneHi: '#fae7ad',
  orange: '#ff9b3d',
  pink: '#ff5cad',
  // Event Horizon additions
  void: '#040405',
  night: '#0c0d0f',
  nightLift: '#17191c',
  flare: '#fff4d8',
  ember: '#e0782f',
} as const;

export type ThemeName = 'dark' | 'light';

export interface Theme {
  name: ThemeName;
  /** panel background and its centre lift */
  bg: string;
  bgLift: string;
  /** panel border */
  edge: string;
  text: string;
  text2: string;
  faint: string;
  rule: string;
  accent: string;
  accentHi: string;
  accentDeep: string;
  /** black hole */
  hole: string;
  ring: string;
  diskHot: string;
  diskMid: string;
  diskCool: string;
  glow: string;
  glowOpacity: number;
  /** doodles: line colour, fill, hatching */
  line: string;
  fill: string;
  hatch: string;
  /** stickers */
  sticker: string;
  stickerAlt: string;
  stickerInk: string;
  /** small star pixels */
  star: string;
  starOpacity: number;
  /** transparent strips sit on GitHub's own page colour (#0d1117 / #ffffff) */
  page: string;
}

export const themes: Record<ThemeName, Theme> = {
  dark: {
    name: 'dark',
    bg: base.night,
    bgLift: base.nightLift,
    edge: '#26292d',
    text: base.onInk,
    text2: base.onInk2,
    faint: '#6b6860',
    rule: '#2f3236',
    accent: base.gold,
    accentHi: base.champagne,
    accentDeep: base.goldDark,
    hole: base.void,
    ring: base.flare,
    diskHot: '#fff1cf',
    diskMid: base.goldHi,
    diskCool: base.ember,
    glow: base.gold,
    glowOpacity: 0.16,
    line: base.onInk,
    fill: base.gold,
    hatch: base.onInk,
    sticker: base.champagne,
    stickerAlt: base.gold,
    stickerInk: base.ink,
    star: base.champagneHi,
    starOpacity: 0.55,
    page: '#0d1117',
  },
  light: {
    name: 'light',
    bg: base.paper,
    bgLift: base.paper2,
    edge: '#d6d4cd',
    text: base.ink,
    text2: base.text2,
    faint: '#9a978f',
    rule: '#cfccc4',
    accent: base.gold,
    accentHi: base.champagne,
    accentDeep: base.goldDark,
    hole: base.ink,
    ring: base.champagneHi,
    diskHot: base.champagneHi,
    diskMid: base.gold,
    diskCool: base.goldDark,
    glow: base.gold,
    glowOpacity: 0.1,
    line: base.ink,
    fill: base.gold,
    hatch: base.ink,
    sticker: base.champagne,
    stickerAlt: base.gold,
    stickerInk: base.ink,
    star: base.ink,
    starOpacity: 0.32,
    page: '#ffffff',
  },
};

/** Type roles. Every face is OFL and is converted to outlines at build time (GitHub's image sandbox loads no fonts). */
export const type = {
  display: 'archivo', // Archivo Black: names, titles
  cond: 'anton', // Anton: stickers, counters, HUD values
  script: 'caveat', // Caveat 700: handwritten notes
  body: 'jakarta700', // Plus Jakarta Sans: captions and descriptions
  bodyMedium: 'jakarta500',
  bodyHeavy: 'jakarta800',
  mono: 'mono500', // JetBrains Mono: HUD labels, typed lines
  monoBold: 'mono700',
} as const;

/** Shape language: big soft radii from HIGH TABLE's panels, a 3.5 px doodle stroke at 1200 px wide. */
export const shape = {
  panelRadius: 28,
  cardRadius: 24,
  pill: 999,
  stroke: 3.5,
  strokeBold: 4.5,
  hairline: 1,
};

/** Motion: one easing family, short entrances, slow orbits. Everything stops under reduced motion. */
export const motion = {
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)', // HIGH TABLE --ease-out
  easeSlap: 'cubic-bezier(.2, 1.5, .4, 1)', // sticker slap / overshoot
  easeInOut: 'cubic-bezier(.65, 0, .35, 1)',
  easeIn: 'cubic-bezier(.55, 0, 1, .45)',
};
