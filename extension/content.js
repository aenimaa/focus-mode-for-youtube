// The hiding rules live in hide.css and apply by default.
// This script only marks which features are switched off, so their rules stop matching.
const root = document.documentElement;
let offValue = null;

function apply(settings) {
  offValue = YTND.FEATURES
    .filter(key => !(settings.master && settings[key]))
    .join(" ");
  root.setAttribute(YTND.ATTR, offValue);
}

// Put the attribute back if the page ever strips it.
new MutationObserver(() => {
  if (offValue !== null && root.getAttribute(YTND.ATTR) !== offValue) {
    root.setAttribute(YTND.ATTR, offValue);
  }
}).observe(root, { attributes: true, attributeFilter: [YTND.ATTR] });

YTND.load().then(apply);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") YTND.load().then(apply);
});
