import {
  MeshTxBuilder,
  SLOT_CONFIG_NETWORK,
  mConStr0,
  mConStr1,
  mOutputReference,
  serializeData,
  slotToBeginUnixTime,
} from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import { grantAddress, grantDatum, grantScriptCbor, isScheduled, paymentKey } from "./blueprint.ts";
import type { Grant, LinearVersion, ScheduledVersion, Version } from "./blueprint.ts";
import { scheduledDatum } from "./schedule.ts";
import type { Period } from "./schedule.ts";

/// The network whose slot length and start the transactions' slots are
/// converted with. It must match the evaluator's.
const SLOT_CONFIG = SLOT_CONFIG_NETWORK.preview;

/// The redeemers: `Action` in `lib/vesting.ak`.
export const CLAIM = mConStr0([]);
export const CLAWBACK = mConStr1([]);

/// A validity window in slots. A bound left out is infinite.
export type Window = { from?: number; until?: number };

/// What a claim or a clawback needs: who builds it, the grant, and the window
/// it declares.
export type Spend = {
  wallet: IWallet;
  provider: IFetcher;
  version: Version;
  grant: Grant;
  /// The UTxO holding the grant.
  grantUtxo: UTxO;
  window: Window;
  /// Pass one to run the scripts while building. Attack tests evaluate later.
  evaluator?: IEvaluator;
};

/// When a slot starts, in POSIX milliseconds: what the ledger hands the
/// validator for a bound set at that slot.
export function slotTime(slot: number): number {
  return slotToBeginUnixTime(slot, SLOT_CONFIG);
}

// #region unvested
/// Round the unvested fraction up for a claim's rest, down for a clawback's
/// retention. Each direction protects the party who did not build the tx.
export function unvested(grant: Grant, at: number, rounding: "up" | "down"): bigint {
  if (at >= grant.end) return 0n;
  if (at <= grant.start) return grant.total;
  const numerator = grant.total * BigInt(grant.end - at);
  const denominator = BigInt(grant.end - grant.start);
  return rounding === "up" ? (numerator + denominator - 1n) / denominator : numerator / denominator;
}
// #endregion unvested

/// Lock a grant: a plain payment to the contract's address, carrying the
/// grant as its datum. No script runs.
export async function buildLockTx(
  wallet: IWallet,
  provider: IFetcher,
  version: LinearVersion,
  grant: Grant,
  networkId: number,
): Promise<string> {
  if (isScheduled(version)) throw new Error("use buildScheduledLockTx for a scheduled grant");
  return lockWithDatum(wallet, provider, version, grant, grantDatum(grant), networkId);
}

// #region lock-scheduled
/// A scheduled validator needs ScheduledGrant, not the linear Grant datum.
export async function buildScheduledLockTx(
  wallet: IWallet,
  provider: IFetcher,
  version: ScheduledVersion,
  grant: Grant,
  period: Period,
  networkId: number,
): Promise<string> {
  if (!isScheduled(version)) throw new Error("use buildLockTx for a linear grant");
  return lockWithDatum(wallet, provider, version, grant, scheduledDatum(grant, period), networkId);
}
// #endregion lock-scheduled

async function lockWithDatum(
  wallet: IWallet,
  provider: IFetcher,
  version: Version,
  grant: Grant,
  datum: Data,
  networkId: number,
): Promise<string> {
  if (grant.total <= 0n) throw new Error("a grant must hold a positive amount");
  const address = grantAddress(version, networkId);
  const datumCbor = serializeData(datum);
  const minimum = await withMinimumLovelace(provider, address, grant.total, datumCbor);
  if (grant.total < minimum) throw new Error(`a grant needs at least ${minimum} lovelace for its output`);
  return await new MeshTxBuilder({ fetcher: provider })
    .txOut(address, [{ unit: "lovelace", quantity: grant.total.toString() }])
    .txOutInlineDatumValue(datumCbor, "CBOR")
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}

// #region claim
/// The beneficiary claims what has vested by the first moment of the window,
/// the start of its `from` slot. The rest goes back to the contract, under
/// the same datum.
export async function buildClaimTx(spend: Spend): Promise<string> {
  const { from } = spend.window;
  if (from === undefined) throw new Error("a claim needs a lower bound");
  const earliest = slotTime(from);
  const owed = unvested(spend.grant, earliest, "up");
  const txBuilder = spendGrant(spend, CLAIM);
  if (owed > 0n) {
    // Near the end, what is unvested can be less than the ledger accepts in
    // an output. Send back the minimum instead: the validator accepts more.
    const rest = await withMinimumLovelace(
      spend.provider, spend.grantUtxo.output.address, owed, datumOf(spend.grantUtxo),
    );
    txBuilder
      .txOut(spend.grantUtxo.output.address, [{ unit: "lovelace", quantity: rest.toString() }])
      // The same datum the grant was spent with, byte for byte.
      .txOutInlineDatumValue(datumOf(spend.grantUtxo), "CBOR");
  }
  // The signature the validator looks for.
  txBuilder.requiredSignerHash(paymentKey(spend.grant.beneficiaryAddress));
  return await finish(txBuilder, spend);
}
// #endregion claim

