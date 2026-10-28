import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import { MeshWallet } from "@meshsdk/wallet";

import { waitForConfirmations } from "../src/lib/confirm.ts";
import type { DeploymentRecord } from "../src/lib/deployment.ts";
import { assertKeyMatches, networkFrom } from "../src/lib/network.ts";

/// What every operator script shares: the network, a provider holding the key,
/// the operator's wallet, and the deployment record.
///
/// These scripts run on the operator's machine and never in a browser, so they
/// may read the Blockfrost key and the operator's recovery phrase from `.env`.
// #region setup
process.loadEnvFile(".env");

export const network = networkFrom(process.env.VITE_NETWORK);
const key = process.env.BLOCKFROST_API_KEY ?? "";
assertKeyMatches(key, network);

// Here the provider holds the key itself. The browser goes through the proxy.
export const provider = new BlockfrostProvider(key);

/// The operator's wallet: the key that may update the oracle, and nothing else.
export async function operatorWallet(): Promise<MeshWallet> {
  const words = (process.env.OPERATOR_MNEMONIC ?? "").split(" ").filter(Boolean);
  if (words.length === 0) {
    throw new Error("OPERATOR_MNEMONIC is empty: run `npm run operator:new` first");
  }
  const wallet = new MeshWallet({
    networkId: network.id,
    fetcher: provider,
    submitter: provider,
    key: { type: "mnemonic", words },
  });
  await wallet.init();
  return wallet;
}
// #endregion setup

/// One record per network, at a path the app can import.
export const recordPath = `deployments/${network.name}.json`;

export function readRecord(): DeploymentRecord {
  if (!existsSync(recordPath)) {
    throw new Error(`no ${recordPath}: run \`npm run deploy\` first`);
  }
  return JSON.parse(readFileSync(recordPath, "utf8")) as DeploymentRecord;
}

export function writeRecord(record: DeploymentRecord): void {
  mkdirSync("deployments", { recursive: true });
  writeFileSync(recordPath, JSON.stringify(record, null, 2) + "\n");
}

/// Sign with the operator's key, submit, and wait until `depth` blocks sit on
/// top of the transaction. Returns its hash.
export async function send(wallet: MeshWallet, unsignedTx: string, depth: number) {
  const signedTx = await wallet.signTx(unsignedTx, true);
  const txHash = await wallet.submitTx(signedTx);
  console.log(`  submitted ${network.explorer}${txHash}`);
  console.log(`  waiting for ${depth} blocks on top of it…`);
  await waitForConfirmations(provider, txHash, depth);
  return txHash;
}

/// A faucet pays into one UTxO. A script transaction needs a second one, pure
/// ADA, to put up as collateral, so the operator pays 5 ADA to itself once.
export async function ensureCollateral(wallet: MeshWallet): Promise<void> {
  const utxos = await wallet.getUtxos();
  if (utxos.length >= 2 && (await wallet.getCollateral()).length > 0) return;

  console.log("Setting up collateral: 5 ADA to the operator's own address");
  const address = await wallet.getChangeAddress();
  const unsignedTx = await new MeshTxBuilder({ fetcher: provider })
    .txOut(address, [{ unit: "lovelace", quantity: "5000000" }])
    .changeAddress(address)
    .selectUtxosFrom(utxos)
    .complete();
  await send(wallet, unsignedTx, 1);
}
