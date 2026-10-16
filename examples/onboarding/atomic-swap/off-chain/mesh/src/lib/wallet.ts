import type { UTxO } from "@meshsdk/core";

/// The slice of a wallet the off-chain functions need. Both the browser wallet
/// (`BrowserWallet`, via a CIP-30 extension) and the headless `MeshWallet` used
/// in tests satisfy this, so the exact same code runs in both places.
export type Wallet = {
  getChangeAddress(): Promise<string>;
  getUtxos(): Promise<UTxO[]>;
  getCollateral(): Promise<UTxO[]>;
};
