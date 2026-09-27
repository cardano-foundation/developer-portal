// Builds payments against an in-memory chain: no network, no wallet extension,
// no test ADA. Run with `npm test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  MeshWallet,
  OfflineFetcher,
} from "@meshsdk/core";
import { deserializeTx } from "@meshsdk/core-cst";
import { buildPaymentTx } from "./payment";

async function fundedWallet(lovelace: string) {
  const fetcher = new OfflineFetcher("preprod");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  // An in-memory chain has no cost models; supply Mesh's defaults so the
  // builder doesn't log a fallback warning on every build.
  fetcher.fetchCostModels = async () => [
    DEFAULT_V1_COST_MODEL_LIST,
    DEFAULT_V2_COST_MODEL_LIST,
    DEFAULT_V3_COST_MODEL_LIST,
  ];
  const wallet = new MeshWallet({
    networkId: 0,
    fetcher,
    key: { type: "mnemonic", words: MeshWallet.brew() as string[] },
  });
  await wallet.init();
  const address = await wallet.getChangeAddress();
  fetcher.addUTxOs([
    {
      input: { txHash: "00".repeat(32), outputIndex: 0 },
      output: { address, amount: [{ unit: "lovelace", quantity: lovelace }] },
    },
  ]);
  return { wallet, fetcher, address };
}

async function recipient() {
  const other = new MeshWallet({ networkId: 0, key: { type: "mnemonic", words: MeshWallet.brew() as string[] } });
  await other.init();
  return other.getChangeAddress();
}

test("pays the exact amount to the recipient and returns the change", async () => {
  const { wallet, fetcher, address } = await fundedWallet("100000000");
  const to = await recipient();
  const tx = deserializeTx(await buildPaymentTx(wallet, fetcher, DEFAULT_PROTOCOL_PARAMETERS, to, 1_500_000));
  const outputs = tx.body().outputs().map((o) => ({ to: o.address().toBech32(), coin: o.amount().coin() }));
  const fee = tx.body().fee();

  assert.deepEqual(outputs.find((o) => o.to === to)?.coin, BigInt(1_500_000));
  const change = outputs.find((o) => o.to === address);
  assert.ok(change, "change goes back to the wallet");
  assert.equal(change.coin + BigInt(1_500_000) + fee, BigInt(100_000_000), "inputs = outputs + fee");
});

test("refuses a payment the wallet cannot cover", async () => {
  const { wallet, fetcher } = await fundedWallet("1000000");
  await assert.rejects(buildPaymentTx(wallet, fetcher, DEFAULT_PROTOCOL_PARAMETERS, await recipient(), 5_000_000));
});
