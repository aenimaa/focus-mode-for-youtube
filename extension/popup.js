const root = document.documentElement;
const settingsList = document.getElementById("settings");
let state = { ...YTND.DEFAULTS };

// Wireframes: a skeleton of the YouTube page with the tucked-away part in red.

const rect = (x, y, w, h, rx = 1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const dot = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

function svg(hit, parts, outline) {
  const body = Object.entries(parts)
    .map(([name, shapes]) => `<g class="${name === hit ? "hit" : ""}">${shapes}</g>`)
    .join("");
  // One outline box, or several when the tucked-away parts are in different places
  const boxes = Array.isArray(outline[0]) ? outline : [outline];
  const outlines = boxes.map(box => rect(...box, 3).replace("<rect", '<rect class="outline"')).join("");
  return `<svg viewBox="0 0 240 154" role="img" aria-label="Page sketch, the tucked-away part in red">
    <g class="soft">${rect(0, 0, 240, 10, 0)}</g>${body}${outlines}
  </svg>`;
}

function watchPage(hit) {
  let related = "";
  for (let i = 0; i < 8; i++) {
    const y = 16 + i * 17;
    related += rect(168, y, 28, 15) + rect(199, y + 2, 33, 3, 1) + rect(199, y + 8, 24, 3, 1);
  }

  const outlines = {
    sidebar: [165, 13, 70, 140],
    description: [5, 119, 158, 18],
    comments: [6, 135, 118, 17]
  };

  return svg(hit, {
    player: rect(8, 16, 152, 80, 3) + rect(8, 101, 110, 5, 1) +
      dot(12, 113, 4) + rect(20, 111, 36, 4, 1) + rect(130, 109, 30, 8, 4),
    description: rect(8, 122, 152, 12, 2),
    comments: dot(12, 141, 3) + rect(18, 139.5, 100, 3, 1) +
      dot(12, 148, 3) + rect(18, 146.5, 80, 3, 1),
    sidebar: related
  }, outlines[hit]);
}

function homePage() {
  let guide = "";
  for (let i = 0; i < 6; i++) guide += rect(5, 18 + i * 9, 11, 4, 1);

  let videos = "";
  for (let i = 0; i < 3; i++) {
    videos += rect(26 + i * 72, 18, 66, 36, 2) + rect(26 + i * 72, 58, 50, 3, 1) + rect(26 + i * 72, 64, 34, 3, 1);
  }

  let shorts = rect(26, 76, 30, 4, 1);
  for (let i = 0; i < 5; i++) shorts += rect(26 + i * 43, 85, 38, 66, 3);

  return svg("shorts", { guide, videos, shorts }, [22, 72, 216, 82]);
}

// The player at the end of a video: creator cards top right, the suggestion strip along the bottom
function endOfVideo() {
  const cards = rect(150, 24, 74, 40, 3) + dot(214, 76, 7);
  let strip = "";
  for (let i = 0; i < 3; i++) strip += rect(16 + i * 71, 100, 66, 34, 2);

  return svg("endscreen", {
    player: rect(8, 16, 224, 126, 4) + rect(8, 146, 120, 5, 1),
    endscreen: cards + strip
  }, [13, 21, 214, 117]);
}

// Home with the expanded left menu: the menu's Explore section and the "Explore more topics" row
function exploreMenu() {
  let menu = "";
  for (const y of [18, 27, 36, 52, 61, 70]) menu += dot(9, y + 2, 2) + rect(14, y, 34, 4, 1);
  menu += rect(6, 45, 50, 1, 0) + rect(6, 79, 50, 1, 0);

  let explore = rect(6, 86, 30, 4, 1);
  for (let i = 0; i < 6; i++) explore += dot(9, 97 + i * 9, 2) + rect(14, 95 + i * 9, 30 + (i % 3) * 6, 4, 1);

  let videos = "";
  for (const x of [68, 156]) videos += rect(x, 18, 80, 45, 2) + rect(x, 68, 60, 3, 1) + rect(x, 74, 40, 3, 1);

  // "Explore more topics": a row of topic chips over a row of videos
  for (const [x, w] of [[68, 30], [102, 36], [142, 28], [174, 40]]) explore += rect(x, 88, w, 6, 3);
  for (const x of [68, 156]) explore += rect(x, 100, 80, 36, 2) + rect(x, 140, 56, 3, 1);

  return svg("explore", { menu, explore, videos }, [[3, 82, 58, 66], [64, 84, 176, 63]]);
}

const WIREFRAMES = { shorts: homePage, endscreen: endOfVideo, explore: exploreMenu };

document.querySelectorAll(".wireframe").forEach(el => {
  const key = el.dataset.wf;
  el.innerHTML = WIREFRAMES[key] ? WIREFRAMES[key]() : watchPage(key);
});

// Settings

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") root.dataset.theme = theme;
  else delete root.dataset.theme;

  try {
    localStorage.setItem("ytnd-theme", theme);
  } catch (_) {}
}

