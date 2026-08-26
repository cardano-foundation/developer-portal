import {
  MeshTxBuilder,
  SLOT_CONFIG_NETWORK,
  deserializeAddress,
  deserializeDatum,
  mConStr0,
  unixTimeToEnclosingSlot,
} from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { vestingAddress, vestingScriptCbor } from "./blueprint.ts";

/// The datum mirrors the on-chain `VestingDatum { beneficiary, lock_until }`:
/// who may claim, and the moment they may claim from.
export function vestingDatum(beneficiaryPubKeyHash: string, lockUntilMs: number): Data {
  return mConStr0([beneficiaryPubKeyHash, lockUntilMs]);
}

const claimRedeemer: Data = mConStr0([]);

/// Read the deadline back out of a vested UTxO. The terms were written into the
/// datum at lock time and are public, so anyone can recover them from the chain
/// rather than having to remember them.
export function deadlineOf(utxo: UTxO): number {
  const datum = deserializeDatum(utxo.output.plutusData ?? "");
  return Number(datum.fields[1].int);
}

/// Lock funds until a moment in the future. This is still an ordinary payment,
/// exactly like the vault's lock: the contract doesn't run, it just records the
/// terms in the datum.
export async function buildVestingLockTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  lovelace: string,
  lockUntilMs: number,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside that address: who will be allowed to claim.
  const beneficiary = deserializeAddress(changeAddress).pubKeyHash;

  // The builder. `fetcher` is how it looks up UTxOs and protocol parameters.
  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
    // Create an output at the contract's address, holding the funds.
    .txOut(vestingAddress(networkId), [{ unit: "lovelace", quantity: lovelace }])
    // Attach both terms at once: who may claim, and from when. The deadline is
    // ordinary data on the UTxO, and nothing enforces it until someone tries.
    .txOutInlineDatumValue(vestingDatum(beneficiary, lockUntilMs))
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}

/// Claim vested funds. The only new line compared with the vault's unlock is
/// `.invalidBefore(...)`: it declares that this transaction may not be included
/// in a block before that slot.
///
/// The validator never reads a clock. It reads that declared window, which the
/// ledger has already checked against the real slot, so submitting early fails
/// rather than lying.
// #region vesting-claim
export async function buildVestingClaimTx(
  wallet: IWallet,
  provider: IFetcher,
  vestedUtxo: UTxO,
  lockUntilMs: number,
  evaluator?: IEvaluator,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside it: the beneficiary the datum named at lock time.
  const beneficiary = deserializeAddress(changeAddress).pubKeyHash;
  // The deposit, as with any spend that runs a script.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }

  // Turn the deadline into a slot. The extra second keeps us strictly past it,
  // since a slot covers a whole second. (Preview's slot config; the whole track
  // runs on Preview.)
  const lowerBoundSlot = unixTimeToEnclosingSlot(
    lockUntilMs + 1000,
    SLOT_CONFIG_NETWORK.preview,
  );

  // Passing `evaluator` is what makes the contract run here, before you send.
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    // Everything that follows describes one Plutus V3 script being spent.
    .spendingPlutusScriptV3()
    // The vested UTxO to spend.
    .txIn(
      vestedUtxo.input.txHash,
      vestedUtxo.input.outputIndex,
      vestedUtxo.output.amount,
      vestedUtxo.output.address,
    )
    // Carry the compiled contract, so the network has the code to run.
    .txInScript(vestingScriptCbor)
    // The datum, holding the beneficiary and the deadline, is already on the UTxO.
    .txInInlineDatumPresent()
    // The contract offers only one action, so the redeemer is empty.
    .txInRedeemerValue(claimRedeemer)
    // The signature the validator looks for.
    .requiredSignerHash(beneficiary)
    // **The only line the vault's unlock does not have.** It declares that this
    // transaction may not be included in a block before that slot. The validator
    // reads this declaration rather than a clock, and the ledger has already
    // checked it against the real slot, so claiming early fails and it cannot lie.
    .invalidBefore(lowerBoundSlot)
    // Offer the deposit found above.
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover the fee.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion vesting-claim
