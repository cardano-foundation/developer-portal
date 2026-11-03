import {
  MeshTxBuilder,
  mConStr0,
  mConStr1,
  mConStr2,
  mConStr3,
  mOutputReference,
  serializeData,
  stringToHex,
} from "@meshsdk/core";
import type { Asset, Data, IEvaluator, UTxO } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import { PREFIX, arrayDatum, elementDatum, entryData } from "./blueprint.ts";
import type { Entry } from "./blueprint.ts";
import type { Chain } from "./offline.ts";

// #region types
export type Mutation = "insert" | "remove" | "update" | "init" | "deinit";
export type Plan = {
  inputs: { utxo: UTxO; redeemer: Data; cbor: string }[];
  outputs: { address: string; amount: Asset[]; datum: Data }[];
  mint?: { name: string; quantity: string; redeemer: Data }[];
  references: UTxO[];
  signed: boolean;
};
// #endregion types

// #region ledger-order
/// Fix wallet inputs before writing any spend input index.
export function byLedgerOrder(a: UTxO, b: UTxO): number {
  return a.input.txHash.localeCompare(b.input.txHash) || a.input.outputIndex - b.input.outputIndex;
}
// #endregion ledger-order

// #region mutation
/// Insert at the tail, remove/relabel the last node, or start/end an empty
/// registry. The off-chain index supplies the affected node and its predecessor.
export function mutationPlan(chain: Chain, action: Mutation, entry: Entry): Plan {
  const { deployed: d, entries } = chain;
  const plan: Plan = { inputs: [], outputs: [], references: [], signed: true };
  const addInput = (utxo: UTxO, redeemer: Data) =>
    plan.inputs.push({ utxo, redeemer, cbor: d.cbor });
  const addOutput = (utxo: UTxO, datum: Data) =>
    plan.outputs.push({ address: utxo.output.address, amount: utxo.output.amount, datum });
  const mint = (name: string, quantity: string, redeemer: Data) => {
    plan.mint = [{ name, quantity, redeemer }];
  };
  if (action === "init") {
    plan.outputs.push({
      address: d.address,
      amount: [
        { unit: "lovelace", quantity: "100000000" },
        { unit: d.policy, quantity: "1" },
      ],
      datum: d.version === "naive" ? arrayDatum([]) : elementDatum(undefined),
    });
    mint("", "1", mConStr0([0]));
    return plan;
  }
  if (d.version === "naive") {
    const input = chain.array!;
    if (action === "deinit") {
      addInput(input, mConStr3([]));
      mint("", "-1", mConStr3([]));
    } else if (action === "insert") {
      addInput(input, mConStr0([entryData(entry), 0]));
      addOutput(input, arrayDatum([...entries, entry]));
    } else if (action === "remove") {
      addInput(input, mConStr1([entry.key, 0]));
      addOutput(input, arrayDatum(entries.filter((e) => e.key !== entry.key)));
    } else {
      addInput(input, mConStr2([entry.key, mConStr0([stringToHex(entry.label)]), 0]));
      addOutput(input, arrayDatum(entries.map((e) => e.key === entry.key ? entry : e)));
    }
    return plan;
  }
  const last = chain.nodes.at(-1);
  const lastEntry = entries.at(-1);
  const index = (utxo: UTxO, others: UTxO[] = []) =>
    [chain.funding, utxo, ...others].sort(byLedgerOrder).findIndex((u) => u === utxo);
  if (action === "deinit") {
    addInput(chain.root!, mConStr0([index(chain.root!)]));
    mint("", "-1", mConStr3([]));
  } else if (action === "insert") {
    const anchor = last ?? chain.root!;
    addInput(anchor, mConStr0([index(anchor)]));
    addOutput(anchor, elementDatum(lastEntry, entry.key));
    plan.outputs.push({
      address: d.address,
      amount: [
        { unit: "lovelace", quantity: "100000000" },
        { unit: d.policy + PREFIX + entry.key, quantity: "1" },
      ],
      datum: elementDatum(entry),
    });
    mint(PREFIX + entry.key, "1", mConStr1([0, 1]));
  } else if (action === "remove") {
    if (!last || !lastEntry) throw new Error("no node to remove");
    const anchor = chain.nodes.at(-2) ?? chain.root!;
    addInput(anchor, mConStr0([index(anchor, [last])]));
    addInput(last, mConStr0([index(last, [anchor])]));
    addOutput(anchor, elementDatum(entries.at(-2)));
    mint(
      PREFIX + lastEntry.key,
      "-1",
      mConStr2([mOutputReference(anchor.input.txHash, anchor.input.outputIndex), 0]),
    );
  } else {
    if (!last) throw new Error("no node to update");
    addInput(last, mConStr1([index(last), 0]));
    addOutput(last, elementDatum(entry));
  }
  return plan;
}
// #endregion mutation

