import { readFile } from "node:fs/promises";

const CARD_VERSION = "1.0.4";
const [coreSource, outputs, zoneGroups, renderScheduler, distribution] = await Promise.all([
  readFile("src/ha-spc-flexc-card.js", "utf8"),
  readFile("src/spc-flexc-outputs.js", "utf8"),
  readFile("src/spc-flexc-zone-groups.js", "utf8"),
  readFile("src/spc-flexc-render-scheduler.js", "utf8"),
  readFile("ha-spc-flexc-card.js", "utf8"),
]);

const core = coreSource.replace(
  /^const CARD_VERSION = "[^"]+";/,
  `const CARD_VERSION = "${CARD_VERSION}";`
);
const source = `${core.trimEnd()}\n\n${outputs.trim()}\n\n${zoneGroups.trim()}\n\n${renderScheduler.trimStart()}`;

if (source !== distribution) {
  console.error(
    "ha-spc-flexc-card.js is out of date. Run: npm run build"
  );
  process.exit(1);
}

console.log(`Distribution file v${CARD_VERSION} is up to date.`);
