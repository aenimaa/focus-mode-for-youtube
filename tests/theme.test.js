// theme.js, the site's shared Light / Dark / System switch.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const code = fs.readFileSync(path.resolve(__dirname, "../theme.js"), "utf8");
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!ok) failures++;
};

const SWITCH = ["light", "dark", "system"].map(v => `<label><input type="radio" name="theme" value="${v}"></label>`).join("");

// A page with the switch; `stored` is what localStorage holds before theme.js runs
function page(stored) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>${SWITCH}</body></html>`, { url: "https://example.test/", runScripts: "outside-only" });
  for (const [k, v] of Object.entries(stored)) dom.window.localStorage.setItem(k, v);
  dom.window.eval(code);
  return dom;
}

const radio = (doc, v) => doc.querySelector(`input[value="${v}"]`);
const ready = doc => doc.dispatchEvent(new doc.defaultView.Event("DOMContentLoaded"));

{
  const { window } = page({});
  const doc = window.document;
  check("nothing saved: follows the system theme", !doc.documentElement.hasAttribute("data-theme"));
  ready(doc);
  check("nothing saved: System is selected", radio(doc, "system").checked);
}

{
  const { window } = page({ "fmyt-theme": "dark" });
  const doc = window.document;
  check("saved Dark applies before the page loads", doc.documentElement.dataset.theme === "dark");
  ready(doc);
  check("saved Dark is selected in the switch", radio(doc, "dark").checked);
  const light = radio(doc, "light");
  light.checked = true;
  light.dispatchEvent(new window.Event("change"));
  check("choosing Light applies it", doc.documentElement.dataset.theme === "light");
  check("choosing Light saves it", window.localStorage.getItem("fmyt-theme") === "light");
  const system = radio(doc, "system");
  system.checked = true;
  system.dispatchEvent(new window.Event("change"));
  check("choosing System goes back to the system theme", !doc.documentElement.hasAttribute("data-theme"));
}

{
  const { window } = page({ theme: "light" });
  const doc = window.document;
  check("a choice saved under the old key still applies", doc.documentElement.dataset.theme === "light");
  ready(doc);
  const dark = radio(doc, "dark");
  dark.checked = true;
  dark.dispatchEvent(new window.Event("change"));
  check("saving moves it to the new key and clears the old one",
    window.localStorage.getItem("fmyt-theme") === "dark" && window.localStorage.getItem("theme") === null);
}

console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
process.exit(failures ? 1 : 0);
