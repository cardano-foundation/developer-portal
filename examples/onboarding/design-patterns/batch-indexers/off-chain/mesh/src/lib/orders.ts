import {
  MeshTxBuilder,
  deserializeAddress,
  mConStr0,
  mConStr1,
  mConStr2,
  mOutputReference,
} from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import {
  FEE_PER_ORDER,
  TOKEN_UNIT,
  bookAddress,
  bookHash,
  bookScriptCbor,
  coordinatorRewardAddress,
  orderDatum,
} from "./blueprint.ts";
import type { Book, CoordinatedBook } from "./blueprint.ts";

/// An order as a seller finds it on chain: the UTxO, and what its datum asks
/// for.
export type Order = {
  utxo: UTxO;
  /// Where the tokens go: the buyer's address, as written in the datum.
  owner: string;
  /// How many tokens the order buys.
  quantity: number;
  /// Deliver only this many, and put the rest of the order back on the book.
  /// Only the mixed books accept it.
  partly?: number;
};

/// Everything a batch needs: who fills, which orders, and where the fee goes.
export type Batch = {
  /// The seller's wallet. It pays the transaction fee, delivers the tokens,
  /// pays the protocol's fee, and keeps the ADA the orders held.
  wallet: IWallet;
  provider: IFetcher;
  /// The protocol's treasury, which every book here is compiled around.
  treasury: string;
  /// The orders to fill, all at the same book.
  orders: Order[];
  /// Pass one to run the scripts while building, as every test here does.
  evaluator?: IEvaluator;
};

