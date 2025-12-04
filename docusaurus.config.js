// GitHub Settings
const repository = "https://github.com/cardano-foundation/developer-portal";
const branch = "staging";

// enable or disable the announcement header bar (see 'announcementBar' section below)
const isAnnouncementActive = true;

// There are various equivalent ways to declare the Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config
import { themes as prismThemes } from 'prism-react-renderer';

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
      //theme: prismThemes.github, // uncomment for light mode in code boxes
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'php', 'bash', 'json', 'typescript', 'yaml', 'diff'],
    },

    // Announcement Bar
    // id: always change it when changing the announcement
    // backgroundColor: use #FD7575 for warnings and #2AA18A for announcements
    announcementBar: isAnnouncementActive ? {
      id: "announcement_index9", // Any value that will identify this message + increment the number every time to be unique
      content:
        `<strong>Join the weekly Developer Office Hours - Get help, share ideas, and connect with the community! <a target="_blank" rel="noopener noreferrer" href="/docs/community/cardano-developer-community">Learn more</a> 💬</strong>`,
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
        src: "img/cardano-logo-blue.svg",
        srcDark: "img/cardano-logo-white.svg",
      },

      items: [
          {
            // The collapsed mega menu for "Learn"
            label: 'Learn',
            type: 'dropdown',
            position: 'left',
            items: [
              //{to: '/discover-cardano', label: 'Discover Cardano'}, //TODO: needs revamp
              {to: '/what-is-ada', label: 'What is ada?'},
              {to: '/what-is-ada#wallets', label: 'Cardano wallets'},
              {to: '/common-scams', label: 'Protect your ada'},
              {to: '/stake-pool-delegation', label: 'Delegate your stake'},
              {to: '/stake-pool-operation', label: 'Operate a stake pool'},
              {to: '/governance', label: 'Participate in governance'},
              {to: '/developers', label: 'Start building on Cardano'},
              {to: '/research', label: 'Cardano Research'},
              {href: 'https://developers.cardano.org/showcase', label: 'Cardano Showcase'},
            ],
            // The mega menu full version for "Learn"
            mega: true,
            customProps: {
              columns: [
                {
                  title: 'Get to know',
                  icon: 'book-solid',
                  items: [
                    //{to: '/discover-cardano', label: 'Discover Cardano', description: 'What makes Cardano unique'}, //TODO: needs revamp
                    {to: '/what-is-ada', label: 'What is ada?', description: 'Cardano\'s native token', icon: 'ada'},
                    {to: '/what-is-ada#wallets', label: 'Cardano wallets', description: 'An app to store and use ada', icon: 'wallet-solid'},
                    {to: '/where-to-get-ada', label: 'Where to get ada?', description: 'Obtain ada to use the Cardano', icon: 'coins-solid'},
                    {to: '/common-scams', label: 'Protect your ada', description: 'Don\'t fall for scams', icon: 'shield-solid'},
                  ],
                },
                {
                  title: 'Take part',
                  icon: 'shapes-solid',
                  items: [
                    {to: '/stake-pool-delegation', label: 'Delegate your ada', description: 'Be a part of it and earn rewards', icon: 'handshake-solid'},
                    {to: '/apps', label: 'Use Cardano Apps', description: 'Explore curated applications', icon: 'shapes-solid'},
                    {to: '/docs', label: 'Get involved in cardano.org', description: 'If you’d like to participate, this will get you started', icon: 'shapes-solid'},
                    
                  ],
                },
                {
                  title: 'Research',
                  icon: 'flask-vial-solid',
                  items: [
                    {to: '/research', label: 'Cardano Research', description: 'Peer-reviewed research and papers', icon: 'flask-vial-solid'},
                    {href: '/insights', label: 'Cardano Insights', description: 'On‑chain or regularly refreshed data', icon: 'chart-line-solid'},
                    {to: '/hardforks', label: 'Hard Forks', description: 'Implemented Upgrades', icon: 'code-branch-solid'},
                  ],
                },
              ],
            },
          },
          {
            // The collapsed mega menu for "Participate"
            label: 'Participate',
            type: 'dropdown',
            position: 'left',
            items: [
              {to: '/events', label: 'Cardano Events'},
              {to: '/constitution', label: 'Cardano Constitution'},
              {to: '/community-code-of-conduct', label: 'Code of Conduct'},
              {to: '/ambassadors', label: 'Cardano Ambassadors'},
              {to: '/newsletter', label: 'Newsletter'},
              {to: '/#follow', label: 'Follow Cardano'},
              {href: 'https://forum.cardano.org', label: 'Cardano Forum'},
              {href: 'https://forum.cardano.org/t/cardano-stay-safe-series-official-community-channel-list/20046', label: 'Social Channels'},
            ],
            // The mega menu full version for "Participate"
            mega: true,
            customProps: {
              columns: [
                {
                  title: 'Connect',
                  icon: 'link-solid',
                  items: [
                    {to: '/#follow', label: 'Follow Cardano', description: 'Stay Updated', icon: 'link-solid'},
                    {to: '/newsletter', label: 'Newsletter', description: 'Stay updated with Cardano news', icon: 'envelope-solid'},
                    {href: 'https://forum.cardano.org/t/cardano-stay-safe-series-official-community-channel-list/20046', label: 'Social Channels', description: 'Recommended Communtiy Channels', icon: 'share-nodes-solid'},
                  ],
                },
                {
                  title: 'Engage',
                  icon: 'comments-solid',
                  items: [
                     {to: '/events', label: 'Cardano Events', description: 'Join Cardano community events', icon: 'calendar-solid'},
                    {href: 'https://forum.cardano.org', label: 'Cardano Forum', description: 'Structured long-format discussions', icon: 'comments-solid'},
                     {href: 'https://discord.com/invite/2PNbVTr', label: 'Cardano Discord', description: 'Real-time chat and quick discussions', icon: 'comments-solid'},
                    {to: '/ambassadors', label: 'Cardano Ambassadors', description: 'Become a Cardano ambassador', icon: 'people-group-solid'},
                    
                    
                  ],
                },
                {
                  title: 'Governance',
                  icon: 'users-solid',
                  items: [
                     {to: '/governance', label: 'Participate in governance', description: 'Shape Cardano\'s future', icon: 'scroll-solid'},
                     {to: '/constitution', label: 'Cardano Constitution', description: 'Learn about governance', icon: 'scroll-solid'},
                    {to: '/community-code-of-conduct', label: 'Code of Conduct', description: 'Community standards and values', icon: 'heart-solid'},
                  ],
                },
              ],
            },
          },
          /* 
          {
            
            label: 'Insights',
            position: 'left',
            items: [  
              {to: '/insights/demo/', label: 'Simple Demo'},
              {to: '/insights/supply/', label: 'Supply'}, 
            ],
          },*/
          {
            // The collapsed mega menu for "Build"
            label: 'Build',
            type: 'dropdown',
            position: 'left',
            items: [
              {to: '/developers', label: 'Start building on Cardano'},
              {to: '/research', label: 'Cardano Research'},
              {to: '/exchanges', label: 'Integrate Cardano'},
              {to: '/entities/#companies', label: 'Companies building on Cardano'},
            ],
            // The mega menu full version for "Build"
            mega: true,
            customProps: {
              columnCount: 2,
              columns: [
                {
                  title: 'Get started',
                  icon: 'code-solid',
                  items: [
                    {to: '/developers', label: 'Start building on Cardano', description: 'Developer resources and tooling', icon: 'code-solid'},
                    {to: '/research', label: 'Cardano Research', description: 'Peer-reviewed research and papers', icon: 'flask-solid'},
                    {to: '/exchanges', label: 'Integrate Cardano', description: 'Exchange and integration guides', icon: 'plug-solid'},
                  ],
                },
                {
                  title: 'Tools',
                  icon: 'wrench-solid',
                  items: [
                    {href: 'https://developers.cardano.org', label: 'Developer Portal', description: 'Cardano developer portal and docs', icon: 'book-solid'},
                    {href: 'https://developers.cardano.org/tools', label: 'Builder Tools', description: 'Tools to build on Cardano', icon: 'wrench-solid'},
                     {to: '/entities/#companies', label: 'Companies building on Cardano', description: 'Companies, associations, and collaborations', icon: 'building-solid'},
                  ],
                },
              ],
            },
          },
        {
          type: 'dropdown',
          label: 'Developers',
          position: 'left',
          items: [
            {
              to: "/docs/get-started/",
              label: "Getting Started",
            },
            {
              to: "/docs/learn/core-concepts/",
              label: "Core Concepts",
            },
            {
              to: "/docs/get-started/client-sdks/overview",
              label: "Client SDKs",
            },
            {
              to: "/docs/build/smart-contracts/overview",
              label: "Smart Contracts",
            },
            {
              to: "/docs/build/integrate/overview",
              label: "Integration",
            },
            {
              to: "tools",
              label: "Builder Tools",
            },
            {
              to: "docs/community/cardano-developer-community",
              label: "Community",
            },
            {
              to: "docs/community/funding",
              label: "Grants",
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Governance',
          position: 'left',
          items: [
            {
              to: '/docs/governance/',
              label: 'Participate in Governance',
            },
            {
              to: '/docs/governance/cardano-governance/governance-actions',
              label: 'Governance Actions',
            },
            {
              to: '/docs/governance/cardano-governance/submitting-governance-actions',
              label: 'Submitting Actions',
            },
            {
              to: '/docs/governance/cardano-governance/constitutional-committee-guide',
              label: 'Constitutional Committee',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Validators',
          position: 'left',
          items: [
            {
              to: '/docs/operate-a-stake-pool/',
              label: 'Getting Started',
            },
            {
              to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration',
              label: 'Relay Configuration',
            },
            {
              to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool',
              label: 'Block Producer Setup',
            },
            {
              to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial',
              label: 'Monitoring',
            },
            {
              to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server',
              label: 'Security',
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Ecosystem',
          position: 'left',
          items: [
            {
              to: "showcase",
              label: "Showcase",
            },
            {
              to: "blog/",
              label: "Dev Blog",
            },
            {
              href: "https://cardanoupdates.com/",
              label: "Developer Activity",
            },
            {
              href: "https://cardanofoundation.org/academy",
              label: "Academy",
            },
            {
              href: "https://cips.cardano.org/",
              label: "CIPs",
            }
          ],
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
            from: '/docs/stake-pool-course/handbook/run-cardano-node-handbook',
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
            to: '/docs/get-started/networks/testnets/overview',
            from: '/docs/get-started/testnets-and-devnets',
          },
          {
            to: '/docs/get-started/networks/testnets/testnet-faucet',
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
            to: '/docs/get-started/client-sdks/csharp/cardanosharp-wallet',
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
