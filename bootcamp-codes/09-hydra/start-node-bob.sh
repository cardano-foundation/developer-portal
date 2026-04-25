#!/usr/bin/env bash
set -euo pipefail

# Start Bob's Hydra node
# Prerequisites:
#   - Cardano node running and synced to preprod
#   - Keys generated via generate-keys.sh
#   - CARDANO_NODE_SOCKET_PATH set
#   - HYDRA_SCRIPTS_TX_ID set (published Hydra scripts on preprod)
#   - ALICE_IP set to Alice's IP address

: "${CARDANO_NODE_SOCKET_PATH:?Set CARDANO_NODE_SOCKET_PATH to your Cardano node socket}"
: "${HYDRA_SCRIPTS_TX_ID:?Set HYDRA_SCRIPTS_TX_ID to the published Hydra scripts tx id}"
: "${ALICE_IP:?Set ALICE_IP to Alice's IP address}"

hydra-node \
  --node-id bob-node \
  --api-host 0.0.0.0 \
  --api-port 4002 \
  --listen 0.0.0.0:5001 \
  --peer "${ALICE_IP}:5001" \
  --hydra-scripts-tx-id "${HYDRA_SCRIPTS_TX_ID}" \
  --cardano-signing-key credentials/bob-node.sk \
  --cardano-verification-key credentials/alice-node.vk \
  --hydra-signing-key credentials/bob-hydra.sk \
  --hydra-verification-key credentials/alice-hydra.vk \
  --ledger-protocol-parameters protocol-parameters.json \
  --testnet-magic 1 \
  --node-socket "${CARDANO_NODE_SOCKET_PATH}" \
  --contestation-period 300s
