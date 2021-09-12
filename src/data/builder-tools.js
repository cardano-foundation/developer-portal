/*
 * BUILDER TOOLS SECTION INFO
 *
 * Requirements for adding your builder tool:
 * - It is an actual builder tool that adds value to Cardano developers.
 * - It has a stable domain name (a random for example, Netlify/Vercel domain is not allowed)
 * - The GitHub account that adds the builder tool must not be new. 
 * - The GitHub account must have a history/or already be known in the Cardano community.
 *
 * Instructions:
 * - Add your tool in the json array below, in alphabetical order of title
 * - Add a local image preview. (decent screenshot or logo of your builder tool)
 * - The image must be added to the GitHub repository and use `require("image")`.
 *
 */

import React from "react";
import { sortBy, difference } from "../utils/jsUtils";

// List of available tags. The tag should be singular and the label in plural. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // PLEASE DO NOT USE THIS TAG: we choose the featured tools (process TBD)
  featured: {
    label: "Featured",
    description:
      "Our favorite Cardano builder tools that you must absolutely check-out.",
    icon: <>⭐️</>,
  },

  // API
  api: {
    label: "APIs",
    description: "Cardano APIs.",
    icon: null,
  },

  // For builder tools with a get started tag, a link to the get started page is required.
  getstarted: {
    label: "Get Started",
    description: "This builder tool has a get started page in the developer portal.",
    icon: null,
  },

  // Library
  library: {
    label: "Libraries",
    description:
      "Cardano libraries.",
    icon: null,
  },

   // Marlowe
   marlowe: {
    label: "Marlowe",
    description:
      "Marlowe",
    icon: null,
  },

  // Plutus
  plutus: {
    label: "Plutus",
    description:
      "Plutus",
    icon: null,
  },

  // Stake Pool Operator Tools
  operatortool: {
    label: "Operator Tools",
    description:
      "Stake pool operator tools.",
    icon: null,
  },

  // Oracle Tools
  oracle: {
    label: "Oracle Tools",
    description:
      "Oracle tools.",
    icon: null,
  },
};

// Add your builder tool to (THE END OF) this list.
// Please don't add the "featured"-tag yourself.
const Showcases = [
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./builder-tools/blockfrost.png"),
    website: "https://blockfrost.io",
    getstarted: "/docs/get-started/blockfrost",
    tags: ["featured", "getstarted", "api"],
  },
  {
    title: "Cardano Serialization Library",
    description:
      "Library for serialization & deserialization of data structures used in Cardano's Haskell implementation.",
    preview: require("./builder-tools/cardano-serialization-lib.png"),
    website: "https://github.com/Emurgo/cardano-serialization-lib",
    getstarted: "/docs/get-started/cardano-serialization-lib/overview",
    tags: ["featured", "getstarted", "library"],
  },
  {
    title: "cardanocli-js",
    description: "A library that wraps the cardano-cli in JavaScript.",
    preview: require("./builder-tools/cardanocli-js.png"),
    website: "https://github.com/Berry-Pool/cardanocli-js",
    getstarted: "/docs/get-started/cardanocli-js",
    tags: ["getstarted", "library"],
  },
  {
    title: "Dandelion APIs",
    description:
      "Kubernetes-based project to easily deploy Cardano APIs and a free, hosted community service to access all of them instantly.",
    preview: require("./builder-tools/dandelion-apis.png"),
    website: "https://gimbalabs.com/dandelionapis",
    getstarted: "/docs/get-started/dandelion-apis",
    tags: ["getstarted", "api"],
  },
  {
    title: "Ogmios",
    description: "Ogmios offers a JSON-WSP interface through WebSockets.",
    preview: require("./builder-tools/ogmios.png"),
    website: "https://ogmios.dev",
    getstarted: "/docs/get-started/ogmios",
    tags: ["featured", "getstarted", "library"],
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./builder-tools/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    getstarted: null,
    tags: ["library"],
  },
  {
    title: "cardano-addresses TypeScript binding",
    description: "This is a Typescript/Javascript version of the cardano-addresses API. It includes a web demo.",
    preview: require("./builder-tools/cardano-addresses-typescript-binding.png"),
    website: "https://www.npmjs.com/package/cardano-addresses",
    getstarted: null,
    tags: ["api"],
  },
  {
    title: "Heidrun",
    description:
      "An automation platform for Cardano to trigger various action based on detecting payment to a wallet address.",
    preview: require("./builder-tools/heidrun.png"),
    website: "https://github.com/adosia/Heidrun",
    getstarted: null,
    tags: ["api"],
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./builder-tools/cardanosharp.png"),
    website: "https://github.com/CardanoSharp/cardanosharp-wallet",
    getstarted: "/docs/get-started/cardanosharp-wallet",
    tags: ["getstarted", "library"],
  },
  {
    title: "Cardano Metadata Oracle",
    description: "Oracle submitting information using Cardano Metadata",
    preview: require("./builder-tools/cardano-metadata-oracle.png"),
    website: "https://github.com/fivebinaries/cardano-metadata-oracle",
    getstarted: null,
    tags: ["oracle"],
  },
  {
    title: "Guild Operators Suite",
    description: "A collection of tools (CNTools, gLiveView, topologyUpdater and more) to simplify typical operations to help community simplify wallet keys, pool management and interact with blockchain.",
    preview: require("./builder-tools/guild-operators.png"),
    website: "https://cardano-community.github.io/guild-operators/",
    getstarted: "/docs/operate-a-stake-pool/guild-ops-suite",
    tags: ["featured", "getstarted", "operatortool"],
  },
  {
    title: "libada-go",
    description: "A Golang library for Cardano network, it is used and maintained by Bitrue.",
    preview: require("./builder-tools/libada-go.png"),
    website: "https://github.com/Bitrue-exchange/libada-go",
    getstarted: null,
    tags: ["library"],
  },
  {
    title: "Python Module",
    description: "The module provides tools for developers to accept and send transactions, manage staking and much more. It uses cardano-wallet as backend but is future-compatible with other solutions.",
    preview: require("./builder-tools/cardano-python.png"),
    website: "https://github.com/emesik/cardano-python",
    getstarted: null,
    tags: ["library", "api"],
  },
  {
    title: "Plutus Playground",
    description: "The Plutus Playground is a lightweight, web-based environment for exploratory Plutus development.",
    preview: require("./builder-tools/plutus-playground.png"),
    website: "https://playground.plutus.iohkdev.io",
    getstarted: "/docs/smart-contracts/plutus#plutus-playground",
    tags: ["featured", "getstarted", "plutus"],
  },
  {
    title: "Marlowe Playground",
    description: "In the browser-based Marlowe Playground you can write Marlowe contracts, in a variety of different ways.",
    preview: require("./builder-tools/marlowe-playground.png"),
    website: "https://alpha.marlowe.iohkdev.io/#/",
    getstarted: "/docs/smart-contracts/marlowe#marlowe-playground",
    tags: ["featured", "getstarted", "marlowe"],
  },
];


