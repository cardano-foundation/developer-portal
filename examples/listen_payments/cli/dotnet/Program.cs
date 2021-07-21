using System.Linq;
using SimpleExec; // dotnet add package SimpleExec --version 7.0.0

// Path to the cardano-cli binary or use the global one
const string CARDANO_CLI_PATH = "cardano-cli";
// The `testnet` identifier number
const int CARDANO_NETWORK_MAGIC = 1097911063;
// The directory where we store our payment keys
// assuming our current directory context is /home/user/receive-ada-sample
const string CARDANO_KEYS_DIR = "keys";
// The total payment we expect in lovelace unit
const long TOTAL_EXPECTED_LOVELACE = 1000000;

// Read wallet address string value from payment.addr file
var walletAddress = await System.IO.File.ReadAllTextAsync($"{CARDANO_KEYS_DIR}/payment1.addr");

// We use the SimpleExec library to execute cardano-cli shell command to query the wallet UTXO and read the output data
var rawUtxoTable = await Command.ReadAsync(CARDANO_CLI_PATH, string.Join(" ",
    "query", "utxo",
    "--testnet-magic", CARDANO_NETWORK_MAGIC,
    "--address", walletAddress
), noEcho: true);

// Calculate total lovelace of the UTXO(s) inside the wallet address
var utxoTableRows = rawUtxoTable.Trim().Split("\n");
var totalLovelaceRecv = 0L;
var isPaymentComplete = false;

foreach(var row in utxoTableRows.Skip(2)){
    var cells = row.Split(" ").Where(c => c.Trim() != string.Empty);
    totalLovelaceRecv += long.Parse(cells.ElementAt(2));
}

// Determine if the total lovelace received is more than or equal to
// the total expected lovelace and displaying the results.
isPaymentComplete = totalLovelaceRecv >= TOTAL_EXPECTED_LOVELACE;

System.Console.WriteLine($"Total Received: {totalLovelaceRecv} LOVELACE");
System.Console.WriteLine($"Expected Payment: {TOTAL_EXPECTED_LOVELACE} LOVELACE");
System.Console.WriteLine($"Payment Complete: {(isPaymentComplete ? "✅":"❌")}");