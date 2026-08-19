// Playground bookkeeping, kept out of the lecture: this file is what lecture 9
// renders, and it runs here too, served at **/vault.html**. `main.tsx` is the
// same idea with the recovery door and some styling. Both drive the same
// `./lib`, which is the code the reader writes.
// #region file
/// The page: connect a wallet, lock 5 ADA, mint the vault's own token, and
/// unlock again. Every button below builds a transaction with the files in
/// `./lib`, then hands it to the wallet to sign and submit.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet, deserializeAddress } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { vaultAddress } from "./lib/blueprint.ts";
import { buildLockTx } from "./lib/lock.ts";
import { buildMintAndLockTx } from "./lib/mint.ts";
import { buildUnlockTx } from "./lib/unlock.ts";
import { fetchLocked } from "./lib/fetch.ts";

const NETWORK_ID = Number(import.meta.env.VITE_NETWORK_ID ?? "0");

// No key here. The provider points at our own backend, which holds it, see
// `server/blockfrost.ts`. Mesh supports this: give it a path instead of a
// project id and it treats it as a privately hosted Blockfrost.
const provider = new BlockfrostProvider("/api/blockfrost");

function App() {
  const [wallet, setWallet] = useState<BrowserWallet>();
  const [owner, setOwner] = useState("");
  const [locked, setLocked] = useState<UTxO[]>([]);
  const [status, setStatus] = useState("");

  async function connect() {
    const connected = await BrowserWallet.enable("lace");
    setWallet(connected);
    // Your key hash. The vault's address is shared with everyone who compiled
    // the same contract, so this is what picks out the UTxOs that are yours.
    const pubKeyHash = deserializeAddress(await connected.getChangeAddress()).pubKeyHash;
    setOwner(pubKeyHash);
    setLocked(await fetchLocked(provider, NETWORK_ID, pubKeyHash));
  }

  // Build, sign, submit. The `true` is a **partial** signature: the wallet signs
  // its own inputs and leaves the script input alone, because no key can sign
  // for a script, the validator decides that one when the network runs it.
  async function run(build: () => Promise<string>) {
    setStatus("Approve the transaction in your wallet…");
    try {
      const unsignedTx = await build();
      const signedTx = await wallet!.signTx(unsignedTx, true);
      const hash = await wallet!.submitTx(signedTx);
      setStatus(`submitted: ${hash}`);
    } catch (error) {
      setStatus(`error: ${(error as Error).message}`);
    }
  }

  function lock() {
    run(() => buildLockTx(wallet!, provider, NETWORK_ID, "5000000"));
  }

  // The same lock, plus one token minted under the vault's own policy. One
  // transaction, two purposes of one script, from **validator purposes**.
  function mintAndLock() {
    run(() => buildMintAndLockTx(wallet!, provider, NETWORK_ID, "5000000"));
  }

  function unlock(utxo: UTxO) {
    run(() => buildUnlockTx(wallet!, provider, utxo, provider));
  }

  if (!wallet) return <button onClick={connect}>Connect wallet</button>;

  return (
    <main>
      <p>The vault lives at {vaultAddress(NETWORK_ID)}</p>
      <button onClick={lock}>Lock 5 ADA</button>
      <button onClick={mintAndLock}>Mint &amp; lock 5 ADA</button>
      <button onClick={async () => setLocked(await fetchLocked(provider, NETWORK_ID, owner))}>
        Refresh locked
      </button>
      <ul>
        {locked.map((utxo) => (
          <li key={`${utxo.input.txHash}#${utxo.input.outputIndex}`}>
            {utxo.input.txHash.slice(0, 8)}…
            <button onClick={() => unlock(utxo)}>Unlock</button>
          </li>
        ))}
      </ul>
      <p>{status}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
// #endregion file
