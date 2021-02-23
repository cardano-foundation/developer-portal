module.exports = {
  title: 'Cardano Developer Portal',
  tagline: 'together, we can change the world for the better',
  url: 'https://staging-dev-portal.netlify.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'cardano-foundation', // GitHub org/user name.
  projectName: 'developer-portal',        // Repo name.
  themeConfig: {

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
      id: 'support_us', // Any value that will identify this message.
      content:
        'If you like the new portal, give it a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/cardano-foundation/developer-portal">GitHub</a>! ⭐️',
      backgroundColor: '#58595B', // Defaults to `#fff`.
      textColor: '#ffffff', // Defaults to `#000`.
      isCloseable: true, // Defaults to `true`.
    },
    

    // Meta Image that will be used for your meta tag, in particular og:image and twitter:image
    // Relative to your site's "static" directory, cannot be SVGs.
    image: 'mg/og-developer-portal.png',
    metadatas: [{name: 'twitter:card', content: 'summary'}],
    

    // Algolia Docsearch
    // Don't forget to apply here: https://docsearch.algolia.com/apply/
    algolia: {
      appId: '6QH8YVQXAE', 
      apiKey: '6033c09f3af6454c8c25efce0460b84a', // search-only API key, revoke this once the repo goes public
      indexName: 'developer-portal',

      // Optional: see doc section bellow
      contextualSearch: true,

      // Optional: Algolia search parameters
      searchParameters: {},

      //... other Algolia params
    },
    navbar: {

      // 
      // Navbar title and logo
      title: 'Developers', 
      logo: {
        alt: 'Cardano Developer Portal Logo',
        src: 'img/cardano-black.png',      // should be svg
        srcDark: 'img/cardano-white.png', // should be svg
      },

      //
      // Navbar items
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: 'Documentation',
          position: 'left',
        },
        {
          to: 'tools', 
          label: 'Tools', 
          position: 'left'
        },
        {
          to: 'showcase', 
          label: 'Showcase', 
          position: 'left'
        },
        {
          to: 'blog/', 
          label: 'Spotlight', 
          position: 'left'
        },
        {
          href: 'https://github.com/cardano-foundation/developer-portal',
          label: 'GitHub',
          position: 'right',
        },
        
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/',
            },
            {
              label: 'Contribute',
              to: 'docs/portal-contribute/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Cardano Forum',
              href: 'https://forum.cardano.org/c/developers/29',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/kfATXEENPD',
            },
            {
              label: 'Reddit',
              href: 'https://www.reddit.com/r/CardanoDevelopers/',
            },
            {
              label: 'Stack Exchange',
              href: 'https://area51.stackexchange.com/proposals/125174/cardano',
            },
            {
              label: 'Telegram',
              href: 'https://t.me/CardanoDevelopersOfficial',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Cardano Website',
              href: 'https://www.cardano.org',
            },
            {
              label: 'Developer Spotlight',
              to: 'blog',
            },
          ],
        },
      ],

      // No copyright, this belongs to the Cardano Community
      //copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
  },
  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
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
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/cardano-foundation/developer-portal/edit/main',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/cardano-foundation/developer-portal/edit/main',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
