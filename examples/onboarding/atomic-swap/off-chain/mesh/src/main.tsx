import { useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  BlockfrostProvider,
  BrowserWallet,
  deserializeAddress,
  stringToHex,
} from "@meshsdk/core";
import type { Asset } from "@meshsdk/core";

import { tokenPolicyId } from "./lib/blueprint.ts";
import { buildMintTx } from "./lib/mint.ts";
import { buildLockTx } from "./lib/lock.ts";
import { fetchOffers, type Offer } from "./lib/fetch-offers.ts";
import { buildSwapTx } from "./lib/swap.ts";
import { buildCancelTx } from "./lib/cancel.ts";
import "./index.css";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");
const provider = new BlockfrostProvider(import.meta.env.VITE_BLOCKFROST_API_KEY ?? "");
const EXPLORER = "https://explorer.cardano.org/preview/transaction?id=";

/** Decode a hex string to text (e.g. an asset name hex → "GOLD"). */
function hexToText(hex: string): string {
  try {
    return new TextDecoder().decode(
      Uint8Array.from(hex.match(/.{1,2}/g) ?? [], (b) => parseInt(b, 16)),
    );
  } catch {
    return hex;
  }
}
/** Readable name from an asset unit (policyId + assetName hex). */
const assetName = (unit: string) => hexToText(unit.slice(56)) || unit.slice(0, 8);

/** The token an offer locked away (its single non-ADA asset). */
const lockedAsset = (offer: Offer): Asset | undefined =>
  offer.utxo.output.amount.find((a) => a.unit !== "lovelace");

/** A link to the Lace FAQ, opening in a new tab. */
function LaceFaq() {
  return (
    <a className="text-blue-600 underline" href="https://www.lace.io/faq" target="_blank" rel="noreferrer">
      lace.io/faq
    </a>
  );
}

/** A numbered step card with a short "what this does" explanation. */
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

/** Show a token id (policy id + name) with a copy button, to share with a trading partner. */
function CopyRow(props: { label: string; unit: string }) {
  return (
    <span className="flex items-center gap-1">
      <strong className="text-xs">{props.label}</strong>
      <code className="break-all text-xs text-gray-500">{props.unit.slice(0, 18)}…</code>
      <button
        className="rounded border border-gray-300 px-1.5 py-0.5 text-xs hover:bg-gray-50"
        onClick={() => navigator.clipboard.writeText(props.unit)}
      >
        copy
      </button>
    </span>
  );
}

