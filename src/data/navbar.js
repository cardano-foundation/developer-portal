/**
 * Navbar mega menu items for the Cardano Developer Portal.
 * Extracted from docusaurus.config.js for maintainability.
 *
 * @param {string} repository - GitHub repository URL
 */
function getNavbarItems(repository) {
  return [
    {
      // Developers mega menu
      type: 'dropdown',
      label: 'Developers',
      position: 'left',
      items: [
        {to: "/docs/developers/", label: "Start Here"},
        {to: "/tools/", label: "Builder Tools"},
        {to: "/docs/developers/curriculum/start-building/ai-assisted-development", label: "Cardano Dev Skills"},
        {to: "/docs/developers/exchange-integrations", label: "Exchange Integration"},
        {to: "/docs/community/cardano-developer-community/", label: "Community"},
        {to: "/docs/community/funding/", label: "Grants & Funding"},
        {to: "/talent/", label: "Talent Pool"},
      ],
      mega: true,
      customProps: {
        columnCount: 2,
        columns: [
          {
            title: 'Learn & Build',
            icon: 'book-solid',
            items: [
              {to: '/docs/developers/', label: 'Start Here', description: 'The 7-module developer curriculum, zero to shipping', icon: 'book-solid'},
              {to: '/tools', label: 'Builder Tools', description: 'Curated tools, SDKs, and libraries', icon: 'wrench-solid'},
              {to: '/docs/developers/curriculum/start-building/ai-assisted-development', label: 'Cardano Dev Skills', description: 'Give your AI coding assistant current, authoritative Cardano context', icon: 'plug-solid'},
              {to: '/docs/developers/exchange-integrations', label: 'Exchange Integration', description: 'Custodial deposit and withdrawal integration for exchanges', icon: 'building-solid'},
            ],
          },
          {
            title: 'Get Involved',
            icon: 'people-group-solid',
            items: [
              {to: '/docs/community/cardano-developer-community', label: 'Community', description: 'Connect with other developers', icon: 'people-group-solid'},
              {to: '/docs/community/funding', label: 'Grants & Funding', description: 'Get funding for your project', icon: 'handshake-solid'},
              {to: '/talent', label: 'Talent Pool', description: 'Join the developer network', icon: 'code-solid'},
            ],
          },
        ],
      },
    },
    {
      // Operators mega menu
      type: 'dropdown',
      label: 'Operators',
      position: 'left',
      items: [
        {to: '/docs/operators/', label: 'Overview'},
        {to: '/docs/operators/basics/consensus-staking', label: 'Handbook'},
        {to: '/docs/operators/operator-tools/guild-ops-suite', label: 'Operator Tools'},
      ],
      mega: true,
      customProps: {
        columnCount: 1,
        columns: [
          {
            title: 'Run a Stake Pool',
            icon: 'book-solid',
            items: [
              {to: '/docs/operators/', label: 'Overview', description: 'What it takes to run a stake pool', icon: 'book-solid'},
              {to: '/docs/operators/basics/consensus-staking', label: 'Handbook', description: 'Step by step from setup to governance', icon: 'building-solid'},
              {to: '/docs/operators/operator-tools/guild-ops-suite', label: 'Operator Tools', description: 'Guild Ops, Calidus keys, and Mithril', icon: 'wrench-solid'},
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
        {href: "https://www.addevent.com/calendar/TG807216", label: "Developer Office Hours"},
        {href: "https://cardanoupdates.com/", label: "Developer Activity"},
        {href: "https://cardanofoundation.org/academy", label: "Academy"},
        {href: "https://cips.cardano.org/", label: "CIPs"},
        {href: "https://cardano.org/governance", label: "Governance"},
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
              {href: 'https://www.addevent.com/calendar/TG807216', label: 'Developer Office Hours', description: 'Weekly live Q&A with Cardano Foundation engineers', icon: 'people-group-solid'},
            ],
          },
          {
            title: 'External Resources',
            icon: 'link-solid',
            items: [
              {href: 'https://cardanoupdates.com/', label: 'Developer Activity', description: 'Track ecosystem-wide development progress', icon: 'chart-line-solid'},
              {href: 'https://cardanofoundation.org/academy', label: 'Cardano Academy', description: 'Learn about Cardano', icon: 'book-solid'},
              {href: 'https://cips.cardano.org/', label: 'CIPs', description: 'Cardano Improvement Proposals', icon: 'scroll-solid'},
              {href: 'https://cardano.org/governance', label: 'Governance', description: 'Delegate your vote, become a DRep, read the constitution', icon: 'users-solid'},
            ],
          },
        ],
      },
    },
    {
      href: "https://discord.gg/MmeqpAzKbp",
      position: "right",
      className: "header-discord-link",
      "aria-label": "Engineering and Development Discord",
    },
    {
      href: repository,
      position: "right",
      className: "header-github-link",
    },
  ];
}

module.exports = getNavbarItems;
