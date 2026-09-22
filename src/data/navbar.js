/**
 * Navbar mega menu items for the Cardano Developer Portal.
 * Extracted from docusaurus.config.js for maintainability.
 *
 * Each mega menu is defined ONCE: an optional featured tile plus link
 * columns. The flat `items` array that Docusaurus's mobile drawer consumes
 * is derived from that definition, so the desktop and mobile menus cannot
 * drift apart.
 *
 * Shapes:
 *   featured: {title, description, image, to|href, cta, placement}
 *     placement 'start' puts the tile before the columns, 'end' after.
 *   columns:  [{title, items: [{label, description?, to|href, icon?}]}]
 *     icon is a name from src/theme/NavbarItem/DropdownNavbarItem/icons.js.
 *
 * @param {string} repository - GitHub repository URL
 */

/** Flatten a mega menu definition into the mobile drawer's link list,
 *  keeping the featured tile in its desktop position. */
function toMobileItems({featured, columns}) {
  const items = [];
  const featuredItem = featured
    ? {...(featured.to ? {to: featured.to} : {href: featured.href}), label: featured.title}
    : null;
  if (featuredItem && featured.placement !== 'end') {
    items.push(featuredItem);
  }
  for (const column of columns) {
    for (const {to, href, label} of column.items) {
      items.push(href ? {href, label} : {to, label});
    }
  }
  if (featuredItem && featured.placement === 'end') {
    items.push(featuredItem);
  }
  return items;
}

function megaMenu({label, featured, columns}) {
  return {
    type: 'dropdown',
    label,
    position: 'left',
    items: toMobileItems({featured, columns}),
    mega: true,
    customProps: {featured, columns},
  };
}

function getNavbarItems(repository) {
  return [
    megaMenu({
      label: 'Developers',
      featured: {
        title: 'Start Here',
        description:
          'The 7-module path from zero to shipping, fundamentals through production.',
        image: '/img/home/rebrand/bento-start-here.webp',
        to: '/docs/developers/',
        cta: 'Start the Curriculum',
        placement: 'start',
      },
      columns: [
        {
          title: 'Build',
          items: [
            {to: '/tools/', label: 'Builder Tools', description: 'Curated tools, SDKs, and libraries', icon: 'gear'},
            {to: '/templates/', label: 'Templates', description: 'Runnable dApp starters you can scaffold in one command', icon: 'template'},
            {to: '/templates/contracts/', label: 'Contracts Library', description: 'Reference smart contracts by use case', icon: 'build'},
            {to: '/docs/developers/curriculum/start-building/ai-assisted-development/', label: 'Code with AI', description: 'Cardano Dev Skills, current Cardano context for your coding agent', icon: 'package'},
            {to: '/x402/', label: 'Agentic Commerce', description: 'Internet-native payments on Cardano with x402', icon: 'payments'},
          ],
        },
        {
          title: 'Guides',
          items: [
            {to: '/docs/developers/cardano-for-ethereum-developers/', label: 'Cardano for Ethereum Developers', description: 'Map your existing mental model to Cardano', icon: 'eth'},
            {to: '/docs/developers/exchange-integrations/', label: 'Exchange Integration', description: 'Custodial deposit and withdrawal integration', icon: 'exchange'},
          ],
        },
      ],
    }),
    megaMenu({
      label: 'Operators',
      columns: [
        {
          title: 'Run a Stake Pool',
          items: [
            {to: '/docs/operators/', label: 'Overview', description: 'What it takes to run a stake pool', icon: 'overview'},
            {to: '/docs/operators/basics/consensus-staking/', label: 'Handbook', description: 'Step by step from setup to governance', icon: 'package'},
            {to: '/docs/operators/operator-tools/guild-ops-suite/', label: 'Operator Tools', description: 'Guild Ops, Calidus keys, and Mithril', icon: 'gear'},
          ],
        },
      ],
    }),
    megaMenu({
      label: 'Ecosystem',
      featured: {
        title: 'Developer Office Hours',
        description: 'Weekly live Q&A with Cardano Foundation engineers.',
        image: '/img/home/rebrand/calendar-spiral.webp',
        href: 'https://www.addevent.com/calendar/TG807216',
        cta: 'Add to Calendar',
        placement: 'end',
      },
      columns: [
        {
          title: 'Community',
          items: [
            {to: '/docs/community/cardano-developer-community/', label: 'Community', description: 'Forums, chats, and weekly office hours', icon: 'people'},
            {to: '/talent/', label: 'Talent Pool', description: 'Hackathons, jobs, and grants for developers', icon: 'profile'},
            {to: '/docs/community/funding/', label: 'Grants & Funding', description: 'Get funding for your project', icon: 'payments'},
          ],
        },
        {
          title: 'Stay Current',
          items: [
            {to: '/blog/', label: 'Dev Blog', description: 'Latest developer updates', icon: 'list'},
            {href: 'https://cardanoupdates.com/', label: 'Developer Activity', description: 'Ecosystem-wide development progress', icon: 'chain'},
            {href: 'https://cips.cardano.org/', label: 'CIPs', description: 'Cardano Improvement Proposals', icon: 'eye'},
          ],
        },
      ],
    }),
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
      "aria-label": "GitHub repository",
    },
  ];
}

module.exports = getNavbarItems;
