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
        src: "img/cardano-black.svg",
        srcDark: "img/cardano-white.svg",
      },

      items: [
        {
          type: 'dropdown',
          label: 'Developers',
          position: 'left',
          items: [
            {
              to: "docs/learn/core-concepts/",
              label: "Core Concepts",
            },
            {
              to: "/docs/native-tokens/",
              label: "Native Tokens",
            },
            {
              to: "/docs/smart-contracts/",
              label: "Smart Contracts",
            },
            {
              to: "tools",
              label: "Builder Tools",
            },
            {
              to: "docs/community/cardano-developer-community",
              label: "Dev Community",
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
              to: '/docs/operate-a-stake-pool/relay-node-configuration',
              label: 'Relay Configuration',
            },
            {
              to: '/docs/operate-a-stake-pool/register-stake-pool',
              label: 'Block Producer Setup',
            },
            {
              to: '/docs/operate-a-stake-pool/grafana-dashboard-tutorial',
              label: 'Monitoring',
            },
            {
              to: '/docs/operate-a-stake-pool/hardening-server',
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
              to: "docs/portal-contribute/",
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
              to: "docs/portal-style-guide",
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
              to: "docs/careers",
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
            to: '/docs/smart-contracts/',
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

            to: '/docs/operate-a-stake-pool/grafana-dashboard-tutorial/',
            from: [
              '/docs/stake-pool-course/handbook/grafana-dashboard-tutorial',
              '/docs/stake-pool-course/handbook/grafana-loki',
              '/docs/stake-pool-course/handbook/apply-logging-prometheus',
            ]
          },
          {
            to: '/docs/operate-a-stake-pool/hardening-server/',
            from: '/docs/stake-pool-course/handbook/setup-firewall',
          },
          {
            to: '/docs/operate-a-stake-pool/node-operations/installing-cardano-node/',
            from: '/docs/stake-pool-course/handbook/install-cardano-node-written',
          },
          {
            to: '/docs/operate-a-stake-pool/node-operations/running-cardano/',
            from: '/docs/stake-pool-course/handbook/run-cardano-node-handbook',
          },
          {
            to: '/docs/get-started/create-simple-transaction/',
            from: [
              '/docs/stake-pool-course/handbook/use-cli',
              '/docs/stake-pool-course/handbook/create-simple-transaction',
            ]
          },
          {
            to: '/docs/learn/core-concepts/',
            from: '/docs/stake-pool-course/handbook/utxo-model',
          },
          {
            to: '/docs/operate-a-stake-pool/cardano-key-pairs/',
            from: '/docs/stake-pool-course/handbook/keys-addresses',
          },
          {
            to: '/docs/operate-a-stake-pool/generating-wallet-keys/',
            from: '/docs/stake-pool-course/handbook/create-stake-pool-keys',
          },
          {
            to: '/docs/operate-a-stake-pool/register-stake-address/',
            from: '/docs/stake-pool-course/handbook/register-stake-keys',
          },
          {
            to: '/docs/operate-a-stake-pool/register-stake-pool/',
            from: [
              '/docs/stake-pool-course/handbook/generate-stake-pool-keys',
              '/docs/stake-pool-course/handbook/register-stake-pool-metadata',
            ]
          },
          {
            to: '/docs/operate-a-stake-pool/relay-node-configuration/',
            from: '/docs/stake-pool-course/handbook/configure-topology-files',
          },
          {
            to: '/docs/learn/educational-resources/air-gap',
            from: '/docs/operate-a-stake-pool/security/air-gap',
          },
          {
            to: '/docs/get-started/security/secure-workflow',
            from: '/docs/operate-a-stake-pool/security/secure-workflow',
          },
          {
            to: '/docs/get-started/security/frankenwallet',
            from: '/docs/operate-a-stake-pool/frankenwallet',
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
