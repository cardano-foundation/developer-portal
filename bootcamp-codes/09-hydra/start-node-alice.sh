#!/usr/bin/env bash
set -euo pipefail

# Start Alice's Hydra node
# Prerequisites:
#   - Cardano node running and synced to preprod
#   - Keys generated via generate-keys.sh
#   - CARDANO_NODE_SOCKET_PATH set
#   - HYDRA_SCRIPTS_TX_ID set (published Hydra scripts on preprod)
#   - BOB_IP set to Bob's IP address

: "${CARDANO_NODE_SOCKET_PATH:?Set CARDANO_NODE_SOCKET_PATH to your Cardano node socket}"
: "${HYDRA_SCRIPTS_TX_ID:?Set HYDRA_SCRIPTS_TX_ID to the published Hydra scripts tx id}"
: "${BOB_IP:?Set BOB_IP to Bob's IP address}"

hydra-node \
  --node-id alice-node \
  --api-host 0.0.0.0 \
  --api-port 4001 \
  --listen 0.0.0.0:5001 \
  --peer "${BOB_IP}:5001" \
  --hydra-scripts-tx-id "${HYDRA_SCRIPTS_TX_ID}" \
  --cardano-signing-key credentials/alice-node.sk \
  --cardano-verification-key credentials/bob-node.vk \
  --hydra-signing-key credentials/alice-hydra.sk \
  --hydra-verification-key credentials/bob-hydra.vk \
  --ledger-protocol-parameters protocol-parameters.json \
  --testnet-magic 1 \
  --node-socket "${CARDANO_NODE_SOCKET_PATH}" \
  --contestation-period 300s
