const root = document.documentElement;
const pagesEl = document.getElementById("pages");
let state = { ...YTND.DEFAULTS };

// The switches, grouped by the page they change. Each draws its own area on that page's map.
const PAGES = {
  watch: [
    { key: "sidebar", label: "Related", icon: '<rect x="1.5" y="2.5" width="13" height="11" rx="2"/><path d="M10 2.5v11"/>',
      note: 'Tucks away the "Up next" column. The video moves to the center; playlists, live chat and transcripts stay.' },
    { key: "endscreen", label: "End screen", icon: '<rect x="1.5" y="2.5" width="13" height="11" rx="2"/><path d="M4 9h3v2H4zM9 9h3v2H9z"/>',
      note: "Tucks away the cards and suggestion grid that appear as a video ends. Autoplay's countdown stays visible." },
    { key: "comments", label: "Comments", icon: '<path d="M2.5 3.5h11v7.5h-6l-3 2.5V11h-2z"/>',
      note: "Tucks away the comments under the video." },
    { key: "description", label: "Description", icon: '<path d="M2.5 4h11M2.5 7.5h11M2.5 11h7"/>',
      note: "Tucks away the box under the title with views, date and description." }
  ],
  home: [
    { key: "shorts", label: "Shorts", icon: '<rect x="4.5" y="1.5" width="7" height="13" rx="2"/><path d="M7 6.2v3.6L10 8z"/>',
      note: "Tucks away Shorts rows, single Shorts in search and under videos, and the Shorts menu entry." },
    { key: "explore", label: "Explore", icon: '<circle cx="8" cy="8" r="6.5"/><path d="M10.5 5.5 9 9l-3.5 1.5L7 7z"/>',
      note: 'Tucks away the Explore section of the left menu and Home\'s "Explore more topics" row.' }
  ]
};

// Page maps: block sketches of YouTube's layout. Areas a switch controls are "zones";
// they turn red while tucked away, and clicking them flips the switch.

const R = (x, y, w, h, rx, cls = "el") => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const zone = (key, parts, boxes) =>
  `<g class="zone" data-k="${key}">${parts}${boxes.map(([x, y, w, h]) => `<rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`).join("")}</g>`;
const svg = body => `<svg viewBox="0 0 288 124" preserveAspectRatio="none">${body}</svg>`;

// Simple blocks in YouTube's real proportions: a wide player, horizontal video cards, vertical Shorts
const topBar = () => R(4, 3, 280, 6, 3);

function watchMap() {
  let related = "";
  for (let i = 0; i < 5; i++) related += R(188, 15 + i * 21.5, 40, 18, 2, "part el") + R(232, 19 + i * 21.5, 48, 4, 2, "part el");

  let endscreen = "";
  for (const x of [12, 68, 124]) endscreen += R(x, 63, 50, 17, 2, "part on-player");

  return svg(
    topBar() +
    R(4, 15, 176, 72, 4, "player") +
    zone("endscreen", endscreen, [[9, 60, 168, 23]]) +
    R(4, 93, 130, 5, 2.5, "strong") +
    zone("description", R(4, 103, 176, 8, 3, "part el"), [[2, 101, 180, 12]]) +
    zone("comments", R(4, 115, 176, 7, 3, "part el"), [[2, 113, 180, 11]]) +
    zone("sidebar", related, [[186, 13, 100, 110]])
  );
}

function homeMap() {
  // Left menu: Home, Shorts, Subscriptions at the top, the Explore section lower down
  const menu = R(4, 15, 38, 4, 2) + R(4, 31, 38, 4, 2) + R(4, 43, 38, 4, 2);
  const shortsEntry = R(4, 23, 38, 4, 2, "part el");
  let exploreMenu = "";
  for (const y of [62, 70, 78, 86]) exploreMenu += R(4, y, 38, 4, 2, "part el");

  let videos = "";
  for (let i = 0; i < 3; i++) videos += R(50 + i * 79, 15, 73, 34, 3);

  let shorts = shortsEntry;
  for (let i = 0; i < 7; i++) shorts += R(50 + i * 33.5, 55, 28, 40, 3, "part el");

  let topics = "";
  for (let i = 0; i < 3; i++) topics += R(50 + i * 79, 101, 73, 21, 3, "part el");

  return svg(
    topBar() + menu + videos +
    zone("shorts", shorts, [[2, 21, 42, 8], [48, 53, 238, 44]]) +
    zone("explore", exploreMenu + topics, [[2, 59, 42, 33], [48, 99, 238, 25]])
  );
}

const MAPS = { watch: watchMap, home: homeMap };

// Build the maps and tiles

