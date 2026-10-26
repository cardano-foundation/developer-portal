import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet"
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core"
import { Address, Client, Transaction, TransactionWitnessSet } from "@evolution-sdk/evolution"
import { useState } from "react"

import { chain, explorerTxUrl, isMainnet, network, networkId } from "../config"

// Calls the payment API in server/payments.ts and returns its JSON.
async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status}).`)
  return data as T
}

// CIP-30 wallets reject with plain objects ({ code, info }), not Error instances.
function describeError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === "object" && err !== null) {
    const { code, info } = err as { code?: number; info?: string }
    if (code === 2) return "Cancelled in the wallet."
    if (info) return info
  }
  return "Transaction failed."
}

function isAddressOnNetwork(bech32: string): boolean {
  try {
    return Address.fromBech32(bech32).networkId === networkId
  } catch {
    return false
  }
}

export default function TransactionBuilder() {
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")

  const { enabledWallet, isConnected } = useCardano({
    limitNetwork: isMainnet ? NetworkType.MAINNET : NetworkType.TESTNET
  })

  const handleSend = async () => {
    setError(null)
    setTxHash(null)

    const to = recipientAddress.trim()
    if (!isAddressOnNetwork(to)) return setError(`Enter a ${network} address.`)

    const ada = Number(amount)
    if (!Number.isFinite(ada) || ada <= 0) return setError("Enter an amount in ADA.")
    // Round, don't floor: 1.005 * 1e6 is 1004999.999... in floating point.
    const lovelace = Math.round(ada * 1_000_000)

    if (isMainnet && !window.confirm(`Send ${ada} ADA on mainnet to ${to}?`)) return

    setIsLoading(true)
    try {
      const api = await window.cardano?.[enabledWallet ?? ""]?.enable()
      if (!api) throw new Error("Could not reach the wallet. Reconnect and try again.")

      // The browser client has no provider: it only reads the wallet and signs.
      const client = Client.make(chain).withCip30(api)
      const from = Address.toBech32(await client.address())

      // The server builds the transaction with the Blockfrost key.
      const { txCbor } = await post<{ txCbor: string }>("/api/build-payment", {
        from,
        to,
        lovelace: lovelace.toString()
      })

      // The wallet asks the user to approve, then returns its signatures.
      const witnessSet = await client.signTx(txCbor)
      const signedTxCbor = Transaction.addVKeyWitnessesHex(txCbor, TransactionWitnessSet.toCBORHex(witnessSet))

      const { txHash } = await post<{ txHash: string }>("/api/submit-tx", { signedTxCbor })
      setTxHash(txHash)
      setRecipientAddress("")
      setAmount("")
    } catch (err) {
      setError(describeError(err))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="px-5 py-8 flex items-center justify-center min-h-[150px]">
        <p className="text-xs text-zinc-400">Connect your wallet to continue</p>
      </div>
    )
  }

  const inputClass =
    "w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600/60"

  return (
    <div className="px-5 py-4 space-y-4">
      <p className={isMainnet ? "text-xs font-semibold text-orange-400" : "text-xs text-zinc-400"}>
        Network: {network}
        {isMainnet && " (real ADA)"}
      </p>

      <div className="space-y-2">
        <label htmlFor="recipient" className="text-xs font-medium text-zinc-400">
          Recipient address
        </label>
        <input
          id="recipient"
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder={isMainnet ? "addr1..." : "addr_test1..."}
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="amount" className="text-xs font-medium text-zinc-400">
          Amount (ADA)
        </label>
        <input
          id="amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="1.5"
          className={inputClass}
          disabled={isLoading}
        />
      </div>

      <button
        className="w-full py-2.5 rounded-md text-xs font-medium transition-all bg-orange-900/90 hover:bg-orange-800 text-zinc-100 border border-orange-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-600/60 disabled:bg-zinc-800/80 disabled:text-zinc-400 disabled:cursor-not-allowed"
        onClick={handleSend}
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send ADA"}
      </button>

      {error && (
        <p
          role="alert"
          className="py-2 px-3 bg-orange-950/30 border border-orange-900/30 rounded-md text-orange-400 text-xs"
        >
          {error}
        </p>
      )}

      {txHash && (
        <div role="status" className="space-y-2">
          <p className="text-xs font-medium text-green-400">Transaction submitted</p>
          <p className="font-mono text-xs text-zinc-300 break-all">{txHash}</p>
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center py-2 text-xs text-orange-400 hover:text-orange-300"
          >
            View on CardanoScan
          </a>
        </div>
      )}
    </div>
  )
}
