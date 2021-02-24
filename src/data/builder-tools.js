/*
 * ADD YOUR TOOL TO THE CARDANO DEVELOPER PORTAL:
 *
 * Requirements for adding your tool:
 * - It is a real tool that adds value to Cardano developers
 * - It has a stable domain name (a random Netlify/Vercel domain is not allowed)
 * - The code is publicly available (not decided yet if this is a requirement)
 *
 * Instructions:
 * - Add your tool in the json array below, in alphabetical order of title
 * - Add a local image preview (decent screenshot of your tool)
 *
 * The image must be added to the GitHub repository, and use `require("image")`
 *
 * Example PR: FIXME: provide example PR in the future
 *
 * If you edit this file through the Github interface, you can:
 * - Submit first your builder-tools.js edit PR
 * - This will create a branch on your Docusaurus fork (usually "patch-1")
 * - Go to https://github.com/<username>/developer-portal/tree/<branch>/src/data/builder-tools
 * - Drag-and-drop an image here to add it to your existing PR
 *
 */

const tools = [
  {
    title: 'Blockfrost',
    description: 'Instant and scaleable API to the Cardano blockchain.',
    preview: require('./builder-tools/blockfrost.png'),
    website: 'https://blockfrost.io',
    // offers no source
  },
  {
    title: 'Cardano Serialization Library',
    description: 'Library for serialization & deserialization of data structures used in Cardano\'s Haskell implementation.',
    preview: require('./builder-tools/cardano-serialization-lib.png'),
    website: 'https://github.com/Emurgo/cardano-serialization-lib',
    source: 'https://github.com/Emurgo/cardano-serialization-lib', 
  },
  {
    title: 'Dandelion APIs',
    description: 'Dandelion provides various endpoints to explore, sign and submit Cardano transactions.',
    preview: require('./builder-tools/dandelion-apis.png'),
    website: 'https://gimbalabs.com/dandelionapis',
    // offers no source
  },
  {
    title: 'Marlowe Playground',
    description: 'In the browser-based Marlowe Playground you can write Marlowe contracts, in a variety of different ways.',
    preview: require('./builder-tools/plutus-playground.png'),
    website: 'https://alpha.marlowe.iohkdev.io/#/',
    source: 'https://github.com/input-output-hk/plutus', 
  },
  {
    title: 'Ogmios',
    description: 'Ogmios offers a JSON-WSP interface through WebSockets.',
    preview: require('./builder-tools/ogmios.png'),
    website: 'https://ktorz.github.io/cardano-ogmios/',
    source: 'https://github.com/KtorZ/cardano-ogmios',
  }, 
  {
    title: 'Plutus Playground',
    description: 'The Plutus Playground is a lightweight, web-based environment for exploratory Plutus development.',
    preview: require('./builder-tools/plutus-playground.png'),
    website: 'https://playground.plutus.iohkdev.io',
    source: 'https://github.com/input-output-hk/plutus', 
  },
];

tools.forEach((tool) => {
  if (
    !tool.preview ||
    (tool.preview instanceof String &&
      (tool.preview.startsWith('http') || tool.preview.startsWith('//')))
  ) {
    throw new Error(
      `Bad tool image preview = ${tool.preview}. The image should be hosted on developer portal site, and not use remote HTTP or HTTPS URLs`,
    );
  }
});

export default tools;