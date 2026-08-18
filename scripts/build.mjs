import { copyFile } from "node:fs/promises";

await copyFile(
  "src/ha-spc-flexc-card.js",
  "ha-spc-flexc-card.js"
);

console.log("Built ha-spc-flexc-card.js");