function App() {
  const [wallet, setWallet] = useState<BrowserWallet>();
  const [address, setAddress] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [held, setHeld] = useState<Asset[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [giveQty, setGiveQty] = useState("1");
  const [giveSel, setGiveSel] = useState<"gold" | "silver">("gold");
  const [wantQty, setWantQty] = useState("1");
  const [wantSel, setWantSel] = useState<"gold" | "silver" | "other">("silver");
  const [wantOther, setWantOther] = useState("");
  const [status, setStatus] = useState<ReactNode>("");
  const [txHash, setTxHash] = useState("");
  const [hasCollateral, setHasCollateral] = useState(false);

  const laceInstalled = BrowserWallet.getInstalledWallets().some((w) => w.id === "lace");
  const amountOf = (unit: string) => Number(held.find((a) => a.unit === unit)?.quantity ?? "0");

  // Resolve the pickers into the token you're locking and the token you want.
  const giveUnit = giveSel === "gold" ? gold : silver;
  const giveName = giveSel === "gold" ? "GOLD" : "SILVER";
  const wantUnit = wantSel === "gold" ? gold : wantSel === "silver" ? silver : wantOther;
  const wantName =
    wantSel === "gold"
      ? "GOLD"
      : wantSel === "silver"
        ? "SILVER"
        : assetName(wantOther) || "the token";

  async function refresh(connected: BrowserWallet) {
    setHeld((await connected.getBalance()).filter((a) => a.unit !== "lovelace"));
    setHasCollateral((await connected.getCollateral()).length > 0);
  }

  async function checkCollateral() {
    if (wallet) setHasCollateral((await wallet.getCollateral()).length > 0);
  }

  // Re-pull everything from the chain: balance, collateral, and open offers.
  async function reload() {
    if (!wallet) return;
    await refresh(wallet);
    await loadOffers();
  }

  async function connect() {
    try {
      const connected = await BrowserWallet.enable("lace");
      const addr = await connected.getChangeAddress();
      const pkh = deserializeAddress(addr).pubKeyHash;
      setWallet(connected);
      setAddress(addr);
      setGold(tokenPolicyId(pkh) + stringToHex("GOLD"));
      setSilver(tokenPolicyId(pkh) + stringToHex("SILVER"));
      await refresh(connected);
      await loadOffers();
      setStatus("");
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  // #region connect
  // The connected browser wallet has the same methods the tested lib expects, so
  // we build the transaction with the lib and only sign + submit it here.
  // `true` = partial sign: the wallet signs just its own inputs and leaves the
  // contract's script input alone (the network validates that one instead).
  async function signAndSubmit(unsignedTx: string) {
    const signedTx = await wallet!.signTx(unsignedTx, true);
    return await wallet!.submitTx(signedTx);
  }
  // #endregion connect

  function run(action: () => Promise<string>) {
    setTxHash("");
    setStatus("Working… approve the transaction in your wallet.");
    action()
      .then(async (hash) => {
        setTxHash(hash);
        setStatus("Submitted. Give it a minute to confirm, then continue.");
        await refresh(wallet!);
      })
      .catch((error) => {
        const message = (error as Error).message;
        setStatus(
          message.includes("collateral") ? (
            <>
              Your wallet has no collateral set. See your wallet's guide to set it (for Lace: <LaceFaq />),
              then try again.
            </>
          ) : (
            `Error: ${message}`
          ),
        );
      });
  }

  const mint = (name: string) =>
    run(async () => signAndSubmit(await buildMintTx(wallet!, provider, stringToHex(name), "1")));

  const makeOffer = () =>
    run(async () =>
      signAndSubmit(
        await buildLockTx(
          wallet!,
          provider,
          NETWORK_ID,
          [
            { unit: "lovelace", quantity: "2000000" },
            { unit: giveUnit, quantity: giveQty },
          ],
          [{ policyId: wantUnit.slice(0, 56), assetName: wantUnit.slice(56), quantity: wantQty }],
        ),
      ),
    );

  const loadOffers = () =>
    fetchOffers(provider, NETWORK_ID)
      .then(setOffers)
      .catch((e) => setStatus(`Error: ${(e as Error).message}`));

  // #region swap
  const swap = (offer: Offer) =>
    run(async () => signAndSubmit(await buildSwapTx(wallet!, provider, offer)));
  // #endregion swap

  const cancel = (offer: Offer) =>
    run(async () => signAndSubmit(await buildCancelTx(wallet!, provider, offer)));

  return (
    <main className="mx-auto max-w-xl px-5 py-8 text-sm leading-relaxed text-gray-800">
      <header className="mb-6">
        <h1 className="mb-1 text-2xl font-bold">Atomic Swap</h1>
        <p className="text-gray-500">
          A guided demo on the Preview testnet. A swap normally happens between two people, but to keep it simple, you'll play <strong>both sides with one wallet</strong>, make an offer, then accept it yourself. The contract runs exactly the same either way.
        </p>
      </header>

      <Step n={1} title="Connect your wallet" hint="Connect Lace to act as the trader.">
        {!wallet ? (
          laceInstalled ? (
            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={connect}
            >
              Connect Lace
            </button>
          ) : (
            <p>
              Lace wallet not found —{" "}
              <a className="text-blue-600 underline" href="https://www.lace.io/" target="_blank" rel="noreferrer">
                Install Lace ↗
              </a>
            </p>
          )
        ) : (
          <>
            <p>
              <strong className="me-1">
                Connected
              </strong>
              <code className="break-all text-xs">{address.slice(0, 20)}…</code>
            </p>
            <p>

              <strong className="me-1">
                Tokens
              </strong>
              {held.length === 0
                ? "no tokens yet"
                : held.map((a) => `${a.quantity} ${assetName(a.unit)}`).join(", ")}
            </p>
            <button
              className="mt-1 rounded border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-gray-50"
              onClick={reload}
            >
              Reload state
            </button>
          </>
        )}
      </Step>

      {wallet && (
        <>
          <Step
            n={2}
            title="Set up collateral"
            hint={
              <>
                Smart-contract transactions (minting, swapping) need collateral, a small ADA deposit the
                wallet sets aside and refunds if it isn't used. Set it once in your wallet (for Lace, see{" "}
                <LaceFaq />).
              </>
            }
          >
            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={checkCollateral}
            >
              Check collateral
            </button>
            <div>
              {hasCollateral ? (
                <span className="text-sm text-green-600">collateral is set</span>
              ) : (
                <span className="text-xs text-gray-500">
                  {" "}
                  not set yet! Set it in your wallet (<LaceFaq />), then check again
                </span>
              )}
            </div>
          </Step>

          <Step
            n={3}
            title="Create your tokens"
            hint="Mint the two tokens you'll trade. Wait about a minute for each to confirm."
          >
            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={() => mint("GOLD")}
              disabled={!hasCollateral}
            >
              Mint GOLD
            </button>


            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={() => mint("SILVER")}
              disabled={!hasCollateral}
            >
              Mint SILVER
            </button>
            <p>
              {amountOf(gold) > 0 && <span className="text-sm text-green-600"> you hold GOLD</span>}
            </p>
            <p>
              {amountOf(silver) > 0 && <span className="text-sm text-green-600"> you hold SILVER</span>}
            </p>

            {!hasCollateral && <span className="text-xs text-gray-500"> set collateral first (step 2)</span>}

            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">
                Your token ids — copy one to share so someone can ask for it in an offer:
              </p>
              <CopyRow label="GOLD" unit={gold} />
              <CopyRow label="SILVER" unit={silver} />
            </div>
          </Step>

          <Step
            n={4}
            title="Make an offer"
            hint="Pick a token to lock and the token you want back. By default you ask for your own SILVER (a self-swap); choose 'other token…' to trade with someone else."
          >
            <div className="mb-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-12 text-gray-500">Give</span>
                <input
                  className="w-14 rounded border border-gray-300 px-2 py-1 text-center"
                  value={giveQty}
                  onChange={(e) => setGiveQty(e.target.value)}
                />
                <select
                  className="rounded border border-gray-300 px-2 py-1"
                  value={giveSel}
                  onChange={(e) => setGiveSel(e.target.value as "gold" | "silver")}
                >
                  <option value="gold">your GOLD</option>
                  <option value="silver">your SILVER</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-12 text-gray-500">Want</span>
                <input
                  className="w-14 rounded border border-gray-300 px-2 py-1 text-center"
                  value={wantQty}
                  onChange={(e) => setWantQty(e.target.value)}
                />
                <select
                  className="rounded border border-gray-300 px-2 py-1"
                  value={wantSel}
                  onChange={(e) => setWantSel(e.target.value as "gold" | "silver" | "other")}
                >
                  <option value="gold">your GOLD</option>
                  <option value="silver">your SILVER</option>
                  <option value="other">other token…</option>
                </select>
              </div>
              {wantSel === "other" && (
                <input
                  className="w-full rounded border border-gray-300 px-2 py-1 font-mono text-xs"
                  value={wantOther}
                  onChange={(e) => setWantOther(e.target.value)}
                  placeholder="paste the token id (policy id + name)"
                />
              )}
            </div>
            <p className="mb-2 text-xs text-gray-500">
              You'll lock {giveQty || "?"} {giveName} and receive {wantQty || "?"} {wantName}.
            </p>
            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={makeOffer}
              disabled={amountOf(giveUnit) === 0 || !wantUnit}
            >
              Create offer
            </button>
            {amountOf(giveUnit) === 0 && (
              <span className="text-xs text-gray-500"> mint some {giveName} first</span>
            )}
          </Step>

          <Step
            n={5}
            title="Accept the offer"
            hint="Now be the buyer: load the open offers and swap. The contract only releases the GOLD if the seller gets paid."
          >
            <button
              className="mr-2 rounded bg-blue-500 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40"
              onClick={loadOffers}
            >
              Refresh offers
            </button>
            {offers.length === 0 ? (
              <p className="text-xs text-gray-500">No open offers yet. Create one above, wait for it to confirm, then Refresh.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {offers.map((offer, index) => {
                  const give = lockedAsset(offer);
                  const price = offer.price[0];
                  return (
                    <li key={index} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
                      Get {give?.quantity} {give ? assetName(give.unit) : "?"} → pay {price?.quantity}{" "}
                      {price ? hexToText(price.assetName) : "?"}
                      {offer.owner === address && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500">
                          your offer
                        </span>
                      )}
                      <button
                        className="ml-auto rounded-md border border-gray-300 px-3 py-1 text-sm font-semibold hover:bg-gray-50"
                        onClick={() => swap(offer)}
                      >
                        Swap
                      </button>
                      {offer.owner === address && (
                        <button
                          className="rounded-md border border-red-300 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50"
                          onClick={() => cancel(offer)}
                        >
                          Cancel
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Step>
        </>
      )}

      {status && (
        <p
          className={`mt-6 rounded-lg border px-4 py-3 break-words ${txHash ? "border-green-500/40 bg-green-500/10" : "border-gray-200"
            }`}
        >
          {status}
          {txHash && (
            <>
              {" "}
              <a className="text-blue-600 underline" href={EXPLORER + txHash} target="_blank" rel="noreferrer">
                view on explorer
              </a>
            </>
          )}
        </p>
      )}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
