import { serializeData } from "@meshsdk/core";
import type { Asset, Data } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";

// #region minimum-ada
/// Preserve the supplied deposit and top it up to the ledger minimum for this
/// address, native assets and inline datum. OfflineEvaluator does not check it.
export function withMinimumAda(address: string, amount: Asset[], datum: Data, coinsPerByte: number): Asset[] {
  let lovelace = BigInt(amount.find((a) => a.unit === "lovelace")?.quantity ?? "0");
  const tokens = amount.filter((a) => a.unit !== "lovelace");
  const multi = csl.MultiAsset.new();
  for (const asset of tokens) {
    multi.set_asset(
      csl.ScriptHash.from_hex(asset.unit.slice(0, 56)),
      csl.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
      csl.BigNum.from_str(asset.quantity),
    );
  }
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(coinsPerByte.toString()));
  // Recheck if topping up changes the CBOR width of the coin amount.
  for (;;) {
    const value = csl.Value.new(csl.BigNum.from_str(lovelace.toString()));
    if (tokens.length) value.set_multiasset(multi);
    const output = csl.TransactionOutput.new(csl.Address.from_bech32(address), value);
    output.set_plutus_data(csl.PlutusData.from_hex(serializeData(datum)));
    const minimum = BigInt(csl.min_ada_for_output(output, cost).to_str());
    if (lovelace >= minimum) return [{ unit: "lovelace", quantity: lovelace.toString() }, ...tokens];
    lovelace = minimum;
  }
}
// #endregion minimum-ada
