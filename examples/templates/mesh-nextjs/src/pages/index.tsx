import { useState } from "react";
import Head from "next/head";
import type { NextPage } from "next";
import { CardanoWallet, useLovelace, useNetwork, useWallet } from "@meshsdk/react";
import { BlockfrostProvider, MeshTxBuilder, deserializeAddress } from "@meshsdk/core";
import { addressPrefix, explorerTxUrl, isMainnet, network, networkId } from "@/config";

// The provider only fetches protocol parameters, through the server route that
// holds the Blockfrost key. The wallet signs and submits.
const provider = new BlockfrostProvider("/api/blockfrost");

function checkRecipient(address: string): string | null {
  if (!address.startsWith(addressPrefix)) {
    return `Enter a ${network} address, starting with ${addressPrefix}.`;
  }
  try {
    deserializeAddress(address);
  } catch {
    return "That address is not valid.";
  }
  return null;
}

// CIP-30 wallets reject with plain objects ({ code, info }), not Error instances.
function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null) {
    const { code, info } = err as { code?: number; info?: string };
    if (code === 2) return "Cancelled in the wallet.";
    if (info) return info;
  }
  return "Transaction failed.";
}

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const balance = useLovelace();
  const walletNetworkId = useNetwork();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const wrongNetwork = walletNetworkId !== undefined && walletNetworkId !== networkId;

  async function sendAda() {
    setError(null);
    setTxHash(null);

    const ada = Number(amount);
    if (!Number.isFinite(ada) || ada <= 0) return setError("Enter an amount in ADA.");
    // Round, don't floor: 1.005 * 1e6 is 1004999.999... in floating point.
    const lovelace = Math.round(ada * 1_000_000);

    const to = recipient.trim();
    const recipientError = checkRecipient(to);
    if (recipientError) return setError(recipientError);

    if (isMainnet && !window.confirm(`Send ${ada} ADA on mainnet to ${to}?`)) {
      return;
    }

    setLoading(true);
    try {
      const params = await provider.fetchProtocolParameters();
      const unsignedTx = await new MeshTxBuilder({ fetcher: provider, params })
        .txOut(to, [{ unit: "lovelace", quantity: lovelace.toString() }])
        .changeAddress(await wallet.getChangeAddress())
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

      const signedTx = await wallet.signTx(unsignedTx);
      setTxHash(await wallet.submitTx(signedTx));
      setRecipient("");
      setAmount("");
    } catch (err) {
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12">
      <Head>
        <title>My Cardano dApp</title>
      </Head>
      <h1 className="text-3xl font-bold">My Cardano dApp</h1>
      <p className={isMainnet ? "font-semibold text-red-400" : "text-sm text-gray-400"}>
        Network: {network}
        {isMainnet && " (real ADA)"}
      </p>

      <CardanoWallet />

      {connected && (
        <div className="flex w-full max-w-md flex-col gap-4">
          {wrongNetwork && (
            <p role="alert" className="text-sm text-red-400">
              Your wallet is on {walletNetworkId === 1 ? "mainnet" : "a testnet"}, but this app is set
              to {network}. Switch the wallet&apos;s network.
            </p>
          )}

          <div className="rounded-md border border-gray-700 p-4 text-center">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="font-mono text-xl">
              {(Number(balance ?? 0) / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 6 })} &#8371;
            </div>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Recipient address
            <input
              className="rounded-md border border-gray-700 bg-transparent px-3 py-2 focus:outline-2 focus:outline-blue-500"
              placeholder={`${addressPrefix}...`}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Amount in ADA
            <input
              className="rounded-md border border-gray-700 bg-transparent px-3 py-2 focus:outline-2 focus:outline-blue-500"
              inputMode="decimal"
              placeholder="1.5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 disabled:opacity-50"
            onClick={sendAda}
            disabled={loading || wrongNetwork}
          >
            {loading ? "Sending..." : "Send ADA"}
          </button>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          {txHash && (
            <p role="status" className="break-all text-sm text-green-400">
              Submitted:{" "}
              <a className="underline" href={explorerTxUrl(txHash)} target="_blank" rel="noreferrer">
                {txHash}
              </a>
            </p>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
