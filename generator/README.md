# Event Horizon: the profile's artwork generator

Every image on the profile README is drawn here, in TypeScript, from two inputs:

- **`profile.config.ts`**: everything personal (name, about text, links, project blurbs, stack sources).
- **`data/github.json`**: public GitHub data (repos, languages, the contribution calendar). No number in the artwork is typed by hand.

```bash
cd generator
npm ci              # once
npm run fetch       # read public GitHub data → data/github.json (saves only if something visible changed)
npm run build       # draw every SVG into ../assets and write ../README.md
npm run verify      # static checks: paths, self-contained SVGs, ids, reduced motion, size budget
npm run check       # TypeScript type-check
```

`.github/workflows/redraw-profile.yml` runs fetch → build → verify every day and commits only when something changed.

### What still needs you (TODO in `profile.config.ts`)

The previous template only had sample values for these, so they are left out of the README until filled in:

| field | what to put there |
| --- | --- |
| `links.website` | your site, e.g. `https://…` |
| `links.email` | a public email address |
| `links.sponsors` | `true` once `github.com/sponsors/<login>` exists (it currently redirects) |
| `now` | one line about what you are working on |

`name` is "Dapaa", as the previous README had it; GitHub's display name is "Dafaa". The project blurbs are taken from each repo's README or homepage because the repos have no GitHub description; rewrite them freely.

---

## The design system

**Concept: curiosity has gravity.** A black hole as the metaphor for curiosity, exploration, engineering and the open-endedness of technology, drawn in HIGH TABLE Pay's visual language: ink black, warm paper, crown gold, big rounded shapes, torn stickers, handwritten notes and horned doodle critters. HIGH TABLE already has a golden black hole (its "Pay with" animation), so the two meet naturally.

**The hero keeps the original's composition**: a camera HUD top and bottom, autofocus brackets hunting through floating distractions, a lock onto the centred name, a typed tagline. Only now the name sits inside a black hole's shadow, the distractions orbit and get pulled in when focus locks, and a "LOCKED IN" sticker slaps on the way HIGH TABLE stamps "PAID!".

### Colour

| token | hex | role |
| --- | --- | --- |
| ink | `#141618` | panels on dark, all line art |
| night | `#0c0d0f` → lift `#17191c` | the hero's sky |
| void | `#040405` | the shadow of every black hole |
| paper | `#ecebe7` | panels on light |
| on-ink | `#f4f2ee` | text on dark, die-cut sticker borders |
| crown gold | `#d9b25a` | accents, fills, data marks |
| champagne | `#f6dc8f` | stickers, highlights, notes on dark |
| gold dark | `#8a6a24` | gold for text on light (contrast) |
| flare | `#fff4d8` | photon ring |
| ember | `#e0782f` | the receding (red-shifted) side of a disk |

Gold is never small text on white: on light themes text uses gold dark. Section strips are transparent and their rule uses GitHub's own border colours so they sit on the page, not on a card.

### Type

All OFL faces, converted to vector outlines at build time (`src/type.ts`), because GitHub shows SVGs through `<img>`, where web fonts never load.

| role | face | used for |
| --- | --- | --- |
| display | Archivo Black, −0.035 em | names, titles |
| condensed | Anton | stickers, counters, big numbers |
| script | Caveat 700 | handwritten notes |
| body | Plus Jakarta Sans 500 / 700 / 800 | blurbs, chips, buttons |
| mono | JetBrains Mono 500 | HUD labels, typed lines (one weight keeps files small) |

Each glyph is defined once per file and placed with `<use>`. opentype.js 2.0's own path writer drops a separator before zeros and its shaper fails on some GSUB lookups, so both are done by hand.

### Shape and illustration

