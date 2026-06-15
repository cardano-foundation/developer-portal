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
        {to: "/docs/community/cardano-developer-community/", label: "Community"},
        {to: "/docs/community/funding/", label: "Grants & Funding"},
        {to: "/talent/", label: "Talent Pool"},
        {to: "/blog/", label: "Dev Blog"},
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
            ],
          },
          {
            title: 'Get Involved',
            icon: 'people-group-solid',
            items: [
              {to: '/docs/community/cardano-developer-community', label: 'Community', description: 'Connect with other developers', icon: 'people-group-solid'},
              {to: '/docs/community/funding', label: 'Grants & Funding', description: 'Get funding for your project', icon: 'handshake-solid'},
              {to: '/talent', label: 'Talent Pool', description: 'Join the developer network', icon: 'code-solid'},
              {to: '/blog/', label: 'Dev Blog', description: 'Latest developer updates', icon: 'book-solid'},
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
        {to: '/docs/operators/', label: 'Overview'},
        {to: '/docs/operators/basics/hardware-requirements', label: 'Before You Start'},
        {to: '/docs/operators/relay-configuration/relay-node-configuration', label: 'Configure'},
        {to: '/docs/operators/block-producer/register-stake-pool', label: 'Register Your Pool'},
        {to: '/docs/operators/monitoring/monitoring-overview', label: 'Monitor'},
        {to: '/docs/operators/deployment-scenarios/hardening-server', label: 'Security & Hardening'},
        {to: '/docs/operators/governance/spo-governance', label: 'Governance'},
      ],
      mega: true,
      customProps: {
        columnCount: 2,
        columns: [
          {
            title: 'Getting Started',
            icon: 'book-solid',
            items: [
              {to: '/docs/operators/', label: 'Overview', description: 'Start operating a stake pool', icon: 'book-solid'},
              {to: '/docs/operators/basics/hardware-requirements', label: 'Before You Start', description: 'Requirements, networking, and key types', icon: 'microscope-solid'},
              {to: '/docs/developers/curriculum/production/node/installing-cardano-node', label: 'Installation', description: 'Install cardano-node and cardano-cli', icon: 'arrow-down-to-line-solid'},
              {to: '/docs/operators/relay-configuration/relay-node-configuration', label: 'Configure', description: 'Set up relay and block producer nodes', icon: 'plug-solid'},
            ],
          },
          {
            items: [
              {to: '/docs/operators/block-producer/register-stake-pool', label: 'Register Your Pool', description: 'Generate keys and submit your pool certificate', icon: 'building-solid'},
              {to: '/docs/operators/monitoring/monitoring-overview', label: 'Monitor', description: 'Track node health and block production', icon: 'chart-line-solid'},
              {to: '/docs/operators/deployment-scenarios/hardening-server', label: 'Security & Hardening', description: 'Harden your servers and secure your keys', icon: 'shield-solid'},
              {to: '/docs/operators/governance/spo-governance', label: 'Governance', description: 'Your role in on-chain governance', icon: 'users-solid'},
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
