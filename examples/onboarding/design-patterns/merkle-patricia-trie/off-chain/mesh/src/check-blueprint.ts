import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { blueprintHash, blueprintManifest, sourceHash } from "./lib/blueprint-source.ts";

const recorded = JSON.parse(readFileSync(blueprintManifest, "utf8"));
assert.equal(sourceHash(), recorded.source, "Aiken sources changed: run npm run compile, then npm run bench");
assert.equal(blueprintHash(), recorded.blueprint, "bundled blueprint changed: run npm run compile, then npm run bench");
