module.exports = {
  developerSidebar: [
    {
      type: "doc",
      id: "developers/overview",
      label: "Start Here",
    },
    {
      type: "category",
      label: "Curriculum",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Module 1: Learn the Fundamentals",
          link: {
            type: "doc",
            id: "developers/curriculum/fundamentals/overview",
          },
          items: [
            "developers/curriculum/fundamentals/what-is-a-blockchain",
            "developers/curriculum/fundamentals/cryptographic-primitives",
            "developers/curriculum/fundamentals/consensus-and-ouroboros",
            {
              type: "category",
              label: "Core Concepts",
              link: {
                type: "doc",
                id: "developers/curriculum/fundamentals/core-concepts/overview",
              },
              items: [
                "developers/curriculum/fundamentals/core-concepts/eutxo",
                "developers/curriculum/fundamentals/core-concepts/addresses",
                "developers/curriculum/fundamentals/core-concepts/wallets-and-keys",
                "developers/curriculum/fundamentals/core-concepts/transactions",
                "developers/curriculum/fundamentals/core-concepts/fees",
              ],
            },
            "developers/curriculum/fundamentals/cardano-components",
            "developers/curriculum/fundamentals/cardano-for-ethereum-developers",
          ],
        },
        {
          type: "category",
          label: "Module 2: Start Building",
          link: {
            type: "doc",
            id: "developers/curriculum/start-building/overview",
          },
          items: [
            "developers/curriculum/start-building/networks-and-test-ada",
            "developers/curriculum/start-building/choose-your-tools",
            "developers/curriculum/start-building/your-first-transaction",
            "developers/curriculum/start-building/transaction-building",
            "developers/curriculum/start-building/query-the-chain",
          ],
        },
        {
          type: "category",
          label: "Module 3: Mint Tokens & NFTs",
          link: {
            type: "doc",
            id: "developers/curriculum/native-tokens/overview",
          },
          items: [
            "developers/curriculum/native-tokens/minting-policies",
            "developers/curriculum/native-tokens/mint-fungible",
            "developers/curriculum/native-tokens/mint-nft",
            "developers/curriculum/native-tokens/metadata-registry",
            "developers/curriculum/native-tokens/authenticated-products",
            {
              type: "category",
              label: "Token Registry",
              items: [
                "developers/curriculum/native-tokens/token-registry/overview",
                "developers/curriculum/native-tokens/token-registry/register-an-entry",
                "developers/curriculum/native-tokens/token-registry/metadata-server",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Module 4: Write Smart Contracts",
          link: {
            type: "doc",
            id: "developers/curriculum/smart-contracts/overview",
          },
          items: [
            "developers/curriculum/smart-contracts/datum-redeemer-context",
            "developers/curriculum/smart-contracts/choose-a-language",
            "developers/curriculum/smart-contracts/write-a-validator",
            "developers/curriculum/smart-contracts/lock-and-spend",
            "developers/curriculum/smart-contracts/testing",
            "developers/curriculum/smart-contracts/formal-verification",
            {
              type: "category",
              label: "Design Patterns",
              link: {
                type: "doc",
                id: "developers/curriculum/smart-contracts/advanced/design-patterns/overview",
              },
              items: [
                "developers/curriculum/smart-contracts/advanced/design-patterns/stake-validator",
                "developers/curriculum/smart-contracts/advanced/design-patterns/utxo-indexers",
                "developers/curriculum/smart-contracts/advanced/design-patterns/tx-level-minter",
                "developers/curriculum/smart-contracts/advanced/design-patterns/validity-range-normalization",
                "developers/curriculum/smart-contracts/advanced/design-patterns/merkelized-validator",
                "developers/curriculum/smart-contracts/advanced/design-patterns/parameter-validation",
                "developers/curriculum/smart-contracts/advanced/design-patterns/linked-list",
                {
                  type: "category",
                  label: "Data Structures",
                  items: [
                    "developers/curriculum/smart-contracts/advanced/design-patterns/merkle-tree",
                    "developers/curriculum/smart-contracts/advanced/design-patterns/trie",
                  ],
                },
              ],
            },
            "developers/curriculum/smart-contracts/example-contracts",
            {
              type: "category",
              label: "Smart Contract Security",
              link: {
                type: "doc",
                id: "developers/curriculum/smart-contracts/security",
              },
              items: [
                "developers/curriculum/smart-contracts/advanced/security/overview",
                {
                  type: "category",
                  label: "Vulnerabilities",
                  items: [
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/double-satisfaction",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/missing-utxo-authentication",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/time-handling",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/token-security",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-value",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-datum",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/unbounded-inputs",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/other-redeemer",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/other-token-name",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/arbitrary-datum",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/utxo-contention",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/cheap-spam",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/insufficient-staking-control",
                    "developers/curriculum/smart-contracts/advanced/security/vulnerabilities/locked-value",
                  ],
                },
                "developers/curriculum/smart-contracts/advanced/security/ctf",
              ],
            },
            {
              type: "category",
              label: "Advanced",
              items: [
                "developers/curriculum/smart-contracts/advanced/uplc",
                "developers/curriculum/smart-contracts/advanced/debug-cbor",
                "developers/curriculum/smart-contracts/advanced/optimization",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Module 5: Build a dApp",
          link: {
            type: "doc",
            id: "developers/curriculum/dapps/overview",
          },
          items: [
            "developers/curriculum/dapps/scaffolding",
            "developers/curriculum/dapps/connect-a-wallet",
            {
              type: "category",
              label: "Wallet Authentication",
              link: {
                type: "doc",
                id: "developers/curriculum/dapps/wallet-authentication/overview",
              },
              items: [
                "developers/curriculum/dapps/wallet-authentication/mesh",
                {
                  type: "category",
                  label: "UTXOS Web3 Services",
                  items: [
                    {
                      type: "autogenerated",
                      dirName: "developers/curriculum/05-dapps/wallet-authentication/utxos",
                    },
                  ],
                },
              ],
            },
            "developers/curriculum/dapps/defi",
            "developers/curriculum/dapps/defi-kernel",
            {
              type: "category",
              label: "Oracles",
              link: {
                type: "doc",
                id: "developers/curriculum/dapps/oracles/overview",
              },
              items: [
                "developers/curriculum/dapps/oracles/charli3",
                "developers/curriculum/dapps/oracles/orcfax",
                "developers/curriculum/dapps/oracles/pyth",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Module 6: Add Staking & Governance",
          link: {
            type: "doc",
            id: "developers/curriculum/staking-governance/overview",
          },
          items: [
            "developers/curriculum/staking-governance/staking",
            "developers/curriculum/staking-governance/governance",
            {
              type: "category",
              label: "Governance via cardano-cli",
              items: [
                "developers/curriculum/staking-governance/cardano-cli/register-drep",
                "developers/curriculum/staking-governance/cardano-cli/delegate-to-a-drep",
                "developers/curriculum/staking-governance/cardano-cli/submit-votes",
                "developers/curriculum/staking-governance/cardano-cli/create-governance-actions",
                "developers/curriculum/staking-governance/cardano-cli/constitutional-committee",
                "developers/curriculum/staking-governance/cardano-cli/gov-queries",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Module 7: Ship to Production",
          link: {
            type: "doc",
            id: "developers/curriculum/production/overview",
          },
          items: [
            "developers/curriculum/production/going-to-production",
            "developers/curriculum/production/hydra",
            {
              type: "category",
              label: "Infrastructure",
              link: {
                type: "doc",
                id: "developers/curriculum/production/infrastructure",
              },
              items: [
                {
                  type: "category",
                  label: "API Providers",
                  link: {
                    type: "doc",
                    id: "developers/curriculum/production/api-providers/overview",
                  },
                  items: [
                    {
                      type: "category",
                      label: "Blockfrost",
                      items: [
                        {
                          type: "autogenerated",
                          dirName:
                            "developers/curriculum/07-production/api-providers/blockfrost",
                        },
                      ],
                    },
                    "developers/curriculum/production/api-providers/koios",
                    "developers/curriculum/production/api-providers/ogmios",
                  ],
                },
                "developers/curriculum/production/run-your-own-node",
                {
                  type: "category",
                  label: "Local Development Networks",
                  link: {
                    type: "doc",
                    id: "developers/curriculum/production/development-networks/overview",
                  },
                  items: [
                    "developers/curriculum/production/development-networks/yaci-devkit",
                    "developers/curriculum/production/development-networks/cardano-testnet",
                  ],
                },
                "developers/curriculum/production/demeter",
                "operators/security/air-gap",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Integrations",
      items: [
        {
          type: "category",
          label: "Payments",
          items: [
            {
              type: "category",
              label: "Listening for Payments",
              link: {
                type: "doc",
                id: "developers/integrations/payments/listening-for-payments/overview",
              },
              items: [
                "developers/integrations/payments/listening-for-payments/point-of-sale",
                "developers/integrations/payments/listening-for-payments/cardano-cli",
                "developers/integrations/payments/listening-for-payments/cardano-wallet",
              ],
            },
            "developers/integrations/payments/x402-standard",
          ],
        },
        {
          type: "category",
          label: "AI Agents",
          link: {
            type: "doc",
            id: "developers/integrations/ai-agents/overview",
          },
          items: ["developers/integrations/ai-agents/masumi"],
        },
        {
          type: "category",
          label: "Internet of Things",
          link: {
            type: "doc",
            id: "developers/integrations/iot/overview",
          },
          items: [
            {
              type: "category",
              label: "Introductions",
              link: {
                type: "doc",
                id: "developers/integrations/iot/introductions/overview",
              },
              items: [
                "developers/integrations/iot/introductions/arduino",
                "developers/integrations/iot/introductions/esp32-d1-microcontrollers",
                "developers/integrations/iot/introductions/rest-apis",
              ],
            },
            {
              type: "category",
              label: "Workshop 01: The Basics",
              link: {
                type: "doc",
                id: "developers/integrations/iot/the-basics/overview",
              },
              items: [
                "developers/integrations/iot/the-basics/01-cardano-setup",
                "developers/integrations/iot/the-basics/02-arduino-setup",
                "developers/integrations/iot/the-basics/03-api-setup",
              ],
            },
            {
              type: "category",
              label: "Workshop 02: Read and Output",
              link: {
                type: "doc",
                id: "developers/integrations/iot/read-and-output/overview",
              },
              items: [
                "developers/integrations/iot/read-and-output/01-fetch-wallet-balance",
                "developers/integrations/iot/read-and-output/02-display-data",
                "developers/integrations/iot/read-and-output/03-light-up-the-tree",
                "developers/integrations/iot/read-and-output/04-epoch-clock",
              ],
            },
            {
              type: "category",
              label: "Workshop 03: Input and Write",
              link: {
                type: "doc",
                id: "developers/integrations/iot/input-and-write/overview",
              },
              items: [
                "developers/integrations/iot/input-and-write/01-connect-and-read-sensor-data",
                "developers/integrations/iot/input-and-write/02-build-your-own-api",
                "developers/integrations/iot/input-and-write/03-mint-sensor-data-on-chain",
              ],
            },
            {
              type: "category",
              label: "Workshop 04: Cardano Ticker",
              link: {
                type: "doc",
                id: "developers/integrations/iot/cardano-ticker/overview",
              },
              items: [
                "developers/integrations/iot/cardano-ticker/01-gathering-data",
                "developers/integrations/iot/cardano-ticker/02-building-the-ticker",
              ],
            },
            {
              type: "category",
              label: "Workshop 05: QR-Code Payments",
              link: {
                type: "doc",
                id: "developers/integrations/iot/qr-code-payments/overview",
              },
              items: [
                "developers/integrations/iot/qr-code-payments/01-getting-started",
                "developers/integrations/iot/qr-code-payments/02-cip13-integration",
                "developers/integrations/iot/qr-code-payments/03-qr-code-creation",
                "developers/integrations/iot/qr-code-payments/04-building-the-frontend",
                "developers/integrations/iot/qr-code-payments/05-building-the-backend",
              ],
            },
            {
              type: "category",
              label: "Hardware",
              link: {
                type: "doc",
                id: "developers/integrations/iot/hardware/overview",
              },
              items: [
                "developers/integrations/iot/hardware/cheap-yellow-display-cyd",
                "developers/integrations/iot/hardware/esp32-c3",
                "developers/integrations/iot/hardware/oled-display-sh1106-13inch-i2c",
                "developers/integrations/iot/hardware/aht10-temperature-humidity-sensor-i2c",
                "developers/integrations/iot/hardware/relay-module-3v-1channel",
                "developers/integrations/iot/hardware/ws2812b-led-ring-12",
              ],
            },
            "developers/integrations/iot/troubleshooting",
          ],
        },
        {
          type: "doc",
          id: "developers/integrations/exchange-integrations",
          label: "Exchange Integrations",
        },
      ],
    },
    {
      type: "category",
      label: "Community",
      items: [
        "community/cardano-developer-community",
        {
          type: "link",
          label: "Talent Pool",
          href: "/talent",
        },
        "community/funding",
      ],
    },
    {
      type: "category",
      label: "Contributing to Developer Portal",
      items: [
        "contribute/portal-contribute",
        "contribute/portal-style-guide",
        {
          type: "link",
          label: "Contributors",
          href: "https://github.com/cardano-foundation/developer-portal/graphs/contributors",
        },
      ],
    },
  ],

  operatorsSidebar: [
    "operators/overview",
    {
      type: "category",
      label: "Handbook",
      collapsed: false,
      items: [
      {
        type: "category",
        label: "1. Before You Start",
        items: [
          "operators/basics/consensus-staking",
          "operators/basics/hardware-requirements",
          "operators/basics/stake-pool-networking",
          "operators/basics/cardano-key-pairs",
        ],
      },
      {
        type: "doc",
        id: "developers/curriculum/production/node/installing-cardano-node",
        label: "2. Installation",
      },
      {
        type: "category",
        label: "3. Configure",
        items: [
          "developers/curriculum/production/node/topology",
          "operators/relay-configuration/relay-node-configuration",
          {
            type: "category",
            label: "Block Producer",
            items: [
              "operators/block-producer/block-producer-keys",
              "operators/block-producer/deployment",
              "operators/block-producer/mithril-signer-configuration",
              "operators/block-producer/kes-agent",
            ],
          },
        ],
      },
      {
        type: "doc",
        id: "developers/curriculum/production/node/running-cardano",
        label: "4. Run",
      },
      {
        type: "category",
        label: "5. Register Your Pool",
        items: [
          "operators/block-producer/generating-wallet-keys",
          "operators/block-producer/register-stake-address",
          "operators/block-producer/register-stake-pool",
        ],
      },
      {
        type: "category",
        label: "6. Monitor",
        items: [
          "operators/monitoring/monitoring-overview",
          "operators/monitoring/monitoring-prometheus-grafana",
          "operators/monitoring/monitoring-openblockperf",
        ],
      },
      {
        type: "category",
        label: "7. Security & Hardening",
        items: [
          "operators/security/secure-workflow",
          "operators/deployment-scenarios/hardening-server",
          "operators/deployment-scenarios/improve-grafana-security",
          "operators/deployment-scenarios/audit-your-node",
        ],
      },
      {
        type: "category",
        label: "8. Governance",
        items: [
          "operators/governance/spo-governance",
          "operators/operator-tools/calidus-keys",
          "operators/governance/on-chain-polls",
        ],
      },
      ],
    },
    {
      type: "category",
      label: "Operator Tools",
      items: [
        "operators/operator-tools/guild-ops-suite",
        "developers/curriculum/production/mithril",
      ],
    },
    {
      type: "category",
      label: "Contributing to Developer Portal",
      items: [
        "contribute/portal-contribute",
        "contribute/portal-style-guide",
        {
          type: "link",
          label: "Contributors",
          href: "https://github.com/cardano-foundation/developer-portal/graphs/contributors",
        },
      ],
    },
  ],
};
