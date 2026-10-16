// #region file
import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { vaultScriptCbor } from "./blueprint.ts";
import { unlockRedeemer } from "./datum.ts";

/// Build a transaction that **unlocks** `lockedUtxo`. This is where the contract
/// runs: the network hands the validator the datum, the redeemer and the
/// transaction, and only lets the spend through if the owner signed.
///
/// Pass an `evaluator` to run the validator here, before anything is sent.
export async function buildUnlockTx(
  wallet: IWallet,
  provider: IFetcher,
  lockedUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside it, the same one the datum recorded when you locked.
  const owner = deserializeAddress(changeAddress).pubKeyHash;
  // The deposit. Any UTxO of yours will do; the network only takes it if the
  // script fails in a way the pre-flight did not predict.
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
    // The locked UTxO to spend: which transaction made it, which output it was,
    // what it holds, and the address it sits at.
    .txIn(
      lockedUtxo.input.txHash,
      lockedUtxo.input.outputIndex,
      lockedUtxo.output.amount,
      lockedUtxo.output.address,
    )
    // Carry the compiled contract, so the network has the code to run.
    .txInScript(vaultScriptCbor)
    // The datum is already on the UTxO, so there is nothing to attach here.
    .txInInlineDatumPresent()
    // The action you are asking for: `Unlock`.
    .txInRedeemerValue(unlockRedeemer)
    // Put your key hash in `extra_signatories`, exactly the list the rule reads.
    // Leave this out and a correct contract refuses a legitimate spend.
    .requiredSignerHash(owner)
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
