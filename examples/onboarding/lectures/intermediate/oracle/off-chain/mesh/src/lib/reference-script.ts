import { MeshTxBuilder, mConStr0 } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { beaconPolicyId, consumerScriptCbor, consumerScriptHash } from "./blueprint.ts";
import type { Deployment } from "./oracle.ts";
import { readOracle } from "./reference-input.ts";

/// Park the consumer's compiled code in a UTxO, once.
///
/// Until now every spend carried the whole script inside the transaction.
/// Attaching it here instead publishes it: later transactions can point at this
/// output rather than shipping the code again, so they get smaller and cheaper.
/// The UTxO is an ordinary one at your own address, and the ADA in it stays
/// yours.
// #region publish-reference-script
export async function buildPublishConsumerScriptTx(
  wallet: IWallet,
  provider: IFetcher,
  deployment: Deployment,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  const policyId = beaconPolicyId(deployment.seed);

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // An output back to yourself. The ADA stays yours; it is only here because
    // every UTxO needs enough to cover what it carries, and this one is bulky.
    .txOut(changeAddress, [{ unit: "lovelace", quantity: "10000000" }])
    // Attach the compiled contract to that output. This is the publishing step:
    // from now on a transaction can point here instead of carrying the code.
    .txOutReferenceScript(consumerScriptCbor(policyId), "V3")
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion publish-reference-script

/// Find the UTxO the script was published into. It sits at your own address
/// among your ordinary UTxOs, and the script's hash is what tells it apart.
export async function fetchPublishedConsumerScript(
  provider: IFetcher,
  address: string,
  deployment: Deployment,
): Promise<UTxO | undefined> {
  const hash = consumerScriptHash(beaconPolicyId(deployment.seed));
  const utxos = await provider.fetchAddressUTxOs(address);
  return utxos.find((utxo) => utxo.output.scriptHash === hash);
}

/// Unlock the consumer without carrying its code.
///
/// Compare this with `buildConsumerSpendTx`: `.txInScript(...)` is gone,
/// replaced by a pointer to the UTxO the script was published into. The network
/// reads the code from there. Everything else, the oracle attached for reading,
/// the redeemer, the collateral, is unchanged, and so is the answer the
/// validator gives.
// #region spend-via-reference
export async function buildConsumerSpendViaReferenceTx(
  wallet: IWallet,
  provider: IFetcher,
  deployment: Deployment,
  lockedUtxo: UTxO,
  oracleUtxo: UTxO,
  scriptUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const policyId = beaconPolicyId(deployment.seed);
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
  const withOracle = readOracle(
    txBuilder
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
      // travels in this transaction, which is the whole saving. The size and
      // hash let the builder price the fee for the referenced bytes.
      .spendingTxInReference(
        scriptUtxo.input.txHash,
        scriptUtxo.input.outputIndex,
        (consumerScriptCbor(policyId).length / 2).toString(),
        consumerScriptHash(policyId),
      )
      // The datum is still inline on the UTxO being spent.
      .spendingReferenceTxInInlineDatumPresent()
      // The same redeemer as before, named for the referenced-script form.
      .spendingReferenceTxInRedeemerValue(mConStr0([])),
    // The oracle, attached for reading only, exactly as before.
    oracleUtxo,
  );

  return await withOracle
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
// #endregion spend-via-reference
