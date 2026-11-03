import { MeshTxBuilder, mConStr0, mConStr1, mOutputReference } from "@meshsdk/core";
import type { Asset, Data, IEvaluator, UTxO } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import { quoteInput, quotedPrice, scriptRefObject } from "./blueprint.ts";
import type { Script, Source } from "./blueprint.ts";
import type { Chain } from "./offline.ts";

// #region plan
export type Action = "purchase" | "cancel";
export type Plan = {
  inputs: { utxo: UTxO; redeemer: Data }[];
  withdrawals: { script: Script; redeemer: Data }[];
  payments: { address: string; lovelace: number; datum: Data }[];
  extraReferences: { utxo: UTxO; script: Script }[];
  signed: boolean;
};

/// The only Plutus purposes here are N spends and these two script withdrawals.
/// Wallet inputs have no redeemer and therefore do not occupy tx.redeemers.
export function transactionPlan(chain: Chain, action: Action): Plan {
  const { deployment: d, voucher: v, vouchers } = chain;
  const plan: Plan = { inputs: [], withdrawals: [], payments: [], extraReferences: [], signed: true };
  if (action === "cancel") {
    plan.inputs = vouchers.map((utxo) => ({ utxo, redeemer: mConStr1([]) }));
    return plan;
  }
  const price = quotedPrice(chain.policy, v);
  if (d.quote && d.code) {
    plan.withdrawals = [
      { script: d.quote, redeemer: mConStr0([quoteInput(v), price]) },
      { script: d.code, redeemer: mConStr0([v.redemptionCode]) },
    ].sort((a, b) => a.script.hash.localeCompare(b.script.hash));
  }
  // Indices into the whole script-purpose map, not indices into withdrawals.
  const quoteIndex = vouchers.length + plan.withdrawals.findIndex((w) => w.script.hash === d.quote?.hash);
  const codeIndex = vouchers.length + plan.withdrawals.findIndex((w) => w.script.hash === d.code?.hash);
  plan.inputs = vouchers.map((utxo, n) => ({
    utxo, redeemer: mConStr0([quoteIndex, codeIndex, n]),
  }));
  plan.payments = vouchers.map(({ input }) => ({
    address: chain.merchantAddress, lovelace: price,
    datum: mOutputReference(input.txHash, input.outputIndex),
  }));
  return plan;
}
// #endregion plan

// #region build
/// Carry or reference exactly the scripts this action executes. Explicit wallet
/// inputs keep published script UTxOs out of coin selection.
export async function buildTransaction(chain: Chain, plan: Plan, source: Source, evaluator?: IEvaluator): Promise<string> {
  const builder = new MeshTxBuilder({ fetcher: chain.fetcher, evaluator });
  const fund = chain.funding;
  builder.txIn(fund.input.txHash, fund.input.outputIndex, fund.output.amount, fund.output.address);
  for (const { utxo, redeemer } of plan.inputs) {
    builder.spendingPlutusScriptV3().txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address);
    if (source === "inline") {
      builder.txInScript(chain.deployment.root.cbor).txInInlineDatumPresent().txInRedeemerValue(redeemer);
    } else {
      const script = chain.deployment.root;
      const ref = chain.references.get(script.hash)!;
      builder.spendingTxInReference(ref.input.txHash, ref.input.outputIndex, String(script.size), script.hash)
        .spendingReferenceTxInInlineDatumPresent().spendingReferenceTxInRedeemerValue(redeemer);
    }
  }
  for (const { script, redeemer } of plan.withdrawals) {
    builder.withdrawalPlutusScriptV3().withdrawal(script.rewardAddress, "0");
    if (source === "inline") builder.withdrawalScript(script.cbor).withdrawalRedeemerValue(redeemer);
    else {
      const ref = chain.references.get(script.hash)!;
      builder.withdrawalTxInReference(ref.input.txHash, ref.input.outputIndex, String(script.size), script.hash)
        .withdrawalRedeemerValue(redeemer);
    }
  }
  for (const payment of plan.payments) {
    builder.txOut(payment.address, [{ unit: "lovelace", quantity: String(payment.lovelace) }])
      .txOutInlineDatumValue(payment.datum);
  }
  for (const { utxo, script } of plan.extraReferences) {
    builder.readOnlyTxInReference(utxo.input.txHash, utxo.input.outputIndex, script.size);
  }
  if (plan.signed) builder.requiredSignerHash(chain.owner);
  const c = chain.collateral;
  return builder.txInCollateral(c.input.txHash, c.input.outputIndex, c.output.amount, c.output.address)
    .changeAddress(chain.ownerAddress).complete();
}
// #endregion build

// #region registration
/// Register each worker once. These legacy registration certificates need no
/// Plutus execution and pay the protocol's stake-key deposit per credential.
export async function buildRegisterTx(chain: Chain): Promise<string> {
  if (!chain.deployment.quote || !chain.deployment.code) throw new Error("the monolith has no worker credentials");
  const f = chain.funding;
  return new MeshTxBuilder({ fetcher: chain.fetcher })
    .txIn(f.input.txHash, f.input.outputIndex, f.output.amount, f.output.address)
    .registerStakeCertificate(chain.deployment.quote.rewardAddress)
    .registerStakeCertificate(chain.deployment.code.rewardAddress)
    .changeAddress(chain.ownerAddress).complete();
}
// #endregion registration

// #region minimum-ada
export async function minimumReferenceAda(chain: Chain, script: Script): Promise<bigint> {
  const output = csl.TransactionOutput.new(csl.Address.from_bech32(chain.ownerAddress), csl.Value.new(csl.BigNum.from_str("100000000")));
  output.set_script_ref(scriptRefObject(script.scriptRef));
  const p = await chain.fetcher.fetchProtocolParameters(Number.NaN);
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(p.coinsPerUtxoSize.toString()));
  return BigInt(csl.min_ada_for_output(output, cost).to_str());
}
// #endregion minimum-ada

// #region publication
/// Publish one module per transaction, so each publication fits independently.
export async function buildPublishTx(chain: Chain, script: Script): Promise<string> {
  const f = chain.funding;
  const amount: Asset[] = [{ unit: "lovelace", quantity: String(await minimumReferenceAda(chain, script)) }];
  return new MeshTxBuilder({ fetcher: chain.fetcher })
    .txIn(f.input.txHash, f.input.outputIndex, f.output.amount, f.output.address)
    .txOut(chain.ownerAddress, amount).txOutReferenceScript(script.cbor, "V3")
    .changeAddress(chain.ownerAddress).complete();
}
// #endregion publication
