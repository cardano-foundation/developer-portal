import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet, deserializeAddress } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { vestingAddress } from "./lib/blueprint.ts";
import { fetchVested } from "./lib/fetch.ts";
import { buildVestingClaimTx, buildVestingLockTx, deadlineOf } from "./lib/vesting.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at the proxy rule in `vite.config.ts`, which
// runs in Node and is the only thing that holds the key.
const provider = new BlockfrostProvider("/api/blockfrost");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

const VESTING_ADDRESS = vestingAddress(NETWORK_ID);

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
  const [beneficiary, setBeneficiary] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);
  const [vested, setVested] = useState<UTxO[]>([]);
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      const changeAddress = await connected.getChangeAddress();
      setAddress(changeAddress);
      // Your key hash. The contract's address is shared with everyone who
      // compiled it, so this is what picks out the UTxOs that are yours.
      const pubKeyHash = deserializeAddress(changeAddress).pubKeyHash;
      setBeneficiary(pubKeyHash);
      setHasCollateral((await connected.getCollateral()).length > 0);
      setVested(await fetchVested(provider, NETWORK_ID, pubKeyHash));
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function reloadVested() {
    setVested(await fetchVested(provider, NETWORK_ID, beneficiary));
  }

  // Lock for two minutes, so you can watch the claim be refused and then
  // succeed without waiting around.
  function lockVesting() {
    const lockUntil = Date.now() + 2 * 60_000;
    run(() => buildVestingLockTx(wallet!, provider, NETWORK_ID, "5000000", lockUntil));
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
      <h1 className="text-xl font-bold">Vesting: lock until a deadline</h1>
      <p className="mt-1 text-sm text-gray-600">
        The vault, plus a time check. The contract never reads a clock, only the validity
        window the transaction declared, which the ledger has already checked against the real slot.
        Claim early and the contract itself refuses.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        <span className="font-semibold">The vesting contract's address</span>
        <br />
        <span className="font-mono break-all">{VESTING_ADDRESS}</span>
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
        title="Lock until a deadline"
        hint="Locks for 2 minutes, so you can watch a claim be refused and then succeed."
      >
        <button className={btn} disabled={!wallet} onClick={lockVesting}>
          Lock 5 ADA for 2 minutes
        </button>{" "}
        <button className={btn} onClick={reloadVested} disabled={!wallet}>
          Refresh vested
        </button>
      </Step>

      <Step
        n={4}
        title="Claim"
        hint="Try it before the countdown ends: the transaction is built, submitted, and refused by the validator."
      >
        <ul className="mt-2 space-y-1 text-sm">
          {vested.length === 0 ? (
            <li className="text-gray-500">Nothing vested by you yet.</li>
          ) : (
            vested.map((utxo) => {
              const deadline = deadlineOf(utxo);
              const remaining = Math.ceil((deadline - Date.now()) / 1000);
              return (
                <li key={`${utxo.input.txHash}#${utxo.input.outputIndex}`} className="flex items-center gap-2">
                  <span className="font-mono text-xs">
                    {utxo.input.txHash.slice(0, 8)}…#{utxo.input.outputIndex}
                  </span>
                  <span>{ada(utxo)}</span>
                  <span className="text-xs text-gray-500">
                    {remaining > 0 ? `${remaining}s to go` : "claimable"}
                  </span>
                  <button
                    className={btn}
                    disabled={!wallet || !hasCollateral}
                    onClick={() =>
                      run(() => buildVestingClaimTx(wallet!, provider, utxo, deadline, provider))
                    }
                  >
                    Claim
                  </button>
                </li>
              );
            })
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
