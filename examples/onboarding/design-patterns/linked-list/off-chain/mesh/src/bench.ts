import { writeFileSync } from "node:fs";
import { measureAll } from "./lib/costs.ts";

const costs = await measureAll();
writeFileSync(new URL("../costs.json", import.meta.url), JSON.stringify(costs, null, 2) + "\n");
console.log("Wrote costs.json: registry mutations, reference proofs, and single-datum insertion limit.");
