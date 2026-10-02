// Runs every *.test.js file in this folder and fails if any of them fails.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".test.js")).sort();
let failed = 0;

for (const file of files) {
  console.log(`\n=== ${file}`);
  const run = spawnSync(process.execPath, [path.join(__dirname, file)], { stdio: "inherit" });
  if (run.status !== 0) failed++;
}

console.log(`\n${files.length - failed} of ${files.length} test files passed`);
process.exit(failed ? 1 : 0);
