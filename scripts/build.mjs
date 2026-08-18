import { copyFile, mkdir } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await copyFile("src/ha-spc-flexc-card.js", "dist/ha-spc-flexc-card.js");
console.log("Built dist/ha-spc-flexc-card.js");
