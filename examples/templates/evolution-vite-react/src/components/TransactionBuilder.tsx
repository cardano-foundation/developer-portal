import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet"
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core"
import { useState } from "react"
import { Address, Assets, Client, mainnet, preprod, preview, TransactionHash } from "@evolution-sdk/evolution"

export default function TransactionBuilder() {
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")

  // Determine network from environment variable
  const networkEnv = import.meta.env.VITE_NETWORK || "preprod"
  const network = networkEnv === "mainnet" ? NetworkType.MAINNET : NetworkType.TESTNET

  const { isConnected, enabledWallet } = useCardano({
    limitNetwork: network
  })

  const handleBuildTransaction = async () => {
    if (!isConnected || !enabledWallet) {
      setError("Wallet not connected")
      return
    }

    if (!recipientAddress || !amount) {
      setError("Please enter recipient address and amount")
      return
    }

    const amountLovelace = parseFloat(amount)
    if (isNaN(amountLovelace) || amountLovelace <= 0) {
      setError("Invalid amount")
      return
    }

    setIsLoading(true)
    setError(null)
    setTxHash(null)

    try {
      // Get wallet API
      const api = await window.cardano?.[enabledWallet]?.enable()
      if (!api) {
        throw new Error("Failed to enable wallet")
      }

      // Determine chain and provider
      const blockfrostUrls = {
        preprod: "https://cardano-preprod.blockfrost.io/api/v0",
        preview: "https://cardano-preview.blockfrost.io/api/v0",
        mainnet: "https://cardano-mainnet.blockfrost.io/api/v0"
      } as const

      const chainPresets = { preprod, preview, mainnet }
      const chain = chainPresets[networkEnv as keyof typeof chainPresets] ?? preprod

      const txClient = Client.make(chain)
        .withBlockfrost({
          baseUrl: blockfrostUrls[networkEnv as keyof typeof blockfrostUrls] ?? blockfrostUrls.preprod,
          projectId: import.meta.env.VITE_BLOCKFROST_PROJECT_ID || ""
        })
        .withCip30(api)

      // Build transaction (convert ADA to lovelace: 1 ADA = 1,000,000 lovelace)
      const lovelaceAmount = BigInt(Math.floor(amountLovelace * 1_000_000))

      // Parse address - support both Bech32 (addr1...) and hex formats
      let parsedAddress: Address.Address
      try {
        parsedAddress = Address.fromBech32(recipientAddress)
      } catch {
        try {
          parsedAddress = Address.fromHex(recipientAddress)
        } catch {
          throw new Error("Invalid address format. Use Bech32 (addr1...) or hex format.")
        }
      }

      // Create assets
      const assetsToSend = Assets.fromLovelace(lovelaceAmount)

      // Build, sign, and submit transaction
      const tx = await txClient
        .newTx()
        .payToAddress({
          address: parsedAddress,
          assets: assetsToSend
        })
        .build()

      const signed = await tx.sign()
      const hash = await signed.submit()

      setTxHash(TransactionHash.toHex(hash))
      setRecipientAddress("")
      setAmount("")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="px-5 py-8 flex items-center justify-center min-h-[150px]">
        <p className="text-xs text-zinc-500">Connect your wallet to continue</p>
      </div>
    )
  }

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Recipient Address Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">
          Recipient Address
          <span className="text-[10px] text-zinc-500 ml-2">(Bech32 or hex)</span>
        </label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="addr_test1... or addr1..."
          className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-700/30 focus:border-orange-700/50"
          disabled={isLoading}
        />
      </div>

      {/* Amount Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400">Amount (ADA)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-700/30 focus:border-orange-700/50"
          disabled={isLoading}
        />
      </div>

      {/* Send Button */}
      <button
        className={`w-full py-2.5 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-1 ${
          isLoading
            ? "bg-zinc-800/80 text-zinc-400 cursor-not-allowed"
            : "bg-orange-900/90 hover:bg-orange-800 text-zinc-100 border border-orange-900/60 focus:ring-orange-700/30"
        }`}
        onClick={handleBuildTransaction}
        disabled={isLoading || !isConnected}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-3 w-3 text-zinc-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Sending Transaction...</span>
          </div>
        ) : (
          "Send ADA"
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="py-2 px-3 bg-orange-950/30 border border-orange-900/30 rounded-md text-orange-400 text-xs">
          {error}
        </div>
      )}

      {/* Success Display */}
      {txHash && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium text-green-400">Transaction Submitted</span>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-md overflow-hidden">
            <div className="px-3 py-2 border-b border-zinc-800/40 text-[10px] text-zinc-400">Transaction Hash</div>
            <div className="px-3 py-2 font-mono text-xs text-zinc-300 break-all">{txHash}</div>
          </div>
          <a
            href={`https://${networkEnv !== "mainnet" ? `${networkEnv}.` : ""}cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            View on CardanoScan →
          </a>
        </div>
      )}
    </div>
  )
}
