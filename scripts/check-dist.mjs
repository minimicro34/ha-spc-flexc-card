import { readFile } from "node:fs/promises";
const source = await readFile("src/ha-spc-flexc-card.js", "utf8");
const dist = await readFile("dist/ha-spc-flexc-card.js", "utf8");
if (source !== dist) { console.error("dist/ha-spc-flexc-card.js is out of date. Run: npm run build"); process.exit(1); }
console.log("Distribution file is up to date.");