// #region clawback
/// The grantor takes back what is unvested at the last moment of the window,
/// one millisecond before its `until` slot starts. Everything else goes to
/// the beneficiary, tagged with the grant's output reference.
export async function buildClawbackTx(spend: Spend): Promise<string> {
  const { until } = spend.window;
  if (until === undefined) throw new Error("a clawback needs an upper bound");
  // The ledger excludes the upper bound: the transaction is valid in slots
  // before `until`, so its last moment is just before `until` starts.
  const latest = slotTime(until) - 1;
  const held = lovelaceOf(spend.grantUtxo);
  const owed = held - unvested(spend.grant, latest, "down");
  const txBuilder = spendGrant(spend, CLAWBACK);
  if (owed > 0n) {
    const { txHash, outputIndex } = spend.grantUtxo.input;
    const tag = serializeData(mOutputReference(txHash, outputIndex));
    // A small tagged payment still has to meet the output minimum. The
    // grantor funds any top-up through balancing; paying more is permitted.
    const payment = await withMinimumLovelace(spend.provider, spend.grant.beneficiaryAddress, owed, tag);
    txBuilder
      .txOut(spend.grant.beneficiaryAddress, [{ unit: "lovelace", quantity: payment.toString() }])
      .txOutInlineDatumValue(tag, "CBOR");
  }
  txBuilder.requiredSignerHash(paymentKey(spend.grant.grantorAddress));
  return await finish(txBuilder, spend);
}
// #endregion clawback

// #region window
/// Spend the grant with `action`, inside the declared window.
function spendGrant(spend: Spend, action: object): MeshTxBuilder {
  const { grantUtxo, window } = spend;
  const txBuilder = new MeshTxBuilder({ fetcher: spend.provider, evaluator: spend.evaluator });
  txBuilder
    .spendingPlutusScriptV3()
    .txIn(grantUtxo.input.txHash, grantUtxo.input.outputIndex, grantUtxo.output.amount, grantUtxo.output.address)
    .txInScript(grantScriptCbor(spend.version))
    .txInInlineDatumPresent()
    .txInRedeemerValue(action);
  // The window, in slots. The ledger turns each bound into the POSIX time its
  // slot starts at before the validator sees it.
  if (window.from !== undefined) txBuilder.invalidBefore(window.from);
  if (window.until !== undefined) txBuilder.invalidHereafter(window.until);
  return txBuilder;
}
// #endregion window

/// Add collateral, balance from the builder's wallet, and complete.
async function finish(txBuilder: MeshTxBuilder, spend: Spend): Promise<string> {
  const collateral = (await spend.wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  return await txBuilder
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(await spend.wallet.getChangeAddress())
    // Keep the collateral out of coin selection, so it stays a pure-ADA UTxO.
    .selectUtxosFrom(
      (await spend.wallet.getUtxos()).filter(
        ({ input }) =>
          input.txHash !== collateral.input.txHash || input.outputIndex !== collateral.input.outputIndex,
      ),
    )
    .complete();
}

/// The grant's inline datum, as CBOR.
function datumOf(utxo: UTxO): string {
  if (!utxo.output.plutusData) throw new Error("the grant has no inline datum");
  return utxo.output.plutusData;
}

/// Raise an output to the ledger minimum for its actual address and datum.
/// Recheck after raising the amount, since the coin's encoding can grow too.
async function withMinimumLovelace(
  provider: IFetcher,
  address: string,
  lovelace: bigint,
  datumCbor: string,
): Promise<bigint> {
  // NaN asks a provider for the current epoch's parameters.
  const { coinsPerUtxoSize } = await provider.fetchProtocolParameters(Number.NaN);
  const dataCost = csl.DataCost.new_coins_per_byte(csl.BigNum.from_str(coinsPerUtxoSize.toString()));
  while (true) {
    const output = csl.TransactionOutput.new(
      csl.Address.from_bech32(address),
      csl.Value.new(csl.BigNum.from_str(lovelace.toString())),
    );
    output.set_plutus_data(csl.PlutusData.from_hex(datumCbor));
    const minimum = BigInt(csl.min_ada_for_output(output, dataCost).to_str());
    if (lovelace >= minimum) return lovelace;
    lovelace = minimum;
  }
}

function lovelaceOf(utxo: UTxO): bigint {
  return BigInt(utxo.output.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0");
}
