// The content scripts (settings, pause, corner badge, page types) and the popup, run in jsdom with a fake chrome.* API.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const EXT = path.resolve(__dirname, "../extension");
const read = f => fs.readFileSync(path.join(EXT, f), "utf8");
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!ok) failures++;
};

function fakeChrome(initialSync = {}) {
  const sync = { ...initialSync };
  const local = {};
  const listeners = [];
  const messageListeners = [];
  const area = (store, name) => ({
    async get(keys) {
      if (keys === null || keys === undefined) return { ...store };
      if (Array.isArray(keys)) return Object.fromEntries(keys.filter(k => k in store).map(k => [k, store[k]]));
      if (typeof keys === "string") return keys in store ? { [keys]: store[keys] } : {};
      return Object.fromEntries(Object.entries(keys).map(([k, d]) => [k, k in store ? store[k] : d]));
    },
    async set(patch) {
      const changes = {};
      for (const [k, v] of Object.entries(patch)) { changes[k] = { oldValue: store[k], newValue: v }; store[k] = v; }
      listeners.forEach(l => l(changes, name));
    },
    async remove(keys) { [].concat(keys).forEach(k => delete store[k]); }
  });
  return {
    sync, local,
    api: {
      storage: { sync: area(sync, "sync"), local: area(local, "local"), onChanged: { addListener: l => listeners.push(l) } },
      runtime: { onMessage: { addListener: l => messageListeners.push(l) }, getManifest: () => JSON.parse(read("manifest.json")) },
      tabs: {
        query: async () => [{ id: 7 }],
        sendMessage: async (id, msg) => new Promise(resolve => messageListeners.forEach(l => l(msg, {}, resolve)))
      }
    },
    messageListeners
  };
}

async function contentPage(url, initialSync, { darkAttr = false } = {}) {
  const dom = new JSDOM(`<!doctype html><html${darkAttr ? " dark" : ""}><head></head><body></body></html>`, { url, runScripts: "outside-only", pretendToBeVisual: true });
  const fake = fakeChrome(initialSync);
  dom.window.chrome = fake.api;
  dom.window.eval(["settings.js", "badge.js", "content.js"].map(read).join(String.fromCharCode(10, 59, 10)));
  await tick(20);
  return { dom, fake, win: dom.window, doc: dom.window.document };
}

const badgeText = win => {
  // The shadow root is closed, so read the text through jsdom's internals-free route: re-open via a test hook.
  const host = win.document.querySelector("ytnd-badge");
  return host;
};

