import { deploymentOf } from "../src/lib/deployment.ts";
import { buildOracleUpdateTx, fetchOracle, rateOf } from "../src/lib/oracle.ts";
import { network, operatorWallet, provider, readRecord, send } from "./operator.ts";

/// Publish a new rate: `npm run update -- 150`. Only the operator's key can.
const newRate = Number(process.argv[2]);
if (!Number.isInteger(newRate)) throw new Error("usage: npm run update -- <new rate>");

const deployment = deploymentOf(readRecord());
const oracle = await fetchOracle(provider, network.id, deployment);
if (!oracle) throw new Error("no oracle found: run `npm run monitor` to see why");

console.log(`Rate ${rateOf(oracle)} → ${newRate}`);
const wallet = await operatorWallet();
const unsignedTx = await buildOracleUpdateTx(
  wallet,
  provider,
  network.id,
  deployment,
  oracle,
  newRate,
  provider,
);
await send(wallet, unsignedTx, 1);
