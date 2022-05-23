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
import { Fav } from '../svg/fav.svg'

// List of available tags. The tag should be singular and the label in plural. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // PLEASE DO NOT USE THIS TAG: we choose the favorite tools (process TBD)
  favorite: {
    label: "Favorite",
    description:
      "Our favorite Cardano builder tools that you must absolutely check-out.",
    color: '#e9669e',
  },

  // API
  api: {
    label: "API",
    description: "Cardano API.",
    icon: null,
    color: '#39ca30',
  },

  // Chain Index
  chainindex: {
    label: "Chain Index",
    description:
      "Index Protocol",
    icon: null,
    color: '#000'
  },

  // For builder tools with a get started tag, a link to the get started page is required.
  getstarted: {
    label: "Get Started",
    description: "This builder tool has a get started page in the developer portal.",
    icon: null,
    color: '#dfd545',
  },

  // Integrated Development Environment
  IDE: {
    label: "IDE",
    description:
      "Integrated development environment",
    icon: null,
    color: '#001eff',
  },

  // Java
  java: {
    label: "Java",
    description:
      "Java language",
    icon: null,
    color: '#d5232d',
    },

  // JavaScript
  javascript: {
    label: "JavaScript",
    description:
      "JavaScript language",
    icon: null,
    color: '#921f32',
    },

  // Library
  library: {
    label: "Library",
    description:
      "Cardano library.",
    icon: null,
    color: '#a44fb7',
  },

   // Marlowe
   marlowe: {
    label: "Marlowe",
    description:
      "Marlowe",
    icon: null,
    color: '#127f82'
  },

  // .NET
  net: {
    label: ".NET",
    description: ".NET language",
    icon: null,
    color: '#e46fd9',
  },

  // NFT Tools
  nft: {
    label: "NFT",
    description: "Non-Fungible Token (NFT)",
    icon: null,
    color: '#fe6829',
  },

  // Stake Pool Operator Tools
  operatortool: {
    label: "Operator Tool",
    description:
      "Stake pool operator tools.",
    icon: null,
    color: '#4267b2',
  },

  // Oracle Tools
  oracle: {
    label: "Oracle",
    description:
      "Oracle tools.",
    icon: null,
    color: '#14cfc3',
  },
  // Plutus
  plutus: {
    label: "Plutus",
    description:
      "Plutus",
    icon: null,
    color: '#8c2f00',
  },

  // Python
  python: {
    label: "Python",
    description:
      "Python language",
    icon: null,
    color: '#5dc942',
  },

  // Rust
  rust: {
    label: "Rust",
    description:
      "Rust language",
    icon: null,
    color: '#7e6a4c',
  },

};

