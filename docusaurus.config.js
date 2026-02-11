// GitHub Settings
const repository = "https://github.com/cardano-foundation/developer-portal";
const branch = "staging";

// enable or disable the announcement header bar (see 'announcementBar' section below)
const isAnnouncementActive = true;

// There are various equivalent ways to declare the Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// Custom Prism syntax highlighting themes (One Light / One Dark palette)
const prismLightTheme = {
  plain: {
    color: '#383a42',
    backgroundColor: '#fafafa',
  },
  styles: [
    { types: ['comment', 'prolog', 'cdata'], style: { color: '#a0a1a7', fontStyle: 'italic' } },
    { types: ['keyword', 'operator'], style: { color: '#a626a4' } },
    { types: ['string', 'char', 'regex', 'attr-value'], style: { color: '#50a14f' } },
    { types: ['number'], style: { color: '#986801' } },
    { types: ['boolean', 'constant'], style: { color: '#986801' } },
    { types: ['class-name'], style: { color: '#c18401' } },
    { types: ['function'], style: { color: '#4078f2' } },
    { types: ['tag', 'deleted'], style: { color: '#e45649' } },
    { types: ['attr-name'], style: { color: '#986801' } },
    { types: ['namespace'], style: { color: '#383a42' } },
    { types: ['punctuation'], style: { color: '#383a42' } },
    { types: ['inserted'], style: { color: '#50a14f' } },
    { types: ['builtin'], style: { color: '#4078f2' } },
  ],
};