function render() {
  document.querySelector(`input[name="master"][value="${state.master ? "on" : "off"}"]`).checked = true;
  const paused = !state.master && state.pausedUntil > Date.now();
  document.getElementById("masterStatus").textContent = state.master
    ? "The noisy parts are tucked away"
    : paused ? `YouTube as usual, ${YTND.backAt(state.pausedUntil)}` : "YouTube as usual";
  document.getElementById("pauseRow").hidden = state.master;
  settingsList.classList.toggle("is-off", !state.master);
  document.getElementById("badge").checked = Boolean(state.badge);

  YTND.FEATURES.forEach(key => {
    const toggle = document.getElementById(key);
    toggle.checked = Boolean(state[key]);
    toggle.disabled = !state.master;
  });

  const theme = ["light", "dark", "system"].includes(state.theme) ? state.theme : "system";
  document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
  applyTheme(theme);
}

function update(patch) {
  Object.assign(state, patch);
  render();
  YTND.save(patch);
}

// Turning Master on or off clears any timed pause; the chips below set one
document.querySelectorAll('input[name="master"]').forEach(input => {
  input.addEventListener("change", () => update({ master: input.value === "on", pausedUntil: 0 }));
});

function pauseEnd(choice) {
  if (choice === "15m") return Date.now() + 15 * 60 * 1000;
  if (choice === "1h") return Date.now() + 60 * 60 * 1000;
  const morning = new Date();
  morning.setDate(morning.getDate() + 1);
  morning.setHours(6, 0, 0, 0);
  return morning.getTime();
}

document.querySelectorAll("[data-pause]").forEach(chip => {
  chip.addEventListener("click", () => update({ master: false, pausedUntil: pauseEnd(chip.dataset.pause) }));
});

document.getElementById("badge").addEventListener("change", event => {
  update({ badge: event.target.checked });
});

YTND.FEATURES.forEach(key => {
  document.getElementById(key).addEventListener("change", event => {
    update({ [key]: event.target.checked });
  });
});

document.querySelectorAll('input[name="theme"]').forEach(input => {
  input.addEventListener("change", () => update({ theme: input.value }));
});

// Accordion: one section open at a time (the settings and Safety).

function setOpen(item, open) {
  item.classList.toggle("open", open);
  item.querySelector(".details").setAttribute("aria-expanded", String(open));
}

document.addEventListener("click", event => {
  const button = event.target.closest(".details");
  if (!button) return;

  const item = button.closest(".setting");
  const open = !item.classList.contains("open");
  document.querySelectorAll(".setting.open").forEach(other => setOpen(other, false));
  setOpen(item, open);
});

const version = chrome.runtime.getManifest().version;
document.getElementById("version").textContent = "v" + version;

// "Something still showing?" pre-fills a bug report with the extension and Chrome versions and,
// if a YouTube tab is open, the kind of page it is. Never the page's address.
const reportLink = document.getElementById("reportLink");

function fillReport(pageType) {
  const url = new URL(reportLink.href);
  const chromeVersion = (navigator.userAgent.match(/Chrome\/(\d+)/) || [])[1] || "?";
  url.searchParams.set("versions", `v${version}, Chrome ${chromeVersion}`);
  if (pageType) url.searchParams.set("url", pageType);
  reportLink.href = url.toString();
}

fillReport();
chrome.tabs.query({ active: true, currentWindow: true })
  .then(([tab]) => tab?.id && chrome.tabs.sendMessage(tab.id, { type: "pageType" }))
  .then(pageType => { if (typeof pageType === "string") fillReport(pageType); })
  .catch(() => {});

// Stay in step with changes made elsewhere, like dismissing the badge on YouTube
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  YTND.load().then(settings => {
    state = settings;
    render();
  });
});

YTND.load().then(settings => {
  state = settings;
  // A pause that ran out while no YouTube tab was open
  if (!state.master && state.pausedUntil && state.pausedUntil <= Date.now()) {
    update({ master: true, pausedUntil: 0 });
  } else {
    render();
  }
});
