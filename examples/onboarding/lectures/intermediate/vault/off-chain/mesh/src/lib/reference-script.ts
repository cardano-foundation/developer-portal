import { MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { unlockRedeemer } from "./datum.ts";

/// Park a contract's compiled code in a UTxO, once.
///
/// Until now every spend carried the whole script inside the transaction.
/// Attaching it here instead publishes it: later transactions can point at this
/// output rather than shipping the code again, so they get smaller and cheaper.
/// The UTxO is an ordinary one at your own address, and the ADA in it stays
/// yours.
// #region deploy-reference-script
export async function buildDeployReferenceScriptTx(
  wallet: IWallet,
  provider: IFetcher,
  scriptCbor: string,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // An output back to yourself. The ADA stays yours; it is only here because
    // every UTxO needs enough to cover what it carries, and this one is bulky.
    .txOut(changeAddress, [{ unit: "lovelace", quantity: "10000000" }])
    // Attach the compiled contract to that output. This is the publishing step:
    // from now on a transaction can point here instead of carrying the code.
    .txOutReferenceScript(scriptCbor, "V3")
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion deploy-reference-script

/// Unlock the vault without carrying its code.
///
/// Compare this with the vault's own unlock: `.txInScript(scriptCbor)` is gone,
/// replaced by a pointer to the UTxO the script was deployed into. The network
/// reads the code from there. Everything else, redeemer, signature, collateral,
/// is unchanged, and so is the answer the validator gives.
// #region spend-via-reference
export async function buildUnlockViaReferenceTx(
  wallet: IWallet,
  provider: IFetcher,
  lockedUtxo: UTxO,
  deployTxHash: string,
  deployOutputIndex: number,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside it, the owner the datum recorded when you locked.
  const owner = deserializeAddress(changeAddress).pubKeyHash;
  // The deposit. Pointing at the code instead of carrying it changes nothing here.
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
    // The locked UTxO to spend, exactly as in the ordinary unlock.
    .txIn(
      lockedUtxo.input.txHash,
      lockedUtxo.input.outputIndex,
      lockedUtxo.output.amount,
      lockedUtxo.output.address,
    )
    // **In place of `.txInScript(...)`**: point at the UTxO the code was
    // published into. The network reads the script from there, so it never
    // travels in this transaction, which is the whole saving.
    .spendingTxInReference(deployTxHash, deployOutputIndex)
    // The datum is still inline on the UTxO being spent.
    .spendingReferenceTxInInlineDatumPresent()
    // The same redeemer as before, named for the referenced-script form.
    .spendingReferenceTxInRedeemerValue(unlockRedeemer)
    // The same signature the validator has always looked for.
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
// #endregion spend-via-reference
