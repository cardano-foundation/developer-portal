// Network settings shared by the browser app and the server.
import { mainnet, preprod, preview } from "@evolution-sdk/evolution"

export const CHAINS = { preprod, preview, mainnet }
export type Network = keyof typeof CHAINS

export function parseNetwork(value: string | undefined): Network {
  const network = value ?? "preprod"
  if (!(network in CHAINS)) {
    throw new Error(`VITE_NETWORK must be preprod, preview or mainnet, got "${network}".`)
  }
  return network as Network
}

// Address network IDs: 1 for mainnet, 0 for every testnet.
export function networkIdOf(network: Network): number {
  return network === "mainnet" ? 1 : 0
}
