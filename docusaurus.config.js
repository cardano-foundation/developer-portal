// GitHub Settings
const repository = "https://github.com/cardano-foundation/developer-portal";
const branch = "staging";

// enable or disable the announcement header bar (see 'announcementBar' section below)
const isAnnouncementActive = true;

// There are various equivalent ways to declare the Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// 2026 brand code themes. Token shades are tuned for AA contrast against
// their code background; interface colors stay in src/css/custom.css.
// Light: warm paper panel, slightly deeper than the cream page, with ink
// text and brand-blue keywords.
const prismLightTheme = {
  plain: {
    color: '#111425',
    backgroundColor: '#F6F0E6',
  },
  styles: [
    { types: ['comment', 'prolog', 'cdata'], style: { color: '#5F6B85', fontStyle: 'italic' } },
    { types: ['keyword', 'operator'], style: { color: '#0033AD' } },
    { types: ['string', 'char', 'regex', 'attr-value'], style: { color: '#2E7D32' } },
    { types: ['number'], style: { color: '#8A5D00' } },
    { types: ['boolean', 'constant'], style: { color: '#8A5D00' } },
    { types: ['class-name'], style: { color: '#8F6100' } },
    { types: ['function'], style: { color: '#6D5FA8' } },
    { types: ['tag', 'deleted'], style: { color: '#B3362B' } },
    { types: ['attr-name'], style: { color: '#8A5D00' } },
    { types: ['namespace'], style: { color: '#111425' } },
    { types: ['punctuation'], style: { color: '#3F4762' } },
    { types: ['inserted'], style: { color: '#2E7D32' } },
    { types: ['builtin'], style: { color: '#6D5FA8' } },
  ],
};

// Dark: code blocks join the navy chrome (navbar, footer, cards), with
// warm off-white text and the periwinkle/amber/lavender accent set.
const prismDarkTheme = {
  plain: {
    color: '#E8E4DC',
    backgroundColor: '#000629',
  },
  styles: [
    { types: ['comment', 'prolog', 'cdata'], style: { color: 'rgba(232, 228, 220, 0.55)', fontStyle: 'italic' } },
    { types: ['keyword', 'operator'], style: { color: '#7E97D7' } },
    { types: ['string', 'char', 'regex', 'attr-value'], style: { color: '#86C994' } },
    { types: ['number'], style: { color: '#FFB122' } },
    { types: ['boolean', 'constant'], style: { color: '#FFB122' } },
    { types: ['class-name'], style: { color: '#FFCF87' } },
    { types: ['function'], style: { color: '#C7C2E6' } },
    { types: ['tag', 'deleted'], style: { color: '#E0776F' } },
    { types: ['attr-name'], style: { color: '#FFB122' } },
    { types: ['namespace'], style: { color: '#E8E4DC' } },
    { types: ['punctuation'], style: { color: 'rgba(232, 228, 220, 0.7)' } },
    { types: ['inserted'], style: { color: '#86C994' } },
    { types: ['builtin'], style: { color: '#C7C2E6' } },
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
  trailingSlash: true,
  onBrokenLinks: "throw",
  onBrokenAnchors: "warn",
  favicon: "img/favicon.ico",
  organizationName: "cardano-foundation",
  projectName: "developer-portal",
  customFields: {
    repository: repository,
    branch: branch,
  },
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },
  themes: ['@docusaurus/theme-mermaid'],
  themeConfig: {
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
    // backgroundColor: use amber #FFB122 for warnings and brand blue #0033AD for announcements (2026 brand)
    announcementBar: isAnnouncementActive ? {
      id: "announcement_index11", // Any value that will identify this message + increment the number every time to be unique
      content:
        `<strong>Join the Cardano developer talent pool and stay in the loop on upcoming hackathons. <a href="/talent/">Sign up here!</a></strong>`,
      backgroundColor: "#0033AD", // 2026 brand blue (bright #0023EB is decorative-only)
      textColor: "#FFFFFF", // White on brand blue; an amber warning bar needs navy #000629 text
      isCloseable: true, // Use true
    } : undefined,

    // Site-wide og:image / twitter:image: the landing card that scripts/generate-og.js
    // writes on every `yarn start` / `yarn build` (gitignored). Docs, blog posts and
    // the section pages set their own card; everything else (landing page, blog
    // tags and archive, 404) shares this one. Relative to static/, cannot be an SVG.
    image: "img/og/pages/home.jpg",
    metadata: [
      { name: "keywords", content: "Cardano, blockchain, smart contracts, dApp, native tokens, Plutus, Aiken, developer tools, developer documentation, stake pool, Web3" },
      { name: "algolia-site-verification", content: "9D24BBA9B6EA9390" },
    ],

    // Algolia Search
    algolia: {
      appId: "SM73IGPCDU",
      apiKey: "7e5c27bffb971566ac4aa7d23cb8faaf",
      indexName: "developer-portal",
      contextualSearch: true,
    },

    // Navbar title, logo and items
    navbar: {
      hideOnScroll: false,
      title: "",
      logo: {
        alt: "Cardano Logo",
        // The navbar follows the theme, so each bar gets its own lockup:
        // black on the cream bar, white on the navy one.
        src: "img/brand/cardano-horizontal-black.svg",
        srcDark: "img/brand/cardano-horizontal-white.svg",
      },

      items: getNavbarItems(repository),
    },
    // The footer is fully custom: content in src/data/footer.js, rendered
    // by src/theme/Footer. No themeConfig.footer block is needed.
  },
  plugins: [
    "./plugins/tools-routes",
    "./plugins/templates-routes",
    [
      '@docusaurus/plugin-client-redirects',
      { redirects },
    ],
    [
      'docusaurus-plugin-llms',
      {
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        generateMarkdownFiles: true,
        docsDir: 'docs',
        includeBlog: false,
        excludeImports: true,
        removeDuplicateHeadings: true,
        ignoreFiles: [
          'portal-archived-changelog.md',
        ],
        includeOrder: [
          'developers/**',
          'operators/**',
          'community/**',
          'contribute/**',
        ],
        includeUnmatchedLast: true,
        title: 'Cardano Developer Portal',
        description: 'Documentation for building on Cardano: getting started, core concepts, governance, stake pool operations, and community contribution.',
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
