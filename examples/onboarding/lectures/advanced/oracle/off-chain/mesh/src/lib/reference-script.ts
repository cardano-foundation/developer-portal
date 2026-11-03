import { MeshTxBuilder, mConStr0 } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { beaconPolicyId, consumerScriptCbor, consumerScriptHash, neverAddress } from "./blueprint.ts";
import type { Deployment } from "./oracle.ts";
import { readOracle } from "./reference-input.ts";
import { feeUtxo, spendableUtxos } from "./spendable.ts";

/// Park the consumer's compiled code in a UTxO, once, where it stays.
///
/// The Intermediate version sent it to your own address, where one careless
/// transaction of yours could spend it and break every unlock that points at
/// it. This one sends it to `never`, the address nothing can be spent from. The
/// ADA beside it is locked there for good too, so the output carries no amount
/// of its own, and the builder gives it the least the ledger accepts for an
/// output that size.
// #region publish-reference-script
export async function buildPublishConsumerScriptTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const policyId = beaconPolicyId(deployment.seed);

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // An output at `never`, with no amount: the builder fills in the minimum.
    .txOut(neverAddress(networkId), [])
    // Attach the compiled contract to that output.
    .txOutReferenceScript(consumerScriptCbor(policyId), "V3")
    .changeAddress(changeAddress)
    .selectUtxosFrom(await spendableUtxos(wallet))
    .complete();
}
// #endregion publish-reference-script

/// Find the UTxO the script was published into. Anyone may park a script at
/// `never`, so the script's hash is what tells this one apart.
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

  // One of your own UTxOs pays the fee, exactly as in the ordinary unlock.
  const utxos = await spendableUtxos(wallet);
  const feeInput = feeUtxo(utxos, collateral);

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
      .spendingReferenceTxInRedeemerValue(mConStr0([]))
      .txIn(
        feeInput.input.txHash,
        feeInput.input.outputIndex,
        feeInput.output.amount,
        feeInput.output.address,
      ),
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
    .selectUtxosFrom(utxos)
    .complete();
}
// #endregion spend-via-reference
