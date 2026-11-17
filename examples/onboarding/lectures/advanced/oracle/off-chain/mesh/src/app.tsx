import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { deploymentOf } from "./lib/deployment.ts";
import type { DeploymentRecord } from "./lib/deployment.ts";
import { networkFrom } from "./lib/network.ts";
import { fetchOracle, rateOf } from "./lib/oracle.ts";
import { buildConsumerLockTx, fetchLocked } from "./lib/reference-input.ts";
import {
  buildConsumerSpendViaReferenceTx,
  fetchPublishedConsumerScript,
} from "./lib/reference-script.ts";
import "./index.css";

const network = networkFrom(import.meta.env.VITE_NETWORK);

// No key here. The provider points at the proxy rule in `vite.config.ts`, which
// runs in Node and is the only thing that holds the key.
const provider = new BlockfrostProvider("/api/blockfrost");

// The record `npm run deploy` wrote for this network. The page publishes
// nothing and remembers nothing: everything it needs to find is in there.
// #region load-record
const records = import.meta.glob<DeploymentRecord>("../deployments/*.json", {
  eager: true,
  import: "default",
});
const record: DeploymentRecord | undefined = records[`../deployments/${network.name}.json`];
// #endregion load-record

/** A numbered step card. */
function Step(props: { n: number; title: string; hint: ReactNode; children: ReactNode }) {
  return (
    <section className="my-4 flex gap-3 rounded-xl border border-gray-200 p-4">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
        {props.n}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-base font-semibold">{props.title}</h2>
        <p className="mb-2 text-xs text-gray-500">{props.hint}</p>
        {props.children}
      </div>
    </section>
  );
}

const btn =
  "rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-40";

function App(props: { record: DeploymentRecord }) {
  const deployment = deploymentOf(props.record);
  const [wallet, setWallet] = useState<BrowserWallet>();
  const [address, setAddress] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);
  const [oracle, setOracle] = useState<UTxO>();
  const [locked, setLocked] = useState<UTxO[]>([]);
  const [scriptUtxo, setScriptUtxo] = useState<UTxO>();
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      setAddress(await connected.getChangeAddress());
      setHasCollateral((await connected.getCollateral()).length > 0);
      await refresh();
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function refresh() {
    setOracle(await fetchOracle(provider, network.id, deployment));
    setLocked(await fetchLocked(provider, network.id, deployment));
    setScriptUtxo(
      await fetchPublishedConsumerScript(provider, props.record.consumerScript.address, deployment),
    );
  }

  // Build → sign (partial, so the wallet signs its own inputs and leaves the
  // script input to the network) → submit. Returns the transaction hash.
  function run(action: () => Promise<string>) {
    setTxHash("");
    setStatus("Working… approve the transaction in your wallet.");
    action()
      .then(async (unsignedTx) => {
        const signedTx = await wallet!.signTx(unsignedTx, true);
        const hash = await wallet!.submitTx(signedTx);
        setTxHash(hash);
        setStatus("Submitted. Give it a moment to confirm, then Refresh.");
      })
      .catch((error) => setStatus(`error: ${(error as Error).message}`));
  }

  return (
    <main className="mx-auto max-w-xl p-6 font-sans">
      <h1 className="text-xl font-bold">Oracle on {network.name}</h1>
      <p className="mt-1 text-sm text-gray-600">
        The operator deployed this oracle from a script and updates it from there. This page is
        for its users: it reads the rate, and locks and unlocks ADA at the consumer, which only
        releases it while the rate is positive.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        <span className="font-semibold">The oracle's address</span>
        <br />
        <span className="font-mono break-all">{props.record.oracleAddress}</span>
        <br />
        <span className="font-semibold">The consumer's address</span>
        <br />
        <span className="font-mono break-all">{props.record.consumerAddress}</span>
      </p>

      <Step n={1} title="Connect your wallet" hint={`Lace, switched to the ${network.name} network.`}>
        {!laceInstalled ? (
          <p className="text-sm text-red-600">
            Lace not found. Install it and switch to {network.name}.
          </p>
        ) : wallet ? (
          <p className="text-sm text-gray-700 break-all">Connected: {address}</p>
        ) : (
          <button className={btn} onClick={connect}>
            Connect Lace
          </button>
        )}
      </Step>

      <Step n={2} title="Set up collateral" hint="A small ADA deposit smart-contract transactions require.">
        <button className={btn} onClick={checkCollateral} disabled={!wallet}>
          Check collateral
        </button>{" "}
        <span className="text-sm">{hasCollateral ? "✓ set" : "not set"}</span>
      </Step>

      <Step n={3} title="Read the oracle" hint="Found by its beacon, at the address in the record.">
        <div className="flex items-center gap-2 text-sm">
          {oracle ? (
            <span>rate: {rateOf(oracle)}</span>
          ) : (
            <span className="text-gray-500">Not read yet.</span>
          )}
          <button className={btn} onClick={refresh} disabled={!wallet}>
            Refresh
          </button>
        </div>
      </Step>

      <Step
        n={4}
        title="Use the consumer"
        hint="Unlocking points at the reference script the operator published at the never address, and reads the oracle as a reference input."
      >
        <button
          className={btn}
          disabled={!wallet}
          onClick={() =>
            run(() => buildConsumerLockTx(wallet!, provider, network.id, deployment, "5000000"))
          }
        >
          Lock 5 ADA
        </button>
        <ul className="mt-2 space-y-1 text-sm">
          {locked.length === 0 ? (
            <li className="text-gray-500">Nothing locked at the consumer.</li>
          ) : (
            locked.map((utxo) => (
              <li
                key={`${utxo.input.txHash}#${utxo.input.outputIndex}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="font-mono text-xs">
                  {utxo.input.txHash.slice(0, 8)}…#{utxo.input.outputIndex}
                </span>
                <button
                  className={btn}
                  disabled={!hasCollateral || !oracle || !scriptUtxo}
                  onClick={() =>
                    run(() =>
                      buildConsumerSpendViaReferenceTx(
                        wallet!,
                        provider,
                        deployment,
                        utxo,
                        oracle!,
                        scriptUtxo!,
                        provider,
                      ),
                    )
                  }
                >
                  Unlock
                </button>
              </li>
            ))
          )}
        </ul>
      </Step>

      {status && <p className="mt-3 text-sm">{status}</p>}
      {txHash && (
        <p className="mt-1 text-sm">
          <a
            className="text-blue-600 underline"
            href={network.explorer + txHash}
            target="_blank"
            rel="noreferrer"
          >
            view on explorer
          </a>
        </p>
      )}
    </main>
  );
}

function NotDeployed() {
  return (
    <main className="mx-auto max-w-xl p-6 font-sans">
      <h1 className="text-xl font-bold">Oracle on {network.name}</h1>
      <p className="mt-3 text-sm">
        No <code>deployments/{network.name}.json</code> yet. Run <code>npm run deploy</code>, then
        reload this page.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  record ? <App record={record} /> : <NotDeployed />,
);
