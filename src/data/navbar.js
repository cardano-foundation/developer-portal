/**
 * Navbar items for the Cardano Developer Portal.
 *
 * Uses standard Docusaurus navbar item types — no custom components required.
 * `docSidebar` items automatically highlight when browsing that sidebar's content.
 *
 * @param {string} repository - GitHub repository URL
 */
function getNavbarItems(repository) {
  return [
    {
      type: "docSidebar",
      sidebarId: "buildSidebar",
      label: "Build",
      position: "left",
    },
    {
      type: "docSidebar",
      sidebarId: "networkSidebar",
      label: "Operate",
      position: "left",
    },
    {
      type: "docSidebar",
      sidebarId: "governanceSidebar",
      label: "Govern",
      position: "left",
    },
    {
      type: "docSidebar",
      sidebarId: "learnSidebar",
      label: "Learn",
      position: "left",
    },
    {
      to: "/tools/",
      label: "Tools",
      position: "left",
    },
    {
      to: "/blog/",
      label: "Blog",
      position: "left",
    },
    {
      type: "dropdown",
      label: "Community",
      position: "left",
      items: [
        { to: "/docs/community/cardano-developer-community/", label: "Developer Community" },
        { to: "/docs/community/funding/", label: "Grants & Funding" },
        { to: "/talent/", label: "Talent Pool" },
        { href: "https://cardanoupdates.com/", label: "Developer Activity ↗" },
        { href: "https://cips.cardano.org/", label: "CIPs ↗" },
        { href: "https://cardanofoundation.org/academy", label: "Cardano Academy ↗" },
      ],
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
