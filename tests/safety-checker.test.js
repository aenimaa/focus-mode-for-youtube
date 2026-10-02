// The safety checker (tools/safety-check.html): this extension must come out clean, and a deliberately
// risky one (tests/fixtures/risky-extension) must be caught.
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.resolve(__dirname, "..");
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  — " + extra : ""}`);
  if (!ok) failures++;
};

// Load the checker's own script into a page, so the test runs the real code
const page = fs.readFileSync(path.join(ROOT, "tools/safety-check.html"), "utf8");
const dom = new JSDOM(page.replace(/<script src="[^"]*"><\/script>/g, ""), { runScripts: "outside-only" });
const script = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
dom.window.eval(script);
const { scopeToExtension, checkManifest, checkCode, checkApis } = dom.window;

// The same { path, file } shape the page builds from a picked folder
function walk(dir, base = "") {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const rel = base + entry.name, full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, rel + "/");
    const buf = fs.readFileSync(full);
    return [{ path: rel, file: { size: buf.length, text: async () => buf.toString("utf8"), arrayBuffer: async () => buf } }];
  });
}

async function scan(folder) {
  const scoped = scopeToExtension(walk(folder));
  const manifest = JSON.parse(await scoped.files.find(f => f.path === "manifest.json").file.text());
  const findings = [...checkManifest(manifest), ...await checkCode(scoped.files), ...await checkApis(scoped.files, manifest)];
  return { base: scoped.base, findings };
}

const flagged = findings => findings.filter(([level]) => level === "warn" || level === "fail");
const has = (findings, level, text) => findings.some(([l, title]) => l === level && title.includes(text));

(async () => {
  // Picking the whole repo should scan just the extension folder
  const ours = await scan(ROOT);
  check("scans the extension folder when given the whole repo", ours.base === "extension/", ours.base);
  check("this extension: no warnings or risks", flagged(ours.findings).length === 0,
    flagged(ours.findings).map(f => f[1]).join("; "));
  check("this extension: only the storage permission", has(ours.findings, "pass", "Permission: storage") &&
    ours.findings.filter(([, t]) => t.startsWith("Permission:")).length === 1);
  check("this extension: no network calls or hidden code", has(ours.findings, "pass", "No network calls"));

  const risky = await scan(path.join(__dirname, "fixtures/risky-extension"));
  const expected = [
    ["fail", "Access to every website"],
    ["warn", "Permission: cookies"],
    ["warn", "Permission: tabs"],
    ["warn", "Network request (fetch)"],
    ["fail", "Runs text as code (eval)"],
    ["warn", "Decodes hidden text (atob)"],
    ["fail", "Loads a script from the internet"],
    ["warn", "chrome.cookies"]
  ];
  for (const [level, text] of expected) check(`risky extension: ${level} "${text}"`, has(risky.findings, level, text));
  check("risky extension: at least 10 flags", flagged(risky.findings).length >= 10, `${flagged(risky.findings).length} flags`);

  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
