/// The networks this app can run on, and what each one decides: the network id
/// every address is built for, and where to read a transaction afterwards.
///
/// The Intermediate app wrote Preview into three places: the key, the network
/// id and the explorer link. Here one name decides all three, so moving to
/// another network is one line in `.env`, and a key for the wrong network is
/// caught before anything is sent.
// #region networks
export type NetworkName = "preview" | "preprod" | "mainnet";

export type Network = { name: NetworkName; id: 0 | 1; explorer: string };

const NETWORKS: Record<NetworkName, Network> = {
  preview: {
    name: "preview",
    id: 0,
    explorer: "https://explorer.cardano.org/preview/transaction?id=",
  },
  preprod: {
    name: "preprod",
    id: 0,
    explorer: "https://explorer.cardano.org/preprod/transaction?id=",
  },
  mainnet: { name: "mainnet", id: 1, explorer: "https://explorer.cardano.org/transaction?id=" },
};

export function networkFrom(name: string | undefined): Network {
  const network = NETWORKS[name as NetworkName];
  if (!network) {
    throw new Error(`unknown network "${name}": use preview, preprod or mainnet`);
  }
  return network;
}

/// A Blockfrost key starts with the name of the one network it works on.
/// Preview and Preprod share a network id, so an address alone cannot tell
/// them apart, and a key for the other one fails later with a confusing error.
export function assertKeyMatches(key: string, network: Network): void {
  if (!key.startsWith(network.name)) {
    throw new Error(
      `BLOCKFROST_API_KEY is not a ${network.name} key. ` +
        `Create a ${network.name} project on blockfrost.io, or change VITE_NETWORK.`,
    );
  }
}
// #endregion networks
