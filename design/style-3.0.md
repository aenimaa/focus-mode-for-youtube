# Focus Mode for YouTube: 3.0 restyle

A calm, slightly warmer refresh for the popup, the landing site and the safety checker. The reference mockup is `design/restyle-3.0.html`; open it beside this file.

**The feeling:** soft surfaces, generous rounding, one wine accent, a quiet shine borrowed from the logo. Nothing blinks, nothing scolds. Colour means "this is tucked away"; everything else stays neutral and warm.

**What changes from 2.x**

- Greys become warm and faintly wine-tinted. Dark mode is a deep wine-black, not YouTube's grey.
- The accent moves from `#E0002E` to the logo's Wine (`#D3133F`), and the primary button gets the logo's gradient and top shine.
- Radii grow (8 → 12 on tiles and maps), tiles become raised cards, and an "on" tile gets a tinted fill as well as a red border.
- The focus ring moves to indigo, so keyboard focus never looks like an "on" state.

---

## 1. Tokens

Apply them with the three-block pattern the popup already uses: light on `:root`, dark in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {…} }`, and dark again on `:root[data-theme="dark"]`.

Tokens marked **NEW** don't exist yet. Every other name is an existing token with a new value.

### Light

```css
:root {
  color-scheme: light;

  /* Surfaces */
  --bg: #FFFBFB;            /* page / popup background, a breath of wine */
  --raised: #FFFFFF;        /* selected tab, selected segment, tiles, cards */
  --soft: #F6ECEE;          /* tracks (tab bar, segmented), count pills */
  --hover: rgba(74, 14, 27, .05);   /* layered over bg or raised */
  --line: #EBDCDF;
  --card: #FFFFFF;          /* NEW in the popup; site and checker already use it */

  /* Text */
  --text: #2A0A12;          /* ink: a near-black wine */
  --muted: #74525A;

  /* Accent */
  --accent: #D3133F;        /* fills: Master "On", toggles, map zones; white text on it */
  --accent-text: #C0103A;   /* accent as text, and icons on tinted fills */
  --on-accent: #FFFFFF;
  --focus: #4F46E5;         /* indigo, deliberately not wine */
  --switch-off: #9A7A81;

  /* Page maps */
  --map-bg: #FBF3F4;
  --map-el: #EBDDE0;
  --map-strong: #D8C4C9;
  --map-player: #3A1A22;
  --map-on-player: #6B4650;

  /* NEW */
  --line-strong: #DCC5CA;   /* border on hover */
  --tile-on: #FDEDF0;       /* fill of an "on" tile */
  --tile-on-hover: #FBE3E8;
  --accent-line: #D3133F;   /* outline of "on" things; differs in dark */
  --brand-from: #FF1A35;    /* the logo gradient: decoration only, never under text */
  --brand-to: #D3133F;
  --btn-from: #DD1440;      /* the text-safe button gradient (see section 3) */
  --btn-to: #C0103A;
  --btn-hover-from: #C9123B;
  --btn-hover-to: #B00E35;
  --shine: linear-gradient(180deg, rgba(255,255,255,.20) 0%, rgba(255,255,255,0) 45%);
  --shadow-xs: 0 1px 1px rgba(74, 14, 27, .06);
  --shadow-sm: 0 1px 2px rgba(74, 14, 27, .10), 0 0 0 1px rgba(74, 14, 27, .04);
  --shadow-md: 0 1px 2px rgba(74, 14, 27, .08), 0 10px 28px -12px rgba(74, 14, 27, .22);
  --shadow-accent: 0 1px 2px rgba(120, 8, 34, .30), 0 6px 16px -6px rgba(211, 19, 63, .45);
  --glow: rgba(211, 19, 63, .07);   /* the site hero's soft halo */
}
```

### Dark

```css
:root[data-theme="dark"] {        /* and the media-query block */
  color-scheme: dark;

  --bg: #1A1013;
  --raised: #2E1C21;
  --soft: #251619;
  --hover: rgba(255, 214, 222, .06);
  --line: #3B272C;
  --card: #221518;          /* NEW in the popup */

  --text: #F8EEF0;
  --muted: #C0A8AE;

  --accent: #D3133F;        /* unchanged: white text still 5.3:1 */
  --accent-text: #FF6B80;
  --on-accent: #FFFFFF;
  --focus: #A5B4FC;
  --switch-off: #876A71;

  --map-bg: #130A0C;
  --map-el: #3A2A2E;
  --map-strong: #4F3A40;
  --map-player: #070304;
  --map-on-player: #4A3238;

  /* NEW */
  --line-strong: #533A40;
  --tile-on: #3A1520;
  --tile-on-hover: #451825;
  --accent-line: #FF6B80;   /* #D3133F is only 3.0:1 on --raised here, so outlines go lighter */
  /* --brand-*, --btn-* and --shine are the same as light */
  --shadow-xs: 0 1px 1px rgba(0, 0, 0, .30);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, .40), inset 0 1px 0 rgba(255, 255, 255, .04);
  --shadow-md: 0 1px 2px rgba(0, 0, 0, .40), 0 12px 32px -12px rgba(0, 0, 0, .70);
  --shadow-accent: 0 1px 2px rgba(0, 0, 0, .40), 0 6px 18px -6px rgba(211, 19, 63, .55);
  --glow: rgba(211, 19, 63, .14);
}
```

### Site and checker only

The site and checker keep their own token blocks. Copy the surface, text, accent and focus values above, set `--bg`/`--card` as shown, and retune the checker's status colours as follows. Hues stay the same, but "fail" joins the wine family and "info" joins the focus indigo.

| Token | Light | Dark |
|---|---|---|
| `--pass` / `--pass-bg` | `#17743A` / `#E8F5EC` | `#4EC46F` / `#16301F` |
| `--info` / `--info-bg` | `#4F46E5` / `#EEEDFC` | `#A5B4FC` / `#23213F` |
| `--warn` / `--warn-bg` | `#A15C00` / `#FDF1DF` | `#F0B04A` / `#3A2A12` |
| `--fail` / `--fail-bg` | `#C0103A` / `#FDEDF0` | `#FF6B80` / `#3D1820` |

