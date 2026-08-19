// #region file
import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { vaultScriptCbor } from "./blueprint.ts";
import { recoverRedeemer } from "./datum.ts";

/// Take the funds out through the **backup key** instead of the owner's.
///
/// Compare this with `unlock.ts` and only one line differs: the redeemer says
/// `Recover` rather than `Unlock`. Everything else is the same, because the two
/// paths spend the same UTxO at the same address, carrying the same script.
///
/// What changes is which signature the validator then looks for. `Unlock` checks
/// the datum's owner; `Recover` checks the key built into the script. So this
/// must be signed by the recovery wallet, not the owner's.
export async function buildRecoverTx(
  wallet: IWallet,
  provider: IFetcher,
  lockedUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside it. Note this is the *backup* wallet's, not the owner's
  // whichever wallet you handed in is the one whose signature this asks for.
  const recovery = deserializeAddress(changeAddress).pubKeyHash;
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
    // #region recover-redeemer
    // **The one line that differs from `unlock.ts`**: `Recover`, not `Unlock`.
    // This is what tells the validator which of its two branches to take.
    .txInRedeemerValue(recoverRedeemer)
    // And so the signature it looks for is the recovery key's.
    .requiredSignerHash(recovery)
    // #endregion recover-redeemer
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
