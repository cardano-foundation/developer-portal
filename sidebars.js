module.exports = {
  someSidebar: {
    'Transaction Metadata': [
      'transaction-metadata/overview',
      'transaction-metadata/how-to-create-a-metadata-transaction'
    ],
    'Payment Integration': [
      'payment-integration/overview',
    ],
    'Native Tokens': [
      'native-tokens/submit-entry-to-cardano-token-registry',
    ],
    'Stake Pool Course': [
      'stake-pool-course/overview',
      {
        type: 'category',
        label: 'Introduction',
        items: [
                  'stake-pool-course/introduction/why-cardano',
                  'stake-pool-course/introduction/about-cardano',
                  'stake-pool-course/introduction/introduction-to-cardano',
                  'stake-pool-course/introduction/ouroboros-protocol',
                ],
      },
    ],
    'Contribution': [
        'portal-contribute',
        'portal-example',
        'portal-style-guide',
    ],
    'Unused': [
      {
        type: 'category',
        label: 'Plutus',
        items: [
                  'unused/smart-contracts-and-building-dapps/plutus/plutus-overview',
                ],
      },
      {
        type: 'category',
        label: 'Community',
        items: [
                  'unused/community-ambassador-program',
                ],
      },
      {
        type: 'category',
        label: 'Resources',
        items: [
                  'unused/resources/developer-portal-updates',
                ],
      },
      {
        type: 'category',
        label: 'Adrestia - SDKs and APIs',
        items: [
                  'unused/adrestia-SDKs-and-APIs/adrestia-cardano-node',
                ],
      },
      {
        type: 'category',
        label: 'Learn Cardano',
        items: [
                  'getting-started/cardano-node',
                   'unused/learn-cardano/token-locking',
                ],
      },
  ],
  },
};