---

## 2. Scales

**Radius**

| Token (NEW) | Value | Used for |
|---|---|---|
| `--r-xs` | 6px | progress bars, small inner blocks |
| `--r-sm` | 8px | chips' inner parts, segments inside a compact control |
| `--r-md` | 12px | tiles, maps, tab bar track, inputs, buttons |
| `--r-lg` | 16px | cards, drop zone, popup sections on the site |
| `--r-xl` | 24px | hero illustration frame, large site cards |
| `--r-pill` | 999px | chips, count pills, toggles |

Inner radius = outer radius − padding. The tab bar track at 12px with 3px padding holds 9px tabs; a segmented track at 10px holds 7px segments.

**Spacing:** a 4px base, with 2 and 6 for tight popup work: `2, 4, 6, 8, 12, 16, 20, 24, 32, 48, 64`. The popup uses 16px outer padding, 12px between blocks, 8px inside a section, and 6px between tiles.

**Type:** keep the bundled Asap where it's already bundled; otherwise use `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`. Popup sizes: title 15/700, section names 13/700, body 13/400, labels 12/600, tile labels and fine print 11/600. On the site the h1 is `clamp(30px, 5vw, 44px)/800` with `letter-spacing: -0.02em`.

**Motion:** `150ms ease` for colour and border, `200ms cubic-bezier(.2,.7,.3,1)` for folding and toggles, and nothing at all under `prefers-reduced-motion`.

---

## 3. Primary button: the logo's shine

The logo's gradient (`#FF1A35 → #D3133F`) is too light at its start for white text (3.9:1). The button uses a darker sibling that keeps every point under the label at 4.7:1 or more, then layers the logo's top shine on it.

```css
.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 40px; padding: 0 18px;
  border: 0; border-radius: var(--r-md);
  color: var(--on-accent);
  font-weight: 700; font-size: 14px;
  background:
    var(--shine),
    linear-gradient(160deg, var(--btn-from), var(--btn-to));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), var(--shadow-accent);
  transition: box-shadow .15s ease, transform .15s ease, background .15s ease;
}
.btn-primary:hover {
  background: var(--shine), linear-gradient(160deg, var(--btn-hover-from), var(--btn-hover-to));
}
.btn-primary:active {
  transform: translateY(1px);
  box-shadow: inset 0 1px 2px rgba(0,0,0,.25);
}
.btn-primary:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
```

