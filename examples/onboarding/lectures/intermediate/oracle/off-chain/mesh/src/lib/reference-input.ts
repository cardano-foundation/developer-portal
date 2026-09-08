import { MeshTxBuilder, mConStr0 } from "@meshsdk/core";
import type { IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { beaconPolicyId, consumerAddress, consumerScriptCbor } from "./blueprint.ts";
import type { Deployment } from "./oracle.ts";

/// Attach a UTxO the transaction only wants to **read**.
///
/// A reference input is not spent: the oracle stays exactly where it is, its
/// datum readable by the validator, and any number of transactions can consult
/// the same one at the same time. Spending it would mean only one of them could
/// win, which is the whole reason this exists.
// #region read-reference-input
export function readOracle(txBuilder: MeshTxBuilder, oracleUtxo: UTxO): MeshTxBuilder {
  return txBuilder.readOnlyTxInReference(oracleUtxo.input.txHash, oracleUtxo.input.outputIndex);
}
// #endregion read-reference-input

/// Lock some ADA at the consumer's address. A plain payment, like every lock so
/// far: no contract runs until somebody tries to take it out again.
export async function buildConsumerLockTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
  lovelace: string,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const policyId = beaconPolicyId(deployment.seed);

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    .txOut(consumerAddress(policyId, networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(mConStr0([]))
    .changeAddress(changeAddress)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}

/// Spend that UTxO, which is only allowed while the oracle's rate is positive.
///
/// The oracle is attached with `readOracle` and never spent, so this transaction
/// and any number of others can consult it in the same block. The contract finds
/// it among the reference inputs by looking for the beacon.
export async function buildConsumerSpendTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
  lockedUtxo: UTxO,
  oracleUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const policyId = beaconPolicyId(deployment.seed);
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }

  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  const withOracle = readOracle(
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        lockedUtxo.input.txHash,
        lockedUtxo.input.outputIndex,
        lockedUtxo.output.amount,
        lockedUtxo.output.address,
      )
      .txInScript(consumerScriptCbor(policyId))
      .txInInlineDatumPresent()
      .txInRedeemerValue(mConStr0([])),
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

/// Read the UTxOs sitting at the consumer's address.
export async function fetchLocked(
  provider: IFetcher,
  networkId: number,
  deployment: Deployment,
): Promise<UTxO[]> {
  const policyId = beaconPolicyId(deployment.seed);
  return await provider.fetchAddressUTxOs(consumerAddress(policyId, networkId));
}
