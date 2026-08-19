import { BrowserWallet } from "@meshsdk/core";

// #region connect-wallet
/// Connect a browser wallet with CIP-30 and read a couple of things from it.
/// CIP-30 is the standard every Cardano browser wallet (Lace, Eternl, ...) speaks,
/// so this one piece of code works with any of them, you just pass the wallet id.
///
/// This runs in the browser: calling `enable()` is what makes the wallet pop up
/// and ask the user to approve the connection. It then hands back an API object
/// your app can call, here we read the receiving address and the balance.
export async function connectWallet(walletId: string) {

  // 1. See which CIP-30 wallets the user actually has installed.
  const installed = BrowserWallet.getInstalledWallets();
  if (!installed.some((w) => w.id === walletId)) {
    throw new Error(`${walletId} is not installed`);
  }

  // 2. Ask the user to connect. This pops the wallet's approval dialog.
  const wallet = await BrowserWallet.enable(walletId);

  // 3. Now you can read from it, like the address people pay you at and your balance.
  const address = await wallet.getChangeAddress();
  const balance = await wallet.getBalance();

  return { wallet, address, balance };
}
// #endregion connect-wallet