**Secondary button:** `background: var(--raised); color: var(--text); border: 1px solid var(--line); box-shadow: var(--shadow-xs)`. On hover, layer `--hover` over `--raised` and use `--line-strong` for the border.

The popup's Master **On** segment uses the same gradient, shine and `--shadow-accent` at segment size.

---

## 4. Components

### Tiles (the toggles under each map)

```css
.tile {
  position: relative;
  display: grid; justify-items: center; gap: 4px;
  padding: 9px 4px 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--raised);
  box-shadow: var(--shadow-xs);
  color: var(--muted);
  font-size: 11px; font-weight: 600; line-height: 1.2;
  transition: background .15s, border-color .15s, color .15s;
}
.tile svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.6; fill: none; }

/* Off + hover */
.tile:hover {
  background: linear-gradient(var(--hover), var(--hover)), var(--raised);
  border-color: var(--line-strong);
  color: var(--text);
}

/* On */
.tile[aria-pressed="true"] {
  background: var(--tile-on);
  border-color: var(--accent-line);
  color: var(--text);
}
.tile[aria-pressed="true"] svg { stroke: var(--accent-text); }
.tile[aria-pressed="true"]::after {           /* a small "tucked away" dot */
  content: ""; position: absolute; top: 5px; right: 5px;
  width: 6px; height: 6px; border-radius: 50%;
  background: linear-gradient(135deg, var(--brand-from), var(--brand-to));
}

/* On + hover */
.tile[aria-pressed="true"]:hover { background: var(--tile-on-hover); }

.tile:active { transform: scale(.98); }
.tile:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
```

An "on" tile is told apart by its fill, border, icon colour and dot, so it never relies on colour alone. When Master is Off or Paused, the maps and tiles drop to `opacity: .45` as they do today.

### Segmented control (Master, Appearance)

```css
.segmented { display: inline-flex; padding: 3px; gap: 2px; border-radius: 10px; background: var(--soft); }
.segmented span {
  display: block; padding: 5px 12px; border-radius: 7px;
  font-size: 12px; font-weight: 600; color: var(--muted);
}
.segmented label:hover span { color: var(--text); }
.segmented input:checked + span { background: var(--raised); color: var(--text); box-shadow: var(--shadow-sm); }
.segmented input:focus-visible + span { outline: 2px solid var(--focus); outline-offset: 1px; }

/* Master: On */
.master-seg input[value="on"]:checked + span {
  background: var(--shine), linear-gradient(160deg, var(--btn-from), var(--btn-to));
  color: var(--on-accent);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), var(--shadow-accent);
}
.segmented.compact span { padding: 4px 9px; font-size: 11px; }
```

Pause and Off use the neutral raised segment. Only "On" is wine.

### Tab bar

```css
.tabs { display: flex; gap: 2px; padding: 3px; border-radius: var(--r-md); background: var(--soft); }
.tab {
  flex: 1; height: 30px; border: 0; border-radius: 9px; background: none;
  color: var(--muted); font-weight: 600; font-size: 13px;
}
.tab:hover { color: var(--text); }
.tab[aria-selected="true"] { background: var(--raised); color: var(--text); box-shadow: var(--shadow-sm); }
```

### Page section (foldable)

- `.page-head`: name 13/700 in `--text`, then a count pill (`background: var(--soft); color: var(--muted); border-radius: var(--r-pill); padding: 1px 8px; font-size: 11px; font-weight: 600`), then the chevron. Hover adds the `--hover` background on a 9px radius.
- Sections are separated by a 1px `--line`, with 12px between them.

### Page maps

- Frame: `border: 1px solid var(--line); border-radius: var(--r-md); background: var(--map-bg);`.
- Blocks keep YouTube's proportions (16:9 player and cards, 9:16 Shorts) with `rx` 3 on small blocks and 5 on the player. Tucked-away zones fill with `--accent`; hover and highlight show a 1.5px dashed `--accent-line` box.
- The rounding on the 288×124 grid goes up by about 1 unit, and nothing else changes in the geometry.

