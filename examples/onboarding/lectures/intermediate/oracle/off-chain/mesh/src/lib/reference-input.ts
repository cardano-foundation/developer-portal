import type { MeshTxBuilder } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

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
