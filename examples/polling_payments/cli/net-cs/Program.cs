using System;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using SimpleExec;

const string CARDANO_CLI_PATH = "cardano-cli";
const string CARDANO_ERA_FLAG = "--mary-era";
const int CARDANO_NETWORK_MAGIC = 1097911063;
const string CARDANO_KEYS_DIR = "keys";
const long TOTAL_EXPECTED_LOVELACE = 1_000_000;
const long LOVELACE_PER_ADA = 1_000_000;

var walletAddress = await File.ReadAllTextAsync(Path.Combine(CARDANO_KEYS_DIR, "payment.addr"));
var rawUtxoTable = await Command.ReadAsync(CARDANO_CLI_PATH, string.Join(
    " ",
    "query", "utxo", CARDANO_ERA_FLAG,
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
), noEcho: true);

var utxoTableRows = rawUtxoTable.Trim().Split("\n");
var totalLovelaceRecv = 0L;

for(var x = 2; x < utxoTableRows.Length; x++)
{
    var cells = utxoTableRows[x].Split(" ").Where(c => c.Trim() != string.Empty).ToArray();
    totalLovelaceRecv +=  long.Parse(cells[2]);
}

Console.WriteLine($"Total ADA Received: {totalLovelaceRecv / LOVELACE_PER_ADA}");
Console.WriteLine($"Expected ADA Payment: {TOTAL_EXPECTED_LOVELACE / LOVELACE_PER_ADA}");
Console.WriteLine($"Payment Complete: {(totalLovelaceRecv >= TOTAL_EXPECTED_LOVELACE ? "✅":"❌")}");
