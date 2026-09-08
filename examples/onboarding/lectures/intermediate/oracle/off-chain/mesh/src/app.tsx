import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { beaconPolicyId, consumerAddress, oracleAddress } from "./lib/blueprint.ts";
import {
  buildOracleCreateTx,
  buildOracleDeleteTx,
  buildOracleUpdateTx,
  fetchOracle,
  rateOf,
} from "./lib/oracle.ts";
import type { Deployment } from "./lib/oracle.ts";
import {
  buildConsumerLockTx,
  buildConsumerSpendTx,
  fetchLocked,
} from "./lib/reference-input.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at the proxy rule in `vite.config.ts`, which
// runs in Node and is the only thing that holds the key.
const provider = new BlockfrostProvider("/api/blockfrost");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

// The oracle's address is derived from the seed you minted the beacon from, so
// there is nothing to compute until you have published one. This is the only
// thing the page remembers, and it lives in this browser alone.
const STORAGE_KEY = "onboarding-oracle-deployment";

function loadDeployment(): Deployment | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Deployment) : undefined;
  } catch {
    return undefined;
  }
}

function saveDeployment(deployment: Deployment) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deployment));
  } catch {
    // A private window can refuse this. The page still works for one session.
  }
}

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

function App() {
  const [wallet, setWallet] = useState<BrowserWallet>();
  const [address, setAddress] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);
  const [deployment, setDeployment] = useState<Deployment | undefined>(loadDeployment);
  const [oracle, setOracle] = useState<UTxO>();
  const [locked, setLocked] = useState<UTxO[]>([]);
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");
  const policyId = deployment ? beaconPolicyId(deployment.seed) : undefined;

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      setAddress(await connected.getChangeAddress());
      setHasCollateral((await connected.getCollateral()).length > 0);
      await refresh(deployment);
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function refresh(which = deployment) {
    if (!which) return;
    setOracle(await fetchOracle(provider, NETWORK_ID, which));
    setLocked(await fetchLocked(provider, NETWORK_ID, which));
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

  // Publishing is the one action that returns something worth keeping: the seed
  // it chose, which is what every address here is derived from.
  function publish() {
    setTxHash("");
    setStatus("Working… approve the transaction in your wallet.");
    buildOracleCreateTx(wallet!, provider, NETWORK_ID, 100)
      .then(async ({ unsignedTx, deployment: fresh }) => {
        const signedTx = await wallet!.signTx(unsignedTx, true);
        const hash = await wallet!.submitTx(signedTx);
        saveDeployment(fresh);
        setDeployment(fresh);
        setTxHash(hash);
        setStatus("Submitted. Give it a moment to confirm, then Refresh.");
      })
      .catch((error) => setStatus(`error: ${(error as Error).message}`));
  }

  return (
    <main className="mx-auto max-w-xl p-6 font-sans">
      <h1 className="text-xl font-bold">Oracle: change data on the chain</h1>
      <p className="mt-1 text-sm text-gray-600">
        A UTxO can't be edited, so an update <b>spends</b> it and puts a new one straight back in
        the same transaction, carrying a new rate. The value changes; the UTxO is replaced.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        {deployment && policyId ? (
          <>
            <span className="font-semibold">Your beacon's policy ID</span>
            <br />
            <span className="font-mono break-all">{policyId}</span>
            <br />
            <span className="font-semibold">Your oracle's address</span>
            <br />
            <span className="font-mono break-all">
              {oracleAddress(policyId, deployment.operator, NETWORK_ID)}
            </span>
            <br />
            <span className="font-semibold">The consumer's address</span>
            <br />
            <span className="font-mono break-all">{consumerAddress(policyId, NETWORK_ID)}</span>
          </>
        ) : (
          <>
            No oracle yet. Both addresses are derived from the UTxO your beacon is minted from, so
            neither exists until you publish one in step 3.
          </>
        )}
      </p>

      <Step n={1} title="Connect your wallet" hint="Lace, switched to the Preview network.">
        {!laceInstalled ? (
          <p className="text-sm text-red-600">Lace not found. Install it and switch to Preview.</p>
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

      <Step
        n={3}
        title="Publish an oracle"
        hint="Mints the beacon and locks it with the first rate. The UTxO this spends fixes the policy ID, and through it every address on this page."
      >
        <button className={btn} disabled={!wallet || !hasCollateral} onClick={publish}>
          Publish rate 100
        </button>{" "}
        <button className={btn} onClick={() => refresh()} disabled={!wallet || !deployment}>
          Refresh
        </button>
      </Step>

      <Step
        n={4}
        title="Update it"
        hint="Watch the transaction hash change while the beacon carries over: a new UTxO replaced the old one."
      >
        {!oracle ? (
          <p className="text-sm text-gray-500">
            {deployment ? "Nothing found yet. Refresh once it confirms." : "Nothing published yet."}
          </p>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-mono text-xs">
              {oracle.input.txHash.slice(0, 8)}…#{oracle.input.outputIndex}
            </span>
            <span>rate: {rateOf(oracle)}</span>
            <button
              className={btn}
              disabled={!hasCollateral}
              onClick={() =>
                run(() =>
                  buildOracleUpdateTx(
                    wallet!,
                    provider,
                    NETWORK_ID,
                    deployment!,
                    oracle,
                    rateOf(oracle) + 50,
                    provider,
                  ),
                )
              }
            >
              Raise by 50
            </button>
            <button
              className={btn}
              disabled={!hasCollateral}
              onClick={() =>
                run(() => buildOracleDeleteTx(wallet!, provider, deployment!, oracle, provider))
              }
            >
              Close
            </button>
          </div>
        )}
      </Step>

      <Step
        n={5}
        title="Read it from another contract"
        hint="The consumer only releases its funds while the rate is positive. It reads the oracle as a reference input, so the oracle is never spent."
      >
        <button
          className={btn}
          disabled={!wallet || !deployment}
          onClick={() =>
            run(() => buildConsumerLockTx(wallet!, provider, NETWORK_ID, deployment!, "5000000"))
          }
        >
          Lock 5 ADA
        </button>{" "}
        <ul className="mt-2 space-y-1 text-sm">
          {locked.length === 0 ? (
            <li className="text-gray-500">Nothing locked at the consumer.</li>
          ) : (
            locked.map((utxo) => (
              <li key={`${utxo.input.txHash}#${utxo.input.outputIndex}`} className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {utxo.input.txHash.slice(0, 8)}…#{utxo.input.outputIndex}
                </span>
                <button
                  className={btn}
                  disabled={!hasCollateral || !oracle}
                  onClick={() =>
                    run(() =>
                      buildConsumerSpendTx(
                        wallet!,
                        provider,
                        NETWORK_ID,
                        deployment!,
                        utxo,
                        oracle!,
                        provider,
                      ),
                    )
                  }
                >
                  Unlock, reading the oracle
                </button>
              </li>
            ))
          )}
        </ul>
      </Step>

      {status && <p className="mt-3 text-sm">{status}</p>}
      {txHash && (
        <p className="mt-1 text-sm">
          <a className="text-blue-600 underline" href={EXPLORER + txHash} target="_blank" rel="noreferrer">
            view on explorer
          </a>
        </p>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
