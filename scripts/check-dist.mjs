import { readFile } from "node:fs/promises";

const [core, outputs, distribution] = await Promise.all([
  readFile("src/ha-spc-flexc-card.js", "utf8"),
  readFile("src/spc-flexc-outputs.js", "utf8"),
  readFile("ha-spc-flexc-card.js", "utf8"),
]);

const source = `${core.trimEnd()}\n\n${outputs.trimStart()}`;

if (source !== distribution) {
  console.error(
    "ha-spc-flexc-card.js is out of date. Run: npm run build"
  );
  process.exit(1);
}

console.log("Distribution file is up to date.");
