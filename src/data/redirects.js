/**
 * Client-side redirects for internal path reorganization.
 * Used by @docusaurus/plugin-client-redirects.
 *
 * Note: Netlify redirects (netlify.toml) handle external domain routing
 * (testnets.cardano.org, developer.cardano.org). Both are needed.
 */
const redirects = [
  {
    // redirect showcase to cardano.org/apps since it moved there
    to: 'https://cardano.org/apps/',
    from: '/showcase',
  },
  {
    // redirect the old smart contracts signpost to the new smart contract category
    to: '/docs/build/smart-contracts/overview',
    from: '/docs/get-started/smart-contracts-signpost',
  },
  {
    // redirect the old funding category overview to the new governance category
    to: '/docs/governance/',
    from: '/docs/fund-your-project/',
  },
  {
    // redirect to the new funding page
    to: '/docs/community/funding',
    from: ['/docs/fund-your-project/project-catalyst', '/docs/fund-your-project/alternatives']
  },
  {
    // redirect as many pages as possible from old SPO course to new SPO course
    // (any old page not existing on new course, include in redirection to top level)
    to: '/docs/operate-a-stake-pool/',
    from: [
      '/docs/stake-pool-course/',
      '/docs/stake-pool-course/lesson-1',
      '/docs/stake-pool-course/lesson-2',
      '/docs/stake-pool-course/lesson-3',
      '/docs/stake-pool-course/lesson-4',
      '/docs/stake-pool-course/lesson-5',
      '/docs/stake-pool-course/handbook/setup-virtual-box-written',
      '/docs/stake-pool-course/handbook/setup-a-server-on-aws-written',
      '/docs/stake-pool-course/assignments/assignment-1',
      '/docs/stake-pool-course/assignments/assignment-2',
      '/docs/stake-pool-course/assignments/kes_period'
    ]
  },
  {
    to: '/docs/learn/core-concepts/',
    from: '/docs/stake-pool-course/introduction-to-cardano',
  },
  {
    to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial',
    from: [
      '/docs/stake-pool-course/handbook/grafana-dashboard-tutorial',
      '/docs/stake-pool-course/handbook/grafana-loki',
      '/docs/stake-pool-course/handbook/apply-logging-prometheus',
    ]
  },
  {
    to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server',
    from: '/docs/stake-pool-course/handbook/setup-firewall',
  },
  {
    to: '/docs/get-started/infrastructure/node/installing-cardano-node',
    from: '/docs/stake-pool-course/handbook/install-cardano-node-written',
  },
  {
    to: '/docs/get-started/infrastructure/node/running-cardano',
    from: [
      '/docs/stake-pool-course/handbook/run-cardano-node-handbook',
      '/docs/get-started/cardano-node/running-cardano',
    ],
  },
  {
    to: '/docs/get-started/infrastructure/cardano-cli/basic-operations/simple-transactions',
    from: [
      '/docs/stake-pool-course/handbook/use-cli',
      '/docs/stake-pool-course/handbook/create-simple-transaction',
      '/docs/get-started/create-simple-transaction',
    ]
  },
  {
    to: '/docs/learn/core-concepts/',
    from: '/docs/stake-pool-course/handbook/utxo-model',
  },
  {
    to: '/docs/operate-a-stake-pool/basics/cardano-key-pairs',
    from: ['/docs/stake-pool-course/handbook/keys-addresses', '/docs/operate-a-stake-pool/cardano-key-pairs'],
  },
  {
    to: '/docs/operate-a-stake-pool/block-producer/generating-wallet-keys',
    from: ['/docs/stake-pool-course/handbook/create-stake-pool-keys', '/docs/operate-a-stake-pool/generating-wallet-keys'],
  },
  {
    to: '/docs/operate-a-stake-pool/block-producer/register-stake-address',
    from: ['/docs/stake-pool-course/handbook/register-stake-keys', '/docs/operate-a-stake-pool/register-stake-address'],
  },
  {
    to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool',
    from: [
      '/docs/stake-pool-course/handbook/generate-stake-pool-keys',
      '/docs/stake-pool-course/handbook/register-stake-pool-metadata',
      '/docs/operate-a-stake-pool/register-stake-pool',
    ]
  },
  {
    to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration',
    from: ['/docs/stake-pool-course/handbook/configure-topology-files', '/docs/operate-a-stake-pool/relay-node-configuration'],
  },
  {
    to: '/docs/learn/educational-resources/air-gap',
    from: '/docs/operate-a-stake-pool/security/air-gap',
  },
  {
    to: '/docs/get-started/infrastructure/cardano-cli/security/secure-workflow',
    from: '/docs/operate-a-stake-pool/security/secure-workflow',
  },
  {
    to: '/docs/operate-a-stake-pool/operator-tools/frankenwallet',
    from: '/docs/operate-a-stake-pool/frankenwallet',
  },
  {
    to: '/docs/operate-a-stake-pool/basics/stake-pool-networking',
    from: '/docs/operate-a-stake-pool/stake-pool-networking',
  },
  {
    to: '/docs/operate-a-stake-pool/basics/hardware-requirements',
    from: '/docs/operate-a-stake-pool/hardware-requirements',
  },
  {
    to: '/docs/operate-a-stake-pool/relay-configuration/monitoring-gLiveView',
    from: '/docs/operate-a-stake-pool/monitoring-gLiveView',
  },
  {
    to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial',
    from: '/docs/operate-a-stake-pool/grafana-dashboard-tutorial',
  },
  {
    to: '/docs/operate-a-stake-pool/block-producer/block-producer-keys',
    from: '/docs/operate-a-stake-pool/block-producer-keys',
  },
  {
    to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server',
    from: '/docs/operate-a-stake-pool/hardening-server',
  },
  {
    to: '/docs/operate-a-stake-pool/deployment-scenarios/improve-grafana-security',
    from: '/docs/operate-a-stake-pool/improve-grafana-security',
  },
  {
    to: '/docs/operate-a-stake-pool/deployment-scenarios/audit-your-node',
    from: '/docs/operate-a-stake-pool/audit-your-node',
  },
  {
    to: '/docs/operate-a-stake-pool/governance/on-chain-polls',
    from: '/docs/operate-a-stake-pool/on-chain-polls',
  },
  {
    to: '/docs/operate-a-stake-pool/operator-tools/guild-ops-suite',
    from: '/docs/operate-a-stake-pool/guild-ops-suite',
  },
  {
    to: '/docs/community/cardano-developer-community',
    from: '/docs/get-started/cardano-developer-community',
  },
  {
    to: '/docs/community/funding',
    from: '/docs/get-started/funding',
  },
  {
    to: '/docs/learn/core-concepts/',
    from: ['/docs/get-started/technical-concepts/', '/docs/get-started/technical-concepts/overview'],
  },
  {
    to: '/docs/learn/core-concepts/eutxo',
    from: '/docs/get-started/technical-concepts/eutxo',
  },
  {
    to: '/docs/learn/core-concepts/transactions',
    from: '/docs/get-started/technical-concepts/transactions',
  },
  {
    to: '/docs/learn/core-concepts/addresses',
    from: '/docs/get-started/technical-concepts/addresses',
  },
  {
    to: '/docs/learn/core-concepts/fees',
    from: '/docs/get-started/technical-concepts/fees',
  },
  {
    to: '/docs/learn/core-concepts/assets',
    from: '/docs/get-started/technical-concepts/assets',
  },
  {
    to: '/docs/learn/educational-resources/haskell/onboarding',
    from: ['/docs/get-started/haskell/', '/docs/get-started/haskell/onboarding'],
  },
  {
    to: '/docs/learn/educational-resources/haskell/functional-programming',
    from: '/docs/get-started/haskell/functional-programming',
  },
  {
    to: '/docs/learn/educational-resources/haskell/advanced-functional-programming',
    from: '/docs/get-started/haskell/advanced-functional-programming',
  },
  {
    to: '/docs/learn/educational-resources/air-gap',
    from: '/docs/get-started/security/air-gap',
  },
  {
    to: '/docs/get-started/networks/overview',
    from: '/docs/get-started/networks-overview',
  },
  {
    to: '/docs/get-started/networks/testnets',
    from: '/docs/get-started/testnets-and-devnets',
  },
  {
    to: '/docs/get-started/networks/testnets',
    from: '/docs/integrate-cardano/testnet-faucet',
  },
  {
    to: '/docs/get-started/networks/development-networks/overview',
    from: '/docs/get-started/development-networks',
  },
  {
    to: '/docs/get-started/networks/development-networks/yaci-devkit',
    from: '/docs/get-started/yaci-devkit',
  },
  {
    to: '/docs/get-started/networks/development-networks/cardano-testnet',
    from: '/docs/get-started/cardano-testnet',
  },
  {
    to: '/docs/get-started/infrastructure/overview',
    from: '/docs/get-started/choose-your-approach',
  },
  {
    to: '/docs/get-started/infrastructure/api-providers/overview',
    from: '/docs/get-started/providers-overview',
  },
  {
    to: '/docs/get-started/infrastructure/api-providers/koios',
    from: '/docs/get-started/koios',
  },
  {
    to: '/docs/get-started/infrastructure/api-providers/ogmios',
    from: '/docs/get-started/ogmios',
  },
  {
    to: '/docs/get-started/infrastructure/demeter',
    from: '/docs/get-started/demeter',
  },
  {
    to: '/docs/get-started/infrastructure/node/cardano-components',
    from: '/docs/operate-a-stake-pool/node-operations/cardano-components',
  },
  {
    to: '/docs/get-started/infrastructure/node/installing-cardano-node',
    from: '/docs/operate-a-stake-pool/node-operations/installing-cardano-node',
  },
  {
    to: '/docs/get-started/infrastructure/node/running-cardano',
    from: '/docs/operate-a-stake-pool/node-operations/running-cardano',
  },
  {
    to: '/docs/get-started/infrastructure/node/dynamic-block-forging',
    from: '/docs/operate-a-stake-pool/node-operations/dynamic-block-forging',
  },
  {
    to: '/docs/get-started/infrastructure/node/rts-options-node',
    from: '/docs/operate-a-stake-pool/node-operations/rts-options-node',
  },
  {
    to: '/docs/get-started/infrastructure/node/topology',
    from: '/docs/operate-a-stake-pool/node-operations/topology',
  },
  {
    to: '/docs/get-started/client-sdks/overview',
    from: '/docs/get-started/high-level-sdks-overview',
  },
  {
    to: '/docs/get-started/client-sdks/typescript/overview',
    from: '/docs/get-started/typescript-sdks',
  },
  {
    to: '/docs/get-started/client-sdks/python/pycardano',
    from: '/docs/get-started/pycardano',
  },
  {
    to: '/docs/get-started/client-sdks/csharp/chrysalis',
    from: '/docs/get-started/cardanosharp-wallet',
  },
  {
    to: '/docs/get-started/client-sdks/typescript/mesh/overview',
    from: '/docs/get-started/mesh',
  },
  {
    to: '/docs/get-started/client-sdks/typescript/evolution-sdk/get-started',
    from: '/docs/get-started/evolution-sdk',
  },
  {
    to: '/docs/build/integrate/wallet-authentication/utxos/overview',
    from: ['/docs/get-started/utxos', '/docs/get-started/client-sdks/typescript/utxos/overview'],
  },
  {
    to: '/docs/get-started/infrastructure/cardano-cli/basic-operations/get-started',
    from: '/docs/get-started/cardano-cli',
  },
  {
    to: '/docs/get-started/infrastructure/cardano-wallet/cardano-wallet',
    from: '/docs/get-started/cardano-wallet',
  },
  {
    to: '/docs/get-started/client-sdks/low-level/cardano-serialization-lib/overview',
    from: '/docs/get-started/cardano-serialization-lib',
  },
  {
    to: '/docs/get-started/infrastructure/cardano-cli/security/secure-workflow',
    from: '/docs/get-started/security/secure-workflow',
  },
  {
    to: '/docs/operate-a-stake-pool/operator-tools/frankenwallet',
    from: '/docs/get-started/security/frankenwallet',
  },
  {
    to: '/docs/operate-a-stake-pool/basics/consensus-staking',
    from: '/docs/get-started/technical-concepts/consensus-staking',
  },
  {
    to: '/docs/build/integrate/overview',
    from: ['/docs/integrate-cardano/', '/docs/integrate-cardano/overview'],
  },
  {
    to: '/docs/build/integrate/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments/overview',
  },
  {
    to: '/docs/build/integrate/payments/listening-for-payments/cardano-cli',
    from: '/docs/integrate-cardano/listening-for-payments/cardano-cli',
  },
  {
    to: '/docs/build/integrate/payments/listening-for-payments/cardano-wallet',
    from: '/docs/integrate-cardano/listening-for-payments/cardano-wallet',
  },
  {
    to: '/docs/build/integrate/payments/listening-for-payments/point-of-sale',
    from: '/docs/integrate-cardano/listening-for-payments/point-of-sale',
  },
  {
    to: '/docs/build/integrate/payments/x402-standard',
    from: '/docs/integrate-cardano/x402-standard',
  },
  {
    to: '/docs/build/integrate/wallet-authentication/overview',
    from: ['/docs/integrate-cardano/user-wallet-authentication/overview', '/docs/build/integrate/user-wallet-authentication/overview'],
  },
  {
    to: '/docs/build/integrate/wallet-authentication/mesh',
    from: ['/docs/integrate-cardano/user-wallet-authentication/mesh', '/docs/build/integrate/user-wallet-authentication/mesh'],
  },
  {
    to: '/docs/build/integrate/wallet-authentication/cardano-serialization-lib',
    from: ['/docs/integrate-cardano/user-wallet-authentication/cardano-serialization-lib', '/docs/build/integrate/user-wallet-authentication/cardano-serialization-lib'],
  },
  {
    to: '/docs/build/integrate/wallet-authentication/utxos/overview',
    from: '/docs/build/integrate/user-wallet-authentication/utxos/overview',
  },
  {
    to: '/docs/build/integrate/ai-agents/overview',
    from: '/docs/integrate-cardano/ai-agents/overview',
  },
  {
    to: '/docs/build/integrate/ai-agents/masumi',
    from: '/docs/integrate-cardano/ai-agents/masumi',
  },
  {
    to: '/docs/build/integrate/oracles/overview',
    from: '/docs/integrate-cardano/oracles-overview',
  },
  {
    to: '/docs/build/integrate/oracles/charli3',
    from: '/docs/integrate-cardano/charli3',
  },
  {
    to: '/docs/build/integrate/oracles/orcfax',
    from: '/docs/integrate-cardano/orcfax',
  },
  {
    to: '/docs/build/integrate/exchange-integrations',
    from: '/docs/integrate-cardano/exchange-integrations',
  },
  {
    to: '/docs/build/integrate/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments',
  },
  {
    to: '/docs/build/integrate/wallet-authentication/overview',
    from: ['/docs/integrate-cardano/user-wallet-authentication', '/docs/build/integrate/user-wallet-authentication'],
  },
  {
    to: '/docs/build/integrate/ai-agents/overview',
    from: '/docs/integrate-cardano/ai-agents',
  },
  {
    to: '/docs/build/native-tokens/overview',
    from: ['/docs/native-tokens/', '/docs/native-tokens/overview'],
  },
  {
    to: '/docs/build/native-tokens/minting',
    from: '/docs/native-tokens/minting',
  },
  {
    to: '/docs/build/native-tokens/minting-nfts',
    from: '/docs/native-tokens/minting-nfts',
  },
  {
    to: '/docs/build/native-tokens/authenticated-products',
    from: '/docs/native-tokens/authenticated-products',
  },
  {
    to: '/docs/build/native-tokens/cardano-token-registry',
    from: '/docs/native-tokens/cardano-token-registry',
  },
  {
    to: '/docs/build/transaction-metadata/overview',
    from: ['/docs/transaction-metadata/', '/docs/transaction-metadata/overview'],
  },
  {
    to: '/docs/build/transaction-metadata/how-to-create-a-metadata-transaction-cli',
    from: '/docs/transaction-metadata/how-to-create-a-metadata-transaction-cli',
  },
  {
    to: '/docs/build/transaction-metadata/how-to-create-a-metadata-transaction-wallet',
    from: '/docs/transaction-metadata/how-to-create-a-metadata-transaction-wallet',
  },
  {
    to: '/docs/build/transaction-metadata/retrieving-metadata',
    from: '/docs/transaction-metadata/retrieving-metadata',
  },
  {
    to: '/docs/build/transaction-metadata/mesh',
    from: '/docs/transaction-metadata/mesh',
  },
  {
    to: '/docs/build/smart-contracts/overview',
    from: ['/docs/smart-contracts/', '/docs/smart-contracts/overview'],
  },
  {
    to: '/docs/contribute/portal-contribute',
    from: '/docs/portal-contribute',
  },
  {
    to: '/docs/contribute/portal-style-guide',
    from: '/docs/portal-style-guide',
  },
  {
    to: '/docs/community/careers',
    from: '/docs/careers',
  },
  // Smart Contract Vulnerabilities → Security section redirects
  {
    to: '/docs/build/smart-contracts/advanced/security/overview',
    from: [
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/overview',
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/mlabs-common-vulnerabilities/overview',
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/mesh-bad-contracts/overview',
    ],
  },
  {
    to: '/docs/build/smart-contracts/advanced/security/ctf',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/ctf',
  },
  {
    to: '/docs/build/smart-contracts/advanced/security/vulnerabilities/double-satisfaction',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/1-double-satisfaction',
  },
  {
    to: '/docs/build/smart-contracts/advanced/security/vulnerabilities/missing-utxo-authentication',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/2-trust-no-utxo',
  },
  {
    to: '/docs/build/smart-contracts/advanced/security/vulnerabilities/time-handling',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/3-time-handling',
  },
  {
    to: '/docs/build/smart-contracts/advanced/security/vulnerabilities/token-security',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/4-token-security',
  },
  {
    to: '/docs/get-started/networks/testnets',
    from: [
      '/docs/get-started/networks/testnets/overview',
      '/docs/get-started/networks/testnets/testnet-faucet',
    ],
  },
  {
    to: '/docs/get-started/infrastructure/node/installing-cardano-node',
    from: '/docs/get-started/cardano-node/installing-cardano-node',
  },
  {
    to: '/docs/get-started/infrastructure/cardano-cli/basic-operations/get-started',
    from: '/docs/get-started/cli-operations/basic-operations',
  },
  {
    to: '/docs/build/smart-contracts/advanced/design-patterns/merkle-tree',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/merkle-tree',
  },
  {
    to: '/docs/build/smart-contracts/advanced/design-patterns/trie',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/trie',
  },
  {
    to: '/docs/build/smart-contracts/example-contracts',
    from: ['/docs/build/smart-contracts/languages/aiken/smart-contract-library', '/docs/build/smart-contracts/smart-contract-library'],
  },
  {
    to: '/docs/build/smart-contracts/advanced/design-patterns/linked-list',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/linked-list',
  },
];

module.exports = redirects;
