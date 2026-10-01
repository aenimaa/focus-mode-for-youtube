// A small, quiet badge in the bottom-left corner of YouTube. It stays dull until you hover it,
// briefly shows itself once a day, and never blocks anything. Built in a closed shadow root so
// YouTube's styles can't change it, with text set as plain text (never as HTML).
const Badge = (() => {
  const ICON = "M3 6V4.5A1.5 1.5 0 0 1 4.5 3H6M14 3h1.5A1.5 1.5 0 0 1 17 4.5V6M17 14v1.5a1.5 1.5 0 0 1-1.5 1.5H14M6 17H4.5A1.5 1.5 0 0 1 3 15.5V14";

  const STYLE = `
    :host {
      all: initial;
      position: fixed;
      left: 16px;
      bottom: 16px;
      z-index: 2100;
      font: 13px/1.35 system-ui, "Segoe UI", Roboto, Arial, sans-serif;
      --bg: #ffffff;
      --text: #0f0f0f;
      --muted: #606060;
      --line: rgba(0, 0, 0, .12);
      --accent: #e0002e;
      --focus: #065fd4;
    }
    :host([data-dark]) {
      --bg: #212121;
      --text: #f1f1f1;
      --muted: #aaaaaa;
      --line: rgba(255, 255, 255, .16);
      --focus: #3ea6ff;
    }
    :host([hidden]) { display: none; }
    .wrap { display: flex; align-items: center; gap: 8px; opacity: .35; transition: opacity .2s; }
    .wrap:hover, .wrap:focus-within, .wrap.peek, .wrap.open, .wrap.undo { opacity: 1; }
    button { font: inherit; cursor: pointer; }
    button:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
    .mark {
      display: grid; place-items: center; width: 32px; height: 32px; padding: 0;
      border: 1px solid var(--line); border-radius: 50%;
      background: var(--bg); color: var(--accent);
      box-shadow: 0 1px 3px rgba(0, 0, 0, .15);
    }
    .mark svg { width: 18px; height: 18px; }
    .panel {
      display: none; align-items: center; gap: 10px; padding: 5px 5px 5px 14px;
      border: 1px solid var(--line); border-radius: 999px;
      background: var(--bg); color: var(--text);
      box-shadow: 0 2px 8px rgba(0, 0, 0, .18);
    }
    .wrap:hover .panel, .wrap:focus-within .panel, .wrap.peek .panel, .wrap.open .panel, .wrap.undo .panel { display: flex; }
    .text { display: flex; flex-direction: column; }
    .title { font-weight: 600; }
    .sub { color: var(--muted); font-size: 12px; }
    .action {
      padding: 6px 12px; border: 0; border-radius: 999px;
      background: var(--accent); color: #ffffff; font-weight: 600;
    }
    .close {
      display: grid; place-items: center; width: 28px; height: 28px; padding: 0;
      border: 0; border-radius: 50%; background: none; color: var(--muted); font-size: 13px;
    }
    .close:hover { background: var(--line); }
    .close[hidden] { display: none; }
    @media (prefers-reduced-motion: reduce) { .wrap { transition: none; } }
  `;

  const UNDO_MS = 5000;
  let host = null;
  let ui = null;
  let latest = null;
  // After ✕, the badge stays a few seconds to offer Undo before it goes
  let undoUntil = 0;
  let undoTimer = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function icon() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("aria-hidden", "true");
    const frame = document.createElementNS(ns, "path");
    frame.setAttribute("d", ICON);
    frame.setAttribute("fill", "none");
    frame.setAttribute("stroke", "currentColor");
    frame.setAttribute("stroke-width", "2");
    frame.setAttribute("stroke-linecap", "round");
    const play = document.createElementNS(ns, "path");
    play.setAttribute("d", "M8 6.8v6.4l5.2-3.2z");
    play.setAttribute("fill", "currentColor");
    svg.append(frame, play);
    return svg;
  }

  function build() {
    // A custom element name, so no YouTube style written for divs can reach it
    host = document.createElement("ytnd-badge");
    const shadow = host.attachShadow({ mode: "closed" });
    const style = el("style");
    style.textContent = STYLE;

    const wrap = el("div", "wrap");
    const mark = el("button", "mark");
    mark.type = "button";
    mark.setAttribute("aria-label", "No Distractions for YouTube");
    mark.append(icon());

    const panel = el("div", "panel");
    const text = el("div", "text");
    const title = el("span", "title");
    const sub = el("span", "sub");
    text.append(title, sub);
    const action = el("button", "action");
    action.type = "button";
    const close = el("button", "close", "✕");
    close.type = "button";
    close.setAttribute("aria-label", "Hide the badge");
    close.title = "Hide the badge. You can turn it back on in the extension's popup.";
    panel.append(text, action, close);
    wrap.append(mark, panel);
    shadow.append(style, wrap);

    mark.addEventListener("click", () => wrap.classList.toggle("open"));
    action.addEventListener("click", () => {
      if (undoUntil > Date.now()) {
        undoUntil = 0;
        clearTimeout(undoTimer);
        YTND.save({ badge: true });
      } else if (latest?.master) {
        YTND.save({ master: false, pausedUntil: Date.now() + 15 * 60 * 1000 });
      } else {
        YTND.save({ master: true, pausedUntil: 0 });
      }
    });

    // ✕ turns the badge off for good (the popup's switch follows), with a moment to undo
    close.addEventListener("click", () => {
      undoUntil = Date.now() + UNDO_MS;
      clearTimeout(undoTimer);
      undoTimer = setTimeout(() => update(latest), UNDO_MS + 50);
      YTND.save({ badge: false });
    });

    ui = { wrap, title, sub, action, close };
    document.body.append(host);
    syncTheme();
  }

  function render(settings) {
    const undoing = !settings.badge && undoUntil > Date.now();
    ui.close.hidden = undoing;
    ui.wrap.classList.toggle("undo", undoing);
    if (undoing) {
      ui.title.textContent = "Badge hidden";
      ui.sub.textContent = "Turn it back on in the popup";
      ui.action.textContent = "Undo";
      return;
    }
    if (settings.master) {
      const count = YTND.FEATURES.filter(key => settings[key]).length;
      ui.title.textContent = "Tucked away";
      ui.sub.textContent = `${count} ${count === 1 ? "section is" : "sections are"} out of sight`;
      ui.action.textContent = "Pause 15 min";
    } else {
      const paused = settings.pausedUntil > Date.now();
      ui.title.textContent = paused ? "Paused" : "YouTube as usual";
      ui.sub.textContent = paused ? YTND.backAt(settings.pausedUntil) : "Everything is showing";
      ui.action.textContent = paused ? "Turn back on" : "Tuck away again";
    }
  }

  // Once a day, show the badge open for a few seconds
  async function peekOncePerDay() {
    const today = new Date().toDateString();
    const { lastPeek } = await chrome.storage.local.get("lastPeek");
    if (lastPeek === today) return;
    await chrome.storage.local.set({ lastPeek: today });
    ui.wrap.classList.add("peek");
    setTimeout(() => ui.wrap.classList.remove("peek"), 4000);
  }

  function syncTheme() {
    if (host) host.toggleAttribute("data-dark", document.documentElement.hasAttribute("dark"));
  }

  function update(settings) {
    latest = settings;
    const undoing = !settings.badge && undoUntil > Date.now();
    if (!settings.badge && !undoing) {
      if (host) host.hidden = true;
      return;
    }
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => update(latest), { once: true });
      return;
    }
    const first = !host;
    if (first) build();
    host.hidden = Boolean(document.fullscreenElement);
    render(settings);
    if (first) peekOncePerDay().catch(() => {});
  }

  document.addEventListener("fullscreenchange", () => {
    if (host) host.hidden = !latest?.badge || Boolean(document.fullscreenElement);
  });

  return { update, syncTheme };
})();
