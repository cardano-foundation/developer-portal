// GitHub Settings
const vars = require('./variables')

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
    repository: `${vars.repository}`,
    branch: `${vars.branch}`,
  },
  themeConfig: {
    // Docs Sidebar
    docs: {
      sidebar: {
        hideable: true,
      }
    },

    // Additional Language Syntax Highlighting
    prism: {
      additionalLanguages: ['csharp', 'php'],
    },

    // Announcement Bar
    // id: always change it when changing the announcement
    // backgroundColor: use #FD7575 for warnings and #2AA18A for announcements
    announcementBar: {
      id: "announcement_index3", // Any value that will identify this message + increment the number every time to be unique
      content:
        `<strong>Build out the Developer Portal together with us, ⭐️<a target="_blank" rel="noopener noreferrer" href="https://discord.gg/Exe6XmqKDx">join Discord.</a></strong>`,
      backgroundColor: "#2AA18A",
      textColor: "#FFFFFF", // Use #FFFFFF
      isCloseable: true, // Use true
    },

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
      title: "Developers",
      logo: {
        alt: "Cardano Logo",
        src: "img/cardano-black.svg",
        srcDark: "img/cardano-white.svg",
      },

      items: [
        {
          to: "docs/get-started/",
          label: "Get Started",
          position: "left",
        },
        {
          to: "tools",
          label: "Builder Tools",
          position: "left",
        },
        {
          to: "showcase",
          label: "Showcase",
          position: "left",
        },
        {
          to: "blog/",
          label: "Dev Blog",
          position: "left",
        },
        {
          href: "https://docs.cardano.org/en/latest/",
          label: "Docs",
          position: "left",
        },
        {
          href: `${vars.repository}`,
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
              label: "Contributors",
              to: "docs/portal-contributors/",
            },
            {
              label: "Changelog",
              to: "/changelog",
            },
            {
              label: "How to Contribute",
              to: "docs/portal-contribute/",
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
              label: "Developer Portal Discord",
              href: "https://discord.com/invite/Exe6XmqKDx",
            },
            {
              label: "Developer Ecosystem Survey",
              href: "https://cardano-foundation.github.io/state-of-the-developer-ecosystem/2022",
            },
            {
              label: "More",
              to: "docs/get-started/cardano-developer-community",
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
            // redirect to the new catalyst page
            to: '/docs/governance/project-catalyst',
            from: ['/docs/fund-your-project/project-catalyst', '/docs/fund-your-project/alternatives']
          },
          {
            // redirect the old cardano improvement proposal overview
            to: '/docs/governance/cardano-improvement-proposals/CIP-0001',
            from: '/docs/governance/cardano-improvement-proposals/',
          },
        ],
      },
    ],
    [
      require.resolve('./src/plugins/changelog/index.js'),
      {
        blogTitle: 'Developer Portal Changelog',
        blogDescription:
          'Keep yourself up-to-date about new features in every release',
        blogSidebarCount: 'ALL',
        blogSidebarTitle: 'Changelog',
        routeBasePath: '/changelog',
        showReadingTime: false,
        postsPerPage: 20,
        archiveBasePath: null,
        authorsMapPath: 'authors.json',
        feedOptions: {
          type: 'all',
          title: 'Developer Portal Changelog',
          description:
            'Keep yourself up-to-date about new features in every release',
          language: 'en',
        },
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
          editUrl: `${vars.repository}/edit/${vars.branch}`,
        },
        blog: {
          showReadingTime: true,
          editUrl: `${vars.repository}/edit/${vars.branch}`,
          blogSidebarCount: 'ALL',
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