// Add your builder tool to (THE END OF) this list.
// Please don't add the "favorite"-tag yourself.
const Showcases = [
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./builder-tools/blockfrost.png"),
    website: "https://blockfrost.io",
    getstarted: "/docs/get-started/blockfrost",
    tags: ["favorite", "getstarted", "api"],
  },
  {
    title: "Cardano Serialization Library",
    description:
      "Library for serialization & deserialization of data structures used in Cardano's Haskell implementation.",
    preview: require("./builder-tools/cardano-serialization-lib.png"),
    website: "https://github.com/Emurgo/cardano-serialization-lib",
    getstarted: "/docs/get-started/cardano-serialization-lib/overview",
    tags: ["getstarted", "library", "rust"],
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
    website: "https://gimbalabs.com/dandelion",
    getstarted: "/docs/get-started/dandelion-apis",
    tags: ["getstarted", "api"],
  },
  {
    title: "Ogmios",
    description: "Ogmios is a lightweight bridge interface (WebSocket + JSON/RPC) for cardano-node.",
    preview: require("./builder-tools/ogmios.png"),
    website: "https://ogmios.dev",
    getstarted: "/docs/get-started/ogmios",
    tags: ["favorite", "getstarted", "library"],
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./builder-tools/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    getstarted: null,
    tags: ["library", "java"],
  },
  {
    title: "cardano-addresses TypeScript binding",
    description: "This is a Typescript/Javascript version of the cardano-addresses API. It includes a web demo.",
    preview: require("./builder-tools/cardano-addresses-typescript-binding.png"),
    website: "https://www.npmjs.com/package/cardano-addresses",
    getstarted: null,
    tags: ["api", "javascript"],
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
    title: "cardano-wallet-js",
    description: "A javascript/typescript SDK for Cardano Wallet with a extra functionalities. You can use it as a client for the official cardano-wallet and also to create Native Tokens and NFTs.",
    preview: require("./builder-tools/cardano-wallet-js.png"),
    website: "https://github.com/tango-crypto/cardano-wallet-js",
    getstarted: "/docs/get-started/cardano-wallet-js",
    tags: ["getstarted", "library", "javascript"]
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./builder-tools/cardanosharp.png"),
    website: "https://www.cardanosharp.com",
    getstarted: "/docs/get-started/cardanosharp-wallet",
    tags: ["favorite", "getstarted", "library", "net"],
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
    tags: ["favorite", "getstarted", "operatortool"],
  },
  {
    title: "libada-go",
    description: "A Golang library for Cardano network, it is used and maintained by Bitrue.",
    preview: require("./builder-tools/libada-go.png"),
    website: "https://github.com/Bitrue-exchange/libada-go",
    getstarted: null,
    tags: ["favorite", "library"],
  },
  {
    title: "Pooldata API",
    description: "The Pooldata public API provide several operational metrics for SPOs in the form of time-series and tabular data. It can be plugged directly to a Grafana environment as datasource.",
    preview: require("./builder-tools/pooldata-api.png"),
    website: "https://api.pooldata.live",
    getstarted: null,
    tags: ["operatortool", "api"],
  },
  {
    title: "Python Module",
    description: "The module provides tools for developers to accept and send transactions, manage staking and much more. It uses cardano-wallet as backend but is future-compatible with other solutions.",
    preview: require("./builder-tools/cardano-python.png"),
    website: "https://github.com/emesik/cardano-python",
    getstarted: null,
    tags: ["library", "api", "python"],
  },
  {
    title: "Plutus Playground",
    description: "The Plutus Playground is a lightweight, web-based environment for exploratory Plutus development.",
    preview: require("./builder-tools/plutus-playground.png"),
    website: "https://playground.plutus.iohkdev.io",
    getstarted: "/docs/smart-contracts/plutus#plutus-playground",
    tags: ["favorite", "getstarted", "plutus"],
  },
  {
    title: "Marlowe Playground",
    description: "In the browser-based Marlowe Playground you can write Marlowe contracts, in a variety of different ways.",
    preview: require("./builder-tools/marlowe-playground.png"),
    website: "https://alpha.marlowe.iohkdev.io/#/",
    getstarted: "/docs/smart-contracts/marlowe#marlowe-playground",
    tags: ["favorite", "getstarted", "marlowe"],
  },
  {
    title: "Automint",
    description:
      "A Python library that benefits the token & NFT communities. Scripts allow easy wallet management, automatic creation of unlocked and time-locked policy IDs, as well as the ability to quickly: build, sign, and submit transactions, and much more. Note: This library relies on wrapping cardano-cli.",
    preview: require("./builder-tools/automint.png"),
    website: "https://github.com/creativequotient/automint",
    getstarted: null,
    tags: ["library"],
  },
  {
    title: "Ansible cardano-node",
    description: "An Ansible playbook that helps operators provision and maintain a secure Cardano stake pool.",
    preview: require("./builder-tools/ansible-cardano-node.png"),
    website: "https://github.com/moaipool/ansible-cardano-node",
    getstarted: "/docs/operate-a-stake-pool/ansible-cardano-node",
    tags: ["getstarted", "operatortool"],
  },
  {
    title: "Fracada",
    description:
      "Plutus dApp which enables users to fractionalize their NFTs. The contract locks an NFT and mints a number of tokens representing fractions of it. To get the NFT back, the fraction tokens are burned.",
    preview: require("./builder-tools/fracada.png"),
    website: "https://github.com/dcSpark/fracada",
    getstarted: null,
    tags: ["favorite", "plutus", "nft"],
  },
  {
    title: "Cardano Light Tools",
    description:
      "A set of lightweight tools to operate and maintain a Cardano Stake Pool. Currently includes a leaderlog script based on BlockFrost (no need for working cardano-cli/cardano-node setup and less CPU/mem utilization) and a monitoring script to log relevant metrics directly into a text file in human-readable form (less complex and more resource-efficient than Grafana).",
    preview: require("./builder-tools/cardano-light-tools.png"),
    website: "https://github.com/orpheus-antpool/cardano-light-tools",
    getstarted: null,
    tags: ["operatortool"],
  },
  {
    title: "cardano-wallet-interface",
    description: "A Javascript/Typescript library to easily interact with the dApp connector of various wallets.",
    preview: require("./builder-tools/cardano-wallet-interface.png"),
    website: "https://github.com/HarmonicPool/cardano-wallet-interface",
    getstarted: null,
    tags: ["library", "javascript"],
  },
  {
    title: "Plutus Fee Estimator",
    description: "Helps developers to estimate the cost of smart contract scripts for maximum efficiency and minimum cost.",
    preview: require("./builder-tools/plutus-fee-estimator.png"),
    website: "https://testnets.cardano.org/en/testnets/cardano/tools/plutus-fee-estimator/",
    getstarted: null,
    tags: ["plutus"],
  },
  {
    title: "Plutus Extra",
    description: "A collection of Plutus-related helper libraries.",
    preview: require("./builder-tools/plutus-extra.png"),
    website: "https://github.com/Liqwid-Labs/plutus-extra",
    getstarted: null,
    tags: ["library", "plutus"],
  },
  {
    title: "PyCardano",
    description:
      "A Cardano library written in Python. It allows users to build and sign transactions without depending on other Cardano serialization tools (such as cardano-cli and cardano-serialization-lib), making it a lightweight library that is easy and fast to set up in all kinds of environments.",
    preview: require("./builder-tools/pycardano.png"),
    website: "https://github.com/cffls/pycardano",
    getstarted: null,
    tags: ["library", "api", "python"],
  },
  {
    title: "Oura - the tail of Cardano",
    description:
      "Oura is a rust-native implementation of a pipeline that connects to the tip of a Cardano node through a combination of Ouroboros mini-protocol, filters the events that match a particular pattern and then submits a succint, self-contained payload to pluggable observers called 'sinks'.",
    preview: require("./builder-tools/oura.png"),
    website: "https://github.com/txpipe/oura",
    getstarted: null,
    tags: ["favorite", "rust", "chainindex"],
  },
  {
    title: "cardano-wallet-connector",
    description:
        "A quickstart and boilerplate code to connect dApps with Web wallets using the latest cardano-serialization-lib. It includes examples with how to lock ADA and Tokens (NFTs) at a plutus script address and then how to redeem them from the plutus script address ... All from the front end. The project is bootstrapped with a Create React App, so is quick to get started for those familiar with this front end framework",
    preview: require("./builder-tools/cardano-wallet-connector.png"),
    website: "https://github.com/dynamicstrategies/cardano-wallet-connector",
    getstarted: null,
    tags: ["javascript","nft","plutus"],
  },
  {
    title: "Stricahq Typhonjs Wallet",
    description:
        "Pure javascript Cardano wallet library.",
    preview: require("./builder-tools/typhonjs.png"),
    website: "https://github.com/StricaHQ/typhonjs",
    getstarted: null,
    tags: ["javascript","library","plutus"],
  },
  {
    title: "IntelliJ IDE",
    description:
      "An IntelliJ plugin for Cardano blockchain",
    preview: require("./builder-tools/IDE.png"),
    website: "https://intelliada.bloxbean.com",
    getstarted: null,
    tags: ["java", "IDE"],
  },
  {
    title: "Cardano Blockchain Snapshots",
    description:
      "Download the latest Cardano blockchain snapshot",
    preview: require("./builder-tools/cardano-snapshots.png"),
    website: "https://cSnapshots.io",
    getstarted: null,
    tags: ["operatortool"],
  },
  {
    title: "Koios",
    description: "Elastic light/full-mode API query-layer for Cardano Blockchain.",
    preview: require("./builder-tools/koios.png"),
    website: "https://koios.rest",
    getstarted: "/docs/get-started/koios",
    tags: ["getstarted", "api"],
  },
  {
    title: "Pallas",
    description: "Rust-native building blocks for the Cardano blockchain ecosystem",
    preview: require("./builder-tools/pallas.svg"),
    website: "https://github.com/txpipe/pallas#readme",
    getstarted: null,
    tags: ["library", "rust"]
  },
  {
    title: "Scrolls",
    description: "Read-optimized cache of Cardano on-chain entities",
    preview: require("./builder-tools/scrolls.png"),
    website: "https://github.com/txpipe/scrolls#readme",
    getstarted: null,
    tags: ["chainindex", "api", "favorite"]
  },
  {
    title: "Kupo",
    description: "A lightweight & configurable chain-index for Cardano.",
    preview: require("./builder-tools/kupo.png"),
    website: "https://github.com/CardanoSolutions/kupo#readme",
    getstarted: null,
    tags: ["chainindex", "api", "favorite"]
  },
  {
    title: "cardano-multiplatform-lib",
    description: "A library of utilities and codecs for serialization/deserialization of core data-stuctures. Replacement for 'cardano-serialization-lib'.",
    preview: require("./builder-tools/cardano-multiplatform-lib.png"),
    website: "https://github.com/dcSpark/cardano-multiplatform-lib#cardano-multiplatform-lib",
    getstarted: null,
    tags: ["library", "rust", "favorite"]
  },
  {
    title: "cardano-js-sdk",
    description: "JavaScript SDK for interacting with Cardano, providing various key management options, soon to be including support for popular hardware wallets.",
    preview: require("./builder-tools/cardano-js-sdk.png"),
    website: "https://github.com/input-output-hk/cardano-js-sdk/#readme",
    getstarted: null,
    tags: ["library", "javascript"]
  },
  {
    title: "Lucid",
    description: "Lucid is a library, which allows you to create Cardano transactions and off-chain code for your Plutus contracts in JavaScript and Node.js.",
    preview: require("./builder-tools/lucid.svg"),
    website: "https://github.com/Berry-Pool/lucid#readme",
    getstarted: null,
    tags: ["library", "javascript", "plutus"]
  },
  {
    title: "Pirouette",
    description: "Pirouette is a semi-automatic code extraction tool for model-checking. It extracts a TLA+ specification from a Plutus Mealy Machine.",
    preview: require("./builder-tools/pirouette.png"),
    website: "https://github.com/tweag/pirouette#readme",
    getstarted: null,
    tags: ["library", "plutus"]
  },
  {
    title: "Pluto",
    description: "An untyped Plutus Core assembler.",
    preview: require("./builder-tools/pluto.png"),
    website: "https://github.com/Plutonomicon/pluto#pluto",
    getstarted: null,
    tags: ["library", "plutus"]
  },
  {
    title: "Plutonomicon",
    description: "A developer-driven guide to the Plutus smart contract language in practice.",
    preview: require("./builder-tools/plutonomicon.png"),
    website: "https://github.com/Plutonomicon/plutonomicon#readme",
    getstarted: null,
    tags: ["plutus"]
  },
  {
    title: "Plutarch",
    description: "Plutarch is a typed eDSL in Haskell for writing efficient Plutus Core validators.",
    preview: require("./builder-tools/plutarch.png"),
    website: "https://github.com/Plutonomicon/plutarch#plutarch",
    getstarted: null,
    tags: ["plutus"]
  },
  {
    title: "Tangocrypto",
    description: "A suite of high availability APIs and developer tools providing fast and reliable access to the Cardano network so you can focus on building and growing your products.",
    preview: require("./builder-tools/tangocrypto.png"),
    website: "https://tangocrypto.com",
    getstarted: "/docs/get-started/tangocrypto",
    tags: ["getstarted", "api", "nft", "chainindex"],
  },
];

export const TagList = Object.keys(Tags);
function sortShowcases() {
  let result = Showcases;
  // Sort by site name
  result = sortBy(result, (showcase) => showcase.title.toLowerCase());
  // Sort by favorite tag, favorite first
  result = sortBy(result, (showcase) => !showcase.tags.includes("favorite"));
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
