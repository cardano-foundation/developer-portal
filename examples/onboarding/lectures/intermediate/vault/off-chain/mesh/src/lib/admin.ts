// #region file
import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { vaultScriptCbor } from "./blueprint.ts";
import { adminRedeemer } from "./datum.ts";

/// `unlock.ts` with one line changed. See that file for what each builder call
/// does; the difference is marked below.
export async function buildAdminUnlockTx(
  wallet: IWallet,
  provider: IFetcher,
  lockedUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The *admin* wallet's key hash. Whichever wallet you hand in is the one
  // whose signature this asks for.
  const admin = deserializeAddress(changeAddress).pubKeyHash;
  // The deposit, the same as any other spend that runs a script.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
      "Send it some test ADA and try again.",
    );
  }

  // Passing `evaluator` is what makes the contract run here, before you send.
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    // Everything that follows describes one Plutus V3 script being spent.
    .spendingPlutusScriptV3()
    // The same locked UTxO the owner would have spent.
    .txIn(
      lockedUtxo.input.txHash,
      lockedUtxo.input.outputIndex,
      lockedUtxo.output.amount,
      lockedUtxo.output.address,
    )
    // The same compiled contract, too.
    .txInScript(vaultScriptCbor)
    // The datum is already on the UTxO, so there is nothing to attach here.
    .txInInlineDatumPresent()
    // #region admin-redeemer
    // **The one line that differs from `unlock.ts`**: `AdminUnlock`, which tells the
    // validator to check the key built into the script instead of the owner.
    .txInRedeemerValue(adminRedeemer)
    // And so the signature it looks for is the admin key's.
    .requiredSignerHash(admin)
    // #endregion admin-redeemer
    // Offer the deposit found above.
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover the fee.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion file
