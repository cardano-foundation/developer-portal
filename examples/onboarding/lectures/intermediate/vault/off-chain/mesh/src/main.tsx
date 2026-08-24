import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet, deserializeAddress } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { vaultAddress } from "./lib/blueprint.ts";
import { buildLockTx } from "./lib/lock.ts";
import { buildMintAndLockTx } from "./lib/mint.ts";
import { buildUnlockTx } from "./lib/unlock.ts";
import { fetchLocked } from "./lib/fetch.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at our own backend, which holds it, see
// the proxy rule in `vite.config.ts`.
const provider = new BlockfrostProvider("/api/blockfrost");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

// The contract's own address, derived from the compiled validator. It belongs to
// no one: only a transaction the validator approves can spend what sits here.
const VAULT_ADDRESS = vaultAddress(NETWORK_ID);

/** Lovelace held by a UTxO, as a readable ADA string. */
function ada(utxo: UTxO): string {
  const lovelace = utxo.output.amount.find((a) => a.unit === "lovelace")?.quantity ?? "0";
  return (Number(lovelace) / 1_000_000).toFixed(2) + " ADA";
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
  const [owner, setOwner] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);
  const [locked, setLocked] = useState<UTxO[]>([]);
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      const changeAddress = await connected.getChangeAddress();
      setAddress(changeAddress);
      // Your key hash. The vault's address is shared with everyone who compiled
      // the same contract, so this is what picks out the UTxOs that are yours.
      const pubKeyHash = deserializeAddress(changeAddress).pubKeyHash;
      setOwner(pubKeyHash);
      setHasCollateral((await connected.getCollateral()).length > 0);
      setLocked(await fetchLocked(provider, NETWORK_ID, pubKeyHash));
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function reloadLocked() {
    setLocked(await fetchLocked(provider, NETWORK_ID, owner));
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
      <h1 className="text-xl font-bold">Lock &amp; unlock a smart contract</h1>
      <p className="mt-1 text-sm text-gray-600">
        Lock some test ADA in a vault, then unlock it. The contract only releases the funds to the
        <b> owner</b> named in the datum, proven by a signature. The datum is public, but a signature
        can't be forged, so only you (the locker) can take it back.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        <span className="font-semibold">The vault's address</span>{" "}
        <span className="text-gray-500">
          (paste it into the explorer to see everything locked here)
        </span>
        <br />
        <span className="font-mono break-all">{VAULT_ADDRESS}</span>
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

      <Step n={3} title="Lock funds" hint="Send 5 test ADA to the contract, with you as the owner in the datum.">
        <button
          className={btn}
          disabled={!wallet}
          onClick={() => run(() => buildLockTx(wallet!, provider, NETWORK_ID, "5000000"))}
        >
          Lock 5 ADA
        </button>{" "}
        <button
          className={btn}
          disabled={!wallet || !hasCollateral}
          onClick={() => run(() => buildMintAndLockTx(wallet!, provider, NETWORK_ID, "5000000"))}
        >
          Mint &amp; lock 5 ADA
        </button>
        <p className="mt-2 text-xs text-gray-500">
          The second button also <b>mints</b> one VAULT token and locks it with the ADA. Same script
          hash, two jobs: the address the funds go to, and the policy id the token is created under.
          Unlocking brings both back.
        </p>
      </Step>

      <Step
        n={4}
        title="Unlock funds"
        hint="Spend a locked UTxO back to yourself. It only succeeds because you're the owner who signs."
      >
        <button className={btn} onClick={reloadLocked} disabled={!wallet}>
          Refresh locked
        </button>
        <ul className="mt-2 space-y-1 text-sm">
          {locked.length === 0 ? (
            <li className="text-gray-500">Nothing locked by you yet.</li>
          ) : (
            locked.map((utxo) => (
              <li key={`${utxo.input.txHash}#${utxo.input.outputIndex}`} className="flex items-center gap-2">
                <span className="font-mono text-xs">
                  {utxo.input.txHash.slice(0, 8)}…#{utxo.input.outputIndex}
                </span>
                <span>{ada(utxo)}</span>
                <button
                  className={btn}
                  disabled={!wallet || !hasCollateral}
                  onClick={() => run(() => buildUnlockTx(wallet!, provider, utxo, provider))}
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
          <a className="text-blue-600 underline" href={EXPLORER + txHash} target="_blank" rel="noreferrer">
            view on explorer
          </a>
        </p>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
