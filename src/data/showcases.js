/*
 * ADD YOUR PROJECT TO THE CARDANO DEVELOPER PORTAL SHOWCASE:
 *
 * Requirements for adding your project to our showcase:
 * - It must be built on Cardano and have a real usecase. 
 * - It has a stable domain name (a random Netlify/Vercel domain is not allowed)
 *
 * Instructions:
 * - Add your project in the json array below
 * - Add a local image preview (decent screenshot of your project)
 *
 * The image must be added to the GitHub repository, and use `require("image")`
 */

import React from "react";
import { sortBy, difference } from "../utils/jsUtils";

// List of available tags. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // PLEASE DO NOT USE THIS TAG: we choose the features projects (process TBD)
  featured: {
    label: "Featured",
    description:
      "Our favorite Cardano projects that you must absolutely check-out.",
    icon: <>⭐️</>,
  },

  // Cardano Block Explorers
  explorer: {
    label: "Block Explorers",
    description: "Block explorers are browsers for the Cardano blockchain. They can display the contents of individual blocks and transactions.",
    icon: null,
  },

  // For open-source sites, a link to the source code is required
  opensource: {
    label: "Open-Source",
    description: "Open-Source sites can be useful for inspiration.",
    icon: null,
  },

  // Native tokens related projects, maybe later we distinguish between NFT
  tokens: {
    label: "Native Tokens",
    description: "Native Tokens",
    icon: null,
  },
};

// Add your site to this list
const Showcases = [
  {
    title: "Cardano Kidz",
    description:
      "Cardano non fungible token (NFT) design cards in lovely design.",
    preview: require("./showcase/cardanokidz.png"),
    website: "https://www.cardanokidz.com",
    source: null,
    tags: ["tokens"],
  },
  {
    title: "Cardano Wall",
    description:
      "Demonstrates serveral use cases for transaction metdata. You can sign messages and create proof of existence for files.",
    preview: require("./showcase/cardanowall.png"),
    website: "https://cardanowall.com/en/explore/",
    source: null,
    tags: ["featured"],
  },
  {
    title: "Meta Data Connector",
    description:
      "Cardano Foundation’s supply chain traceability and anti-counterfeit solution together with Scantrust.",
    preview: require("./showcase/baiawine.png"),
    website: "https://www.baiawine.com",
    source: "https://github.com/cardano-foundation",
    tags: ["featured", "opensource"],
  },
  {
    title: "NFT Maker",
    description:
      "Create your own NFT by uploading an image and paying some ada.",
    preview: require("./showcase/nft-maker.png"),
    website: "https://www.nft-maker.io",
    source: null,
    tags: ["tokens"],
  },
  {
    title: "SpaceBudz",
    description:
      "The first full on-chain NFT platform on Cardano consisting of 10,000 unique little astronauts.",
    preview: require("./showcase/spacebudz.png"),
    website: "https://spacebudz.io",
    source: null,
    tags: ["tokens"],
  },
  {
    title: "ADAex",
    description:
      "A classic block explorer that also offers a Cardano rich list.",
    preview: require("./showcase/adaex.png"),
    website: "https://adaex.org",
    source: null,
    tags: ["explorer"],
  },
  {
    title: "AdaStat",
    description:
      "The browser, inconspicuous at first glance, offers a great many statistics and insights.",
    preview: require("./showcase/adastat.png"),
    website: "https://adastat.net",
    source: null,
    tags: ["explorer"],
  },
  {
    title: "Cardano Explorer",
    description:
      "The Cardano explorer built by IOHK, one of the founding entities of Cardano.",
    preview: require("./showcase/cardanoexplorer.png"),
    website: "https://explorer.cardano.org",
    source: null,
    tags: ["explorer"],
  },
  {
    title: "Cardano Scan",
    description:
      "A combination of block explorer and pool tool, uses it's own implementation of db-sync.",
    preview: require("./showcase/cardanoscan.png"),
    website: "https://cardanoscan.io/",
    source: null,
    tags: ["explorer"],
  },
  {
    title: "Pool PM",
    description:
      "Block explorer that brought out a new, refreshing concept to visualize transactions.",
    preview: require("./showcase/poolpm.png"),
    website: "https://pool.pm",
    source: null,
    tags: ["explorer"],
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
      "source",
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

  function checkOpenSource() {
    if (typeof showcase.source === "undefined") {
      throw new Error(
        "The source attribute is required.\nIf your Cardano project is not open-source, please make it explicit with 'source: null'"
      );
    } else {
      const hasOpenSourceTag = showcase.tags.includes("opensource");
      if (showcase.source === null && hasOpenSourceTag) {
        throw new Error(
          "You can't add the opensource tag to a site that does not have a link to source code."
        );
      } else if (showcase.source && !hasOpenSourceTag) {
        throw new Error(
          "For open-source sites, please add the 'opensource' tag."
        );
      }
    }
  }

  try {
    checkFields();
    checkTitle();
    checkDescription();
    checkWebsite();
    checkPreview();
    checkTags();
    checkOpenSource();
  } catch (e) {
    throw new Error(
      `Showcase site with title=${showcase.title} contains errors:\n${e.message}`
    );
  }
}

Showcases.forEach(ensureShowcaseValid);
