import { MeshTxBuilder, deserializeAddress, mConStr0 } from "@meshsdk/core";
import type { IFetcher } from "@meshsdk/core";

import { mintScriptCbor, tokenPolicyId } from "./blueprint.ts";
import type { Wallet } from "./wallet.ts";

// #region mint
/// Build an unsigned transaction that mints `quantity` of a token named
/// `assetNameHex` under the connected wallet's own minting policy. The minted
/// token lands back in the wallet as change.
export async function buildMintTx(
  wallet: Wallet,
  provider: IFetcher,
  assetNameHex: string,
  quantity: string,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const owner = deserializeAddress(changeAddress).pubKeyHash;
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) throw new Error("wallet has no collateral UTxO");

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    .mintPlutusScriptV3()
    .mint(quantity, tokenPolicyId(owner), assetNameHex)
    .mintingScript(mintScriptCbor(owner))
    .mintRedeemerValue(mConStr0([]))
    .requiredSignerHash(owner)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
// #endregion mint
