const root = document.documentElement;
const settingsList = document.getElementById("settings");
let state = { ...YTND.DEFAULTS };

// Wireframes: a skeleton of the YouTube page with the affected area in red.

const rect = (x, y, w, h, rx = 1.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;
const dot = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`;

function svg(hit, parts, outline) {
  const body = Object.entries(parts)
    .map(([name, shapes]) => `<g class="${name === hit ? "hit" : ""}">${shapes}</g>`)
    .join("");
  return `<svg viewBox="0 0 240 154" role="img" aria-label="Page sketch, hidden area in red">
    <g class="soft">${rect(0, 0, 240, 10, 0)}</g>${body}${rect(...outline, 3).replace("<rect", '<rect class="outline"')}
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

document.querySelectorAll(".wireframe").forEach(el => {
  el.innerHTML = el.dataset.wf === "shorts" ? homePage() : watchPage(el.dataset.wf);
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
  document.getElementById("masterStatus").textContent =
    state.master ? "Your choices below are applied" : "Everything is visible";
  settingsList.classList.toggle("is-off", !state.master);

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

document.querySelectorAll('input[name="master"]').forEach(input => {
  input.addEventListener("change", () => update({ master: input.value === "on" }));
});

YTND.FEATURES.forEach(key => {
  document.getElementById(key).addEventListener("change", event => {
    update({ [key]: event.target.checked });
  });
});

document.querySelectorAll('input[name="theme"]').forEach(input => {
  input.addEventListener("change", () => update({ theme: input.value }));
});

// Accordion: one section open at a time (the four settings and Safety).

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

document.getElementById("version").textContent = "v" + chrome.runtime.getManifest().version;

YTND.load().then(settings => {
  state = settings;
  render();
});
