/**
 * Footer content for the Cardano Developer Portal.
 *
 * Single source: the component in src/theme/Footer renders exactly this.
 * Items with `to` are internal routes (root-relative, trailing slash);
 * items with `href` are external and render with a new-tab affordance.
 */

const footer = {
  tagline: 'Everything you need to build on Cardano.',
  socials: [
    {
      icon: 'github',
      label: 'GitHub repository',
      href: 'https://github.com/cardano-foundation/developer-portal',
    },
    {
      icon: 'discord',
      label: 'Engineering and Development Discord',
      href: 'https://discord.gg/MmeqpAzKbp',
    },
  ],
  columns: [
    {
      title: 'Build',
      items: [
        {label: 'Get Started', to: '/docs/developers/'},
        {label: 'Builder Tools', to: '/tools/'},
        {label: 'Templates', to: '/templates/'},
        {label: 'Contracts Library', to: '/templates/contracts/'},
      ],
    },
    {
      title: 'Community',
      items: [
        {label: 'Developer Community', to: '/docs/community/cardano-developer-community/'},
        {label: 'Talent Pool', to: '/talent/'},
        {label: 'Stack Exchange', href: 'https://cardano.stackexchange.com'},
        {label: 'Cardano Forum', href: 'https://forum.cardano.org/c/developers/29'},
        {label: 'Ecosystem Survey', href: 'https://cardano-foundation.github.io/state-of-the-developer-ecosystem'},
      ],
    },
    {
      title: 'Portal',
      items: [
        {label: 'How to Contribute', to: '/docs/contribute/portal-contribute/'},
        {label: 'Style Guide', to: '/docs/contribute/portal-style-guide/'},
        {label: 'Raise an Issue', href: 'https://github.com/cardano-foundation/developer-portal/issues'},
        {label: 'Dev Blog', to: '/blog/'},
        {label: 'Developer Activity', href: 'https://cardanoupdates.com'},
        {label: 'Cardano Foundation', href: 'https://www.cardanofoundation.org'},
      ],
    },
  ],
  legal: [
    {label: 'Terms', href: 'https://cardanofoundation.org/en/terms-and-conditions'},
    {label: 'Privacy', href: 'https://cardanofoundation.org/en/privacy'},
  ],
};

export default footer;
