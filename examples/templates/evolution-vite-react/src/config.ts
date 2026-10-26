import { CHAINS, networkIdOf, parseNetwork } from "./network.ts"

export const network = parseNetwork(import.meta.env.VITE_NETWORK)
export const chain = CHAINS[network]
export const networkId = networkIdOf(network)
export const isMainnet = network === "mainnet"

export function explorerTxUrl(txHash: string): string {
  const host = isMainnet ? "cardanoscan.io" : `${network}.cardanoscan.io`
  return `https://${host}/transaction/${txHash}`
}
