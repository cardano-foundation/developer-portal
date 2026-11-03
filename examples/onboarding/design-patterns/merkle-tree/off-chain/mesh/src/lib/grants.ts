import { MeshTxBuilder } from "@meshsdk/core";
import type { Data, IEvaluator, UTxO } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import { claimRedeemer, grantScript } from "./blueprint.ts";
import type { Chain } from "./offline.ts";

// #region plan
/// Exposed for tests: forge one field and build without an evaluator.
export type ClaimPlan = { grant: UTxO; redeemer: Data; signer?: string };

export function claimPlan(chain: Chain): ClaimPlan {
  return {
    grant: chain.grant,
    redeemer: claimRedeemer(chain.version, chain.beneficiary, chain.proof),
    signer: chain.beneficiary,
  };
}
// #endregion plan

// #region lock
/// Publish the chosen list/root beside the grant. No validator runs when funds
/// are locked; verify the dataset and preserve proof availability beforehand.
export async function buildLockTx(chain: Chain): Promise<string> {
  const fund = chain.funding;
  return new MeshTxBuilder({ fetcher: chain.fetcher })
    .txIn(fund.input.txHash, fund.input.outputIndex, fund.output.amount, fund.output.address)
    .txOut(chain.grant.output.address, await fundedAmount(chain))
    .txOutInlineDatumValue(chain.datum)
    .changeAddress(chain.walletAddress)
    .complete();
}
// #endregion lock

// #region claim
/// Membership plus the member's signature consumes the whole grant. The
/// claimant may choose where their authorized spend sends its funds.
export async function buildClaimTx(
  chain: Chain,
  plan = claimPlan(chain),
  evaluator?: IEvaluator,
): Promise<string> {
  const fund = chain.funding;
  const collateral = chain.collateral;
  const { grant } = plan;
  const builder = new MeshTxBuilder({ fetcher: chain.fetcher, evaluator });
  builder
    .txIn(fund.input.txHash, fund.input.outputIndex, fund.output.amount, fund.output.address)
    .spendingPlutusScriptV3()
    .txIn(grant.input.txHash, grant.input.outputIndex, grant.output.amount, grant.output.address)
    .txInScript(grantScript(chain.version))
    .txInInlineDatumPresent()
    .txInRedeemerValue(plan.redeemer);
  // The member is a required signer, not just an address in the output.
  if (plan.signer) builder.requiredSignerHash(plan.signer);
  return builder
    .txInCollateral(collateral.input.txHash, collateral.input.outputIndex, collateral.output.amount, collateral.output.address)
    .changeAddress(chain.walletAddress)
    .complete();
}
// #endregion claim

// #region minimum-ada
/// OfflineEvaluator does not check min-UTxO. Include the actual inline datum
/// when calculating the minimum, even for the baseline's large list.
export async function minimumAda(chain: Chain): Promise<bigint> {
  const output = csl.TransactionOutput.new(
    csl.Address.from_bech32(chain.grant.output.address),
    csl.Value.new(csl.BigNum.from_str("100000000")),
  );
  output.set_plutus_data(csl.PlutusData.from_hex(chain.grant.output.plutusData!));
  const p = await chain.fetcher.fetchProtocolParameters(Number.NaN);
  const cost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(p.coinsPerUtxoSize.toString()));
  return BigInt(csl.min_ada_for_output(output, cost).to_str());
}

async function fundedAmount(chain: Chain) {
  const minimum = await minimumAda(chain);
  return [{ unit: "lovelace", quantity: (minimum > 100_000_000n ? minimum : 100_000_000n).toString() }];
}
// #endregion minimum-ada
