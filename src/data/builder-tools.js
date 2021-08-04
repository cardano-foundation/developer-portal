/*
 * ADD YOUR TOOL TO THE CARDANO DEVELOPER PORTAL:
 *
 * Requirements for adding your builder tool:
 * - It is an actual builder tool that adds value to Cardano developers.
 * - It has a stable domain name (a random for example, Netlify/Vercel domain is not allowed)
 * - The GitHub account that adds the project must not be new. 
 * - The GitHub account must have a history/or already be known in the Cardano community.
 *
 * Instructions:
 * - Add your tool in the json array below, in alphabetical order of title
 * - Add a local image preview (decent screenshot or logo of your tool)
 *
 * The image must be added to the GitHub repository, and use `require("image")`
 */

const tools = [
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./builder-tools/blockfrost.png"),
    website: "https://blockfrost.io",
    gettingstarted: "/docs/get-started/blockfrost",
  },
  {
    title: "cardano-addresses TypeScript binding",
    description: "This is a Typescript/Javascript version of the cardano-addresses API. It includes a web demo.",
    preview: require("./builder-tools/cardano-addresses-typescript-binding.png"),
    website: "https://www.npmjs.com/package/cardano-addresses",
  },
  {
    title: "cardanocli-js",
    description: "A library that wraps the cardano-cli in JavaScript.",
    preview: require("./builder-tools/cardanocli-js.png"),
    website: "https://github.com/Berry-Pool/cardanocli-js",
    gettingstarted: "/docs/get-started/cardanocli-js",
  },
  {
    title: "Cardano Metadata Oracle",
    description: "Oracle submitting information using Cardano Metadata",
    preview: require("./builder-tools/cardano-metadata-oracle.png"),
    website: "https://github.com/fivebinaries/cardano-metadata-oracle",
  },
  {
    title: "Cardano Serialization Library",
    description:
      "Library for serialization & deserialization of data structures used in Cardano's Haskell implementation.",
    preview: require("./builder-tools/cardano-serialization-lib.png"),
    website: "https://github.com/Emurgo/cardano-serialization-lib",
    gettingstarted: "/docs/get-started/cardano-serialization-lib/overview",
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./builder-tools/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    gettingstarted: null,
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./builder-tools/cardanosharp.png"),
    website: "https://github.com/CardanoSharp/cardanosharp-wallet",
    gettingstarted: "/docs/get-started/cardanosharp-wallet",
  },
  {
    title: "Dandelion APIs",
    description:
      "Kubernetes-based project to easily deploy Cardano APIs and a free, hosted community service to access all of them instantly.",
    preview: require("./builder-tools/dandelion-apis.png"),
    website: "https://gimbalabs.com/dandelionapis",
    gettingstarted: "/docs/get-started/dandelion-apis",
  },
  {
    title: "Heidrun",
    description:
      "An automation platform for Cardano to trigger various action based on detecting payment to a wallet address.",
    preview: require("./builder-tools/heidrun.png"),
    website: "https://github.com/adosia/Heidrun",
    gettingstarted: null,
  },
  {
    title: "cardano-wallet-js",
    description: "A javascript/typescript SDK for Cardano Wallet with a extra functionalities. You can use it as a client for the official cardano-wallet and also to create Native Tokens and NFTs.",
    preview: require("./builder-tools/cardano-wallet-js.png"),
    website: "https://github.com/tango-crypto/cardano-wallet-js",
    gettingstarted: "/docs/get-started/cardano-wallet-js",
  },
  /*{
    title: "Marlowe Playground",
    description:
      "In the browser-based Marlowe Playground you can write Marlowe contracts, in a variety of different ways.",
    preview: require("./builder-tools/marlowe-playground.png"),
    website: "https://alpha.marlowe.iohkdev.io/#/",
    gettingstarted: null,
  },*/
  {
    title: "Ogmios",
    description: "Ogmios offers a JSON-WSP interface through WebSockets.",
    preview: require("./builder-tools/ogmios.png"),
    website: "https://ogmios.dev",
    gettingstarted: "/docs/get-started/ogmios",
  },
  /*{
    title: "Plutus Playground",
    description:
      "The Plutus Playground is a lightweight, web-based environment for exploratory Plutus development.",
    preview: require("./builder-tools/plutus-playground.png"),
    website: "https://playground.plutus.iohkdev.io",
    gettingstarted: null,
  },
  */
];

tools.forEach((tool) => {
  if (
    !tool.preview ||
    (tool.preview instanceof String &&
      (tool.preview.startsWith("http") || tool.preview.startsWith("//")))
  ) {
    throw new Error(
      `Bad tool image preview = ${tool.preview}. The image should be hosted on developer portal site, and not use remote HTTP or HTTPS URLs`
    );
  }
});

export default tools;
