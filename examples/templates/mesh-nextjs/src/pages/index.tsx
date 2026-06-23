import { useState } from "react";
import type { NextPage } from "next";
import { CardanoWallet, useWallet, useLovelace } from "@meshsdk/react";
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";

const Home: NextPage = () => {
  const { connected, wallet } = useWallet();
  const lovelace = useLovelace();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendAda() {
    if (!wallet || !recipient || !amount) {
      setError("Enter a recipient address and an amount.");
      return;
    }
    setLoading(true);
    setError(null);
    setTxHash(null);
    try {
      // A provider supplies protocol parameters; the connected wallet signs and submits.
      const provider = new BlockfrostProvider(
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY ?? ""
      );
      const txBuilder = new MeshTxBuilder({ fetcher: provider, submitter: provider });

      const lovelaceAmount = BigInt(Math.floor(parseFloat(amount) * 1_000_000)).toString();

      const unsignedTx = await txBuilder
        .txOut(recipient, [{ unit: "lovelace", quantity: lovelaceAmount }])
        .changeAddress(await wallet.getChangeAddress())
        .selectUtxosFrom(await wallet.getUtxos())
        .complete();

      const signedTx = await wallet.signTx(unsignedTx);
      setTxHash(await wallet.submitTx(signedTx));
      setRecipient("");
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-12">
      <h1 className="text-3xl font-bold">My Cardano dApp</h1>

      <CardanoWallet />

      {connected && (
        <div className="flex w-full max-w-md flex-col gap-4">
          <div className="rounded-md border border-gray-700 p-4 text-center">
            <div className="text-xs text-gray-400">Balance</div>
            <div className="font-mono text-xl">
              {lovelace ? (Number(lovelace) / 1_000_000).toFixed(2) : "0.00"} &#8371;
            </div>
          </div>

          <input
            className="rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm"
            placeholder="Recipient address (addr_test1... or addr1...)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            className="rounded-md border border-gray-700 bg-transparent px-3 py-2 text-sm"
            type="number"
            placeholder="Amount in ADA"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={sendAda}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send ADA"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {txHash && (
            <p className="break-all text-sm text-green-400">Submitted: {txHash}</p>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
