import { writeFileSync } from "node:fs";
import { measureAll } from "./lib/costs.ts";

writeFileSync(new URL("../costs.json", import.meta.url), JSON.stringify(await measureAll(), null, 2) + "\n");
console.log("Wrote costs.json: inline/reference purchases and cancels, setup, batch limits, and wide deployment.");
