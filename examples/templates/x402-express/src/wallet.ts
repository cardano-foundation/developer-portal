/**
 * Generates a fresh Cardano preprod wallet for testing and prints where to
 * fund it. The mnemonic is printed once — put it in .env as MNEMONIC.
 */
import { Address, PrivateKey } from "@evolution-sdk/evolution";
import { addressFromSeed } from "@evolution-sdk/evolution/sdk/wallet/Derivation";

const mnemonic = PrivateKey.generateMnemonic();
const address = Address.toBech32(addressFromSeed(mnemonic, { networkId: 0 }).address);

console.log("New Cardano preprod wallet\n");
console.log(`MNEMONIC=${mnemonic}\n`);
console.log(`Address: ${address}\n`);
console.log("1. Put the MNEMONIC line into your .env");
console.log("2. Fund the address with test ADA:  https://docs.cardano.org/cardano-testnets/tools/faucet");
console.log("3. (optional) Claim test USDM:      https://tusdm.moneta.global/#manual");
console.log("\nFaucet funds usually arrive within a minute or two.");
