import { writeFileSync } from "node:fs";
import { measureAll } from "./lib/costs.ts";

writeFileSync(new URL("../costs.json", import.meta.url), JSON.stringify(await measureAll(), null, 2) + "\n");
console.log("Wrote costs.json: claim costs, proof sizes, publication costs, and list publication limit.");