### Toggle switch (Settings)

The geometry is unchanged. Off uses `--switch-off`, and on uses `linear-gradient(160deg, var(--btn-from), var(--btn-to))`. The knob is `#FFF` with `--shadow-sm`.

### Chips (Pause: "Back in …")

`border: 1px solid var(--line); background: var(--raised); color: var(--text); border-radius: var(--r-pill); padding: 3px 10px; font-size: 12px; font-weight: 600`. On hover, layer `--hover` and use `--line-strong`.

### Focus

All focusable things get `outline: 2px solid var(--focus); outline-offset: 2px` (or 3px on gradient buttons). Indigo is used on purpose: it never reads as "on" or "tucked away".

### Site hero and checker header

- **Site hero:** centred, with a radial `--glow` behind the 96px logo tile (`radial-gradient(60% 60% at 50% 0%, var(--glow), transparent 70%)`). Then the h1, a muted tagline, and the fine print in `--muted` at 13px. A primary button and a secondary button sit side by side, with the hero illustration below in a 24px-radius frame.
- **Checker header:** a 40px logo tile, a muted "Made for …" line with an `--accent-text` link, and the compact segmented theme control on the right. Below them come the h1, a muted intro, and a dashed drop zone (`border: 1.5px dashed var(--line-strong); border-radius: var(--r-lg); background: var(--card)`) holding the primary button.

---

## 5. Contrast (WCAG 2.1 AA)

Text needs 4.5:1 and UI parts or graphics need 3:1. Each ratio is computed from the hex values above, with translucent tokens composited first. Every pair passes AA; AAA is not a goal.

### Text on background, light

