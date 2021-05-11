import * as fs from 'fs';
import cmd from 'node-cmd';

const CARDANO_CLI_PATH = "cardano-cli";
const CARDANO_ERA_FLAG = "--mary-era";
const CARDANO_NETWORK_MAGIC = 1097911063;
const CARDANO_KEYS_DIR = "keys";
const TOTAL_EXPECTED_LOVELACE = 1_000_000;
const LOVELACE_PER_ADA = 1_000_000;

const walletAddress = fs.readFileSync(`${CARDANO_KEYS_DIR}/payment.addr`).toString();
const rawUtxoTable = cmd.runSync([
    CARDANO_CLI_PATH,
    "query", "utxo", CARDANO_ERA_FLAG,
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
].join(" "));

const utxoTableRows = rawUtxoTable.data.trim().split('\n');
let totalLovelaceRecv = 0;

for(let x = 2; x < utxoTableRows.length; x++) {
    const cells = utxoTableRows[x].split(" ").filter(i => i);
    totalLovelaceRecv += parseInt(cells[2]);
}

console.log(`Total ADA Received: ${totalLovelaceRecv / LOVELACE_PER_ADA}`);
console.log(`Expected ADA Payment: ${TOTAL_EXPECTED_LOVELACE / LOVELACE_PER_ADA}`);
console.log(`Payment Complete: ${(totalLovelaceRecv >= TOTAL_EXPECTED_LOVELACE ? "✅":"❌")}`);