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
        {to: "tools", label: "Builder Tools"},
        {to: "docs/community/cardano-developer-community", label: "Community"},
        {to: "docs/community/funding", label: "Grants"},
        {to: "/hackathons", label: "Hackathons"},
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
              {to: '/hackathons', label: 'Hackathons', description: 'Compete and build projects', icon: 'code-solid'},
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
      // Validators mega menu
      type: 'dropdown',
      label: 'Validators',
      position: 'left',
      items: [
        {to: '/docs/operate-a-stake-pool/', label: 'Getting Started'},
        {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Relay Configuration'},
        {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Block Producer Setup'},
        {to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial', label: 'Monitoring'},
        {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security'},
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
              {to: '/docs/operate-a-stake-pool/basics/hardware-requirements', label: 'Hardware Requirements', description: 'What you need to run a pool', icon: 'microscope-solid'},
              {to: '/docs/operate-a-stake-pool/basics/stake-pool-networking', label: 'Stake Pool Networking', description: 'Network setup and topology', icon: 'share-nodes-solid'},
              {to: '/docs/operate-a-stake-pool/basics/cardano-key-pairs', label: 'Key Pairs', description: 'Understanding Cardano keys', icon: 'shield-solid'},
            ],
          },
          {
            title: 'Operations',
            icon: 'wrench-solid',
            items: [
              {to: '/docs/operate-a-stake-pool/relay-configuration/relay-node-configuration', label: 'Relay Configuration', description: 'Configure your relay nodes', icon: 'plug-solid'},
              {to: '/docs/operate-a-stake-pool/block-producer/register-stake-pool', label: 'Block Producer Setup', description: 'Register your stake pool', icon: 'building-solid'},
              {to: '/docs/operate-a-stake-pool/relay-configuration/grafana-dashboard-tutorial', label: 'Monitoring', description: 'Monitor with Grafana', icon: 'chart-line-solid'},
              {to: '/docs/operate-a-stake-pool/deployment-scenarios/hardening-server', label: 'Security', description: 'Harden your server', icon: 'shield-solid'},
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
      href: "https://discord.gg/2nPUa5d7DE",
      position: "right",
      className: "header-discord-link",
      "aria-label": "Discord",
    },
    {
      href: repository,
      position: "right",
      className: "header-github-link",
    },
  ];
}

module.exports = getNavbarItems;
