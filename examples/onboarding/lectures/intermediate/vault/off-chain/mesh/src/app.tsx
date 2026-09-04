// Playground bookkeeping, kept out of the lecture: this file is what lecture 9
// renders, and it runs here too, served at **/vault.html**. `main.tsx` is the
// same idea with the admin door and some styling. Both drive the same
// `./lib`, which is the code the reader writes.
// #region file
/// The page: connect a wallet, mint or burn the vault's own token, lock 5 ADA,
/// and unlock it again. Every button below builds a transaction with the files
/// in `./lib`, then hands it to the wallet to sign and submit.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BlockfrostProvider, BrowserWallet, deserializeAddress } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";

import { vaultAddress } from "./lib/blueprint.ts";
import { buildLockTx } from "./lib/lock.ts";
import { buildMintAndLockTx } from "./lib/mint.ts";
import { buildUnlockTx } from "./lib/unlock.ts";
import { fetchLocked } from "./lib/fetch.ts";
import { TOKEN_NAME, buildTokenTx, fetchTokenBalance, tokenUnit } from "./lib/token.ts";

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
  const [qty, setQty] = useState("1");
  const [tokens, setTokens] = useState("0");

  async function connect() {
    const connected = await BrowserWallet.enable("lace");
    setWallet(connected);
    // Your key hash. The vault's address is shared with everyone who compiled
    // the same contract, so this is what picks out the UTxOs that are yours.
    const pubKeyHash = deserializeAddress(await connected.getChangeAddress()).pubKeyHash;
    setOwner(pubKeyHash);
    setLocked(await fetchLocked(provider, NETWORK_ID, pubKeyHash));
    setTokens(await fetchTokenBalance(connected));
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

  const FIVE_ADA = { unit: "lovelace", quantity: "5000000" };

  function lock() {
    run(() => buildLockTx(wallet!, provider, NETWORK_ID, [FIVE_ADA]));
  }

  // The same lock, with tokens riding along in the same UTxO. A UTxO holds a
  // bundle, and the vault's validator never looks at what is in it.
  function lockWithTokens() {
    run(() =>
      buildLockTx(wallet!, provider, NETWORK_ID, [
        FIVE_ADA,
        { unit: tokenUnit(), quantity: qty },
      ]),
    );
  }

  // The token on its own, in either direction. The policy checks the name and
  // ignores the amount, so mint and burn differ only by the sign.
  function mint() {
    run(() => buildTokenTx(wallet!, provider, qty));
  }

  function burn() {
    run(() => buildTokenTx(wallet!, provider, `-${qty}`));
  }

  // A read, not a transaction. Minting and burning only show up here once the
  // chain has confirmed them, so this is a button rather than something
  // automatic.
  async function refreshTokens() {
    setTokens(await fetchTokenBalance(wallet!));
  }

  // The same lock, plus one token minted under the vault's policy script, from
  // **validator purposes**. Only that policy runs: creating an output at the
  // vault's address does not run the vault's own validator.
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
      <label>
        How many {TOKEN_NAME}?{" "}
        <input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
      </label>
      <button onClick={mint}>Mint</button>
      <button onClick={burn}>Burn</button>
      <button onClick={refreshTokens}>Refresh tokens</button>
      <p>
        You hold {tokens} {TOKEN_NAME}
      </p>
      <button onClick={lock}>Lock 5 ADA</button>
      <button onClick={lockWithTokens}>
        Lock 5 ADA + {qty} {TOKEN_NAME}
      </button>
      <button onClick={mintAndLock}>Mint & lock 5 ADA</button>
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
