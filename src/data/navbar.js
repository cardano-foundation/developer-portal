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
        {to: "/docs/get-started/", label: "Getting Started"},
        {to: "/docs/learn/core-concepts/", label: "Core Concepts"},
        {to: "/docs/get-started/client-sdks/overview", label: "Client SDKs"},
        {to: "/docs/build/smart-contracts/overview", label: "Smart Contracts"},
        {to: "/docs/build/integrate/overview", label: "Integration"},
        {to: "/tools/", label: "Builder Tools"},
        {to: "/docs/community/cardano-developer-community/", label: "Community"},
        {to: "/docs/community/funding/", label: "Grants"},
        {to: "/talent/", label: "Talent Pool"},
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
              {to: '/docs/get-started/client-sdks/overview', label: 'Client SDKs', description: 'Libraries for TypeScript, Python, Java, Rust, and more', icon: 'code-solid'},
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
              {to: '/talent', label: 'Talent Pool', description: 'Join the developer network', icon: 'code-solid'},
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
        {to: '/docs/operate-a-stake-pool/', label: 'Overview'},
        {to: '/docs/operate-a-stake-pool/basics/hardware-requirements', label: 'Before You Start'},
        {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Configure'},
        {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Register Your Pool'},
        {to: '/docs/operate-a-stake-pool/monitoring/monitoring-overview', label: 'Monitor'},
        {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security & Hardening'},
        {to: '/docs/operate-a-stake-pool/governance/spo-governance', label: 'Governance'},
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
              {to: '/docs/operate-a-stake-pool/basics/hardware-requirements', label: 'Before You Start', description: 'Requirements, networking, and key types', icon: 'microscope-solid'},
              {to: '/docs/get-started/infrastructure/node/installing-cardano-node', label: 'Installation', description: 'Install cardano-node and cardano-cli', icon: 'arrow-down-to-line-solid'},
              {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Configure', description: 'Set up relay and block producer nodes', icon: 'plug-solid'},
            ],
          },
          {
            items: [
              {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Register Your Pool', description: 'Generate keys and submit your pool certificate', icon: 'building-solid'},
              {to: '/docs/operate-a-stake-pool/monitoring/monitoring-overview', label: 'Monitor', description: 'Track node health and block production', icon: 'chart-line-solid'},
              {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security & Hardening', description: 'Harden your servers and secure your keys', icon: 'shield-solid'},
              {to: '/docs/operate-a-stake-pool/governance/spo-governance', label: 'Governance', description: 'Your role in on-chain governance', icon: 'users-solid'},
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
