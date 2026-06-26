import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet"
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core"
import { useState } from "react"

export default function WalletConnect() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const network = import.meta.env.MODE === "development" ? NetworkType.TESTNET : NetworkType.MAINNET

  const { accountBalance, connect, disconnect, installedExtensions, isConnected, stakeAddress } = useCardano({
    limitNetwork: network
  })

  return (
    <div className="w-full">
      {isConnected ? (
        <div className="px-5 py-4">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-10">
              <div className="text-xs font-medium text-zinc-400">Address</div>
              <div className="text-xs font-mono text-zinc-200 text-right truncate">
                {stakeAddress?.slice(0, 10)}
                {"..."}
                {stakeAddress?.slice(stakeAddress.length - 6)}
              </div>

              <div className="text-xs font-medium text-zinc-400">Balance</div>
              <div className="text-xs font-mono text-zinc-200 text-right">{accountBalance} ₳</div>
            </div>

            <button
              className="w-full py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700/50 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-zinc-500/30"
              onClick={() => disconnect()}
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center px-5 py-8">
          <button
            className="w-full max-w-xs py-2.5 bg-orange-900/90 hover:bg-orange-800 text-zinc-100 rounded-md border border-orange-900/60 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-orange-700/30"
            onClick={() => setIsModalOpen(true)}
          >
            Connect Wallet
          </button>
        </div>
      )}

      {isModalOpen && !isConnected && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800/80 rounded-lg shadow-lg max-w-sm w-full overflow-hidden">
            <div className="px-5 py-3.5 border-b border-zinc-800/60">
              <h2 className="text-sm font-medium text-zinc-100">Select Wallet</h2>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid gap-2">
                {installedExtensions.map((provider) => (
                  <button
                    key={provider}
                    className="w-full px-4 py-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-md border border-zinc-700/50 flex items-center justify-between transition-all text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-500/30"
                    onClick={() => {
                      connect(provider)
                      setIsModalOpen(false)
                    }}
                  >
                    <span className="capitalize">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
                  </button>
                ))}
              </div>

              <button
                className="w-full px-4 py-2 bg-zinc-800/60 text-zinc-300 rounded-md hover:bg-zinc-700 transition-all text-xs border border-zinc-700/40 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-500/30"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
