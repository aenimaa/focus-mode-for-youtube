// The hiding rules live in hide.css and apply by default.
// This script marks which features are switched off, ends timed pauses, and updates the corner badge.
const root = document.documentElement;
let offValue = null;
let pauseTimer = null;

function apply(settings) {
  offValue = YTND.FEATURES
    .filter(key => !(settings.master && settings[key]))
    .join(" ");
  root.setAttribute(YTND.ATTR, offValue);
  schedulePauseEnd(settings);
  Badge.update(settings);
}

// When a timed pause runs out, switch everything back on
function schedulePauseEnd(settings) {
  clearTimeout(pauseTimer);
  if (settings.master || !settings.pausedUntil) return;

  const wait = settings.pausedUntil - Date.now();
  if (wait <= 0) YTND.resume();
  else pauseTimer = setTimeout(() => YTND.resume(), wait);
}

// Put our attribute back if the page ever strips it, and follow YouTube's light/dark theme for the badge
new MutationObserver(() => {
  if (offValue !== null && root.getAttribute(YTND.ATTR) !== offValue) {
    root.setAttribute(YTND.ATTR, offValue);
  }
  Badge.syncTheme();
}).observe(root, { attributes: true, attributeFilter: [YTND.ATTR, "dark"] });

YTND.load().then(apply);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") YTND.load().then(apply);
});

// The popup's "Something still showing?" link asks which kind of page this is.
// Only the page type is shared, never the address.
const PAGE_TYPES = [
  [/^\/$/, "Home page"],
  [/^\/watch/, "Video page"],
  [/^\/results/, "Search results"],
  [/^\/shorts/, "Shorts"],
  [/^\/feed\/subscriptions/, "Subscriptions"],
  [/^\/(@|channel\/|c\/|user\/)/, "Channel page"],
  [/^\/playlist/, "Playlist page"]
];

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message?.type !== "pageType") return;
  const match = PAGE_TYPES.find(([pattern]) => pattern.test(location.pathname));
  reply(match ? match[1] : "Other YouTube page");
});
