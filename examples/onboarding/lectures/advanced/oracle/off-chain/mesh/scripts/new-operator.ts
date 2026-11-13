import { MeshWallet } from "@meshsdk/wallet";

import { network } from "./operator.ts";

/// A new key that does one job: updating this oracle. Not your personal
/// wallet, so the recovery phrase in `.env` controls nothing else.
const words = MeshWallet.brew() as string[];
const wallet = new MeshWallet({ networkId: network.id, key: { type: "mnemonic", words } });
await wallet.init();

console.log("Add this line to .env, and keep it out of version control:\n");
console.log(`OPERATOR_MNEMONIC="${words.join(" ")}"\n`);
console.log(`Then fund the operator's ${network.name} address from the faucet:\n`);
console.log(await wallet.getChangeAddress());
