// The first off-chain script in the track, and the only one that is not part of
// the app: it opens **frontend integration** by proving the provider works
// before anything is built on top of it. It talks to the chain and nothing
// else: no contract, no wallet, no transaction. Run it with `node src/check.ts`
// on Node 22.6 or newer.
//
// Its two values come from `.env`, so no key is ever written into the code.
// #region check
import { BlockfrostProvider } from "@meshsdk/core";

// Read `.env` into process.env. Node does this natively, no library needed.
// It looks in the folder you run from, so run this from your workspace root.
try {
  process.loadEnvFile();
} catch {
  throw new Error("no .env here. Run this from your workspace root: node off-chain/src/check.ts");
}

// This script runs on your machine, so it may hold the key. The browser app
// built later in that lecture may not, which is why the name has no VITE_ prefix.
const provider = new BlockfrostProvider(process.env.BLOCKFROST_API_KEY ?? "");
const address = process.env.MY_ADDRESS ?? "";

try {
  const params = await provider.fetchProtocolParameters();
  console.log("connected. current epoch:", params.epoch);

  const utxos = await provider.fetchAddressUTxOs(address);
  console.log(`${utxos.length} UTxOs at this address`);
} catch (error) {
  console.error("the provider refused:", JSON.parse(String(error)).data?.message ?? error);
}
// #endregion check
