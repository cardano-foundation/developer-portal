import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet, deserializeAddress } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { oracleAddress } from "./lib/blueprint.ts";
import { buildOracleCreateTx, buildOracleUpdateTx, fetchOracles, ownerOf, priceOf } from "./lib/oracle.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at the proxy rule in `vite.config.ts`, which
// runs in Node and is the only thing that holds the key.
const provider = new BlockfrostProvider("/api/blockfrost");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

const ORACLE_ADDRESS = oracleAddress(NETWORK_ID);

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
  const [owner, setOwner] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);
  const [oracles, setOracles] = useState<UTxO[]>([]);
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      const changeAddress = await connected.getChangeAddress();
      setAddress(changeAddress);
      // Your key hash. Every oracle here is readable, but only the ones whose
      // datum names you can be updated — the validator checks that.
      setOwner(deserializeAddress(changeAddress).pubKeyHash);
      setHasCollateral((await connected.getCollateral()).length > 0);
      setOracles(await fetchOracles(provider, NETWORK_ID));
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function reloadOracles() {
    setOracles(await fetchOracles(provider, NETWORK_ID));
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
      <h1 className="text-xl font-bold">Oracle: change data on the chain</h1>
      <p className="mt-1 text-sm text-gray-600">
        A UTxO can't be edited, so an update <b>spends</b> it and puts a new one straight back in
        the same transaction, carrying a new price. The value changes; the UTxO is replaced.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        <span className="font-semibold">The oracle's address</span>
        <br />
        <span className="font-mono break-all">{ORACLE_ADDRESS}</span>
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
        title="Publish a price"
        hint="An ordinary payment to the script address, carrying the first price in its datum. Nothing runs yet."
      >
        <button
          className={btn}
          disabled={!wallet}
          onClick={() => run(() => buildOracleCreateTx(wallet!, provider, NETWORK_ID, 100))}
        >
          Publish price 100
        </button>{" "}
        <button className={btn} onClick={reloadOracles} disabled={!wallet}>
          Refresh oracles
        </button>
      </Step>

      <Step
        n={4}
        title="Update it"
        hint="Watch the transaction hash change while the price carries over: a new UTxO replaced the old one."
      >
        <ul className="mt-2 space-y-1 text-sm">
          {oracles.length === 0 ? (
            <li className="text-gray-500">Nothing published yet.</li>
          ) : (
            oracles.map((utxo) => (
              <li key={`${utxo.input.txHash}#${utxo.input.outputIndex}`} className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {utxo.input.txHash.slice(0, 8)}…#{utxo.input.outputIndex}
                </span>
                <span>price: {priceOf(utxo)}</span>
                <span className="text-xs text-gray-500">
                  {ownerOf(utxo) === owner ? "yours" : "someone else's"}
                </span>
                <button
                  className={btn}
                  disabled={!wallet || !hasCollateral || ownerOf(utxo) !== owner}
                  onClick={() =>
                    run(() =>
                      buildOracleUpdateTx(
                        wallet!,
                        provider,
                        NETWORK_ID,
                        utxo,
                        priceOf(utxo) + 50,
                        provider,
                      ),
                    )
                  }
                >
                  Raise by 50
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
