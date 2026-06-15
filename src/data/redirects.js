/**
 * Client-side redirects for internal path reorganization.
 * Used by @docusaurus/plugin-client-redirects.
 *
 * Note: Netlify redirects (netlify.toml) handle external domain routing
 * (testnets.cardano.org, developer.cardano.org). Both are needed.
 */
const redirects = [
  // Module 2 (How Value Works): old Learn > Core Concepts paths moved to /docs/value/*
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/overview',
    from: '/docs/learn/core-concepts/',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/eutxo',
    from: '/docs/learn/core-concepts/eutxo',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/addresses',
    from: '/docs/learn/core-concepts/addresses',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/transactions',
    from: '/docs/learn/core-concepts/transactions',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/fees',
    from: '/docs/learn/core-concepts/fees',
  },
  {
    to: '/docs/developers/curriculum/native-tokens/overview',
    from: '/docs/learn/core-concepts/assets',
  },
  // Module 1 (Cardano Foundations): Ethereum guide relocated out of Learn > Educational Resources
  {
    to: '/docs/developers/curriculum/fundamentals/cardano-for-ethereum-developers',
    from: '/docs/learn/educational-resources/ethereum-developers',
  },
  // Module 3 (Setup & First Transaction): network setup pages consolidated into first-steps
  {
    to: '/docs/developers/curriculum/start-building/networks-and-test-ada',
    from: [
      '/docs/get-started/networks/overview',
      '/docs/get-started/networks/testnets',
      '/docs/get-started/networks/explorers',
    ],
  },
  {
    // redirect old showcase path to cardano.org/apps since it moved there
    to: 'https://cardano.org/apps/',
    from: '/showcase',
  },
  {
    // redirect the old smart contracts signpost to the new smart contract category
    to: '/docs/developers/curriculum/smart-contracts/overview',
    from: '/docs/get-started/smart-contracts-signpost',
  },
  {
    // the old funding category overview now points to the funding page
    to: '/docs/community/funding',
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
    to: '/docs/operators/',
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
    to: '/docs/developers/curriculum/fundamentals/core-concepts/overview',
    from: '/docs/stake-pool-course/introduction-to-cardano',
  },
  {
    to: '/docs/operators/monitoring/monitoring-prometheus-grafana',
    from: [
      '/docs/stake-pool-course/handbook/grafana-dashboard-tutorial',
      '/docs/stake-pool-course/handbook/grafana-loki',
      '/docs/stake-pool-course/handbook/apply-logging-prometheus',
    ]
  },
  {
    to: '/docs/operators/deployment-scenarios/hardening-server',
    from: '/docs/stake-pool-course/handbook/setup-firewall',
  },
  {
    to: '/docs/developers/curriculum/production/node/installing-cardano-node',
    from: '/docs/stake-pool-course/handbook/install-cardano-node-written',
  },
  {
    to: '/docs/developers/curriculum/production/node/running-cardano',
    from: [
      '/docs/stake-pool-course/handbook/run-cardano-node-handbook',
      '/docs/get-started/cardano-node/running-cardano',
    ],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: [
      '/docs/stake-pool-course/handbook/use-cli',
      '/docs/stake-pool-course/handbook/create-simple-transaction',
      '/docs/get-started/create-simple-transaction',
    ]
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/overview',
    from: '/docs/stake-pool-course/handbook/utxo-model',
  },
  {
    to: '/docs/operators/basics/cardano-key-pairs',
    from: ['/docs/stake-pool-course/handbook/keys-addresses', '/docs/operate-a-stake-pool/cardano-key-pairs'],
  },
  {
    to: '/docs/operators/block-producer/generating-wallet-keys',
    from: ['/docs/stake-pool-course/handbook/create-stake-pool-keys', '/docs/operate-a-stake-pool/generating-wallet-keys'],
  },
  {
    to: '/docs/operators/block-producer/register-stake-address',
    from: ['/docs/stake-pool-course/handbook/register-stake-keys', '/docs/operate-a-stake-pool/register-stake-address'],
  },
  {
    to: '/docs/operators/block-producer/register-stake-pool',
    from: [
      '/docs/stake-pool-course/handbook/generate-stake-pool-keys',
      '/docs/stake-pool-course/handbook/register-stake-pool-metadata',
      '/docs/operate-a-stake-pool/register-stake-pool',
    ]
  },
  {
    to: '/docs/operators/relay-configuration/relay-node-configuration',
    from: ['/docs/stake-pool-course/handbook/configure-topology-files', '/docs/operate-a-stake-pool/relay-node-configuration'],
  },
  {
    to: '/docs/operators/security/air-gap',
    from: '/docs/operate-a-stake-pool/security/air-gap',
  },
  {
    to: '/docs/operators/security/secure-workflow',
    from: '/docs/operate-a-stake-pool/security/secure-workflow',
  },
  {
    to: '/docs/operators/security/air-gap',
    from: '/docs/operate-a-stake-pool/frankenwallet',
  },
  {
    to: '/docs/operators/basics/stake-pool-networking',
    from: '/docs/operate-a-stake-pool/stake-pool-networking',
  },
  {
    to: '/docs/operators/basics/hardware-requirements',
    from: '/docs/operate-a-stake-pool/hardware-requirements',
  },
  {
    to: '/docs/operators/monitoring/monitoring-overview',
    from: '/docs/operate-a-stake-pool/monitoring-gLiveView',
  },
  {
    to: '/docs/operators/monitoring/monitoring-prometheus-grafana',
    from: '/docs/operate-a-stake-pool/grafana-dashboard-tutorial',
  },
  {
    to: '/docs/operators/block-producer/block-producer-keys',
    from: '/docs/operate-a-stake-pool/block-producer-keys',
  },
  {
    to: '/docs/operators/deployment-scenarios/hardening-server',
    from: '/docs/operate-a-stake-pool/hardening-server',
  },
  {
    to: '/docs/operators/deployment-scenarios/improve-grafana-security',
    from: '/docs/operate-a-stake-pool/improve-grafana-security',
  },
  {
    to: '/docs/operators/deployment-scenarios/audit-your-node',
    from: '/docs/operate-a-stake-pool/audit-your-node',
  },
  {
    to: '/docs/operators/governance/on-chain-polls',
    from: '/docs/operate-a-stake-pool/on-chain-polls',
  },
  {
    to: '/docs/operators/operator-tools/guild-ops-suite',
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
    to: '/docs/developers/curriculum/fundamentals/core-concepts/overview',
    from: ['/docs/get-started/technical-concepts/', '/docs/get-started/technical-concepts/overview'],
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/eutxo',
    from: '/docs/get-started/technical-concepts/eutxo',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/transactions',
    from: '/docs/get-started/technical-concepts/transactions',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/addresses',
    from: '/docs/get-started/technical-concepts/addresses',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/core-concepts/fees',
    from: '/docs/get-started/technical-concepts/fees',
  },
  {
    to: '/docs/developers/curriculum/native-tokens/overview',
    from: '/docs/get-started/technical-concepts/assets',
  },
  {
    to: '/docs/operators/security/air-gap',
    from: '/docs/get-started/security/air-gap',
  },
  {
    to: '/docs/developers/curriculum/start-building/networks-and-test-ada',
    from: '/docs/get-started/networks-overview',
  },
  {
    to: '/docs/developers/curriculum/start-building/networks-and-test-ada',
    from: '/docs/get-started/testnets-and-devnets',
  },
  {
    to: '/docs/developers/curriculum/start-building/networks-and-test-ada',
    from: '/docs/integrate-cardano/testnet-faucet',
  },
  {
    to: '/docs/developers/curriculum/production/development-networks/overview',
    from: '/docs/get-started/development-networks',
  },
  {
    to: '/docs/developers/curriculum/production/development-networks/yaci-devkit',
    from: '/docs/get-started/yaci-devkit',
  },
  {
    to: '/docs/developers/curriculum/production/development-networks/cardano-testnet',
    from: '/docs/get-started/cardano-testnet',
  },
  {
    to: '/docs/developers/curriculum/production/infrastructure',
    from: ['/docs/get-started/infrastructure/overview', '/docs/get-started/choose-your-approach'],
  },
  {
    to: '/docs/developers/curriculum/production/api-providers/overview',
    from: '/docs/get-started/providers-overview',
  },
  {
    to: '/docs/developers/curriculum/production/api-providers/koios',
    from: '/docs/get-started/koios',
  },
  {
    to: '/docs/developers/curriculum/production/api-providers/ogmios',
    from: '/docs/get-started/ogmios',
  },
  {
    to: '/docs/developers/curriculum/production/demeter',
    from: '/docs/get-started/demeter',
  },
  {
    to: '/docs/developers/curriculum/fundamentals/cardano-components',
    from: '/docs/operate-a-stake-pool/node-operations/cardano-components',
  },
  {
    to: '/docs/developers/curriculum/production/node/installing-cardano-node',
    from: '/docs/operate-a-stake-pool/node-operations/installing-cardano-node',
  },
  {
    to: '/docs/developers/curriculum/production/node/running-cardano',
    from: '/docs/operate-a-stake-pool/node-operations/running-cardano',
  },
  {
    to: '/docs/developers/curriculum/production/node/running-cardano',
    from: '/docs/operate-a-stake-pool/node-operations/dynamic-block-forging',
  },
  {
    to: '/docs/developers/curriculum/production/node/running-cardano',
    from: '/docs/operate-a-stake-pool/node-operations/rts-options-node',
  },
  {
    to: '/docs/developers/curriculum/production/node/topology',
    from: '/docs/operate-a-stake-pool/node-operations/topology',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/high-level-sdks-overview',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/typescript-sdks',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/pycardano',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/cardanosharp-wallet',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/mesh',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/evolution-sdk',
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: ['/docs/get-started/utxos', '/docs/get-started/client-sdks/typescript/utxos/overview'],
  },
  {
    to: '/docs/developers/curriculum/start-building/your-first-transaction',
    from: '/docs/get-started/cardano-cli',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/cardano-wallet',
  },
  {
    to: '/docs/developers/curriculum/start-building/choose-your-tools',
    from: '/docs/get-started/cardano-serialization-lib',
  },
  {
    to: '/docs/operators/security/secure-workflow',
    from: '/docs/get-started/security/secure-workflow',
  },
  {
    to: '/docs/operators/security/air-gap',
    from: '/docs/get-started/security/frankenwallet',
  },
  {
    to: '/docs/operators/basics/consensus-staking',
    from: '/docs/get-started/technical-concepts/consensus-staking',
  },
  {
    to: '/docs/developers/curriculum/dapps/overview',
    from: ['/docs/integrate-cardano/', '/docs/integrate-cardano/overview'],
  },
  {
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments/overview',
  },
  {
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments/cardano-cli',
  },
  {
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments/cardano-wallet',
  },
  {
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments/point-of-sale',
  },
  {
    // Listening for Payments consolidated into one page; per-method guides folded into tabs
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: [
      '/docs/build/integrate/payments/listening-for-payments/point-of-sale',
      '/docs/build/integrate/payments/listening-for-payments/cardano-cli',
      '/docs/build/integrate/payments/listening-for-payments/cardano-wallet',
    ],
  },
  {
    to: '/docs/developers/integrations/payments/x402-standard',
    from: '/docs/integrate-cardano/x402-standard',
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: ['/docs/integrate-cardano/user-wallet-authentication/overview', '/docs/build/integrate/user-wallet-authentication/overview'],
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: ['/docs/integrate-cardano/user-wallet-authentication/mesh', '/docs/build/integrate/user-wallet-authentication/mesh', '/docs/build/integrate/wallet-authentication/mesh'],
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: ['/docs/build/integrate/wallet-authentication/cardano-serialization-lib', '/docs/integrate-cardano/user-wallet-authentication/cardano-serialization-lib', '/docs/build/integrate/user-wallet-authentication/cardano-serialization-lib'],
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: [
      '/docs/build/integrate/user-wallet-authentication/utxos/overview',
      '/docs/build/integrate/wallet-authentication/utxos/overview',
      '/docs/build/integrate/wallet-authentication/utxos/wallet',
      '/docs/build/integrate/wallet-authentication/utxos/sponsorship',
    ],
  },
  {
    to: '/docs/developers/integrations/ai-agents/overview',
    from: '/docs/integrate-cardano/ai-agents/overview',
  },
  {
    to: '/docs/developers/integrations/ai-agents/masumi',
    from: '/docs/integrate-cardano/ai-agents/masumi',
  },
  {
    to: '/docs/developers/curriculum/dapps/oracles/overview',
    from: '/docs/integrate-cardano/oracles-overview',
  },
  {
    to: '/docs/developers/curriculum/dapps/oracles/charli3',
    from: '/docs/integrate-cardano/charli3',
  },
  {
    to: '/docs/developers/curriculum/dapps/oracles/orcfax',
    from: '/docs/integrate-cardano/orcfax',
  },
  {
    to: '/docs/developers/integrations/exchange-integrations',
    from: '/docs/integrate-cardano/exchange-integrations',
  },
  {
    to: '/docs/developers/integrations/payments/listening-for-payments/overview',
    from: '/docs/integrate-cardano/listening-for-payments',
  },
  {
    to: '/docs/developers/curriculum/dapps/wallet-authentication/overview',
    from: ['/docs/integrate-cardano/user-wallet-authentication', '/docs/build/integrate/user-wallet-authentication'],
  },
  {
    to: '/docs/developers/integrations/ai-agents/overview',
    from: '/docs/integrate-cardano/ai-agents',
  },
  {
    to: '/docs/developers/curriculum/native-tokens/overview',
    from: ['/docs/native-tokens/', '/docs/build/native-tokens/overview', '/docs/build/native-tokens'],
  },
  {
    to: '/docs/developers/curriculum/native-tokens/mint-fungible',
    from: ['/docs/native-tokens/minting', '/docs/build/native-tokens/minting'],
  },
  {
    to: '/docs/developers/curriculum/native-tokens/mint-nft',
    from: ['/docs/native-tokens/minting-nfts', '/docs/build/native-tokens/minting-nfts'],
  },
  {
    to: '/docs/developers/curriculum/native-tokens/authenticated-products',
    from: ['/docs/build/native-tokens/authenticated-products'],
  },
  {
    to: '/docs/developers/curriculum/native-tokens/token-registry/overview',
    from: ['/docs/native-tokens/cardano-token-registry', '/docs/build/native-tokens/cardano-token-registry', '/docs/build/native-tokens/token-registry/cardano-token-registry-overview', '/docs/build/native-tokens/token-registry/cardano-token-registry-cip26', '/docs/build/native-tokens/token-registry/cardano-token-registry-cip68'],
  },
  {
    to: '/docs/developers/curriculum/native-tokens/token-registry/metadata-server',
    from: ['/docs/build/native-tokens/token-registry/cardano-token-registry-server'],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: ['/docs/build/transaction-metadata/overview', '/docs/transaction-metadata/', '/docs/transaction-metadata/overview'],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: ['/docs/build/transaction-metadata/how-to-create-a-metadata-transaction-cli', '/docs/transaction-metadata/how-to-create-a-metadata-transaction-cli'],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: ['/docs/build/transaction-metadata/how-to-create-a-metadata-transaction-wallet', '/docs/transaction-metadata/how-to-create-a-metadata-transaction-wallet'],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: ['/docs/build/transaction-metadata/retrieving-metadata', '/docs/transaction-metadata/retrieving-metadata'],
  },
  {
    to: '/docs/developers/curriculum/start-building/transaction-building',
    from: ['/docs/build/transaction-metadata/mesh', '/docs/transaction-metadata/mesh'],
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/overview',
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
    to: '/docs/community/cardano-developer-community',
    from: ['/docs/careers', '/docs/community/careers'],
  },
  // Smart Contract Vulnerabilities → Security section redirects
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/overview',
    from: [
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/overview',
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/mlabs-common-vulnerabilities/overview',
      '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/mesh-bad-contracts/overview',
    ],
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/ctf',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/ctf',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/double-satisfaction',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/1-double-satisfaction',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/missing-utxo-authentication',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/2-trust-no-utxo',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/time-handling',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/3-time-handling',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/token-security',
    from: '/docs/build/smart-contracts/advanced/smart-contract-vulnerabilities/invariant0-blog/4-token-security',
  },
  {
    to: '/docs/developers/curriculum/start-building/networks-and-test-ada',
    from: [
      '/docs/get-started/networks/testnets/overview',
      '/docs/get-started/networks/testnets/testnet-faucet',
    ],
  },
  {
    to: '/docs/developers/curriculum/production/node/installing-cardano-node',
    from: '/docs/get-started/cardano-node/installing-cardano-node',
  },
  {
    to: '/docs/developers/curriculum/start-building/your-first-transaction',
    from: '/docs/get-started/cli-operations/basic-operations',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/merkle-tree',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/merkle-tree',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/trie',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/trie',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/example-contracts',
    from: ['/docs/build/smart-contracts/languages/aiken/smart-contract-library', '/docs/build/smart-contracts/smart-contract-library'],
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/linked-list',
    from: '/docs/build/smart-contracts/languages/aiken/advanced-data-structures/linked-list',
  },
  {
    // Per-language pages dissolved into the Choose a Language hub; per-language depth now lives in each project's official docs
    to: '/docs/developers/curriculum/smart-contracts/choose-a-language',
    from: [
      '/docs/build/smart-contracts/languages/aiken/overview',
      '/docs/build/smart-contracts/languages/plutarch/overview',
      '/docs/build/smart-contracts/languages/plinth',
      '/docs/build/smart-contracts/languages/opshin',
      '/docs/build/smart-contracts/languages/scalus',
      '/docs/build/smart-contracts/languages/marlowe',
      '/docs/build/smart-contracts/languages/pebble',
      '/docs/build/smart-contracts/languages/plu-ts',
      '/docs/get-started/plu-ts',
    ],
  },
  {
    // Plutarch data structures collapsed into the agnostic Design Patterns pages
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/merkle-tree',
    from: [
      '/docs/build/smart-contracts/languages/plutarch/advanced-data-structures/merkle-tree',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/merkle-tree',
    ],
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/trie',
    from: '/docs/build/smart-contracts/languages/plutarch/advanced-data-structures/trie',
  },
  {
    to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/linked-list',
    from: '/docs/build/smart-contracts/languages/plutarch/advanced-data-structures/linked-list',
  },
  {
    // Plutarch production-grade dApps distilled into the DeFi application patterns section
    to: '/docs/developers/curriculum/dapps/defi',
    from: [
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/overview',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/nix-environments',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/bridge-template',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/linear-vesting',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/yield-farming',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/single-asset-staking',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/smart-handles',
      '/docs/build/smart-contracts/languages/plutarch/production-grade-dapps/direct-offer',
    ],
  },
  {
    // fix broken blog pagination: ../  from /blog/page/N/ resolves to /blog/page/
    to: '/blog/',
    from: '/blog/page',
  },
  {
    // /hackathons renamed to /talent
    to: '/talent',
    from: '/hackathons',
  },
  // frankenwallet content merged into air-gap page
  { to: '/docs/operators/security/air-gap', from: '/docs/operate-a-stake-pool/operator-tools/frankenwallet' },
  // cardano-cli docs moved from get-started/infrastructure/cardano-cli to learn/cardano-cli
  { to: '/docs/developers/curriculum/start-building/your-first-transaction', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/get-started', '/docs/learn/cardano-cli/basic-operations/get-started'] },
  { to: '/docs/developers/curriculum/start-building/transaction-building', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/simple-transactions', '/docs/learn/cardano-cli/basic-operations/simple-transactions'] },
  // cardano-cli stake ops dissolved into the staking topic (concept + Evolution/Mesh/cli tabs)
  { to: '/docs/developers/curriculum/staking-governance/staking', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/stakeaddress-registration', '/docs/learn/cardano-cli/basic-operations/stake-address-registration'] },
  { to: '/docs/developers/curriculum/staking-governance/staking', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/stake-address-delegation', '/docs/learn/cardano-cli/basic-operations/delegate-to-stake-pool'] },
  { to: '/docs/developers/curriculum/staking-governance/staking', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/deregister-stake-address', '/docs/learn/cardano-cli/basic-operations/deregister-stake-address'] },
  { to: '/docs/developers/curriculum/staking-governance/staking', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/withdraw-rewards', '/docs/learn/cardano-cli/basic-operations/withdraw-rewards'] },
  { to: '/docs/developers/curriculum/start-building/transaction-building', from: ['/docs/get-started/infrastructure/cardano-cli/basic-operations/treasury-donations', '/docs/learn/cardano-cli/basic-operations/treasury-donation'] },
  { to: '/docs/developers/curriculum/start-building/transaction-building', from: ['/docs/get-started/infrastructure/cardano-cli/multi-witness-transactions', '/docs/learn/cardano-cli/multi-witness-transactions'] },
  { to: '/docs/operators/security/secure-workflow', from: '/docs/get-started/infrastructure/cardano-cli/security/secure-workflow' },
  // cardano-cli governance guides moved from the legacy learn/ bucket into Module 6
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/voting', '/docs/learn/cardano-cli/governance/submit-votes'] },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/gov-queries', '/docs/learn/cardano-cli/governance/gov-queries'] },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/governance-actions', '/docs/learn/cardano-cli/governance/create-governance-actions'] },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/constitutional-committee', '/docs/learn/cardano-cli/governance/constitutional-committee'] },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/delegating-vote', '/docs/learn/cardano-cli/governance/delegate-to-a-drep'] },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/get-started/infrastructure/cardano-cli/governance/register-drep', '/docs/learn/cardano-cli/governance/register-drep'] },
  // the standalone governance section was folded into the developer curriculum (Module 6); participation now lives at cardano.org/governance
  { to: '/docs/developers/curriculum/staking-governance/overview', from: '/docs/governance/' },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: ['/docs/governance/overview', '/docs/governance/cardano-governance/overview', '/docs/governance/cardano-governance/cardano-governance', '/docs/governance/cardano-governance/governance-actions', '/docs/governance/cardano-governance/submitting-governance-actions', '/docs/governance/cardano-governance/constitutional-committee-guide'] },
  { to: '/docs/developers/curriculum/native-tokens/mint-fungible', from: ['/docs/get-started/infrastructure/cardano-cli/native-assets/native-assets', '/docs/learn/cardano-cli/native-assets'] },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: ['/docs/get-started/infrastructure/cardano-cli/simple-scripts/simple-scripts', '/docs/learn/cardano-cli/simple-scripts'] },
  { to: '/docs/developers/curriculum/smart-contracts/lock-and-spend', from: ['/docs/get-started/infrastructure/cardano-cli/plutus-scripts/plutus-scripts', '/docs/learn/cardano-cli/plutus-scripts'] },
  // deleted SPO docs
  { to: '/docs/operators/', from: '/docs/operate-a-stake-pool/basics/scaling-node-operations' },
  { to: '/docs/operators/relay-configuration/relay-node-configuration', from: '/docs/operate-a-stake-pool/relay-configuration/mithril-relay' },
  { to: '/docs/operators/monitoring/monitoring-overview', from: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial' },
  { to: '/docs/operators/monitoring/monitoring-overview', from: '/docs/operate-a-stake-pool/relay-configuration/monitoring-gLiveView' },
  // deleted node docs
  { to: '/docs/developers/curriculum/production/node/running-cardano', from: '/docs/get-started/infrastructure/node/dynamic-block-forging' },
  { to: '/docs/developers/curriculum/production/node/running-cardano', from: '/docs/get-started/infrastructure/node/rts-options-node' },
  // Lessons course dissolved into the module curriculum (theory + practical fully harvested).
  // Each old lesson URL redirects to its canonical module home. URLs dropped the numeric
  // filename prefix (Docusaurus default), so the `from` paths below are un-numbered.
  // Course + track landings:
  { to: '/docs/developers/curriculum/smart-contracts/overview', from: '/docs/smart-contracts/lessons' },
  { to: '/docs/developers/curriculum/fundamentals/overview', from: '/docs/build/smart-contracts/lessons/theory-overview' },
  { to: '/docs/developers/curriculum/start-building/overview', from: '/docs/build/smart-contracts/lessons/practical-overview' },
  // Theory track:
  { to: '/docs/developers/curriculum/fundamentals/what-is-a-blockchain', from: '/docs/build/smart-contracts/lessons/theory/what-is-blockchain' },
  { to: '/docs/developers/curriculum/fundamentals/cryptographic-primitives', from: '/docs/build/smart-contracts/lessons/theory/cryptographic-primitives' },
  { to: '/docs/developers/curriculum/fundamentals/consensus-and-ouroboros', from: '/docs/build/smart-contracts/lessons/theory/consensus-mechanisms' },
  { to: '/docs/developers/curriculum/fundamentals/core-concepts/eutxo', from: '/docs/build/smart-contracts/lessons/theory/utxo-model' },
  { to: '/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys', from: '/docs/build/smart-contracts/lessons/theory/wallets-keys-addresses' },
  { to: '/docs/developers/curriculum/fundamentals/core-concepts/transactions', from: '/docs/build/smart-contracts/lessons/theory/transactions' },
  { to: '/docs/developers/curriculum/smart-contracts/overview', from: '/docs/build/smart-contracts/lessons/theory/smart-contracts' },
  { to: '/docs/developers/curriculum/smart-contracts/choose-a-language', from: '/docs/build/smart-contracts/lessons/theory/smart-contract-languages' },
  { to: '/docs/developers/curriculum/smart-contracts/datum-redeemer-context', from: '/docs/build/smart-contracts/lessons/theory/datum-redeemer-context' },
  { to: '/docs/developers/curriculum/native-tokens/overview', from: '/docs/build/smart-contracts/lessons/theory/native-tokens' },
  { to: '/docs/developers/curriculum/dapps/defi', from: '/docs/build/smart-contracts/lessons/theory/defi-concepts' },
  { to: '/docs/developers/curriculum/staking-governance/staking', from: '/docs/build/smart-contracts/lessons/theory/stake-pools-delegation' },
  { to: '/docs/developers/curriculum/production/infrastructure', from: '/docs/build/smart-contracts/lessons/theory/developer-infrastructure' },
  { to: '/docs/developers/curriculum/smart-contracts/security', from: '/docs/build/smart-contracts/lessons/theory/blockchain-security' },
  { to: '/docs/developers/curriculum/staking-governance/governance', from: '/docs/build/smart-contracts/lessons/theory/cardano-governance' },
  // Practical track:
  { to: '/docs/developers/curriculum/start-building/your-first-transaction', from: '/docs/build/smart-contracts/lessons/practical/wallet-send-lovelace' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/practical/multisig' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/practical/aiken-contracts' },
  { to: '/docs/developers/curriculum/smart-contracts/testing', from: '/docs/build/smart-contracts/lessons/practical/contract-testing' },
  { to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/stake-validator', from: '/docs/build/smart-contracts/lessons/practical/avoid-redundant-validation' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/practical/interpreting-blueprint' },
  { to: '/docs/developers/curriculum/smart-contracts/lock-and-spend', from: '/docs/build/smart-contracts/lessons/practical/vesting' },
  { to: '/docs/developers/curriculum/smart-contracts/example-contracts', from: '/docs/build/smart-contracts/lessons/practical/plutus-nft' },
  { to: '/docs/developers/curriculum/production/hydra', from: '/docs/build/smart-contracts/lessons/practical/hydra' },
  { to: '/docs/developers/curriculum/dapps/connect-a-wallet', from: '/docs/build/smart-contracts/lessons/practical/web3-services' },
  // Legacy flat lesson URLs (pre theory/practical split) -> module homes:
  { to: '/docs/developers/curriculum/start-building/your-first-transaction', from: '/docs/build/smart-contracts/lessons/01-hello-world' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/02-multisig' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/03-aiken-contracts' },
  { to: '/docs/developers/curriculum/smart-contracts/testing', from: '/docs/build/smart-contracts/lessons/04-contract-testing' },
  { to: '/docs/developers/curriculum/smart-contracts/advanced/design-patterns/stake-validator', from: '/docs/build/smart-contracts/lessons/05-avoid-redundant-validation' },
  { to: '/docs/developers/curriculum/smart-contracts/write-a-validator', from: '/docs/build/smart-contracts/lessons/06-interpreting-blueprint' },
  { to: '/docs/developers/curriculum/smart-contracts/lock-and-spend', from: '/docs/build/smart-contracts/lessons/07-vesting' },
  { to: '/docs/developers/curriculum/smart-contracts/example-contracts', from: '/docs/build/smart-contracts/lessons/08-plutus-nft' },
];

module.exports = redirects;
