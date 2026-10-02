# Changelog

What changed in each release. The release page on GitHub shows the section for that version.

## 3.1.1

### Improvements
- The README and website now show the corner badge, at rest and open.
- The tests are published in the repo. They run on every change, and a release can't be built unless they pass.
- The website's light and dark switch is one shared script, and your choice is saved under its own name.

## 3.1.0

### Improvements
- The play button in the logo is optically centred, with a small adjustment for each icon size.
- Clearer wording in places, and the Persian pages now read as standard written Persian.
- Tidier code: shared helpers for pausing and resuming, safer popup building, and less unused CSS.
- Includes the calmer colours from 3.0.1.

### Fixes
- While paused or off, the dimmed tiles in the popup could still be switched with the keyboard.
- The safety page now lists all four files that run on YouTube, and all three links in the popup.

## 3.0.1

### Improvements
- Calmer colours: backgrounds, cards, lines and the page maps are now warm neutral greys. Red only marks what's tucked away and the brand.

## 3.0.0

### New features
- A new name, **Focus Mode for YouTube**, and a new logo.
- A Persian README, linked from the English one and back.

### Improvements
- A fresh look for the popup, the website and the safety checker, with the logo's soft shine on the main buttons and an "On" switch that stands out.
- "On" tiles show a small dot as well as colour, so their state doesn't rely on colour alone.
- Keyboard focus is shown in indigo, so it never looks like "on".
- The README explains every feature, each with a before and after illustration.
- The safety page explains how much access different kinds of extensions need, and lists the checks run for each release.

## 2.6.0

### New features
- A reorganised popup with **Focus**, **Settings** and **About** tabs.
- Small maps of the video page and Home: tap a tile, or the area itself, to tuck it away or bring it back.
- Master is now **On · Pause · Off**.

### Improvements
- The popup fits Chrome's popup size without scrolling, even while paused.

## 2.5.0

### New features
- The **Explore** switch also tucks away Home's "Explore more topics" row.

## 2.4.1

### Improvements
- Closing the corner badge now turns its switch off in the popup too, with a few seconds to undo.

## 2.4.0

### New features
- **Pause:** bring everything back for 15 minutes, 1 hour or until tomorrow morning. It switches itself back on.
- **A quiet corner badge** on YouTube that shows what's tucked away. It stays dim until you hover it.
- **"Something still showing?"** opens a bug report with the versions and the kind of page filled in. It never includes the page's address.

### Improvements
- The safety checker no longer warns about `chrome.tabs` when an extension can't see tab addresses.

## 2.3.0

### New features
- **End of video:** tucks away the end-screen cards and the strip of suggestions over the player.
- **Explore menu:** tucks away the Explore section of the left menu, in any language.

### Improvements
- **Shorts** now also covers single Shorts in search and the Shorts menu entry.
- Calmer wording throughout ("tucked away", "YouTube as usual").

## 2.2.2

### Improvements
- A GitHub link in the popup's footer.

## 2.2.1

### Improvements
- A softer icon that reads clearly at small sizes.
- Opening a section in the popup no longer shifts the layout.

### Fixes
- The small icon looked over-sharpened in Chrome's toolbar.

## 2.2.0

### New features
- First public release on GitHub: tucks away related videos, comments, Shorts shelves and the video description, with a Master switch.
- A safety page and an online safety checker.
- Releases with a one-click download and a SHA-256 fingerprint.
