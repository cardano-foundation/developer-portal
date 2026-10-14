import { writeFileSync } from "node:fs";
import { measureAll } from "./lib/costs.ts";

// Measure every sweep and write the figures to `costs.json`, which the docs
// page reads. `npm test` measures again and fails if this file is out of date,
// so run `npm run bench` after any change to a validator or a builder.

const costs = await measureAll();
writeFileSync(new URL("../costs.json", import.meta.url), `${JSON.stringify(costs, null, 2)}\n`);
console.log("wrote costs.json");
