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

// List of available tags. The tag should be singular and the label in plural. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // PLEASE DO NOT USE THIS TAG: we choose the features projects (process TBD)
  featured: {
    label: "Featured",
    description:
      "Our favorite Cardano projects that you must absolutely check-out.",
    icon: <>⭐️</>,
  },

  // Analytics
  analytics: {
    label: "Analytics",
    description: "Tools that provide special insights related to Cardano.",
    icon: null,
  },

  // Cardano Block Explorers
  explorer: {
    label: "Block Explorers",
    description:
      "Block explorers are browsers for the Cardano blockchain. They can display the contents of individual blocks and transactions.",
    icon: null,
  },

  // Educational
  educational: {
    label: "Educational",
    description:
      "Educational projects that will help you onboarding to Cardano.",
    icon: null,
  },
 
  // Games
  game: {
    label: "Games",
    description: "Games on the Cardano blockchain.",
    icon: null,
  },

  // Gateways
  gateway: {
    label: "Gateways",
    description: "Payment Gateway Providers.",
    icon: null,
  },

  // For open-source sites, a link to the source code is required
  opensource: {
    label: "Open-Source",
    description: "Open-Source sites can be useful for inspiration.",
    icon: null,
  },

  // Pool Tools
  pooltool: {
    label: "Pool Tools",
    description:
      "Pool tools provide delegates with the necessary tools to find a good pool.",
    icon: null,
  },

  // Meta data projects
  metadata: {
    label: "Metadata",
    description: "Transaction metadata",
    icon: null,
  },

  // Native tokens related projects
  tokens: {
    label: "Native Tokens",
    description: "Native Tokens",
    icon: null,
  },

  // NFT projects
  nft: {
    label: "NFT",
    description: "Non-Fungible Token (NFT)",
    icon: null,
  },

  // Wallets
  wallet: {
    label: "Wallets",
    description:
      "Cardano wallets store the public and/or private keys to access and manage your funds.",
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
    tags: ["tokens", "nft"],
  },
  {
    title: "Cardano Wall",
    description:
      "Demonstrates serveral use cases for transaction metdata. You can sign messages and create proof of existence for files.",
    preview: require("./showcase/cardanowall.png"),
    website: "https://cardanowall.com/en/explore/",
    source: null,
    tags: ["featured", "metadata"],
  },
  {
    title: "Meta Data Connector",
    description:
      "Cardano Foundation’s supply chain traceability and anti-counterfeit solution together with Scantrust.",
    preview: require("./showcase/baiawine.png"),
    website: "https://www.baiawine.com",
    source: "https://github.com/cardano-foundation",
    tags: ["opensource", "featured", "metadata"],
  },
  {
    title: "NFT Maker",
    description:
      "Create your own NFT by uploading an image and paying some ada.",
    preview: require("./showcase/nft-maker.png"),
    website: "https://www.nft-maker.io",
    source: null,
    tags: ["tokens", "nft"],
  },
  {
    title: "SpaceBudz",
    description:
      "The first full on-chain NFT platform on Cardano consisting of 10,000 unique little astronauts.",
    preview: require("./showcase/spacebudz.png"),
    website: "https://spacebudz.io",
    source: null,
    tags: ["tokens", "nft"],
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
  {
    title: "Adafolio",
    description:
      "Adafolio provides a place to create and share multi-delegation portfolios.",
    preview: require("./showcase/adafolio.png"),
    website: "https://adafolio.com",
    source: null,
    tags: ["pooltool"],
  },
  {
    title: "Adapools",
    description:
      "Was one of the first pool tools and was always further developed.",
    preview: require("./showcase/adapools.png"),
    website: "https://adapools.org/",
    source: null,
    tags: ["pooltool", "analytics"],
  },
  {
    title: "PoolTool",
    description:
      "One of the most feature-rich, unbiased pool tools. Also offers a native app.",
    preview: require("./showcase/pooltool.png"),
    website: "https://pooltool.io",
    source: null,
    tags: ["pooltool", "analytics"],
  },
  {
    title: "AdaLite",
    description:
      "AdaLite was developed by vacuumlabs, they were also responsible for the Cardano Ledger app and won the crypto puzzle at the IOHK Summit 2019.",
    preview: require("./showcase/adalite.png"),
    website: "https://adalite.io",
    source: null,
    tags: ["wallet"],
  },
  {
    title: "Atomic Wallet",
    description:
      "Multi-cryptocurrency wallet that supports Cardano. During the integration they contributed code to the Cardano Rust library.",
    preview: require("./showcase/atomicwallet.png"),
    website: "https://atomicwallet.io",
    source: null,
    tags: ["wallet"],
  },
  {
    title: "Daedalus",
    description:
      "Daedalus is a full node and developed by IOHK, one of the founding entities of Cardano.",
    preview: require("./showcase/daedalus.png"),
    website: "https://daedaluswallet.io",
    source: "https://github.com/input-output-hk/daedalus",
    tags: ["wallet", "opensource", "featured"],
  },
  {
    title: "Yoroi",
    description:
      "Yoroi is a lightweight node and developed by EMURGO, one of the founding entities of Cardano.",
    preview: require("./showcase/yoroi.png"),
    website: "https://yoroi-wallet.com",
    source: "https://github.com/Emurgo/yoroi-frontend",
    tags: ["wallet", "opensource"],
  },
  {
    title: "Crypto Mage",
    description: "Cardano NFT game.",
    preview: require("./showcase/cryptomage.png"),
    website: "https://cryptomage.net",
    source: null,
    tags: ["featured", "tokens", "nft", "game"],
  },
  {
    title: "Cardano Warriors",
    description: "Cardano NFT game.",
    preview: require("./showcase/cardanowarriors.png"),
    website: "https://www.cardanowarriors.io",
    source: null,
    tags: ["tokens", "nft", "game"],
  },
  {
    title: "Native Tokens",
    description: "Provides insights into native tokens on Cardano mainnet.",
    preview: require("./showcase/nativetokens.png"),
    website: "https://nativetokens.da.iogservices.io",
    source: null,
    tags: ["tokens", "analytics"],
  },
  {
    title: "Cardano Cubes",
    description: "Cardano NFT game.",
    preview: require("./showcase/cardanocubes.png"),
    website: "https://cardanocubes.com",
    source: null,
    tags: ["tokens", "nft", "game"],
  },
  {
    title: "Cardano Assets",
    description: "Overview of native tokens on Cardano.",
    preview: require("./showcase/cardanoassets.png"),
    website: "https://cardanoassets.com",
    source: null,
    tags: ["tokens", "analytics"],
  },
  {
    title: "NFTea",
    description: "Sometimes all you need is a good cup of NFTea.",
    preview: require("./showcase/nftea.png"),
    website: "https://cardanonftea.com",
    source: null,
    tags: ["tokens", "nft"],
  },
  {
    title: "Cardano Bits",
    description: "The first eight bit pixel art on Cardano.",
    preview: require("./showcase/cardanobits.png"),
    website: "https://cardanobits.art",
    source: null,
    tags: ["tokens", "nft"],
  },
  {
    title: "Crypto Knitties",
    description:
      "Adorable, cuddly and unique, CryptoKnitties are collectable knitted NFT companions for your Cardano wallet.",
    preview: require("./showcase/cryptoknitties.png"),
    website: "https://adaknitties.com",
    source: null,
    tags: ["tokens", "nft"],
  },
  {
    title: "Cardano Updates",
    description:
      "Follow the development of Cardano in real time without the hassle of GitHub.",
    preview: require("./showcase/cardanoupdates.png"),
    website: "https://cardanoupdates.com",
    source: null,
    tags: ["analytics"],
  },
  {
    title: "Pool Stats",
    description: "Pool tool and insights visualized by heat maps.",
    preview: require("./showcase/poolstats.png"),
    website: "https://poolstats.org",
    source: null,
    tags: ["pooltool", "analytics"],
  },
  {
    title: "Ada Tools",
    description:
      "Visualizes the nodes on a globe and also provides various tools.",
    preview: require("./showcase/adatools.png"),
    website: "https://adatools.io/hologram",
    source: null,
    tags: ["pooltool", "analytics", "tokens"],
  },
  {
    title: "See Ada",
    description:
      "This project tracks the controlled stake of the top pool operators and monitors decentralization.",
    preview: require("./showcase/seeada.png"),
    website: "https://seeada.org",
    source: null,
    tags: ["analytics"],
  },
  {
    title: "Cardano Blockchain Insights",
    description:
      "A Google Data Studio dashboard that visualizes many Cardano on-chain metrics.",
    preview: require("./showcase/cardano-blockchain-insights.png"),
    website:
      "https://datastudio.google.com/u/0/reporting/3136c55b-635e-4f46-8e4b-b8ab54f2d460/page/k5r9B",
    source: null,
    tags: ["analytics"],
  },
  {
    title: "Xhibit",
    description:
      "Create your own NFT or look into recently minted NFTs on Cardano.",
    preview: require("./showcase/xhibit.png"),
    website: "https://xhibit.io",
    source: null,
    tags: ["featured", "tokens", "nft"],
  },
  {
    title: "Token Tool",
    description: "Keep track of native tokens on testnet and mainnet.",
    preview: require("./showcase/tokentool.png"),
    website: "https://tokentool.io",
    source: null,
    tags: ["tokens"],
  },
  {
    title: "Transaction Meta Data Browser",
    description:
      "Browse and search different types of transaction metadata on Cardano.",
    preview: require("./showcase/transaction-meta-data-browser.png"),
    website: "https://bi.stakepoolcentral.com/transactiondata",
    source: null,
    tags: ["featured", "metadata"],
  },
  {
    title: "PoolTool Mobile",
    description:
      "Explore Cardano, track your rewards and get notified to take action on certain events.",
    preview: require("./showcase/pooltoolmobile.png"),
    website: "https://pooltool.io/mobile",
    source: null,
    tags: ["featured", "pooltool", "analytics"],
  },
  {
    title: "Rewards Calendar",
    description:
      "Shows the epochs and rewards in a calendar.",
    preview: require("./showcase/rewardscalendar.png"),
    website: "https://dbooster.io/calendar",
    source: null,
    tags: ["featured", "analytics"],
  },
  {
    title: "NOWPayments",
    description:
      "Payment gateway provider to accept ada payments and ada donations.",
    preview: require("./showcase/nowpayments.png"),
    website: "https://nowpayments.io",
    source: null,
    tags: ["featured", "gateway"],
  },
  {
    title: "Coti adaPay",
    description:
      "Payment gateway provider to accept ada payments and ada donations.",
    preview: require("./showcase/cotiadapay.png"),
    website: "https://adapay.coti.io",
    source: null,
    tags: ["gateway"],
  },
  {
    title: "Gimbalabs",
    description:
      "Gimbalabs is a collaborative community and space where dApps and OpenSource tools are develop in the \"Playground\" (Project-Based Learning experiences). All are welcome to join every Tuesday at 4pm UTC!",
    preview: require("./showcase/gimbalabs.png"),
    website: "https://gimbalabs.com",
    source: "https://gitlab.com/gimbalabs",
    tags: ["featured", "educational", "opensource"],
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
