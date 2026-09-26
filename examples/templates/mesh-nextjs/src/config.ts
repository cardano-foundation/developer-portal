// Network settings, read once. NEXT_PUBLIC_NETWORK is inlined at build time,
// so the same value is used in the browser and in the API route.

const NETWORKS = ["preprod", "preview", "mainnet"] as const;
export type Network = (typeof NETWORKS)[number];

function readNetwork(): Network {
  const value = process.env.NEXT_PUBLIC_NETWORK ?? "preprod";
  if (!(NETWORKS as readonly string[]).includes(value)) {
    throw new Error(`NEXT_PUBLIC_NETWORK must be one of ${NETWORKS.join(", ")}, got "${value}".`);
  }
  return value as Network;
}

export const network = readNetwork();
export const isMainnet = network === "mainnet";

// CIP-30 reports 1 for mainnet and 0 for every testnet, so preview and
// preprod wallets cannot be told apart from the wallet alone.
export const networkId = isMainnet ? 1 : 0;
export const addressPrefix = isMainnet ? "addr1" : "addr_test1";

export function explorerTxUrl(txHash: string): string {
  const host = isMainnet ? "cardanoscan.io" : `${network}.cardanoscan.io`;
  return `https://${host}/transaction/${txHash}`;
}
