import { MeshTxBuilder, ForgeScript, resolveScriptHash, stringToHex } from "@meshsdk/core";
import type { BrowserWallet } from "@meshsdk/core";

// #region mint-token
/// Mint `quantity` of a native token called `name`, using only the connected
/// wallet. A "minting policy" is the rule for who may create (or destroy) a
/// token. Here we use the simplest one: a native script that requires *your*
/// wallet's signature. Hashing that policy gives the token's **policy id**, the
/// unique namespace that makes your token distinct from anyone else's, even one
/// with the same name.
export async function mintToken(
  wallet: BrowserWallet,
  name: string,
  quantity: string,
): Promise<string> {
  const address = await wallet.getChangeAddress();

  const policyScript = ForgeScript.withOneSignature(address); // "only my key may mint"
  const policyId = resolveScriptHash(policyScript); // hash of the policy = the policy id
  const tokenNameHex = stringToHex(name); // asset names are stored as hex

  // Build: mint the tokens, with no explicit output they land back in your
  // wallet as change (which also gets the required min-ADA automatically).
  const unsignedTx = await new MeshTxBuilder()
    .mint(quantity, policyId, tokenNameHex) // create the tokens...
    .mintingScript(policyScript) // ...and prove the policy allows it
    .changeAddress(address)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  // Sign (this also satisfies the policy, since it needs your key) and submit.
  const signedTx = await wallet.signTx(unsignedTx);
  return await wallet.submitTx(signedTx);
}
// #endregion mint-token
