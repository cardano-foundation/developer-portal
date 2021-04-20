/*
 * ADD YOUR SITE TO THE CARDANO DEVELOPER PORTAL SHOWCASE:
 *
 * Requirements for adding your site to our showcase:
 * - It must be built on Cardano and have a real usecase. Preferably but not necessarily dapps.
 *   Please exclude pooltools and explorers for the time being.
 * - It has a stable domain name (a random Netlify/Vercel domain is not allowed)
 * - The code is publicly available (not decided yet if this is a requirement)
 *
 * Instructions:
 * - Add your site in the json array below, in alphabetical order of title
 * - Add a local image preview (decent screenshot of your site)
 *
 * The image must be added to the GitHub repository, and use `require("image")`
 *
 * Example PR: FIXME: provide example PR in the future
 *
 * If you edit this file through the Github interface, you can:
 * - Submit first your showcase.js edit PR
 * - This will create a branch on your Docusaurus fork (usually "patch-1")
 * - Go to https://github.com/<username>/developer-portal/tree/<branch>/website/src/data/showcase
 * - Drag-and-drop an image here to add it to your existing PR
 *
 */

const showcases = [
  {
    title: "Cardano Kidz",
    description:
      "Cardano non fungible token (NFT) design cards in lovely design.",
    preview: require("./showcase/cardanokidz.png"),
    website: "https://www.cardanokidz.com",
    // offers no source
  },
  {
    title: "Cardano Wall",
    description:
      "Demonstrates serveral use cases for transaction metdata. You can sign messages and create proof of existence for files.",
    preview: require("./showcase/cardanowall.png"),
    website: "https://cardanowall.com/en/explore/",
    // offers no source
  },
  {
    title: "Meta Data Connector",
    description:
      "Cardano Foundation’s supply chain traceability and anti-counterfeit solution together with Scantrust.",
    preview: require("./showcase/baiawine.png"),
    website: "https://www.baiawine.com",
    // source: 'https://github.com/cardano-foundation/FIXME', // will offer source
  },
  {
    title: "NFT Maker",
    description:
      "Create your own NFT by uploading an image and paying some ada.",
    preview: require("./showcase/nft-maker.png"),
    website: "https://www.nft-maker.io",
    // offers no source
  },
  {
    title: "SpaceBudz",
    description:
      "The first full on-chain NFT platform on Cardano consisting of 10,000 unique little astronauts.",
    preview: require("./showcase/spacebudz.png"),
    website: "https://spacebudz.io",
    // offers no source
  },
];

showcases.forEach((showcase) => {
  if (
    !showcase.preview ||
    (showcase.preview instanceof String &&
      (showcase.preview.startsWith("http") ||
        showcase.preview.startsWith("//")))
  ) {
    throw new Error(
      `Bad showcase site image preview = ${showcase.preview}. The image should be hosted on developer portal site, and not use remote HTTP or HTTPS URLs`
    );
  }
});

export default showcases;