// Dark theme based on Aiken docs / One Dark color scheme
const prismDarkTheme = {
  plain: {
    color: '#abb2bf',
    backgroundColor: '#282c34',
  },
  styles: [
    { types: ['comment', 'prolog', 'cdata'], style: { color: '#5c6370', fontStyle: 'italic' } },
    { types: ['keyword', 'operator'], style: { color: '#c678dd' } },
    { types: ['string', 'char', 'regex', 'attr-value'], style: { color: '#98c379' } },
    { types: ['number'], style: { color: '#d19a66' } },
    { types: ['boolean', 'constant'], style: { color: '#d19a66' } },
    { types: ['class-name'], style: { color: '#e6c07b' } },
    { types: ['function'], style: { color: '#61aeee' } },
    { types: ['tag', 'deleted'], style: { color: '#e06c75' } },
    { types: ['attr-name'], style: { color: '#d19a66' } },
    { types: ['namespace'], style: { color: '#abb2bf' } },
    { types: ['punctuation'], style: { color: '#abb2bf' } },
    { types: ['inserted'], style: { color: '#98c379' } },
    { types: ['builtin'], style: { color: '#61aeee' } },
  ],
};

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Docusaurus Config
module.exports = {
  title: "Cardano Developer Portal",
  tagline: "Let’s build together",
  url: "https://developers.cardano.org",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "cardano-foundation",
  projectName: "developer-portal",
  customFields: {
    repository: repository,
    branch: branch,
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
    // Toggle display of icons in the mega menu. Icons need to be added to /static/img/icons/ as svg files
    megaMenuIcons: false,
    // Toggle display of icons in mega menu column titles. 
    megaMenuColumnIcons: true,
    
    // Docs Sidebar
    docs: {
      sidebar: {
        hideable: true,
      }
    },

    // Additional Language Syntax Highlighting
    prism: {
      theme: prismLightTheme,
      darkTheme: prismDarkTheme,
      additionalLanguages: ['csharp', 'php', 'bash', 'json', 'typescript', 'yaml', 'diff', 'haskell'],
    },

    // Announcement Bar
    // id: always change it when changing the announcement
    // backgroundColor: use #FD7575 for warnings and #2AA18A for announcements
    announcementBar: isAnnouncementActive ? {
      id: "announcement_index10", // Any value that will identify this message + increment the number every time to be unique
      content:
        `<strong>Intersect's State of Developer Experience Survey is here! <a target="_blank" rel="noopener noreferrer" href="https://forms.gle/ey7yRJP2cP92EqrS7">Share your feedback!</a></strong>`,
      backgroundColor: "#2AA18A",
      textColor: "#FFFFFF", // Use #FFFFFF
      isCloseable: true, // Use true
    } : undefined,

    // Meta Image that will be used for your meta tag, in particular og:image and twitter:image
    // Relative to your site's "static" directory, cannot be SVGs.
    image: "img/og/og-developer-portal.png",
    metadata: [{ name: "twitter:card", content: "summary" }],

    // Algolia Search
    algolia: {
      appId: "6QH8YVQXAE",
      apiKey: "6033c09f3af6454c8c25efce0460b84a",
      indexName: "developer-portal",
      contextualSearch: true,
    },

    // Navbar title, logo and items
    navbar: {
      hideOnScroll: false,
      title: "",
      logo: {
        alt: "Cardano Logo",
        src: "img/cardano-black.svg",
        srcDark: "img/cardano-white.svg",
      },

      items: [
        {
          // Developers mega menu
          type: 'dropdown',
          label: 'Developers',
          position: 'left',
          items: [
            {to: "/docs/get-started/", label: "Getting Started"},
            {to: "/docs/learn/core-concepts/", label: "Core Concepts"},
            {to: "/docs/get-started/client-sdks/overview", label: "Client SDKs"},
            {to: "/docs/build/smart-contracts/overview", label: "Smart Contracts"},
            {to: "/docs/build/integrate/overview", label: "Integration"},
            {to: "tools", label: "Builder Tools"},
            {to: "docs/community/cardano-developer-community", label: "Community"},
            {to: "docs/community/funding", label: "Grants"},
            {to: "/hackathons", label: "Hackathons"},
          ],
          mega: true,
          customProps: {
            columnCount: 3,
            columns: [
              {
                title: 'Get Started',
                icon: 'book-solid',
                items: [
                  {to: '/docs/get-started/', label: 'Getting Started', description: 'Begin your Cardano development journey', icon: 'arrow-down-to-line-solid'},
                  {to: '/docs/learn/core-concepts/', label: 'Core Concepts', description: 'Understand the fundamentals', icon: 'book-solid'},
                  {to: '/docs/get-started/client-sdks/overview', label: 'Client SDKs', description: 'Libraries for TypeScript, Python, Rust, and more', icon: 'code-solid'},
                  {to: '/docs/get-started/infrastructure/overview', label: 'Infrastructure', description: 'Cardano Node, CLI, APIs and tooling', icon: 'plug-solid'},
                ],
              },
              {
                title: 'Build',
                icon: 'code-solid',
                items: [
                  {to: '/docs/build/smart-contracts/overview', label: 'Smart Contracts', description: 'Write and deploy smart contracts', icon: 'scroll-solid'},
                  {to: '/docs/build/native-tokens/overview', label: 'Native Tokens', description: 'Create and manage tokens', icon: 'coins-solid'},
                  {to: '/docs/build/integrate/overview', label: 'Integration', description: 'Payments, wallets, and oracles', icon: 'link-solid'},
                  {to: '/docs/build/transaction-metadata/overview', label: 'Transaction Metadata', description: 'Attach data to transactions', icon: 'shapes-solid'},
                ],
              },
              {
                title: 'Resources',
                icon: 'wrench-solid',
                items: [
                  {to: '/tools', label: 'Builder Tools', description: 'Explore developer tools', icon: 'wrench-solid'},
                  {to: '/docs/community/cardano-developer-community', label: 'Community', description: 'Connect with other developers', icon: 'people-group-solid'},
                  {to: '/docs/community/funding', label: 'Grants & Funding', description: 'Get funding for your project', icon: 'handshake-solid'},
                  {to: '/hackathons', label: 'Hackathons', description: 'Compete and build projects', icon: 'code-solid'},
                ],
              },
            ],
          },
        },
        {
          // Governance mega menu
          type: 'dropdown',
          label: 'Governance',
          position: 'left',
          items: [
            {to: '/docs/governance/', label: 'Participate in Governance'},
            {to: '/docs/governance/cardano-governance/governance-actions', label: 'Governance Actions'},
            {to: '/docs/governance/cardano-governance/submitting-governance-actions', label: 'Submitting Actions'},
            {to: '/docs/governance/cardano-governance/constitutional-committee-guide', label: 'Constitutional Committee'},
          ],
          mega: true,
          customProps: {
            columnCount: 2,
            columns: [
              {
                title: 'Overview',
                icon: 'users-solid',
                items: [
                  {to: '/docs/governance/', label: 'Participate in Governance', description: 'Shape Cardano\'s future', icon: 'users-solid'},
                  {to: '/docs/governance/cardano-governance/governance-model', label: 'Cardano Governance', description: 'How governance works', icon: 'scroll-solid'},
                ],
              },
              {
                title: 'Advanced',
                icon: 'scroll-solid',
                items: [
                  {to: '/docs/governance/cardano-governance/governance-actions', label: 'Governance Actions', description: 'Types of governance actions', icon: 'shapes-solid'},
                  {to: '/docs/governance/cardano-governance/submitting-governance-actions', label: 'Submitting Actions', description: 'How to submit proposals', icon: 'arrow-down-to-line-solid'},
                  {to: '/docs/governance/cardano-governance/constitutional-committee-guide', label: 'Constitutional Committee', description: 'CC member guide', icon: 'shield-solid'},
                ],
              },
            ],
          },
        },
        {
          // Validators mega menu
          type: 'dropdown',
          label: 'Validators',
          position: 'left',
          items: [
            {to: '/docs/operate-a-stake-pool/', label: 'Getting Started'},
            {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Relay Configuration'},
            {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Block Producer Setup'},
            {to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial', label: 'Monitoring'},
            {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security'},
          ],
          mega: true,
          customProps: {
            columnCount: 2,
            columns: [
              {
                title: 'Getting Started',
                icon: 'book-solid',
                items: [
                  {to: '/docs/operate-a-stake-pool/', label: 'Overview', description: 'Start operating a stake pool', icon: 'book-solid'},
                  {to: '/docs/operate-a-stake-pool/basics/hardware-requirements', label: 'Hardware Requirements', description: 'What you need to run a pool', icon: 'microscope-solid'},
                  {to: '/docs/operate-a-stake-pool/basics/stake-pool-networking', label: 'Stake Pool Networking', description: 'Network setup and topology', icon: 'share-nodes-solid'},
                  {to: '/docs/operate-a-stake-pool/basics/cardano-key-pairs', label: 'Key Pairs', description: 'Understanding Cardano keys', icon: 'shield-solid'},
                ],
              },
              {
                title: 'Operations',
                icon: 'wrench-solid',
                items: [
                  {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Relay Configuration', description: 'Configure your relay nodes', icon: 'plug-solid'},
                  {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Block Producer Setup', description: 'Register your stake pool', icon: 'building-solid'},
                  {to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial', label: 'Monitoring', description: 'Monitor with Grafana', icon: 'chart-line-solid'},
                  {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security', description: 'Harden your server', icon: 'shield-solid'},
                ],
              },
            ],
          },
        },
        {
          // Ecosystem mega menu
          type: 'dropdown',
          label: 'Ecosystem',
          position: 'left',
          items: [
            {to: "blog/", label: "Dev Blog"},
            {href: "https://cardanoupdates.com/", label: "Developer Activity"},
            {href: "https://cardanofoundation.org/academy", label: "Academy"},
            {href: "https://cips.cardano.org/", label: "CIPs"},
          ],
          mega: true,
          customProps: {
            columnCount: 2,
            columns: [
              {
                title: 'Explore',
                icon: 'shapes-solid',
                items: [
                  {to: '/blog/', label: 'Dev Blog', description: 'Latest developer updates', icon: 'book-solid'},
                ],
              },
              {
                title: 'External Resources',
                icon: 'link-solid',
                items: [
                  {href: 'https://cardanoupdates.com/', label: 'Developer Activity', description: 'Track ecosystem-wide development progress', icon: 'chart-line-solid'},
                  {href: 'https://cardanofoundation.org/academy', label: 'Cardano Academy', description: 'Learn about Cardano', icon: 'book-solid'},
                  {href: 'https://cips.cardano.org/', label: 'CIPs', description: 'Cardano Improvement Proposals', icon: 'scroll-solid'},
                ],
              },
            ],
          },
        },
        {
          href: "https://discord.gg/2nPUa5d7DE",
          position: "right",
          className: "header-discord-link",
          "aria-label": "Discord",
        },
        {
          href: repository,
          position: "right",
          className: "header-github-link",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Developer Portal",
          items: [
            {
              label: "How to Contribute",
              to: "docs/contribute/portal-contribute",
            },
            {
              label: "Contributors",
              href: "https://github.com/cardano-foundation/developer-portal/graphs/contributors",
            },
            {
              label: "Releases",
              href: "https://github.com/cardano-foundation/developer-portal/releases",
            },
            {
              label: "Style Guide",
              to: "docs/contribute/portal-style-guide",
            },
            {
              label: "Suggest Content",
              href: "https://github.com/cardano-foundation/developer-portal/discussions/161",
            },
            {
              label: "Raise an Issue",
              href: "https://github.com/cardano-foundation/developer-portal/issues",
            },
          ],
        },
        {
          title: "Developer Community",
          items: [
            {
              label: "Stack Exchange",
              href: "https://cardano.stackexchange.com",
            },
            {
              label: "Cardano Forum",
              href: "https://forum.cardano.org/c/developers/29",
            },
            {
              label: "Developer Ecosystem Survey",
              href: "https://cardano-foundation.github.io/state-of-the-developer-ecosystem",
            },
            {
              label: "More",
              to: "docs/community/cardano-developer-community",
            },
          ],
        },
        {
          title: "More about Cardano",
          items: [
            {
              label: "Careers on Cardano",
              to: "docs/community/careers",
            },
            {
              label: "Cardano Enterprise",
              href: "https://cardano.org/enterprise",
            },
            {
              label: "Cardano Foundation",
              href: "https://www.cardanofoundation.org",
            },
            {
              label: "Development Updates",
              href: "https://cardanoupdates.com",
            },
            {
              label: "Ouroboros Protocol",
              href: "https://cardano.org/ouroboros/",
            },
          ],
        },
      ],

      // Let's use the copyright footer for terms and privacy policy for now
      copyright: `<a href="https://cardanofoundation.org/en/terms-and-conditions" target="_blank" rel="noopener noreferrer" style="color: #ebedf0;">Terms</a> | <a href="https://cardanofoundation.org/en/privacy" target="_blank" rel="noopener noreferrer" style="color: #ebedf0;">Privacy Policy</a>`,
    },
  },
  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
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
        ],
      },
    ],
  ],

  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: `${repository}/edit/${branch}`,
        },
        blog: {
          showReadingTime: true,
          editUrl: `${repository}/edit/${branch}`,
          blogSidebarCount: 'ALL',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        gtag: {
          // You can also use your "G-" Measurement ID here.
          trackingID: 'GTM-5NM3NX4',
          // Optional fields.
          anonymizeIP: true, // Should IPs be anonymized?
        },
      },
    ],
  ],
};