/// Place an order: lock ADA at the book with a datum saying what it buys. No
/// script runs.
export async function buildPlaceOrderTx(
  wallet: IWallet,
  provider: IFetcher,
  book: Book,
  treasury: string,
  networkId: number,
  lovelace: string,
  quantity: number,
): Promise<string> {
  const owner = await wallet.getChangeAddress();
  return await new MeshTxBuilder({ fetcher: provider })
    .txOut(bookAddress(book, treasury, networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(orderDatum(owner, quantity))
    .changeAddress(owner)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}

/// The order the scripts see inputs in: sorted by transaction hash, then by
/// output index. Use it with `sort`.
export function byLedgerOrder(a: UTxO, b: UTxO): number {
  if (a.input.txHash !== b.input.txHash) return a.input.txHash < b.input.txHash ? -1 : 1;
  return a.input.outputIndex - b.input.outputIndex;
}

/// Where each order's outputs go: its position among the inputs, and the
/// position of its payment among the outputs. A partial fill's rest sits
/// right after its payment.
export type Placement = { order: Order; input: number; payment: number };

/// Fill a batch of orders with any of the five books, and pay the protocol's
/// fee for all of them.
///
/// The outputs come in the order the ledger will sort the orders: each
/// order's payment, then, for a partial fill, the rest of the order. Then
/// the fee, then the seller's change.
// #region batch
export async function buildBatchTx(batch: Batch, book: Book, networkId: number): Promise<string> {
  const collateral = await collateralOf(batch.wallet);
  // Coin selection would add inputs after the indices were worked out and
  // shift them, so the seller's funds are chosen here, up front.
  const funds = withoutCollateral(await batch.wallet.getUtxos(), collateral);
  const orders = [...batch.orders].sort((a, b) => byLedgerOrder(a.utxo, b.utxo));
  const inputs = [...orders.map((order) => order.utxo), ...funds].sort(byLedgerOrder);

  // Lay the outputs out first, so every index is known before any redeemer
  // is written.
  const placements: Placement[] = [];
  let next = 0;
  for (const order of orders) {
    placements.push({ order, input: inputs.indexOf(order.utxo), payment: next });
    next += order.partly === undefined ? 1 : 2;
  }
  const feeIndex = next;

  const script = bookScriptCbor(book, batch.treasury);
  const txBuilder = new MeshTxBuilder({ fetcher: batch.provider, evaluator: batch.evaluator });
  for (const placement of placements) {
    const { utxo } = placement.order;
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
      .txInScript(script)
      .txInInlineDatumPresent()
      .txInRedeemerValue(spendRedeemer(book, batch.treasury, placement, feeIndex));
  }
  if (book !== "perOrder") {
    await withdrawZero(txBuilder, batch, book, networkId, coordinatorRedeemer(book, placements, feeIndex));
  }
  for (const { order } of placements) {
    const { utxo, owner, quantity, partly } = order;
    const sent = partly ?? quantity;
    txBuilder
      .txOut(owner, [{ unit: TOKEN_UNIT, quantity: String(sent) }])
      .txOutInlineDatumValue(mOutputReference(utxo.input.txHash, utxo.input.outputIndex));
    if (partly !== undefined) {
      txBuilder
        .txOut(utxo.output.address, [{ unit: "lovelace", quantity: rest(utxo, quantity, sent) }])
        .txOutInlineDatumValue(orderDatum(owner, quantity - sent));
    }
  }
  // #region fee
  // One fee for the whole batch, tagged with the book's hash.
  txBuilder
    .txOut(batch.treasury, [
      { unit: "lovelace", quantity: String(FEE_PER_ORDER * BigInt(placements.length)) },
    ])
    .txOutInlineDatumValue(bookHash(book, batch.treasury));
  // #endregion fee
  for (const { input, output } of funds) {
    txBuilder.txIn(input.txHash, input.outputIndex, output.amount, output.address);
  }
  return await txBuilder
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(await batch.wallet.getChangeAddress())
    .complete();
}
// #endregion batch

/// The ADA the rest of an order keeps: the share still owed, rounded up, so
/// rounding always favors the buyer.
function rest(order: UTxO, quantity: number, sent: number): string {
  const locked = BigInt(order.output.amount.find((asset) => asset.unit === "lovelace")!.quantity);
  const owed = BigInt(quantity - sent);
  return ((locked * owed + BigInt(quantity) - 1n) / BigInt(quantity)).toString();
}

// #region redeemers
/// What each order's spend handler is told.
export function spendRedeemer(
  book: Book,
  treasury: string,
  { order, input, payment }: Placement,
  feeIndex: number,
): Data {
  switch (book) {
    case "perOrder":
      return mConStr0([input, payment, feeIndex]); // Fill { input, output, fee }
    case "byHand":
      return mConStr0([input]); // Fill { input_index }
    case "withLibrary":
      return mConStr0([input, 0]); // Fill { input_index, withdrawal_index }
    case "mixedByHand":
      // Fill { input_index } or PartialFill { input_index }
      return order.partly === undefined ? mConStr0([input]) : mConStr2([input]);
    case "mixedLibrary": {
      // Fill { filling, input_index, withdrawal_index, coordinator }. The
      // coordinator's credential is how the library tells this book's
      // redeemers from every other script's.
      const filling = order.partly === undefined ? mConStr0([]) : mConStr1([]);
      const coordinator = mConStr1([bookHash(book, treasury)]);
      return mConStr0([filling, input, 0, coordinator]);
    }
  }
}

/// What the coordinator is told: where each order's payment is, and where
/// the fee is.
export function coordinatorRedeemer(
  book: CoordinatedBook,
  placements: Placement[],
  feeIndex: number,
): Data {
  switch (book) {
    case "byHand":
    case "mixedByHand":
      // Batch { payments, fee }: the payments, in input order.
      return mConStr0([placements.map(({ payment }) => payment), feeIndex]);
    case "withLibrary":
    case "mixedLibrary":
      // Batch { indices, fee }: each order's input paired with its payment.
      return mConStr0([new Map(placements.map(({ input, payment }) => [input, payment])), feeIndex]);
  }
}
// #endregion redeemers

/// Add a book's coordinator: a withdrawal from its own stake credential.
async function withdrawZero(
  txBuilder: MeshTxBuilder,
  batch: Batch,
  book: CoordinatedBook,
  networkId: number,
  redeemer: Data,
): Promise<void> {
  const rewardAddress = coordinatorRewardAddress(book, batch.treasury, networkId);
  // A withdrawal must take the account's whole balance, normally zero.
  const { rewards } = await batch.provider.fetchAccountInfo(rewardAddress);
  txBuilder
    .withdrawalPlutusScriptV3()
    .withdrawal(rewardAddress, rewards)
    .withdrawalScript(bookScriptCbor(book, batch.treasury))
    .withdrawalRedeemerValue(redeemer);
}

/// Register a book's stake credential, so its coordinator can run. Once per
/// book, by anyone, for a 2 ADA deposit that stays locked: nobody may
/// deregister it.
// #region register
export async function buildRegisterCoordinatorTx(
  wallet: IWallet,
  provider: IFetcher,
  book: CoordinatedBook,
  treasury: string,
  networkId: number,
): Promise<string> {
  return await new MeshTxBuilder({ fetcher: provider })
    .registerStakeCertificate(coordinatorRewardAddress(book, treasury, networkId))
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}
// #endregion register

/// Take an order back, alone: no book accepts a cancel in a batch. Built and
/// signed by its owner.
export async function buildCancelTx(
  ownerWallet: IWallet,
  provider: IFetcher,
  book: Book,
  treasury: string,
  order: Order,
  evaluator?: IEvaluator,
): Promise<string> {
  const owner = await ownerWallet.getChangeAddress();
  const collateral = await collateralOf(ownerWallet);
  const { utxo } = order;
  return await new MeshTxBuilder({ fetcher: provider, evaluator })
    .spendingPlutusScriptV3()
    .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
    .txInScript(bookScriptCbor(book, treasury))
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr1([])) // Cancel
    .requiredSignerHash(deserializeAddress(owner).pubKeyHash)
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(owner)
    .selectUtxosFrom(withoutCollateral(await ownerWallet.getUtxos(), collateral))
    .complete();
}

export async function collateralOf(wallet: IWallet): Promise<UTxO> {
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  return collateral;
}

export function withoutCollateral(utxos: UTxO[], collateral: UTxO): UTxO[] {
  return utxos.filter(
    ({ input }) =>
      input.txHash !== collateral.input.txHash ||
      input.outputIndex !== collateral.input.outputIndex,
  );
}
