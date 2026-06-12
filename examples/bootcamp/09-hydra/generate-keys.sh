#!/usr/bin/env bash
set -euo pipefail

# Generate keys for both Alice and Bob
# Requires: cardano-cli, hydra-node

mkdir -p credentials

for PARTICIPANT in alice bob; do
  echo "Generating keys for ${PARTICIPANT}..."

  # Cardano node keys (for L1 fees and identity)
  cardano-cli address key-gen \
    --verification-key-file "credentials/${PARTICIPANT}-node.vk" \
    --signing-key-file "credentials/${PARTICIPANT}-node.sk"

  cardano-cli address build \
    --payment-verification-key-file "credentials/${PARTICIPANT}-node.vk" \
    --out-file "credentials/${PARTICIPANT}-node.addr" \
    --testnet-magic 1

  # Funds keys (for committing to the Head)
  cardano-cli address key-gen \
    --verification-key-file "credentials/${PARTICIPANT}-funds.vk" \
    --signing-key-file "credentials/${PARTICIPANT}-funds.sk"

  cardano-cli address build \
    --payment-verification-key-file "credentials/${PARTICIPANT}-funds.vk" \
    --out-file "credentials/${PARTICIPANT}-funds.addr" \
    --testnet-magic 1

  # Hydra keys (for Head protocol signing)
  hydra-node gen-hydra-key --output-file "credentials/${PARTICIPANT}-hydra"

  echo "Keys for ${PARTICIPANT} generated."
  echo "  Node address: $(cat "credentials/${PARTICIPANT}-node.addr")"
  echo "  Funds address: $(cat "credentials/${PARTICIPANT}-funds.addr")"
  echo ""
done

echo "Fund the node addresses with at least 30 tADA each from:"
echo "  https://docs.cardano.org/cardano-testnets/tools/faucet/"
echo ""
echo "Fund the funds addresses with the amount you want to commit to the Head."
