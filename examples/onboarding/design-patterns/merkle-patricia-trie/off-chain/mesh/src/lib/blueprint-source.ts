import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const onChain = new URL("../../../../on-chain/aiken/", import.meta.url);
export const bundledBlueprint = new URL("../../blueprints/merkle-patricia-trie.plutus.json", import.meta.url);
export const blueprintManifest = new URL("../../blueprints/source.json", import.meta.url);

function aikenFiles(directory: string): string[] {
  return readdirSync(new URL(directory, onChain), { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}${entry.name}`;
    return entry.isDirectory() ? aikenFiles(`${path}/`) : entry.name.endsWith(".ak") ? [path] : [];
  });
}

export function sourceHash(): string {
  const hash = createHash("sha256");
  for (const path of ["aiken.toml", "aiken.lock", ...aikenFiles("lib/"), ...aikenFiles("validators/")].sort()) {
    hash.update(path).update("\0").update(readFileSync(new URL(path, onChain))).update("\0");
  }
  return hash.digest("hex");
}

export function blueprintHash(): string {
  return createHash("sha256").update(readFileSync(bundledBlueprint)).digest("hex");
}

export const onChainPath = fileURLToPath(onChain);
