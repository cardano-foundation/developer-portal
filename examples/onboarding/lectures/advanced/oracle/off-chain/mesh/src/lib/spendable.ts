import type { IWallet, UTxO } from "@meshsdk/core";

/// Your UTxOs, minus the ones that have to stay where they are.
///
/// A published script lives in an ordinary UTxO at your own address, and
/// ordinary coin selection would spend it like any other. Every builder here
/// draws from this list instead, so publishing once really is once.
export async function spendableUtxos(wallet: IWallet): Promise<UTxO[]> {
  return (await wallet.getUtxos()).filter(
    (utxo) => !utxo.output.scriptRef && !utxo.output.scriptHash,
  );
}

/// One UTxO of yours to pay the fee from, keeping the collateral aside.
///
/// A transaction whose only input belongs to a script has nothing your key can
/// sign, and the wallet refuses to sign it. Spending one of your own UTxOs
/// gives it something to sign, and the locked ADA comes back to you whole.
export function feeUtxo(utxos: UTxO[], collateral: UTxO): UTxO {
  const candidate = utxos.find(
    (utxo) =>
      !(
        utxo.input.txHash === collateral.input.txHash &&
        utxo.input.outputIndex === collateral.input.outputIndex
      ) && utxo.output.amount.some((a) => a.unit === "lovelace" && Number(a.quantity) >= 2_000_000),
  );
  if (!candidate) {
    throw new Error("no UTxO to pay the fee from: this wallet needs some ADA besides its collateral");
  }
  return candidate;
}
