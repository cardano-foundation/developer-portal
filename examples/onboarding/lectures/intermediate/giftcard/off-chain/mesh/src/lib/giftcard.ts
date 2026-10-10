import { MeshTxBuilder, mConStr0, mConStr1 } from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";

import { CARD_NAME_HEX, cardAddress, cardPolicyId, cardScriptCbor, cardUnit } from "./blueprint.ts";
import type { Seed } from "./blueprint.ts";

/// The two redeemers the mint handler offers. `CardAction` reaches the validator
/// as a number, so `Create` is constructor 0 and `Burn` is constructor 1.
const createRedeemer: Data = mConStr0([]);
const burnRedeemer: Data = mConStr1([]);

/// The spend handler ignores its redeemer, so anything will do.
const spendRedeemer: Data = mConStr0([]);

/// One card: the seed it was created from. Its policy id and address are
/// derived from this, never stored.
export type Card = { seed: Seed };

/// Your UTxOs, minus the collateral, so it stays available for the next
/// script transaction.
async function spendableUtxos(wallet: IWallet, collateral: UTxO): Promise<UTxO[]> {
  return (await wallet.getUtxos()).filter(
    (utxo) =>
      !(
        utxo.input.txHash === collateral.input.txHash &&
        utxo.input.outputIndex === collateral.input.outputIndex
      ),
  );
}

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

/// The UTxO holding the funds behind a card, if it is still there.
export async function fetchLocked(
  provider: IFetcher,
  networkId: number,
  card: Card,
): Promise<UTxO | undefined> {
  const utxos = await provider.fetchAddressUTxOs(cardAddress(card.seed, networkId));
  return utxos[0];
}

/// The UTxO in your wallet that holds the card itself, if you have it.
export async function fetchCard(wallet: IWallet, card: Card): Promise<UTxO | undefined> {
  const unit = cardUnit(card.seed);
  return (await wallet.getUtxos()).find((utxo) =>
    utxo.output.amount.some((a) => a.unit === unit && a.quantity === "1"),
  );
}

/// Create a card: mint the token and lock the funds behind it, in one
/// transaction.
///
/// The seed it spends fixes the policy id, and through it the address, and
/// neither can ever be chosen again, because the seed is now spent. The card
/// itself comes back to your wallet with the change.
// #region create-card
export async function buildCardCreateTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  lovelace: string,
): Promise<{ unsignedTx: string; card: Card }> {
  const changeAddress = await wallet.getChangeAddress();
  // Minting runs a script, so this transaction needs a deposit.
  const collateral = await collateralOf(wallet);

  const utxos = await spendableUtxos(wallet, collateral);
  // Any UTxO of yours will do. Spending it is what makes the card one of a
  // kind, so the policy is built around whichever one you pick here.
  const seedUtxo = utxos[0];
  if (!seedUtxo) throw new Error("this wallet has no UTxOs to seed the card from");
  const seed: Seed = {
    txHash: seedUtxo.input.txHash,
    outputIndex: seedUtxo.input.outputIndex,
  };

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  const unsignedTx = await txBuilder
    // Spend the seed by name. The policy checks for this exact reference among
    // the inputs, so it cannot be left to the coin selection below.
    .txIn(
      seedUtxo.input.txHash,
      seedUtxo.input.outputIndex,
      seedUtxo.output.amount,
      seedUtxo.output.address,
    )
    // Everything that follows describes one Plutus V3 script minting.
    .mintPlutusScriptV3()
    // Exactly one card, which is all the policy allows.
    .mint("1", cardPolicyId(seed), CARD_NAME_HEX)
    .mintingScript(cardScriptCbor(seed))
    .mintRedeemerValue(createRedeemer)
    // The funds behind the card, at the script's own address. The datum is a
    // placeholder the contract never reads: the card is the state.
    .txOut(cardAddress(seed, networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(mConStr0([]))
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // The change comes back here, and the freshly minted card with it.
    .changeAddress(changeAddress)
    .selectUtxosFrom(utxos)
    .complete();

  return { unsignedTx, card: { seed } };
}
// #endregion create-card

/// Use the card: spend the funds behind it and burn the card, in one
/// transaction, so both handlers run and both have to approve.
// #region redeem-card
export async function buildCardRedeemTx(
  wallet: IWallet,
  provider: IFetcher,
  card: Card,
  lockedUtxo: UTxO,
  cardUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const collateral = await collateralOf(wallet);
  const policyId = cardPolicyId(card.seed);

  // Passing `evaluator` is what makes the contract run here, before you send.
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    // Everything that follows describes one Plutus V3 script being spent.
    .spendingPlutusScriptV3()
    // The funds behind the card.
    .txIn(
      lockedUtxo.input.txHash,
      lockedUtxo.input.outputIndex,
      lockedUtxo.output.amount,
      lockedUtxo.output.address,
    )
    // Carry the compiled contract, with its parameter already filled in.
    .txInScript(cardScriptCbor(card.seed))
    // The placeholder datum is already on the UTxO being spent.
    .txInInlineDatumPresent()
    .txInRedeemerValue(spendRedeemer)
    // The UTxO in your wallet that holds the card. Spending it is what lets
    // the transaction burn the card, and it also pays the fee.
    .txIn(
      cardUtxo.input.txHash,
      cardUtxo.input.outputIndex,
      cardUtxo.output.amount,
      cardUtxo.output.address,
    )
    // Destroying a token is minting a negative amount of it. The same script
    // runs again, now as a policy, with the `Burn` redeemer.
    .mintPlutusScriptV3()
    .mint("-1", policyId, CARD_NAME_HEX)
    .mintingScript(cardScriptCbor(card.seed))
    .mintRedeemerValue(burnRedeemer)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await spendableUtxos(wallet, collateral))
    .complete();
}
// #endregion redeem-card

/// Try to take the funds and keep the card. The spend handler asks whether a
/// card is being burned in this transaction, finds none, and refuses, so the
/// SDK reports the failure before anything is sent.
export async function buildCardKeepTx(
  wallet: IWallet,
  provider: IFetcher,
  card: Card,
  lockedUtxo: UTxO,
  cardUtxo: UTxO,
  evaluator?: IEvaluator,
): Promise<string> {
  const changeAddress = await wallet.getChangeAddress();
  const collateral = await collateralOf(wallet);

  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator });
  return await txBuilder
    .spendingPlutusScriptV3()
    .txIn(
      lockedUtxo.input.txHash,
      lockedUtxo.input.outputIndex,
      lockedUtxo.output.amount,
      lockedUtxo.output.address,
    )
    .txInScript(cardScriptCbor(card.seed))
    // The placeholder datum is already on the UTxO being spent.
    .txInInlineDatumPresent()
    .txInRedeemerValue(spendRedeemer)
    // The card comes in, and goes straight back out with the change: held,
    // not burned.
    .txIn(
      cardUtxo.input.txHash,
      cardUtxo.input.outputIndex,
      cardUtxo.output.amount,
      cardUtxo.output.address,
    )
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(changeAddress)
    .selectUtxosFrom(await spendableUtxos(wallet, collateral))
    .complete();
}
