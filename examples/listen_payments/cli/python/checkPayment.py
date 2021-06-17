# coding: utf-8
import os
import subprocess

CARDANO_CLI_PATH = "cardano-cli"
CARDANO_NETWORK_MAGIC = 1097911063
CARDANO_KEYS_DIR = "keys"
TOTAL_EXPECTED_LOVELACE = 1000000

with open(os.path.join(CARDANO_KEYS_DIR, "payment.addr"), 'r') as file:
    walletAddress = file.read()

rawUtxoTable = subprocess.check_output([
    CARDANO_CLI_PATH,
    'query', 'utxo',
    '--testnet-magic', str(CARDANO_NETWORK_MAGIC),
    '--address', walletAddress])

utxoTableRows = rawUtxoTable.strip().splitlines()
totalLovelaceRecv = 0
isPaymentComplete = False

for x in range(2, len(utxoTableRows)):
    cells = utxoTableRows[x].split()
    totalLovelaceRecv +=  int(cells[2])

isPaymentComplete = totalLovelaceRecv >= TOTAL_EXPECTED_LOVELACE

print("Total Received: %s LOVELACE" % totalLovelaceRecv)
print("Expected Payment: %s LOVELACE" % TOTAL_EXPECTED_LOVELACE)
print("Payment Complete: %s" % {True: "✅", False: "❌"} [isPaymentComplete])