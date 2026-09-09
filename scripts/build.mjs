import { readFile, writeFile } from "node:fs/promises";

const sources = await Promise.all([
  readFile("src/ha-spc-flexc-card.js", "utf8"),
  readFile("src/spc-flexc-outputs.js", "utf8"),
]);

await writeFile(
  "ha-spc-flexc-card.js",
  `${sources[0].trimEnd()}\n\n${sources[1].trimStart()}`,
  "utf8"
);

console.log("Built ha-spc-flexc-card.js");
