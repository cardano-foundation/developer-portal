import { execFileSync } from "node:child_process";
import { copyFileSync, writeFileSync } from "node:fs";
import { blueprintHash, blueprintManifest, bundledBlueprint, onChain, onChainPath, sourceHash } from "./lib/blueprint-source.ts";

execFileSync("aiken", ["build"], { cwd: onChainPath, stdio: "inherit" });
copyFileSync(new URL("plutus.json", onChain), bundledBlueprint);
writeFileSync(blueprintManifest, `${JSON.stringify({ source: sourceHash(), blueprint: blueprintHash() }, null, 2)}\n`);
console.log("updated the blueprint and source fingerprint");
