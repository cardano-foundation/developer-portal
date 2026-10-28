import { MeshTxBuilder, deserializeAddress, mConStr0, mConStr1, mConStr2, mOutputReference } from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import { TOKEN_UNIT, bookAddress, bookScriptCbor, orderDatum } from "./blueprint.ts";
import type { Book } from "./blueprint.ts";

/// An order as a seller finds it on chain: the UTxO, and what its datum asks
/// for.
export type Order = {
  utxo: UTxO;
  /// Where the tokens go: the buyer's address, as written in the datum.
  owner: string;
  /// How many tokens the order buys.
  quantity: number;
};

/// Everything a fill needs: who fills, and which orders.
export type Batch = {
  /// The seller's wallet. It pays the fee and delivers the tokens, and keeps
  /// the ADA the orders held.
  wallet: IWallet;
  provider: IFetcher;
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
  networkId: number,
  lovelace: string,
  quantity: number,
): Promise<string> {
  const owner = await wallet.getChangeAddress();
  return await new MeshTxBuilder({ fetcher: provider })
    .txOut(bookAddress(book, networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(orderDatum(owner, quantity))
    .changeAddress(owner)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();
}

// #region ledger-order
/// The order the scripts see inputs in. A transaction's inputs are a set:
/// however the builder adds them, the ledger sorts them by transaction hash,
/// then by output index. Use it with `sort`.
export function byLedgerOrder(a: UTxO, b: UTxO): number {
  if (a.input.txHash !== b.input.txHash) return a.input.txHash < b.input.txHash ? -1 : 1;
  return a.input.outputIndex - b.input.outputIndex;
}
// #endregion ledger-order

/// Fill every order in the batch, with any of the three books. Each order
/// gets its whole quantity, unless `partly` says how many tokens to deliver
/// instead: then each order gets that many, and the rest of it goes back on
/// the book.
///
/// The outputs come in the order the ledger will sort the orders: one per
/// order for a fill, or two (the payment, then the rest of the order) for a
/// partial fill. The seller's change goes last.
// #region fill
export async function buildFillTx(batch: Batch, book: Book, partly?: number): Promise<string> {
  const collateral = await collateralOf(batch.wallet);
  // Coin selection would add inputs after the indices were worked out and
  // shift them, so the seller's funds are chosen here, up front.
  const funds = withoutCollateral(await batch.wallet.getUtxos(), collateral);
  const orders = [...batch.orders].sort((a, b) => byLedgerOrder(a.utxo, b.utxo));
  const inputs = [...orders.map((order) => order.utxo), ...funds].sort(byLedgerOrder);
  const outputsPerOrder = partly === undefined ? 1 : 2;

  const script = bookScriptCbor(book);
  const txBuilder = new MeshTxBuilder({ fetcher: batch.provider, evaluator: batch.evaluator });
  orders.forEach(({ utxo }, n) => {
    // Order `n`, in ledger order, is paid by output `n` (or `2n`).
    const input = inputs.indexOf(utxo);
    const output = n * outputsPerOrder;
    txBuilder
      .spendingPlutusScriptV3()
      .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
      .txInScript(script)
      .txInInlineDatumPresent()
      .txInRedeemerValue(
        partly === undefined
          ? fillRedeemer(book, input, output)
          : partialFillRedeemer(book, input, output),
      );
  });
  for (const { utxo, owner, quantity } of orders) {
    const sent = partly ?? quantity;
    txBuilder
      .txOut(owner, [{ unit: TOKEN_UNIT, quantity: String(sent) }])
      // The tag: this output pays this order and no other.
      .txOutInlineDatumValue(mOutputReference(utxo.input.txHash, utxo.input.outputIndex));
    if (partly !== undefined) {
      txBuilder
        .txOut(utxo.output.address, [{ unit: "lovelace", quantity: rest(utxo, quantity, sent) }])
        .txOutInlineDatumValue(orderDatum(owner, quantity - sent));
    }
  }
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
// #endregion fill

// #region rest
/// The ADA the rest of an order keeps: the share still owed, rounded up, so
/// rounding always favors the buyer.
function rest(order: UTxO, quantity: number, sent: number): string {
  const locked = BigInt(order.output.amount.find((asset) => asset.unit === "lovelace")!.quantity);
  const owed = BigInt(quantity - sent);
  return ((locked * owed + BigInt(quantity) - 1n) / BigInt(quantity)).toString();
}
// #endregion rest

// #region redeemers
/// What each book's spend handler is told about where to look. `input` is the
/// order's position among the inputs, `output` the position of the output
/// that pays it.
export function fillRedeemer(book: Book, input: number, output: number): Data {
  switch (book) {
    case "naive":
      return mConStr0([]); // Fill: nothing to point at, the spend searches
    case "byHand":
      return mConStr0([output]); // Fill(output_index)
    case "withLibrary":
      return mConStr0([mConStr0([input, output])]); // Fill(InputAndOutput)
  }
}

/// The same for a partial fill, whose payment at `output` is followed by the
/// rest of the order at `output + 1`.
export function partialFillRedeemer(book: Book, input: number, output: number): Data {
  switch (book) {
    case "naive":
      return mConStr2([]); // PartialFill: the spend searches
    case "byHand":
      return mConStr2([mConStr0([input, output])]); // PartialFill(InputAndOutput)
    case "withLibrary":
      return mConStr2([mConStr0([input, [output, output + 1]])]); // PartialFill(InputAndOutputs)
  }
}
// #endregion redeemers

/// Take an order back. Built and signed by its owner: every book refuses
/// anyone else.
// #region cancel
export async function buildCancelTx(
  ownerWallet: IWallet,
  provider: IFetcher,
  book: Book,
  order: Order,
  evaluator?: IEvaluator,
): Promise<string> {
  const owner = await ownerWallet.getChangeAddress();
  const collateral = await collateralOf(ownerWallet);
  const { utxo } = order;
  return await new MeshTxBuilder({ fetcher: provider, evaluator })
    .spendingPlutusScriptV3()
    .txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
    .txInScript(bookScriptCbor(book))
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr1([])) // Cancel
    // The signature every book looks for.
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
// #endregion cancel

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