(async () => {
  // 1. Defaults: everything tucked away, badge built, peek recorded
  {
    const { doc, fake, win } = await contentPage("https://www.youtube.com/watch?v=x", {});
    check("defaults: no feature switched off", doc.documentElement.getAttribute("data-ytnd-off") === "");
    const host = doc.querySelector("ytnd-badge");
    check("badge element added to the page", Boolean(host));
    check("badge visible by default", host && !host.hidden);
    check("daily peek recorded once", fake.local.lastPeek === new win.Date().toDateString());
    // Page type for the report link
    const reply = await new Promise(r => fake.messageListeners.forEach(l => l({ type: "pageType" }, {}, r)));
    check("page type on a video page", reply === "Video page", reply);
    win.close();
  }

  // 2. Master off: every feature listed as off
  {
    const { doc, win } = await contentPage("https://www.youtube.com/", { master: false });
    check("master off: all six features off", doc.documentElement.getAttribute("data-ytnd-off") === "sidebar comments shorts description endscreen explore");
    win.close();
  }

  // 3. One feature off
  {
    const { doc, win } = await contentPage("https://www.youtube.com/", { comments: false, explore: false });
    check("individual features off", doc.documentElement.getAttribute("data-ytnd-off") === "comments explore");
    win.close();
  }

  // 4. A pause that already ran out turns master back on
  {
    const { fake, win } = await contentPage("https://www.youtube.com/", { master: false, pausedUntil: Date.now() - 1000 });
    await tick(20);
    check("expired pause switches master back on", fake.sync.master === true && fake.sync.pausedUntil === 0);
    win.close();
  }

  // 5. A short pause ends on its own
  {
    const { fake, doc, win } = await contentPage("https://www.youtube.com/", { master: false, pausedUntil: Date.now() + 150 });
    check("during pause: features off", doc.documentElement.getAttribute("data-ytnd-off").split(" ").length === 6);
    await tick(300);
    check("pause timer switches master back on", fake.sync.master === true);
    await tick(20);
    check("after pause: features hidden again", doc.documentElement.getAttribute("data-ytnd-off") === "");
    win.close();
  }

  // 6. Badge setting off: no visible badge
  {
    const { doc, win } = await contentPage("https://www.youtube.com/", { badge: false });
    const host = doc.querySelector("ytnd-badge");
    check("badge off: nothing shown", !host || host.hidden);
    win.close();
  }

  // 7. Dark theme follows YouTube's html[dark]
  {
    const { doc, win } = await contentPage("https://www.youtube.com/", {}, { darkAttr: true });
    check("badge follows YouTube dark theme", doc.querySelector("ytnd-badge")?.hasAttribute("data-dark"));
    doc.documentElement.removeAttribute("dark");
    await tick(10);
    check("badge follows switch back to light", !doc.querySelector("ytnd-badge")?.hasAttribute("data-dark"));
    win.close();
  }

  // 8. The page attribute is restored if stripped
  {
    const { doc, win } = await contentPage("https://www.youtube.com/", { comments: false });
    doc.documentElement.removeAttribute("data-ytnd-off");
    await tick(10);
    check("attribute restored after being stripped", doc.documentElement.getAttribute("data-ytnd-off") === "comments");
    win.close();
  }

  // 9. Page types
  {
    const { fake, win } = await contentPage("https://www.youtube.com/@somechannel/videos", {});
    const reply = await new Promise(r => fake.messageListeners.forEach(l => l({ type: "pageType" }, {}, r)));
    check("page type on a channel page", reply === "Channel page", reply);
    win.close();
  }

  // 10. Popup
  {
    const html = read("popup.html").replace(/<script src="[^"]+"><\/script>/g, "");
    const dom = new JSDOM(html, { url: "chrome-extension://abc/popup.html", runScripts: "outside-only", pretendToBeVisual: true });
    const fake = fakeChrome({ master: false, pausedUntil: Date.now() + 60 * 60 * 1000 });
    // The popup's tab replies with a page type
    fake.messageListeners.push((msg, s, reply) => { if (msg.type === "pageType") reply("Search results"); });
    const win = dom.window;
    win.chrome = fake.api;
    win.eval(["theme-init.js", "settings.js", "popup.js"].map(read).join(String.fromCharCode(10, 59, 10)));
    await tick(30);
    const doc = win.document;
    check("popup: pause row shown while off", !doc.getElementById("pauseRow").hidden);
    check("popup: status says when it comes back", /back (tomorrow )?at/.test(doc.getElementById("masterStatus").textContent), doc.getElementById("masterStatus").textContent);
    const href = new URL(doc.getElementById("reportLink").href);
    check("popup: report link has versions", (href.searchParams.get("versions") || "").startsWith("v" + JSON.parse(read("manifest.json")).version + ", Chrome "), href.searchParams.get("versions"));
    check("popup: report link has page type only", href.searchParams.get("url") === "Search results", href.searchParams.get("url"));
    check("popup: report link never has a youtube address", !/youtube\.com/.test(href.toString()));
    check("popup: six tiles, four on the video page and two on Home", doc.querySelectorAll(".tile").length === 6 && doc.querySelectorAll("[data-tiles=watch] .tile").length === 4 && doc.querySelectorAll("[data-tiles=home] .tile").length === 2);
    check("popup: both page maps drawn", doc.querySelectorAll(".map svg").length === 2 && doc.querySelectorAll(".zone").length === 6);
    // Turn on
    const on = doc.querySelector('input[name="master"][value="on"]');
    on.checked = true;
    on.dispatchEvent(new win.Event("change"));
    await tick(10);
    check("popup: turning on clears the pause", fake.sync.master === true && fake.sync.pausedUntil === 0);
    check("popup: pause row hidden while on", doc.getElementById("pauseRow").hidden);
    // Pause chip
    doc.querySelector('[data-pause="15m"]').click();
    await tick(10);
    const mins = Math.round((fake.sync.pausedUntil - Date.now()) / 60000);
    check("popup: 15 min chip sets a 15 minute pause", fake.sync.master === false && mins === 15, `${mins} min`);
    // Tiles, map areas, counts
    const tile = doc.querySelector(".tile[data-k=comments]");
    tile.click(); await tick(10);
    check("popup: tile click switches comments off", fake.sync.comments === false && tile.getAttribute("aria-pressed") === "false");
    doc.querySelector(".zone[data-k=comments]").dispatchEvent(new win.Event("click", { bubbles: true })); await tick(10);
    check("popup: map click switches comments back on", fake.sync.comments === true);
    doc.querySelector(".tile[data-k=explore]").click(); await tick(10);
    check("popup: Home count follows", doc.querySelector("[data-count=home]").textContent === "1 of 2", doc.querySelector("[data-count=home]").textContent);
    doc.querySelector(".tile[data-k=explore]").click(); await tick(10);
    // Hover outlines the area
    tile.dispatchEvent(new win.Event("mouseenter")); 
    check("popup: hovering a tile outlines its area", doc.querySelector(".zone[data-k=comments]").classList.contains("hl"));
    // Pause and Off from the segmented control
    const pauseRadio = doc.querySelector("input[name=master][value=pause]");
    pauseRadio.checked = true; pauseRadio.dispatchEvent(new win.Event("change")); await tick(10);
    const pmins = Math.round((fake.sync.pausedUntil - Date.now()) / 60000);
    check("popup: Pause sets a 15 minute pause", fake.sync.master === false && pmins === 15 && !doc.getElementById("pauseRow").hidden, pmins + " min");
    const offRadio = doc.querySelector("input[name=master][value=off]");
    offRadio.checked = true; offRadio.dispatchEvent(new win.Event("change")); await tick(10);
    check("popup: Off clears the pause", fake.sync.master === false && fake.sync.pausedUntil === 0 && doc.getElementById("pauseRow").hidden);
    check("popup: Off greys out the pages", doc.getElementById("pages").classList.contains("inactive"));
    // Tabs
    doc.getElementById("tab-about").click();
    check("popup: About tab shows its panel", !doc.getElementById("panel-about").hidden && doc.getElementById("panel-focus").hidden);
    doc.getElementById("tab-focus").click();
    // Folding a page
    const head = doc.querySelector("[data-page=watch] .page-head");
    head.click();
    check("popup: video page folds", doc.querySelector("[data-page=watch]").classList.contains("closed") && head.getAttribute("aria-expanded") === "false");
    // Badge switch
    const badge = doc.getElementById("badge");
    badge.checked = false;
    badge.dispatchEvent(new win.Event("change"));
    await tick(10);
    check("popup: badge switch saves", fake.sync.badge === false);
    win.close();
  }

  // 11. Expired pause found when the popup opens
  {
    const html = read("popup.html").replace(/<script src="[^"]+"><\/script>/g, "");
    const dom = new JSDOM(html, { url: "chrome-extension://abc/popup.html", runScripts: "outside-only" });
    const fake = fakeChrome({ master: false, pausedUntil: Date.now() - 5000 });
    dom.window.chrome = fake.api;
    dom.window.eval(["theme-init.js", "settings.js", "popup.js"].map(read).join(String.fromCharCode(10, 59, 10)));
    await tick(30);
    check("popup: expired pause switches back on", fake.sync.master === true);
    dom.window.close();
  }

  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