// #region proof
/// The caller's query probe reads one authenticated reference UTxO. It does
/// not spend the registry or run its minting/spending handlers.
export function proofPlan(chain: Chain, present: boolean, key: string): Plan {
  const reference = chain.array ?? chain.nodes.at(-1) ?? chain.root!;
  return {
    inputs: [{
      utxo: chain.probe,
      cbor: chain.deployed.proofCbor,
      redeemer: present ? mConStr0([key, 0]) : mConStr1([key, 0]),
    }],
    outputs: [],
    references: [reference],
    signed: false,
  };
}
// #endregion proof

// #region build
/// Plans are exposed so tests can forge one field without running an evaluator
/// during construction. Honest builders pass the evaluator for accurate fees.
export async function buildPlan(chain: Chain, plan: Plan, evaluator?: IEvaluator): Promise<string> {
  const tx = new MeshTxBuilder({ fetcher: chain.fetcher, evaluator });
  const funding = chain.funding;
  tx.txIn(funding.input.txHash, funding.input.outputIndex, funding.output.amount, funding.output.address);
  for (const { utxo, redeemer, cbor } of plan.inputs) {
    tx.spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
      .txInScript(cbor)
      .txInInlineDatumPresent()
      .txInRedeemerValue(redeemer);
  }
  for (const output of plan.outputs) {
    const amount = await enoughAda(chain, output);
    tx.txOut(output.address, amount).txOutInlineDatumValue(output.datum);
  }
  for (const mint of plan.mint ?? []) {
    tx.mintPlutusScriptV3()
      .mint(mint.quantity, chain.deployed.policy, mint.name)
      .mintingScript(chain.deployed.cbor)
      .mintRedeemerValue(mint.redeemer);
  }
  for (const ref of plan.references) {
    tx.readOnlyTxInReference(ref.input.txHash, ref.input.outputIndex);
  }
  if (plan.signed) tx.requiredSignerHash(chain.operator);
  const c = chain.collateral;
  return tx.txInCollateral(c.input.txHash, c.input.outputIndex, c.output.amount, c.output.address)
    .changeAddress(chain.walletAddress)
    .complete();
}
// #endregion build

// #region minimum-ada
/// OfflineEvaluator does not enforce phase-1 min-UTxO. Calculate it explicitly,
/// including tokens and inline datum, and preserve at least the input deposit.
async function enoughAda(chain: Chain, output: Plan["outputs"][number]): Promise<Asset[]> {
  const lovelace = output.amount.find((a) => a.unit === "lovelace")!.quantity;
  const value = csl.Value.new(csl.BigNum.from_str(lovelace));
  const multi = csl.MultiAsset.new();
  for (const a of output.amount.filter((a) => a.unit !== "lovelace")) {
    multi.set_asset(
      csl.ScriptHash.from_hex(a.unit.slice(0, 56)),
      csl.AssetName.new(Buffer.from(a.unit.slice(56), "hex")),
      csl.BigNum.from_str(a.quantity),
    );
  }
  value.set_multiasset(multi);
  const out = csl.TransactionOutput.new(csl.Address.from_bech32(output.address), value);
  out.set_plutus_data(csl.PlutusData.from_hex(serializeData(output.datum)));
  const p = await chain.fetcher.fetchProtocolParameters(Number.NaN);
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(p.coinsPerUtxoSize.toString()));
  const minimum = BigInt(csl.min_ada_for_output(out, cost).to_str());
  return output.amount.map((a) =>
    a.unit === "lovelace" && BigInt(a.quantity) < minimum
      ? { ...a, quantity: minimum.toString() }
      : a,
  );
}
// #endregion minimum-ada