| Text | Background | Ratio |
|---|---|---|
| `--text` #2A0A12 | `--bg` #FFFBFB | 17.77 |
| `--text` | `--raised` / `--card` #FFFFFF | 18.25 |
| `--text` | `--soft` #F6ECEE | 15.78 |
| `--text` | `--tile-on` #FDEDF0 | 16.12 |
| `--text` | `--tile-on-hover` #FBE3E8 | 15.00 |
| `--text` | `--hover` on `--raised` (#F6F3F4) | 16.55 |
| `--muted` #74525A | `--bg` | 6.60 |
| `--muted` | `--raised` / `--card` | 6.78 |
| `--muted` | `--soft` (unselected tabs, segments, count pills) | 5.86 |
| `--muted` | `--hover` on `--bg` (#F6EFF0) | 5.98 |
| `--muted` | `--hover` on `--raised` | 6.15 |
| `--muted` | `--glow` on `--bg` (site hero, #FCEBEE at its strongest) | 5.89 |
| `--accent-text` #C0103A | `--bg` | 6.05 |
| `--accent-text` | `--raised` / `--card` | 6.22 |
| `--accent-text` | `--soft` | 5.38 |
| `--accent-text` | `--tile-on` / `--tile-on-hover` | 5.49 / 5.11 |
| `--on-accent` #FFFFFF | `--accent` #D3133F | 5.34 |
| `--on-accent` | `--btn-from` #DD1440 | 4.94 |
| `--on-accent` | `--btn-to` #C0103A | 6.22 |
| `--on-accent` | worst point under the label, gradient + shine | 4.89 |
| `--on-accent` | `--btn-hover-to` #B00E35 | 7.09 |
| `--pass` #17743A | `--pass-bg` #E8F5EC / `--card` | 5.20 / 5.84 |
| `--info` #4F46E5 | `--info-bg` #EEEDFC / `--card` | 5.44 / 6.29 |
| `--warn` #A15C00 | `--warn-bg` #FDF1DF / `--card` | 4.65 / 5.19 |
| `--fail` #C0103A | `--fail-bg` #FDEDF0 / `--card` | 5.49 / 6.22 |

### Text on background, dark

| Text | Background | Ratio |
|---|---|---|
| `--text` #F8EEF0 | `--bg` #1A1013 | 16.39 |
| `--text` | `--raised` #2E1C21 | 14.17 |
| `--text` | `--soft` #251619 | 15.30 |
| `--text` | `--card` #221518 | 15.55 |
| `--text` | `--tile-on` #3A1520 | 14.13 |
| `--text` | `--tile-on-hover` #451825 | 13.10 |
| `--text` | `--hover` on `--raised` (#3B272C) | 12.22 |
| `--muted` #C0A8AE | `--bg` | 8.38 |
| `--muted` | `--raised` | 7.25 |
| `--muted` | `--soft` | 7.83 |
| `--muted` | `--card` | 7.95 |
| `--muted` | `--hover` on `--bg` (#281C1F) | 7.41 |
| `--muted` | `--hover` on `--raised` | 6.25 |
| `--muted` | `--glow` on `--bg` (#341019 at its strongest) | 7.66 |
| `--accent-text` #FF6B80 | `--bg` | 6.80 |
| `--accent-text` | `--raised` | 5.88 |
| `--accent-text` | `--soft` | 6.35 |
| `--accent-text` | `--card` | 6.45 |
| `--accent-text` | `--tile-on` / `--tile-on-hover` | 5.86 / 5.44 |
| `--on-accent` #FFFFFF | `--accent` / `--btn-from` / `--btn-to` | 5.34 / 4.94 / 6.22 |
| `--on-accent` | worst point under the label, gradient + shine | 4.89 |
| `--pass` #4EC46F | `--pass-bg` #16301F / `--card` | 6.40 / 7.95 |
| `--info` #A5B4FC | `--info-bg` #23213F / `--card` | 7.74 / 8.86 |
| `--warn` #F0B04A | `--warn-bg` #3A2A12 / `--card` | 7.25 / 9.27 |
| `--fail` #FF6B80 | `--fail-bg` #3D1820 / `--card` | 5.68 / 6.45 |

### UI parts (3:1)

| Part | Against | Light | Dark |
|---|---|---|---|
| `--focus` ring | `--bg` / `--raised` | 6.12 / 6.29 | 9.34 / 8.08 |
| `--switch-off` track | `--bg` / `--raised` | 3.73 / 3.84 | 3.84 / 3.32 |
| `--accent-line` ("on" outline) | `--bg` / `--raised` | 5.20 / 5.34 | 6.80 / 5.88 |
| `--accent-text` icon in an "on" tile | `--tile-on` | 5.49 | 5.86 |
| `--accent` map zone | `--map-bg` | 4.89 | 3.66 |

Map blocks (`--map-el`, `--map-strong`) are decorative sketches and carry no meaning on their own, so they're exempt. Every map zone has a labelled tile beside it.

---

## 6. Illustrations

`docs/illustrations/{key}-{light|dark}.svg` (640×240) for `related`, `endscreen`, `comments`, `description`, `shorts` and `explore`, plus `hero-{light|dark}.svg` (800×320). They contain no words, so the English and Persian READMEs can share them. Put the alt text in each README's own language:

```html
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/illustrations/related-dark.svg">
  <img src="docs/illustrations/related-light.svg" width="640" height="240" alt="…">
</picture>
```

On the site, swap them with the existing `.for-light` / `.for-dark` pattern.

---

## 7. Notes for the engineer

- **Key names:** the illustrations use `related`, but `popup.js` still calls that switch `sidebar`. Map one to the other; don't rename the stored setting key unless there's a migration.
- **`--accent-line` vs `--accent`:** use `--accent-line` for every outline or border that marks "on" (tiles, map hover boxes). Use `--accent` for fills (map zones, Master On fallback, toggles). In dark mode they differ for contrast reasons.
- **Gradients are layered `background`s**, not `background-color`, so `transition: background` won't animate between them. That's fine; the hover shift is subtle.
- **Shadows on the map frame:** none. The maps stay flat sketches; depth lives on tiles, the selected tab and the selected segment.
- **Popup height:** the tiles grow by about 6px each (larger padding and icon). If both sections open overflow Chrome's 600px limit, reduce `.map svg` height from 112px to 104px before cutting padding.
- Remove the old blue `--focus` values (`#065FD4` / `#3EA6FF`, and the site's `#2557D6` / `#7AA2FF`).
