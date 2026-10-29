import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { cardAddress, cardPolicyId } from "./lib/blueprint.ts";
import {
  buildCardCreateTx,
  buildCardKeepTx,
  buildCardRedeemTx,
  fetchCard,
  fetchLocked,
} from "./lib/giftcard.ts";
import type { Card } from "./lib/giftcard.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at the proxy rule in `vite.config.ts`, which
// runs in Node and is the only thing that holds the key.
const provider = new BlockfrostProvider("/api/blockfrost");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

// The card's policy id and address are derived from the seed it was created
// from, so there is nothing to compute until you have created one. This is the
// only thing the page remembers, and it lives in this browser alone.
const STORAGE_KEY = "onboarding-giftcard-card";

function loadCard(): Card | undefined {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Card) : undefined;
  } catch {
    return undefined;
  }
}

function saveCard(card: Card) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(card));
  } catch {
    // A private window can refuse this. The page still works for one session.
  }
}

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
  const [hasCollateral, setHasCollateral] = useState(false);
  const [card, setCard] = useState<Card | undefined>(loadCard);
  const [locked, setLocked] = useState<UTxO>();
  const [cardUtxo, setCardUtxo] = useState<UTxO>();
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      setWallet(connected);
      setAddress(await connected.getChangeAddress());
      setHasCollateral((await connected.getCollateral()).length > 0);
      await refresh(card, connected);
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  async function refresh(which = card, using = wallet) {
    if (!which || !using) return;
    setLocked(await fetchLocked(provider, NETWORK_ID, which));
    setCardUtxo(await fetchCard(using, which));
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

  // Creating is the one action that returns something worth keeping: the seed
  // it chose, which is what the card's policy id and address are derived from.
  function create() {
    setTxHash("");
    setStatus("Working… approve the transaction in your wallet.");
    buildCardCreateTx(wallet!, provider, NETWORK_ID, "5000000")
      .then(async ({ unsignedTx, card: fresh }) => {
        const signedTx = await wallet!.signTx(unsignedTx, true);
        const hash = await wallet!.submitTx(signedTx);
        saveCard(fresh);
        setCard(fresh);
        setTxHash(hash);
        setStatus("Submitted. Give it a moment to confirm, then Refresh.");
      })
      .catch((error) => setStatus(`error: ${(error as Error).message}`));
  }

  return (
    <main className="mx-auto max-w-xl p-6 font-sans">
      <h1 className="text-xl font-bold">Gift card: a token that opens a lock</h1>
      <p className="mt-1 text-sm text-gray-600">
        One script, two jobs. As a policy it creates the card once and burns it. As an address it
        holds the funds, and releases them only in a transaction that burns the card.
      </p>

      <p className="mt-3 rounded-lg bg-gray-100 p-3 text-xs">
        {card ? (
          <>
            <span className="font-semibold">Your card's policy ID</span>
            <br />
            <span className="font-mono break-all">{cardPolicyId(card.seed)}</span>
            <br />
            <span className="font-semibold">The address holding its funds, the same hash</span>
            <br />
            <span className="font-mono break-all">{cardAddress(card.seed, NETWORK_ID)}</span>
          </>
        ) : (
          <>
            No card yet. The policy ID and the address are derived from the UTxO the card is
            created from, so neither exists until you create one in step 3.
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
        title="Create a card"
        hint="Mints the card and locks 5 ADA behind it, in one transaction. The UTxO this spends fixes the policy ID, and the card comes back to your wallet."
      >
        <button className={btn} disabled={!wallet || !hasCollateral} onClick={create}>
          Create a 5 ADA card
        </button>{" "}
        <button className={btn} onClick={() => refresh()} disabled={!wallet || !card}>
          Refresh
        </button>
      </Step>

      <Step
        n={4}
        title="Use it"
        hint="Redeeming spends the funds and burns the card in one transaction, so both handlers run. Keeping the card is refused before anything is sent: your SDK ran the contract, and the spend handler found no burn."
      >
        {!card ? (
          <p className="text-sm text-gray-500">Nothing created yet.</p>
        ) : !locked ? (
          <p className="text-sm text-gray-500">Nothing found at the card's address. Refresh once it confirms.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono text-xs">
              {locked.input.txHash.slice(0, 8)}…#{locked.input.outputIndex}
            </span>
            <span>{ada(locked)}</span>
            <span className="text-gray-500">{cardUtxo ? "you hold the card" : "the card is not in this wallet"}</span>
            <button
              className={btn}
              disabled={!hasCollateral || !cardUtxo}
              onClick={() =>
                run(() => buildCardRedeemTx(wallet!, provider, card, locked, cardUtxo!, provider))
              }
            >
              Redeem: burn the card, take the funds
            </button>
            <button
              className={btn}
              disabled={!hasCollateral || !cardUtxo}
              onClick={() =>
                run(() => buildCardKeepTx(wallet!, provider, card, locked, cardUtxo!, provider))
              }
            >
              Take the funds, keep the card
            </button>
          </div>
        )}
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
