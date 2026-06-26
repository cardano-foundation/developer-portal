import WalletConnect from "./WalletConnect"
import TransactionBuilder from "./TransactionBuilder"

export default function Main() {
  return (
    <div className="w-full">
      <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg shadow-md overflow-hidden">
        {/* Wallet section */}
        <div className="border-b border-zinc-800/40">
          <div className="px-5 py-3 border-b border-zinc-800/20">
            <h3 className="text-sm font-medium text-zinc-100">Wallet</h3>
          </div>
          <WalletConnect />
        </div>

        {/* Transaction section */}
        <div>
          <div className="px-5 py-3 border-b border-zinc-800/20">
            <h3 className="text-sm font-medium text-zinc-100">Transaction</h3>
          </div>
          <TransactionBuilder />
        </div>
      </div>
    </div>
  )
}