for (const [page, switches] of Object.entries(PAGES)) {
  document.querySelector(`[data-map="${page}"]`).innerHTML = MAPS[page]();
  // Tiles are built as elements with plain text; only the constant icon paths go in as markup
  const tiles = document.querySelector(`[data-tiles="${page}"]`);
  for (const s of switches) {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.dataset.k = s.key;
    tile.title = s.note;
    tile.setAttribute("aria-pressed", "false");
    tile.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${s.icon}</svg>`;
    const label = document.createElement("span");
    label.textContent = s.label;
    tile.append(label);
    tiles.append(tile);
  }
}

const highlight = (key, on) =>
  document.querySelectorAll(`.zone[data-k="${key}"]`).forEach(z => z.classList.toggle("hl", on));

document.querySelectorAll(".tile").forEach(tile => {
  const key = tile.dataset.k;
  tile.addEventListener("click", () => update({ [key]: !state[key] }));
  for (const [event, on] of [["mouseenter", true], ["focus", true], ["mouseleave", false], ["blur", false]]) {
    tile.addEventListener(event, () => highlight(key, on));
  }
});

document.querySelectorAll(".zone").forEach(z => {
  z.addEventListener("click", () => update({ [z.dataset.k]: !state[z.dataset.k] }));
});

// Pages fold away; which ones are folded is remembered in this popup only

let folded = [];
try { folded = JSON.parse(localStorage.getItem("ytnd-folded") || "[]"); } catch (_) {}

document.querySelectorAll(".page").forEach(section => {
  const head = section.querySelector(".page-head");
  const setFolded = closed => {
    section.classList.toggle("closed", closed);
    head.setAttribute("aria-expanded", String(!closed));
  };
  setFolded(folded.includes(section.dataset.page));
  head.addEventListener("click", () => {
    setFolded(!section.classList.contains("closed"));
    folded = [...document.querySelectorAll(".page.closed")].map(s => s.dataset.page);
    try { localStorage.setItem("ytnd-folded", JSON.stringify(folded)); } catch (_) {}
  });
});

// Tabs

const tabs = [...document.querySelectorAll(".tab")];

function selectTab(tab) {
  tabs.forEach(t => {
    const selected = t === tab;
    t.setAttribute("aria-selected", String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
  });
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", event => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
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
  const paused = !state.master && state.pausedUntil > Date.now();
  const mode = state.master ? "on" : paused ? "pause" : "off";
  document.querySelector(`input[name="master"][value="${mode}"]`).checked = true;

  const count = YTND.countOn(state);
  document.getElementById("masterStatus").textContent =
    mode === "on" ? `${count} of ${YTND.FEATURES.length} tucked away`
      : mode === "pause" ? `Paused, ${YTND.backAt(state.pausedUntil)}`
        : "YouTube as usual";
  document.getElementById("pauseRow").hidden = mode !== "pause";
  pagesEl.classList.toggle("inactive", !state.master);
  pagesEl.inert = !state.master;  // dimmed tiles can't be reached with the keyboard either

  for (const [page, switches] of Object.entries(PAGES)) {
    const on = switches.filter(s => state[s.key]).length;
    document.querySelector(`[data-count="${page}"]`).textContent = `${on} of ${switches.length}`;
  }
  document.querySelectorAll(".tile").forEach(tile => tile.setAttribute("aria-pressed", String(Boolean(state[tile.dataset.k]))));
  document.querySelectorAll(".zone").forEach(z => z.classList.toggle("on", Boolean(state[z.dataset.k])));

  document.getElementById("badge").checked = Boolean(state.badge);
  const theme = ["light", "dark", "system"].includes(state.theme) ? state.theme : "system";
  document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
  applyTheme(theme);
}

function update(patch) {
  Object.assign(state, patch);
  render();
  YTND.save(patch);
}

function pauseEnd(choice) {
  if (choice === "15m") return Date.now() + 15 * 60 * 1000;
  if (choice === "1h") return Date.now() + 60 * 60 * 1000;
  const morning = new Date();
  morning.setDate(morning.getDate() + 1);
  morning.setHours(6, 0, 0, 0);
  return morning.getTime();
}

// On, Pause (15 minutes, adjustable with the chips) and Off
document.querySelectorAll('input[name="master"]').forEach(input => {
  input.addEventListener("change", () => {
    if (input.value === "on") update({ master: true, pausedUntil: 0 });
    else if (input.value === "pause") update({ master: false, pausedUntil: pauseEnd("15m") });
    else update({ master: false, pausedUntil: 0 });
  });
});

document.querySelectorAll("[data-pause]").forEach(chip => {
  chip.addEventListener("click", () => update({ master: false, pausedUntil: pauseEnd(chip.dataset.pause) }));
});

document.getElementById("badge").addEventListener("change", event => {
  update({ badge: event.target.checked });
});

document.querySelectorAll('input[name="theme"]').forEach(input => {
  input.addEventListener("change", () => update({ theme: input.value }));
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
