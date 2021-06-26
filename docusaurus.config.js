// GitHub Settings
const vars = require('./variables')

// Docusaurus Config
module.exports = {
  title: "Cardano Developer Portal",
  tagline: "together, we can change the world for the better",
  url: "https://staging-dev-portal.netlify.app",
  baseUrl: "/",
  onBrokenLinks: "throw",
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
    hideableSidebar: true,

    // Additional Language Syntax Highlighting
    prism: {
      additionalLanguages: ['csharp'],
    },
    
    // Dark / Light Mode
    colorMode: {
      disableSwitch: false,
      // with true defaultMode is overridden by user system preferences.
      respectPrefersColorScheme: true,
      switchConfig: {
        darkIcon: "🌙",
        darkIconStyle: {
          marginLeft: "2px",
        },
        lightIcon: "☀️",
        lightIconStyle: {
          marginLeft: "1px",
        },
      },
    },

    // Announcement Bar
    announcementBar: {
      id: "support_se", // Any value that will identify this message.
      content:
        //`If you like the new portal, give it a star on <a target="_blank" rel="noopener noreferrer" href="${repository}">GitHub</a>! ⭐️`,
        `<strong>Cardano Stack Exchange is now open to the public. ⭐️<a target="_blank" rel="noopener noreferrer" href="https://cardano.stackexchange.com">Join us!</a></strong>`,
      backgroundColor: "#FD7575", // Defaults to `#fff`.
      textColor: "#ffffff", // Defaults to `#000`.
      isCloseable: true, // Defaults to `true`.
    },

    // Meta Image that will be used for your meta tag, in particular og:image and twitter:image
    // Relative to your site's "static" directory, cannot be SVGs.
    image: "mg/og-developer-portal.png",
    metadatas: [{ name: "twitter:card", content: "summary" }],

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
          to: "tools",
          label: "Tools",
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
              label: "How to Contribute",
              to: "docs/portal-contribute/",
            },
            {
              label: "Style Guide",
              to: "docs/portal-style-guide",
            },
          ],
        },
        {
          title: "Developer Community",
          items: [
            {
              label: "Cardano Forum",
              href: "https://forum.cardano.org/c/developers/29",
            },
            {
              label: "Discord",
              href: "https://discord.gg/kfATXEENPD",
            },
            {
              label: "Reddit",
              href: "https://www.reddit.com/r/CardanoDevelopers/",
            },
            {
              label: "Stack Exchange",
              href: "https://cardano.stackexchange.com",
            },
            {
              label: "Slack",
              href:
                "https://join.slack.com/t/iohkdevcommunity/shared_invite/zt-mdvb06fr-8Tv8pjl~iR0~lGrimqK_yg",
            },
            {
              label: "Telegram",
              href: "https://t.me/CardanoDevelopersOfficial",
            },
          ],
        },
        {
          title: "More about Cardano",
          items: [
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
              to: "https://cardanoupdates.com",
            },
            {
              label: "Ouroboros Protocol",
              to: "https://cardano.org/ouroboros/",
            },
            {
              label: "Why Cardano?",
              href: "https://why.cardano.org",
            },
          ],
        },
      ],

      // No copyright, this belongs to the Cardano Community
      // copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
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
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],
};
