import { MeshTxBuilder, deserializeAddress, mConStr0 } from "@meshsdk/core";
import type { Asset, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import {
  SWEEP_NAME_HEX,
  coordinatorRewardAddress,
  poolAddress,
  poolHash,
  poolScriptCbor,
} from "./blueprint.ts";
import type { Pool } from "./blueprint.ts";

/// Every sweep needs the same few things: who pays, who is paid, and which
/// donations are taken.
export type Sweep = {
  wallet: IWallet;
  provider: IFetcher;
  /// The beneficiary's address, exactly as the pool was compiled around it.
  beneficiaryAddress: string;
  /// The donations to sweep, all at the same pool.
  donations: UTxO[];
  /// Pass one to run the scripts while building, as every test here does.
  evaluator?: IEvaluator;
};

/// The note every donation carries. The pool never reads it, but Mesh will not
/// spend a script input without one, so it is the empty constructor.
export const DONATION_DATUM = mConStr0([]);

/// Send a donation: a plain payment to the pool's address. No script runs.
export async function buildDonateTx(
  wallet: IWallet,
  provider: IFetcher,
  pool: Pool,
  beneficiaryAddress: string,
  networkId: number,
  lovelace: string,
): Promise<string> {
  return await new MeshTxBuilder({ fetcher: provider })
    .txOut(poolAddress(pool, beneficiaryAddress, networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(DONATION_DATUM)
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}

/// Sweep with the naive pool: one spend per donation, and each one checks the
/// whole transaction.
// #region naive-sweep
export async function buildNaiveSweepTx(sweep: Sweep): Promise<string> {
  const txBuilder = await spendDonations(sweep, "naive");
  return await payOut(txBuilder, sweep, "naive", []);
}
// #endregion naive-sweep

/// Sweep with a withdraw-zero pool. The spends are the same as the naive ones;
/// what is new is a withdrawal from the pool's own stake credential, which is
/// what makes the coordinator run.
///
/// The credential has to be registered first, once, with
/// `buildRegisterCoordinatorTx`. A withdrawal from an unregistered credential
/// is refused by the ledger before any script runs.
// #region withdraw-sweep
export async function buildWithdrawSweepTx(
  sweep: Sweep,
  pool: "withdrawByHand" | "withdrawLibrary",
  networkId: number,
): Promise<string> {
  const rewardAddress = coordinatorRewardAddress(pool, sweep.beneficiaryAddress, networkId);
  // A withdrawal must take the account's whole balance. It is zero unless
  // someone paid rewards in, and the coordinator counts any it finds as taken
  // from the pool, so they are paid to the beneficiary with the donations.
  const { rewards } = await sweep.provider.fetchAccountInfo(rewardAddress);
  const txBuilder = await spendDonations(sweep, pool);
  txBuilder
    // Everything that follows describes one Plutus V3 script withdrawing.
    .withdrawalPlutusScriptV3()
    .withdrawal(rewardAddress, rewards)
    // The same script the donations are locked by: one validator, one hash.
    .withdrawalScript(poolScriptCbor(pool, sweep.beneficiaryAddress))
    .withdrawalRedeemerValue(mConStr0([]));
  return await payOut(txBuilder, sweep, pool, [{ unit: "lovelace", quantity: rewards }]);
}
// #endregion withdraw-sweep

/// Sweep with a minting-policy pool. In place of the withdrawal, the
/// transaction mints one SWEEP token under the pool's own policy, which is
/// what makes the coordinator run. Nothing sends it anywhere, so it lands in
/// the sweeper's change.
// #region mint-sweep
export async function buildMintSweepTx(
  sweep: Sweep,
  pool: "mintByHand" | "mintLibrary",
): Promise<string> {
  const txBuilder = await spendDonations(sweep, pool);
  txBuilder
    // Everything that follows describes one Plutus V3 script minting.
    .mintPlutusScriptV3()
    // Exactly one: the ledger refuses a mint of zero, and the policy refuses
    // more than one.
    .mint("1", poolHash(pool, sweep.beneficiaryAddress), SWEEP_NAME_HEX)
    // Again the same script the donations are locked by.
    .mintingScript(poolScriptCbor(pool, sweep.beneficiaryAddress))
    .mintRedeemerValue(mConStr0([]));
  return await payOut(txBuilder, sweep, pool, []);
}
// #endregion mint-sweep

/// Burn SWEEP tokens. Anyone holding them may: burning runs the policy, and the
/// check passes because the transaction takes nothing from the pool.
export async function buildBurnSweepTokensTx(
  wallet: IWallet,
  provider: IFetcher,
  pool: "mintByHand" | "mintLibrary",
  beneficiaryAddress: string,
  quantity: number,
  evaluator?: IEvaluator,
): Promise<string> {
  const collateral = await collateralOf(wallet);
  return await new MeshTxBuilder({ fetcher: provider, evaluator })
    .mintPlutusScriptV3()
    .mint(`-${quantity}`, poolHash(pool, beneficiaryAddress), SWEEP_NAME_HEX)
    .mintingScript(poolScriptCbor(pool, beneficiaryAddress))
    .mintRedeemerValue(mConStr0([]))
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(withoutCollateral(await wallet.getUtxos(), collateral))
    .complete();
}

/// Register the pool's hash as a stake credential, so it can be withdrawn
/// from. Once per pool, by anyone, for a 2 ADA deposit.
// #region register
export async function buildRegisterCoordinatorTx(
  wallet: IWallet,
  provider: IFetcher,
  pool: "withdrawByHand" | "withdrawLibrary",
  beneficiaryAddress: string,
  networkId: number,
): Promise<string> {
  return await new MeshTxBuilder({ fetcher: provider })
    // The certificate Mesh writes here needs no script to run, only the deposit.
    .registerStakeCertificate(coordinatorRewardAddress(pool, beneficiaryAddress, networkId))
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
// #endregion register

/// Deregister the pool's stake credential and take the deposit back. Built and
/// signed by the beneficiary: the pool's `publish` handler refuses anyone else.
/// Sweeps stop until someone registers it again.
// #region deregister
export async function buildDeregisterCoordinatorTx(
  beneficiaryWallet: IWallet,
  provider: IFetcher,
  pool: "withdrawByHand" | "withdrawLibrary",
  networkId: number,
  evaluator?: IEvaluator,
): Promise<string> {
  const beneficiaryAddress = await beneficiaryWallet.getChangeAddress();
  const collateral = await collateralOf(beneficiaryWallet);
  return await new MeshTxBuilder({ fetcher: provider, evaluator })
    .deregisterStakeCertificate(coordinatorRewardAddress(pool, beneficiaryAddress, networkId))
    // Deregistering a script credential runs the script, under `publish`.
    .certificateScript(poolScriptCbor(pool, beneficiaryAddress), "V3")
    .certificateRedeemerValue(mConStr0([]))
    // The signature `publish` looks for.
    .requiredSignerHash(deserializeAddress(beneficiaryAddress).pubKeyHash)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // The refunded deposit comes back here, with the change.
    .changeAddress(beneficiaryAddress)
    .selectUtxosFrom(withoutCollateral(await beneficiaryWallet.getUtxos(), collateral))
    .complete();
}
// #endregion deregister

/// Add every donation as a script input. The pool's code travels once, however
/// many inputs it guards.
// #region spend-donations
async function spendDonations(sweep: Sweep, pool: Pool): Promise<MeshTxBuilder> {
  const script = poolScriptCbor(pool, sweep.beneficiaryAddress);
  const txBuilder = new MeshTxBuilder({ fetcher: sweep.provider, evaluator: sweep.evaluator });
  for (const donation of sweep.donations) {
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        donation.input.txHash,
        donation.input.outputIndex,
        donation.output.amount,
        donation.output.address,
      )
      .txInScript(script)
      .txInInlineDatumPresent()
      // The library's withdraw pool reads this redeemer as the coordinator's
      // position among the withdrawals. Every other pool ignores it.
      .txInRedeemerValue(0);
  }
  return txBuilder;
}
// #endregion spend-donations

/// Pay everything the donations hold, plus `extra`, to the beneficiary in one
/// output tagged with the pool's hash, and balance the rest from the sweeper's
/// wallet.
// #region pay-out
async function payOut(
  txBuilder: MeshTxBuilder,
  sweep: Sweep,
  pool: Pool,
  extra: Asset[],
): Promise<string> {
  const collateral = await collateralOf(sweep.wallet);
  const owed = totalOf([...sweep.donations.flatMap((d) => d.output.amount), ...extra]);
  return await txBuilder
    .txOut(sweep.beneficiaryAddress, owed)
    // The tag: this payment is on behalf of this pool and no other. The pool
    // only counts payments that carry its own hash.
    .txOutInlineDatumValue(poolHash(pool, sweep.beneficiaryAddress))
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(await sweep.wallet.getChangeAddress())
    // Keep the collateral out of coin selection, so it stays a pure-ADA UTxO
    // set aside for the next script, and the sweep's inputs never depend on
    // which of the two the selection happened to pick.
    .selectUtxosFrom(withoutCollateral(await sweep.wallet.getUtxos(), collateral))
    .complete();
}
// #endregion pay-out

async function collateralOf(wallet: IWallet): Promise<UTxO> {
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  return collateral;
}

function withoutCollateral(utxos: UTxO[], collateral: UTxO): UTxO[] {
  return utxos.filter(
    ({ input }) =>
      input.txHash !== collateral.input.txHash ||
      input.outputIndex !== collateral.input.outputIndex,
  );
}

/// Add up a list of assets, unit by unit, leaving out any that come to zero.
function totalOf(assets: Asset[]): Asset[] {
  const totals = new Map<string, bigint>();
  for (const { unit, quantity } of assets) {
    totals.set(unit, (totals.get(unit) ?? 0n) + BigInt(quantity));
  }
  return [...totals]
    .filter(([, quantity]) => quantity > 0n)
    .map(([unit, quantity]) => ({ unit, quantity: quantity.toString() }));
}
