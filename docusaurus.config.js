// GitHub Settings
const repository = "https://github.com/cardano-foundation/developer-portal";
const branch = "staging";

// enable or disable the announcement header bar (see 'announcementBar' section below)
const isAnnouncementActive = true;

// There are various equivalent ways to declare the Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// One Light palette
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

// One Dark palette
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

const getNavbarItems = require('./src/data/navbar');
const redirects = require('./src/data/redirects');

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
        // Collapse other categories when expanding one, so only one stays open at a time
        autoCollapseCategories: true,
      }
    },

    // Additional Language Syntax Highlighting
    prism: {
      theme: prismLightTheme,
      darkTheme: prismDarkTheme,
      additionalLanguages: ['csharp', 'java', 'php', 'bash', 'json', 'typescript', 'yaml', 'diff', 'haskell'],
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
    metadata: [],

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

      items: getNavbarItems(repository),
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
      { redirects },
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
