import { existsSync } from "node:fs";

import { neverAddress } from "../src/lib/blueprint.ts";
import { derive } from "../src/lib/deployment.ts";
import { buildOracleCreateTx } from "../src/lib/oracle.ts";
import { buildPublishConsumerScriptTx } from "../src/lib/reference-script.ts";
import {
  ensureCollateral,
  network,
  operatorWallet,
  provider,
  recordPath,
  send,
  writeRecord,
} from "./operator.ts";

/// Deploy the oracle: two transactions, each waited on, then the record.
///
/// Run it once per network. A second run would mint a second beacon from a new
/// seed, which is a second oracle at a second address, so it refuses instead.
// #region deploy
const FIRST_RATE = 100;
// Practical finality on Cardano: 10 to 20 blocks, a few minutes.
const DEPTH = 10;

if (existsSync(recordPath)) {
  throw new Error(`${recordPath} exists: this network already has a deployment`);
}

const wallet = await operatorWallet();
await ensureCollateral(wallet);

console.log("1/2 Mint the beacon and lock it with the first rate");
const { unsignedTx: createTx, deployment } = await buildOracleCreateTx(
  wallet,
  provider,
  network.id,
  FIRST_RATE,
);
const createOracle = await send(wallet, createTx, DEPTH);

console.log("2/2 Publish the consumer's script at the never address");
const publishTx = await buildPublishConsumerScriptTx(wallet, provider, network.id, deployment);
const publishConsumerScript = await send(wallet, publishTx, DEPTH);

// The publish transaction has one output at `never`: that is the script.
const store = neverAddress(network.id);
const published = (await provider.fetchAddressUTxOs(store)).find(
  (utxo) => utxo.input.txHash === publishConsumerScript,
);
if (!published) throw new Error("the published script is not at the never address");

const { scriptStoreAddress, ...derived } = derive(network.id, deployment.seed, deployment.operator);
writeRecord({
  network: network.name,
  seed: deployment.seed,
  operator: deployment.operator,
  ...derived,
  consumerScript: {
    txHash: published.input.txHash,
    outputIndex: published.input.outputIndex,
    address: scriptStoreAddress,
  },
  transactions: { createOracle, publishConsumerScript },
});
console.log(`Deployed. The record is in ${recordPath}: commit it.`);
// #endregion deploy
