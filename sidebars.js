module.exports = {
  someSidebar: {
    "Get Started": [
      "getting-started/overview",
      "getting-started/blockfrost",
      "getting-started/cardanocli-js",
      "getting-started/dandelion-apis",
      "getting-started/ogmios",
      "getting-started/smart-contracts-signpost",
    ],
    "Integrate Cardano": [
      "cardano-integration/overview",
      "cardano-integration/cardano-components",
      "cardano-integration/installing-cardano-node",
      "cardano-integration/running-cardano",
      "cardano-integration/installing-cardano-wallet",
      "cardano-integration/creating-wallet-faucet",
      "cardano-integration/listening-for-payments-cli",
      "cardano-integration/listening-for-payments-wallet"
    ],
    "Build with Transaction Metadata": [
      "transaction-metadata/overview",
      "transaction-metadata/how-to-create-a-metadata-transaction-cli",
      "transaction-metadata/how-to-create-a-metadata-transaction-wallet",
    ],
    "Discover Native Tokens": [
      "native-tokens/overview",
      "native-tokens/minting",
      "native-tokens/minting-nfts",
      "native-tokens/cardano-token-registry"
    ],
    "Fund a Project": ["funding/overview", "funding/dcfund", "funding/cfund"],
    "Operate a Stake Pool": [
      "stake-pool-operation/overview",
      "stake-pool-operation/cardano-key-pairs",
      {
        type: "category",
        label: "Stake Pool Course",
        items: [
          "stake-pool-course/overview",
          "stake-pool-course/introduction-to-cardano",
          "stake-pool-course/lesson-1",
          "stake-pool-course/lesson-2",
          "stake-pool-course/lesson-3",
          "stake-pool-course/lesson-4",
          "stake-pool-course/lesson-5",
          {
            type: "category",
            label: "Handbook",
            items: [
              "stake-pool-course/handbook/setup-virtual-box-written",
              "stake-pool-course/handbook/setup-a-server-on-aws-written",
              "stake-pool-course/handbook/setup-firewall",
              "stake-pool-course/handbook/install-cardano-node-written",
              "stake-pool-course/handbook/run-cardano-node-handbook",
              "stake-pool-course/handbook/use-cli",
              "stake-pool-course/handbook/utxo-model",
              "stake-pool-course/handbook/keys-addresses",
              "stake-pool-course/handbook/create-simple-transaction",
              "stake-pool-course/handbook/create-stake-pool-keys",
              "stake-pool-course/handbook/register-stake-keys",
              "stake-pool-course/handbook/generate-stake-pool-keys",
              "stake-pool-course/handbook/configure-topology-files",
              "stake-pool-course/handbook/register-stake-pool-metadata",
              "stake-pool-course/handbook/apply-logging-prometheus",
            ],
          },
          {
            type: "category",
            label: "Assignments",
            items: [
              "stake-pool-course/assignments/assignment-1",
              "stake-pool-course/assignments/assignment-2",
              "stake-pool-course/assignments/kes_period",
            ],
          },
        ],
      },
      "stake-pool-operation/marketing-stake-pool",
    ],
    "Contribute to the Developer Portal": [
      "portal-contributors",
      "portal-contribute",
      "portal-style-guide",
    ],
  },
};
