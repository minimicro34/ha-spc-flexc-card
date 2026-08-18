import { readFile } from "node:fs/promises";

const source = await readFile(
  "src/ha-spc-flexc-card.js",
  "utf8"
);

const distribution = await readFile(
  "ha-spc-flexc-card.js",
  "utf8"
);

if (source !== distribution) {
  console.error(
    "ha-spc-flexc-card.js is out of date. Run: npm run build"
  );
  process.exit(1);
}

console.log("Distribution file is up to date.");
