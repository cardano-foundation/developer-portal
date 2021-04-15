module.exports = {
  someSidebar: {
    'Getting Started': [
      'getting-started/overview',
      'getting-started/blockfrost',
      'getting-started/cardano-serialization-lib',
      'getting-started/dandelion-apis'
    ],
    'Transaction Metadata': [
      'transaction-metadata/overview',
      'transaction-metadata/how-to-create-a-metadata-transaction',
    ],
    'Cardano Integration': [
      'cardano-integration/overview',
    ],
    'Native Tokens': [
      'native-tokens/overview',
      'native-tokens/submit-entry-to-cardano-token-registry',
    ],
    'Stake Pool Operation': [
      'stake-pool-operation/overview',
      {
        type: 'category',
        label: 'Stake Pool Course',
        items: [
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
                  {
                    type: 'category',
                    label: 'Lesson 1',
                    items: [
                              'stake-pool-course/lesson-1/setup-virtual-box',
                              'stake-pool-course/lesson-1/setup-a-server-on-aws',
                              'stake-pool-course/lesson-1/alternative-to-aws',
                              'stake-pool-course/lesson-1/install-cardano-node',
                              'stake-pool-course/lesson-1/run-cardano-node',
                            ],
                  },
                  {
                    type: 'category',
                    label: 'Lesson 2',
                    items: [
                              'stake-pool-course/lesson-2/cli',
                              'stake-pool-course/lesson-2/utxo',
                              'stake-pool-course/lesson-2/payment-keys-and-address',
                              'stake-pool-course/lesson-2/faucet',
                              'stake-pool-course/lesson-2/transaction',
                            ],
                  },
                  {
                    type: 'category',
                    label: 'Lesson 3',
                    items: [
                              'stake-pool-course/lesson-3/create-stake-keys-and-address',
                              'stake-pool-course/lesson-3/register-stake-key',
                            ],
                  },
                  {
                    type: 'category',
                    label: 'Lesson 4',
                    items: [
                              'stake-pool-course/lesson-4/kes',
                              'stake-pool-course/lesson-4/understanding-pledge',
                              'stake-pool-course/lesson-4/stakepools-keys',
                              'stake-pool-course/lesson-4/topology-files',
                              'stake-pool-course/lesson-4/register-stake-pool',
                              'stake-pool-course/lesson-4/secure-crypto-keys',
                            ],
                  },
                  {
                    type: 'category',
                    label: 'Lesson 5',
                    items: [
                              'stake-pool-course/lesson-5/logging-prometheus',
                              'stake-pool-course/lesson-5/grafana',
                            ],
                  },
                  {
                    type: 'category',
                    label: 'Handbook',
                    items: [
                              'stake-pool-course/handbook/setup-virtual-box-written',
                              'stake-pool-course/handbook/setup-a-server-on-aws-written',
                              'stake-pool-course/handbook/setup-firewall',
                              'stake-pool-course/handbook/install-cardano-node-written',
                              'stake-pool-course/handbook/run-cardano-node-handbook',
                              'stake-pool-course/handbook/use-cli',
                              'stake-pool-course/handbook/utxo-model',
                              'stake-pool-course/handbook/keys-addresses',
                              'stake-pool-course/handbook/create-simple-transaction',
                              'stake-pool-course/handbook/create-stake-pool-keys',
                              'stake-pool-course/handbook/register-stake-keys',
                              'stake-pool-course/handbook/generate-stake-pool-keys',
                              'stake-pool-course/handbook/configure-topology-files',
                              'stake-pool-course/handbook/register-stake-pool-metadata',
                              'stake-pool-course/handbook/apply-logging-prometheus',
                            ],
                  },
                {
                  type: 'category',
                  label: 'Assignments',
                  items: [
                            'stake-pool-course/assignments/assignment-1',
                            'stake-pool-course/assignments/assignment-2',
                            'stake-pool-course/assignments/kes_period',
                          ],
                },
                ],
      },
  ],
    'Project Funding': [
      'funding/overview',
    ],
    'Contribution': [
        'portal-contributors',
        'portal-contribute',
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
                  'unused/learn-cardano/cardano-node',
                  'unused/learn-cardano/token-locking',
                ],
      },
  ],
  },
};
