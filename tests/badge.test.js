// Badge ✕ turns the badge setting off (with a 5 s undo window), and Undo turns it back on.
const fs = require("fs"), path = require("path");
const { JSDOM } = require("jsdom");
const EXT = path.resolve(__dirname, "../extension");
const read = f => fs.readFileSync(path.join(EXT, f), "utf8");
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));
let failures = 0;
const check = (name, ok, extra = "") => { console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`); if (!ok) failures++; };

(async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body></body></html>`, { url: "https://www.youtube.com/", runScripts: "outside-only", pretendToBeVisual: true });
  const win = dom.window;
  // Test-only: open the closed shadow root so the test can click inside the badge
  const attach = win.Element.prototype.attachShadow;
  let shadow;
  win.Element.prototype.attachShadow = function () { shadow = attach.call(this, { mode: "open" }); return shadow; };
  const sync = {}, local = {}, listeners = [];
  const area = (store, name) => ({
    async get(keys) {
      if (typeof keys === "string") return keys in store ? { [keys]: store[keys] } : {};
      if (Array.isArray(keys)) return Object.fromEntries(keys.filter(k => k in store).map(k => [k, store[k]]));
      return Object.fromEntries(Object.entries(keys).map(([k, d]) => [k, k in store ? store[k] : d]));
    },
    async set(p) { Object.assign(store, p); listeners.forEach(l => l({}, name)); },
    async remove() {}
  });
  win.chrome = { storage: { sync: area(sync, "sync"), local: area(local, "local"), onChanged: { addListener: l => listeners.push(l) } }, runtime: { onMessage: { addListener() {} } } };
  win.eval(["settings.js", "badge.js", "content.js"].map(read).join("\n;\n"));
  await tick(30);

  const host = win.document.querySelector("ytnd-badge");
  const $ = sel => shadow.querySelector(sel);
  check("badge shown at start", host && !host.hidden);
  $(".close").click();
  await tick(30);
  check("✕ saves badge: false", sync.badge === false);
  check("badge stays during undo window", !host.hidden);
  check("undo message shown", $(".title").textContent === "Badge hidden" && $(".action").textContent === "Undo", $(".title").textContent);
  check("✕ hidden during undo", $(".close").hidden);

  $(".action").click();
  await tick(30);
  check("Undo saves badge: true", sync.badge === true);
  check("back to normal after undo", $(".title").textContent === "Tucked away" && !host.hidden, $(".title").textContent);

  $(".close").click();
  await tick(5200);
  check("after 5 s the badge is gone", host.hidden);
  check("setting stays off", sync.badge === false);
  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