export const TagList = Object.keys(Tags);
function sortShowcases() {
  let result = Showcases;
  // Sort by site name
  result = sortBy(result, (showcase) => showcase.title.toLowerCase());
  // Sort by featured tag, featured first
  result = sortBy(result, (showcase) => !showcase.tags.includes("featured"));
  return result;
}

export const SortedShowcases = sortShowcases();

// Fail-fast on common errors
function ensureShowcaseValid(showcase) {
  function checkFields() {
    const keys = Object.keys(showcase);
    const validKeys = [
      "title",
      "description",
      "preview",
      "website",
      "getstarted",
      "tags",
    ];
    const unknownKeys = difference(keys, validKeys);
    if (unknownKeys.length > 0) {
      throw new Error(
        `Site contains unknown attribute names=[${unknownKeys.join(",")}]`
      );
    }
  }

  function checkTitle() {
    if (!showcase.title) {
      throw new Error("Site title is missing");
    }
  }

  function checkDescription() {
    if (!showcase.description) {
      throw new Error("Site description is missing");
    }
  }

  function checkWebsite() {
    if (!showcase.website) {
      throw new Error("Site website is missing");
    }
    const isHttpUrl =
      showcase.website.startsWith("http://") ||
      showcase.website.startsWith("https://");
    if (!isHttpUrl) {
      throw new Error(
        `Site website does not look like a valid url: ${showcase.website}`
      );
    }
  }

  function checkPreview() {
    if (
      !showcase.preview ||
      (showcase.preview instanceof String &&
        (showcase.preview.startsWith("http") ||
          showcase.preview.startsWith("//")))
    ) {
      throw new Error(
        `Site has bad image preview=[${showcase.preview}].\nThe image should be hosted on the Developer Portal GitHub, and not use remote HTTP or HTTPS URLs`
      );
    }
  }

  function checkTags() {
    if (
      !showcase.tags ||
      !(showcase.tags instanceof Array) ||
      showcase.tags.includes("")
    ) {
      throw new Error(`Bad showcase tags=[${JSON.stringify(showcase.tags)}]`);
    }
    const unknownTags = difference(showcase.tags, TagList);
    if (unknownTags.length > 0) {
      throw new Error(
        `Unknown tags=[${unknownTags.join(
          ","
        )}\nThe available tags are ${TagList.join(",")}`
      );
    }
  }

  function checkGetStarted() {
    if (typeof showcase.getstarted === "undefined") {
      throw new Error(
        "The getstarted attribute is required.\nIf your builder tool has no get started page, please make it explicit with 'getstarted: null'"
      );
    } else {
      const hasGetStartedTag = showcase.tags.includes("getstarted");
      if (showcase.getstarted === null && hasGetStartedTag) {
        throw new Error(
          "You can't add the getstarted tag to a site that does not have a link to a get started page."
        );
      } else if (showcase.getstarted && !hasGetStartedTag) {
        throw new Error(
          "For builder tools with started sites, please add the 'getstarted' tag."
        );
      }
    }
  }

  function checkOperatorTool() {

    const hasGetStartedTag = showcase.tags.includes("getstarted");
    const isOperatorTool = showcase.tags.includes("operatortool");

    if ((hasGetStartedTag && isOperatorTool) && !(typeof showcase.getstarted === "string" &&
        (showcase.getstarted.startsWith("/docs/operate-a-stake-pool/")))
    ) {
      throw new Error(
        // Be more specific as soon as we have an operator tool with a get started page
        "Get started pages for stake pool operator tools, should go into the operate-a-stake-pool-section."
      );
    }
  }

  try {
    checkFields();
    checkTitle();
    checkDescription();
    checkWebsite();
    checkPreview();
    checkTags();
    checkGetStarted();
    checkOperatorTool();
  } catch (e) {
    throw new Error(
      `Showcase site with title=${showcase.title} contains errors:\n${e.message}`
    );
  }
}

Showcases.forEach(ensureShowcaseValid);
