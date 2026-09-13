import { readFile, writeFile } from "node:fs/promises";

const CARD_VERSION = "1.0.5";
const sources = await Promise.all([
  readFile("src/ha-spc-flexc-card.js", "utf8"),
  readFile("src/spc-flexc-outputs.js", "utf8"),
  readFile("src/spc-flexc-zone-groups.js", "utf8"),
  readFile("src/spc-flexc-i18n.js", "utf8"),
  readFile("src/spc-flexc-area-cards.js", "utf8"),
  readFile("src/spc-flexc-xbus.js", "utf8"),
  readFile("src/spc-flexc-responsive.js", "utf8"),
  readFile("src/spc-flexc-render-scheduler.js", "utf8"),
]);

const core = sources[0].replace(
  /^const CARD_VERSION = "[^"]+";/,
  `const CARD_VERSION = "${CARD_VERSION}";`
);

await writeFile(
  "ha-spc-flexc-card.js",
  `${core.trimEnd()}\n\n${sources[1].trim()}\n\n${sources[2].trim()}\n\n${sources[3].trim()}\n\n${sources[4].trim()}\n\n${sources[5].trim()}\n\n${sources[6].trim()}\n\n${sources[7].trimStart()}`,
  "utf8"
);

console.log(`Built ha-spc-flexc-card.js v${CARD_VERSION}`);
