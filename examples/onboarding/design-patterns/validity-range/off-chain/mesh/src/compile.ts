import { execFileSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const onChain = new URL("../../../on-chain/aiken/", import.meta.url);
execFileSync("aiken", ["build"], { cwd: fileURLToPath(onChain), stdio: "inherit" });
copyFileSync(new URL("plutus.json", onChain), new URL("../blueprints/validity-range.plutus.json", import.meta.url));