- **Panels**: radius 26–28 (HIGH TABLE's big soft corners), 1.5 px edge. Pills everywhere else.
- **Line**: one weight per drawing (5 % of its size, HIGH TABLE's 5 / 96), round caps and joins.
- **Critters** (`src/doodles.ts`): the Singularity mascot (a horned black hole wearing its disk), a horned ghost that can be spaghettified, a "what if?" speech bubble, an open tab, an eyeball, a paper plane. Always ink drawings. On dark surfaces they become **die-cut stickers** (a wide warm-white silhouette under the ink) instead of turning into white lines, because HIGH TABLE's monsters only ever live on paper.
- **Marks**: sparkle, crown, spiral, hooked arrow, squiggle, orbit glyph, in the theme's line colour.
- **Shade**: diagonal hatching on one side of a shape. **Texture**: pixel stars, packed into a few paths.
- **Paper things**: torn stickers (jagged polygon, Anton caps, ±6–8° tilt), pills, Caveat notes with scribbled underlines.

### The black hole (`src/blackhole.ts`)

Shadow, photon ring, a lensed halo bent over the top (with a faint secondary image underneath), and an inclined accretion disk split into a far half (behind the shadow) and a near half (in front of it). Each band is a gradient body with fine streak rings on top. The approaching left side is hotter and brighter than the receding right (Doppler beaming). Two renderings share the geometry: **luminous** for night skies, **print** (gold leaf, engraved lines, ink contours, hatched shade) for paper. The hero stays a night window in both themes, framed by a paper or ink device, the way HIGH TABLE puts its golden black hole on an ink panel.

### Motion

Principles borrowed from the two skills used for this redesign: *html-demo* (every frame is a pure function of one clock) and *session-story* (beats with a cause, no idle motion).

- **Keyframes only say where things come from.** Every element's resting state is its designed final frame. That is what stays after the intro, what reduced motion shows (`prefers-reduced-motion` turns all animation off), and what a screenshot at any `t` is computed from.
- **Only the hero has an entrance.** Images further down start animating when the page loads, long before anyone scrolls to them, so they get ambient loops only.
- **Loops are physics.** Disks orbit with Kepler timing (period ∝ r^1.5) using one shared keyframe: each streak has `pathLength=1000` and slides exactly one dash pattern per cycle, so every loop is seamless. Other loops: a scanner sweeping the year, a body riding a section's orbit, stars twinkling, the mascot waving and blinking.
- **A heavy moment gets a beat of stillness before it, and reactions start on the frame of their cause.** In the hero the brackets hold on each target, then at 2.45 s the lock, the photon-ring flare, the name, the HUD status and the needle all land together.

Hero timeline: 0–1 s the hole emerges · 0.3–2.3 s brackets hunt four targets · **2.45 s lock** · 2.55 s distractions recede toward the hole · 2.65 s sticker · 2.75–3.65 s tagline types.

### SVG conventions

- Self-contained: no external URLs, fonts, scripts or `data:` URIs (`npm run verify` enforces it).
- Animated elements are wrapper groups **without** a `transform` attribute (a CSS transform would replace it).
- `transform-box: fill-box` for self-centred motion; explicit `transform-origin` in px for the hole.
- SVGO runs with three plugins only (comments, numbers, path data): ids, classes, groups and styles stay exactly as written.
- One `<title>` and `aria-label` per file, and the README's `alt` text carries the same facts.

### GitHub compatibility (verified)

The README was rendered by GitHub's own Markdown API (on a copy with personal details swapped out) and every feature used survived: `<picture>` with `prefers-color-scheme` sources (GitHub wraps them in its `<themed-picture>` element, so images follow the viewer's GitHub theme), `width` / `height` / `align`, `<details>` / `<summary>`, `<sub>`, links. No `style` attributes are used. On phones the art scales to about 30 %: names, titles and numbers stay readable, small labels become texture, and every fact is also in real text (alt text, the details lists, the live links).

---

## Files

```
profile.config.ts       everything personal
data/github.json        public data snapshot (written by npm run fetch)
src/fetch-github.ts     GraphQL with a token (the workflow), public REST + calendar page without
src/stats.ts            every number the artwork shows is derived here
src/tokens.ts           palette, type roles, shape and motion constants
src/type.ts             text → outlines
src/blackhole.ts        the black hole
src/doodles.ts          critters, marks, stickers, pills, notes, stars
src/parts.ts            panels, brand icons (simple-icons, CC0), line icons
src/scenes/*.ts         hero, section strips, accretion (stack), orbit cards, telemetry, closing, badges
src/readme.ts           README.md template
src/build.ts            draws everything, runs SVGO, writes the README
qa/verify.ts            static checks
qa/shoot.ts             frames at exact times, contact sheets, reduced-motion end frames, page previews
```

Credits: visual language after HIGH TABLE Pay. Fonts: Archivo Black, Anton, Caveat, Plus Jakarta Sans, JetBrains Mono (SIL OFL 1.1, via Fontsource). Brand icons: simple-icons (CC0).
