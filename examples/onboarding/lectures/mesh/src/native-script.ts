import { resolveNativeScriptHash } from "@meshsdk/core";
import type { NativeScript } from "@meshsdk/core";

// #region native-script
/// The same "both keys must sign" rule, built in code. A native script is just
/// data, so you assemble it like any object, no smart-contract language. Hashing
/// it gives the script hash: the very same value that becomes a minting policy id
/// or a script address.
export function bothMustSign(
  keyHashA: string,
  keyHashB: string,
): { script: NativeScript; hash: string } {
  const script: NativeScript = {
    type: "all", // every listed rule must hold ("any" or "atLeast" relax this)
    scripts: [
      { type: "sig", keyHash: keyHashA }, // this key must sign
      { type: "sig", keyHash: keyHashB },
    ],
  };

  return { script, hash: resolveNativeScriptHash(script) };
}
// #endregion native-script
