/*
 * BUILDER TOOLS SECTION INFO
 *
 * Requirements for adding your builder tool:
 * https://developers.cardano.org/docs/portal-contribute#add-tools-to-builder-tools
 *
 * Instructions:
 * - Add your tool in the json array at the end of the array.
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

  // Aiken
  aiken: {
    label: "Aiken",
    description: "Aiken and its development tools & libraries",
    icon: null,
    color: '#65d2a1',
  },

  // Chain Index
  chainindex: {
    label: "Chain Index",
    description:
      "Index Protocol",
    icon: null,
    color: '#000'
  },

  // Command Line Tools
  cli: {
    label: "CLI",
    description: "Command-line interface tools",
    icon: null,
    color: '#921f32',
  },

  // Crystal
  crystal: {
    label: "Crystal",
    description:
      "Crystal language",
    icon: null,
    color: '#ddd',
  },

  // Golang
  golang: {
    label: "Go",
    description:
      "Go language",
    icon: null,
    color: '#50b7e0',
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
    color: '#fce300',
  },

  // Koios
  koios: {
    label: "Koios",
    description: "Koios and its integrations",
    icon: null,
    color: "#b84421"
  },

  // Kotlin
  kotlin: {
    label: "Kotlin",
    description: "Kotlin language",
    icon: null,
    color: "#9c21b8"
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

  // Ogmios
  ogmios: {
    label: "Ogmios",
    description: "Ogmios and its integrations",
    icon: null,
    color: "#ff6d01"
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

  // Purescript
  purescript: {
    label: "Purescript",
    description:
      "PureScript language",
    icon: null,
    color: '#0F9D58',
  },

  // WebSocket
  websocket: {
    label: "WebSocket",
    description:
      "API w/ WebSocket",
    icon: null,
    color: "#1DB7ff"
  },

  // HTTP
  http: {
    label: "HTTP",
    description:
      "API w/ HTTP",
    icon: null,
    color: "#7F8C8D"
  },

  // JSON
  json: {
    label: "JSON",
    description:
      "JSON data format",
    icon: null,
    color: "#FCE300"
  },

  // Haskell
  haskell: {
    label: "Haskell",
    description:
      "Haskell language",
    icon: null,
    color: "#5F5287"
  },

  // TypeScript
  typescript: {
    label: "TypeScript",
    description:
      "TypeScript language",
    icon: null,
    color: "#2D79C7"
  },

  // Wallet
  wallet: {
    label: "Wallet",
    description:
      "Wallet integrations or implementations",
    icon: null,
    color: "#E1B12c"
  },

  // Serialization
  serialization: {
    label: "Serialization",
    description:
      "Binary serialization / deserialization",
    icon: null,
    color: "#D6A2E8"
  },

  // SDK
  sdk: {
    label: "SDK",
    description:
      "Software Development Kit",
    icon: null,
    color: "#B33771"
  },

  // Redis
  redis: {
    label: "Redis",
    description: "Redis",
    icon: null,
    color: "#FD7272"
  },

  // SQL
  sql: {
    label: "SQL",
    description: "SQL database (MySQL, PostgreSQL, SQLite...)",
    icon: null,
    color: "#FD7272"
  },

  // Low-Level
  lowlevel: {
    label: "Low-Level",
    description: "Low-level utility",
    icon: null,
    color: "#2C3A47"
  },

  // Testing
  testing: {
    label: "Testing",
    description: "Testing / Quality Assurance tool",
    icon: null,
    color: "#B8E994"
  },

  // Hosted
  hosted: {
    label: "Hosted Service",
    description: "Hosted / 3rd-party service",
    icon: null,
    color: "#4a69BD"
  },
};

// Add your builder tool to (THE END OF) this list.
// Please don't add the "favorite"-tag yourself.
export const Showcases = [
  {
    title: "cardano-cli",
    description: "The companion command-line to interact with a Cardano node, manipulate addresses or create transactions.",
    preview: require("./builder-tools/cardano-cli.png"),
    website: "https://github.com/input-output-hk/cardano-node/tree/master/cardano-cli#cardano-cli",
    getstarted: null,
    tags: ["favorite", "cli", "serialization"]
  },
  {
    title: "bech32",
    description: "Convert to and from bech32 strings from the command-line. A simple and easy-to-use unix utility.",
    preview: require("./builder-tools/bech32.png"),
    website: "https://github.com/input-output-hk/bech32/#readme",
    getstarted: null,
    tags: ["cli", "serialization"]
  },
  {
    title: "cardano-wallet",
    description: "An HTTP server and command-line for managing UTxOs and hierarchical deterministic wallets in Cardano.",
    preview: require("./builder-tools/cardano-wallet.png"),
    website: "https://github.com/input-output-hk/cardano-wallet/#overview",
    getstarted: "https://input-output-hk.github.io/cardano-wallet/",
    tags: ["http", "json", "wallet"]
  },
  {
    title: "cardano-graphql",
    description: "A cross-platform, typed, and queryable API for Cardano.",
    preview: require("./builder-tools/cardano-graphql.png"),
    website: "https://github.com/input-output-hk/cardano-graphql/#overview",
    getstarted: "https://github.com/input-output-hk/cardano-graphql#getting-started",
    tags: ["chainindex", "http"]
  },
  {
    title: "cardano-rosetta",
    description: "An implementation of Rosetta (an open-source specification and set of tools for blockchain integration) for Cardano. Rosetta’s goal is to make blockchain integration simpler, faster, and more reliable than using a native integration.",
    preview: require("./builder-tools/cardano-rosetta.png"),
    website: "https://github.com/input-output-hk/cardano-rosetta/#cardano-rosetta",
    getstarted: "https://www.rosetta-api.org/docs/getting_started.html",
    tags: ["http", "json"]
  },
  {
    title: "cardano-db-sync",
    description: "A PostgreSQL database layer which stores all data from the Cardano blockchain in a structured  and normalized way.",
    preview: require("./builder-tools/cardano-db-sync.png"),
    website: "https://github.com/input-output-hk/cardano-db-sync#cardano-db-sync",
    getstarted: null,
    tags: ["chainindex", "sql"]
  },
  {
    title: "cardano-addresses",
    description: "A command-line utility and library for manipulating addresses, keys and recovery phrases on Cardano.",
    preview: require("./builder-tools/cardano-addresses.png"),
    website: "https://github.com/input-output-hk/cardano-addresses#overview",
    getstarted: "https://github.com/input-output-hk/cardano-addresses#command-line",
    tags: ["cli", "haskell", "serialization"]
  },
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./builder-tools/blockfrost.png"),
    website: "https://blockfrost.io",
    getstarted: "/docs/get-started/blockfrost",
    tags: ["favorite", "http", "json", "hosted"],
  },
  {
    title: "StakePool Operator Scripts",
    description: "CLI scripts to manage your stake pool (online or offline), use and migrate to hardware wallets, send transactions with messages, register for Catalyst, mint/burn Tokens, generate the Token Registry, and more.",
    preview: require("./builder-tools/spo-scripts-gitmachtl.png"),
    website: "https://github.com/gitmachtl/scripts",
    getstarted: null,
    tags: ["operatortool", "cli", "serialization"],
  },
  {
    title: "Cardano Serialization Library",
    description:
      "Library for serialization & deserialization of data structures used in Cardano's Haskell implementation.",
    preview: require("./builder-tools/cardano-serialization-lib.png"),
    website: "https://github.com/Emurgo/cardano-serialization-lib",
    getstarted: "/docs/get-started/cardano-serialization-lib/overview",
    tags: ["serialization", "rust"],
  },
  {
    title: "Cardano Transaction Library",
    description: "A Purescript library for building smart contract transactions on Cardano (NodeJS & the browser)",
    preview: require("./builder-tools/cardano-transaction-lib.png"),
    website: "https://github.com/Plutonomicon/cardano-transaction-lib/",
    getstarted: "https://github.com/Plutonomicon/cardano-transaction-lib/blob/develop/doc/getting-started.md",
    tags: ["purescript", "sdk", "plutus"]
  },
  {
    title: "cardanocli-js",
    description: "A library that wraps the cardano-cli in JavaScript.",
    preview: require("./builder-tools/cardanocli-js.png"),
    website: "https://github.com/Berry-Pool/cardanocli-js",
    getstarted: "/docs/get-started/cardanocli-js",
    tags: ["javascript", "sdk"],
  },
  {
    title: "Dandelion APIs",
    description:
      "Kubernetes-based project to easily deploy Cardano APIs and a free, hosted community service to access all of them instantly.",
    preview: require("./builder-tools/dandelion-apis.png"),
    website: "https://gimbalabs.com/dandelion",
    getstarted: "/docs/get-started/dandelion-apis",
    tags: ["http", "websocket", "json", "hosted"],
  },
  {
    title: "Ogmios",
    description: "Ogmios is a lightweight bridge interface (WebSocket + JSON/RPC) for cardano-node.",
    preview: require("./builder-tools/ogmios.png"),
    website: "https://ogmios.dev",
    getstarted: "/docs/get-started/ogmios",
    tags: ["favorite", "ogmios", "websocket", "json", "lowlevel"],
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./builder-tools/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    getstarted: null,
    tags: ["java", "sdk", "favorite"],
  },
  {
    title: "Imperator - imperative, secure SC programming language",
    description:
      "A proof of concept secure, imperative language for writing Smart Contracts on Cardano L1.",
    preview: require("./builder-tools/imperator.png"),
    website: "https://github.com/ImperatorLang/imperator",
    getstarted: null,
    tags: ["python", "plutus"],
  },
  {
    title: "cardano-addresses TypeScript binding",
    description: "This is a Typescript/Javascript version of the cardano-addresses API. It includes a web demo.",
    preview: require("./builder-tools/cardano-addresses-typescript-binding.png"),
    website: "https://www.npmjs.com/package/cardano-addresses",
    getstarted: null,
    tags: ["typescript", "serialization"],
  },
  {
    title: "Heidrun",
    description:
      "An automation platform for Cardano to trigger various action based on detecting payment to a wallet address.",
    preview: require("./builder-tools/heidrun.png"),
    website: "https://github.com/adosia/Heidrun",
    getstarted: null,
    tags: ["http", "json"],
  },
  {
    title: "cardano-wallet-js",
    description: "A JavaScript SDK for Cardano Wallet with a extra functionalities. You can use it as a client for the official cardano-wallet and also to create Native Tokens and NFTs.",
    preview: require("./builder-tools/cardano-wallet-js.png"),
    website: "https://github.com/tango-crypto/cardano-wallet-js",
    getstarted: "/docs/get-started/cardano-wallet-js",
    tags: ["javascript", "sdk", "wallet"]
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./builder-tools/cardanosharp.png"),
    website: "https://www.cardanosharp.com",
    getstarted: "/docs/get-started/cardanosharp-wallet",
    tags: ["favorite", "sdk", "wallet", "net"],
  },
  {
    title: "Cardano Metadata Oracle",
    description: "Oracle submitting information using Cardano Metadata.",
    preview: require("./builder-tools/cardano-metadata-oracle.png"),
    website: "https://github.com/fivebinaries/cardano-metadata-oracle",
    getstarted: null,
    tags: ["oracle", "cli"],
  },
  {
    title: "Guild Operators Suite",
    description: "A collection of tools (CNTools, gLiveView, topologyUpdater and more) to simplify typical operations to help community simplify wallet keys, pool management and interact with blockchain.",
    preview: require("./builder-tools/guild-operators.png"),
    website: "https://cardano-community.github.io/guild-operators/",
    getstarted: "/docs/operate-a-stake-pool/guild-ops-suite",
    tags: ["favorite", "operatortool"],
  },
  {
    title: "libada-go",
    description: "A Golang library for Cardano network, it is used and maintained by Bitrue.",
    preview: require("./builder-tools/libada-go.png"),
    website: "https://github.com/Bitrue-exchange/libada-go",
    getstarted: null,
    tags: ["golang", "sdk"],
  },
  {
    title: "go-cardano-serialization",
    description: "A Golang serialisation library for Cardano network.",
    preview: require("./builder-tools/go-cardano-serialisation.png"),
    website: "https://github.com/fivebinaries/go-cardano-serialization",
    getstarted: null,
    tags: ["favorite", "golang", "serialization"],
  },
  {
    title: "Pooldata API",
    description: "The Pooldata public API provide several operational metrics for SPOs in the form of time-series and tabular data. It can be plugged directly to a Grafana environment as datasource.",
    preview: require("./builder-tools/pooldata-api.png"),
    website: "https://api.pooldata.live",
    getstarted: null,
    tags: ["operatortool", "http", "hosted"],
  },
  {
    title: "Python Module",
    description: "The module provides tools for developers to accept and send transactions, manage staking and much more. It uses cardano-wallet as backend but is future-compatible with other solutions.",
    preview: require("./builder-tools/cardano-python.png"),
    website: "https://github.com/emesik/cardano-python",
    getstarted: null,
    tags: ["sdk", "python"],
  },
  {
    title: "Plutus Playground",
    description: "The Plutus Playground is a lightweight, web-based environment for exploratory Plutus development.",
    preview: require("./builder-tools/plutus-playground.png"),
    website: "https://playground.plutus.iohkdev.io",
    getstarted: "/docs/smart-contracts/plutus#plutus-playground",
    tags: ["favorite", "plutus", "hosted"],
  },
  {
    title: "Marlowe Playground",
    description: "In the browser-based Marlowe Playground you can write Marlowe contracts, in a variety of different ways.",
    preview: require("./builder-tools/marlowe-playground.png"),
    website: "https://play.marlowe-finance.io",
    getstarted: "/docs/smart-contracts/marlowe#marlowe-playground",
    tags: ["favorite", "marlowe", "hosted"],
  },
  {
    title: "Automint",
    description:
      "A Python library that benefits the token & NFT communities. Scripts allow easy wallet management, automatic creation of unlocked and time-locked policy IDs, as well as the ability to quickly: build, sign, and submit transactions, and much more. Note: This library relies on wrapping cardano-cli.",
    preview: require("./builder-tools/automint.png"),
    website: "https://github.com/creativequotient/automint",
    getstarted: null,
    tags: ["python", "nft"],
  },
  {
    title: "Ansible cardano-node",
    description: "An Ansible playbook that helps operators provision and maintain a secure Cardano stake pool.",
    preview: require("./builder-tools/ansible-cardano-node.png"),
    website: "https://github.com/moaipool/ansible-cardano-node",
    getstarted: "/docs/operate-a-stake-pool/ansible-cardano-node",
    tags: ["operatortool"],
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
    description: "A Javascript library to easily interact with the dApp connector of various wallets.",
    preview: require("./builder-tools/cardano-wallet-interface.png"),
    website: "https://github.com/HarmonicPool/cardano-wallet-interface",
    getstarted: null,
    tags: ["javascript", "wallet"],
  },
  {
    title: "Plutus Fee Estimator",
    description: "Helps developers to estimate the cost of smart contract scripts for maximum efficiency and minimum cost.",
    preview: require("./builder-tools/plutus-fee-estimator.png"),
    website: "https://testnets.cardano.org/en/testnets/cardano/tools/plutus-fee-estimator/",
    getstarted: null,
    tags: ["plutus", "hosted"],
  },
  {
    title: "Plutus Extra",
    description: "A collection of Plutus-related helper libraries.",
    preview: require("./builder-tools/plutus-extra.png"),
    website: "https://github.com/Liqwid-Labs/plutus-extra",
    getstarted: null,
    tags: ["plutus", "haskell"],
  },
  {
    title: "PyCardano",
    description:
      "A Cardano library written in Python. It allows users to build and sign transactions without depending on other Cardano serialization tools (such as cardano-cli and cardano-serialization-lib), making it a lightweight library that is easy and fast to set up in all kinds of environments.",
    preview: require("./builder-tools/pycardano.png"),
    website: "https://github.com/cffls/pycardano",
    getstarted: null,
    tags: ["python", "sdk"],
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
        "A quickstart and boilerplate code to connect dApps with Web wallets using the latest cardano-serialization-lib. It includes examples with how to lock ADA and Tokens (NFTs) at a plutus script address and then how to redeem them from the plutus script address ... All from the front end. The project is bootstrapped with a Create React App, so is quick to get started for those familiar with this front end framework.",
    preview: require("./builder-tools/cardano-wallet-connector.png"),
    website: "https://github.com/dynamicstrategies/cardano-wallet-connector",
    getstarted: null,
    tags: ["javascript", "wallet", "plutus"],
  },
  {
    title: "Stricahq Typhonjs Wallet",
    description:
        "Pure javascript Cardano wallet library.",
    preview: require("./builder-tools/typhonjs.png"),
    website: "https://github.com/StricaHQ/typhonjs",
    getstarted: null,
    tags: ["javascript", "wallet"],
  },
  {
    title: "IntelliJ IDE",
    description:
      "An IntelliJ plugin for Cardano blockchain.",
    preview: require("./builder-tools/IDE.png"),
    website: "https://intelliada.bloxbean.com",
    getstarted: null,
    tags: ["java", "IDE"],
  },
  {
    title: "Cardano Blockchain Snapshots",
    description:
      "Download the latest Cardano blockchain snapshot.",
    preview: require("./builder-tools/cardano-snapshots.png"),
    website: "https://cSnapshots.io",
    getstarted: null,
    tags: ["operatortool", "chainindex", "hosted"],
  },
  {
    title: "Koios",
    description: "Elastic light/full-mode API query-layer for Cardano Blockchain.",
    preview: require("./builder-tools/koios.png"),
    website: "https://koios.rest",
    getstarted: "/docs/get-started/koios",
    tags: ["koios", "http", "json", "hosted"],
  },
  {
    title: "Pallas",
    description: "Rust-native building blocks for the Cardano blockchain ecosystem.",
    preview: require("./builder-tools/pallas.png"),
    website: "https://github.com/txpipe/pallas#readme",
    getstarted: null,
    tags: ["rust", "lowlevel"]
  },
  {
    title: "Scrolls",
    description: "Read-optimized cache of Cardano on-chain entities.",
    preview: require("./builder-tools/scrolls.png"),
    website: "https://github.com/txpipe/scrolls#readme",
    getstarted: null,
    tags: ["chainindex", "redis", "favorite"]
  },
  {
    title: "Kupo",
    description: "A lightweight & configurable chain-index for Cardano.",
    preview: require("./builder-tools/kupo.png"),
    website: "https://github.com/CardanoSolutions/kupo#readme",
    getstarted: null,
    tags: ["chainindex", "http", "json", "favorite"]
  },
  {
    title: "cardano-multiplatform-lib",
    description: "A library of utilities and codecs for serialization/deserialization of core data-stuctures. Replacement for 'cardano-serialization-lib'.",
    preview: require("./builder-tools/cardano-multiplatform-lib.png"),
    website: "https://github.com/dcSpark/cardano-multiplatform-lib#cardano-multiplatform-lib",
    getstarted: null,
    tags: ["rust", "serialization", "favorite"]
  },
  {
    title: "cardano-js-sdk",
    description: "JavaScript SDK for interacting with Cardano, providing various key management options, soon to be including support for popular hardware wallets.",
    preview: require("./builder-tools/cardano-js-sdk.png"),
    website: "https://github.com/input-output-hk/cardano-js-sdk/#readme",
    getstarted: null,
    tags: ["sdk", "javascript"]
  },
  {
    title: "Lucid",
    description: "Lucid is a library, which allows you to create Cardano transactions and off-chain code for your Plutus contracts in JavaScript and Node.js.",
    preview: require("./builder-tools/lucid.png"),
    website: "https://github.com/Berry-Pool/lucid#readme",
    getstarted: null,
    tags: ["javascript", "sdk", "plutus"]
  },
  {
    title: "Pirouette",
    description: "Pirouette is a semi-automatic code extraction tool for model-checking. It extracts a TLA+ specification from a Plutus Mealy Machine.",
    preview: require("./builder-tools/pirouette.png"),
    website: "https://github.com/tweag/pirouette#readme",
    getstarted: null,
    tags: ["haskell", "plutus", "testing"]
  },
  {
    title: "Pluto",
    description: "An untyped Plutus Core assembler.",
    preview: require("./builder-tools/pluto.png"),
    website: "https://github.com/Plutonomicon/pluto#pluto",
    getstarted: null,
    tags: ["plutus", "lowlevel"]
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
    tags: ["plutus", "haskell"]
  },
  {
    title: "Tangocrypto",
    description: "A suite of high availability APIs and developer tools providing fast and reliable access to the Cardano network so you can focus on building and growing your products.",
    preview: require("./builder-tools/tangocrypto.png"),
    website: "https://tangocrypto.com",
    getstarted: "/docs/get-started/tangocrypto",
    tags: ["http", "json", "hosted"],
  },
  {
    title: "go-ouroboros-network",
    description: "A Golang implementation of the Cardano Ouroboros network protocol.",
    preview: require("./builder-tools/go-ouroboros-network.png"),
    website: "https://github.com/cloudstruct/go-ouroboros-network",
    getstarted: null,
    tags: ["golang", "lowlevel"]
  },
  {
    title: "cscli",
    description: "A lightweight cross-platform CLI tool for generating/serialising Cardano wallet primitives (i.e. recovery-phrases, keys, addresses and transactions), querying the chain and submitting transactions to the testnet or mainnet networks.",
    preview: require("./builder-tools/cscli.png"),
    website: "https://github.com/CardanoSharp/cscli",
    getstarted: "/docs/get-started/cscli",
    tags: ["cli", "serialization", "wallet"],
  },
  {
    title: "HeliosLang",
    description: "A DSL for writing Cardano Smart Contracts. Reference compiler is a single Javascript file without dependencies.",
    preview: require("./builder-tools/helioslang.png"),
    website: "https://github.com/Hyperion-BT/Helios",
    getstarted: null,
    tags: ["javascript", "plutus"],
  },
  {
    title: "plu-ts",
    description: "Typescript-embedded smart contract programming language and transaction creation library",
    preview: require("./builder-tools/plu-ts.png"),
    website: "https://pluts.harmoniclabs.tech/docs/intro",
    getstarted: "/docs/get-started/plu-ts",
    tags: ["plutus", "javascript", "typescript", "serialization"],
  },
  {
    title: "cardanocli-pluts",
    description: "Wrapper of the cardano-cli tool based on the plu-ts offchain types",
    preview: require("./builder-tools/plu-ts.png"),
    website: "https://github.com/HarmonicLabs/cardanocli-pluts",
    getstarted: null,
    tags: ["javascript", "typescript", "serialization"],
  },
  {
    title: "koios-pluts",
    description: "Wrapper of the koios tool based on the plu-ts offchain types",
    preview: require("./builder-tools/plu-ts.png"),
    website: "https://github.com/HarmonicLabs/koios-pluts",
    getstarted: null,
    tags: ["javascript", "typescript", "serialization", "koios"],
  },
  {
    title: "Aiken",
    description: "A modern smart contract platform for Cardano.",
    preview: require("./builder-tools/aiken.png"),
    website: "https://aiken-lang.org",
    getstarted: "/docs/get-started/aiken",
    tags: ["favorite", "cli", "plutus", "aiken"],
  },
  {
    title: "Acca",
    description: "Aiken's utility library (extending standard library). It takes it's inspiration from libraries like Guava (Java) or Lodash (JavaScript). You can find in this library many missing functions, new data types (e.g. Either) also collections (e.g. HashTree, HashList, Stack, Binomial Heap).",
    preview: require("./builder-tools/acca.png"),
    website: "https://github.com/Cardano-Fans/acca",
    getstarted: null,
    tags: ["plutus", "aiken"],
  },
  {
    title: "Pix",
    description: "An NFT collection generator that is CIP-25 compliant",
    preview: require("./builder-tools/pix.png"),
    website: "https://github.com/txpipe/pix",
    getstarted: null,
    tags: ["cli", "nft"],
  },
  {
    title: "Cardano Signer",
    description: "Tool to sign data with a Cardano-Secret-Key and verify data with a Cardano-Public-Key",
    preview: require("./builder-tools/cardano-signer.png"),
    website: "https://github.com/gitmachtl/cardano-signer",
    getstarted: null,
    tags: ["operatortool", "cli", "json"],
  },
  {
    title: "Mesh SDK",
    description: "An Open-Source library by Martify Labs with the purpose of making building dApps on Cardano easier than ever. The Mesh library is engineered to simplify the development and implementation of blockchain technology, so you can focus on your project.",
    preview: require("./builder-tools/mesh.png"),
    website: "https://meshjs.dev/",
    getstarted: "/docs/get-started/mesh/overview",
    tags: ["javascript", "typescript", "serialization", "sdk", "plutus","favorite"]
  },
  {
    title: "Cexplorer",
    description: "Rich featured blockchain explorer with support of all testnet instances and an API.",
    preview: require("./builder-tools/cexplorer.png"),
    website: "https://cexplorer.io",
    getstarted: null,
    tags: ["operatortool"],
  },
  {
    title: "Koios Python",
    description: "Koios Python wrapper which allow interacting with all information and parameters stored on the Cardano blockchain.",
    preview: require("./builder-tools/koios-python.png"),
    website: "https://github.com/cardano-community/koios-python",
    getstarted: null,
    tags: ["koios", "python", "sdk"],
  },
  {
    title: "Cardano Leader Slot",
    description: "Lightweight and Portable Scheduled Blocks Checker for Next, Current and Previous Epochs.",
    preview: require("./builder-tools/leader-slot.png"),
    website: "https://github.com/QuixoteSystems/cardano-leader-slot",
    getstarted: null,
    tags: ["python", "operatortool", "cli"],
  },
  {
    title: "Cardano connect with wallet",
    description: "Useful hooks and React components to simplify the Cardano dApp integration e.g. to connect browser wallets, fetch addresses and provide signing.",
    preview: require("./builder-tools/cardano-connect-with-wallet.png"),
    website: "https://github.com/cardano-foundation/cardano-connect-with-wallet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "Frankenwallet",
    description: "An encrypted, air-gapped Linux bootable USB drive for Cardano transaction signing, sandboxed access to files on your main computer, and storage & backup of secure assets & documents.",
    preview: require("./builder-tools/frankenwallet.png"),
    website: "https://cosd.com/frankenwallet",
    getstarted: "/docs/operate-a-stake-pool/frankenwallet",
    tags: ["operatortool"],
  },
  {
    title: "cnft",
    description: "A library for validating metadata for the 721 metadatum property. Complies with community standards",
    preview: require("./builder-tools/cnft9000.png"),
    website: "https://github.com/ada9000/cnft#readme",
    getstarted: null,
    tags: ["javascript", "typescript", "nft"]
  },
  {
    title: "Bakrypt.io",
    description: "Bakrypt offers backend tools and Cloud storage services for brands, companies, and creators to help them build their NFTs.",
    preview: require("./builder-tools/bakrypt-io.png"),
    website: "https://bakrypt.io",
    getstarted: "https://bakrypt.readme.io",
    tags: ["nft", "http", "hosted"],
  },
  {
    title: "CARP (Cardano Postgres Indexer)",
    description: "A modular indexer for Cardano with an SQL Postgres backend.",
    preview: require("./builder-tools/carp.png"),
    website: "https://github.com/dcSpark/carp",
    getstarted: "https://dcspark.github.io/carp/docs/intro",
    tags: ["chainindex", "sql", "typescript"],
  },
  {
    title: "Pooldata.live",
    description:
      "Pooldata.live API provides a public Grafana datasource for pool operators with several operational metrics related to a stake pool.",
    preview: require("./builder-tools/pooldata-live.png"),
    website: "https://api.pooldata.live",
    getstarted: null,
    tags: ["operatortool", "http"],
  },
  {
    title: "Plutip",
    description: "Cardano tool that aims to help dApp developers with integration testing and contracts debugging using disposable private network",
    preview: require("./builder-tools/plutip.png"),
    website: "https://github.com/mlabs-haskell/plutip",
    getstarted: null,
    tags: ["haskell", "testing"],
  },
  {
    title: "Demeter.run",
    description: "A cloud environment with all the tools for building your dApp.",
    preview: require("./builder-tools/demeter.png"),
    website: "https://demeter.run/",
    getstarted: null,
    tags: ["favorite", "IDE", "hosted"],
  },
  {
    title: "Kogmios",
    description: "A Kotlin API library for interacting with Ogmios.",
    preview: require("./builder-tools/kogmios.png"),
    website: "https://github.com/projectNEWM/kogmios",
    getstarted: null,
    tags: ["ogmios", "sdk", "kotlin", "lowlevel"],
  },
  {
    title: "Cardano Verify Datasignature",
    description: "A lightweight typescript library to verify a cip30 datasignature.",
    preview: require("./builder-tools/cardano-verify-datasignature.png"),
    website: "https://github.com/cardano-foundation/cardano-verify-datasignature",
    getstarted: null,
    tags: ["typescript"],
  },
  {
    title: "Koios Api Python package",
    description: "The Koios Api python package allows interrogating the Cardano blockchain using https://api.koios.rest/. It has pagination and retry in case of errors.",
    preview: require("./builder-tools/koios-api-python.png"),
    website: "https://github.com/cardano-apexpool/koios-api-python",
    getstarted: null,
    tags: ["koios", "python", "sdk"],
  },
  {
    title: "Cardano Token Registry Python API",
    description: "A simple Python API for the Cardano Token Registry.",
    preview: require("./builder-tools/token-registry-api.png"),
    website: "https://github.com/cardano-apexpool/token-registry-api",
    getstarted: null,
    tags: ["python"],
  },
  {
    title: "Periodic DNS resolver",
    description: "System service to configure a DDNS address firewall rule on a BP and send a message via Telegram Bot if your relay IP address has changed. Keeps Cardano nodes connected and secure on residential ISPs with rolling public IPs.",
    preview: require("./builder-tools/pdr_bot.png"),
    website: "https://github.com/Fuma419/periodic-dns-resolver",
    getstarted: null,
    tags: ["operatortool", "cli"],
  },
  {
    title: "opshin",
    description:
      "A simple pythonic programming language for Smart Contracts on Cardano.",
    preview: require("./builder-tools/opshin.png"),
    website: "https://github.com/OpShin/opshin",
    getstarted: null,
    tags: ["python", "cli", "plutus"],
  },
  {
    title: "Koios Java Client",
    description: "A Java API library for interacting with Koios Server instances.",
    preview: require("./builder-tools/koios-java-client.png"),
    website: "https://github.com/cardano-community/koios-java-client",
    getstarted: null,
    tags: ["koios", "java", "sdk"],
  },
  {
    title: "Ogmios Java Client",
    description: "A Java API library for interacting with Ogmios.",
    preview: require("./builder-tools/ogmios-java-client.png"),
    website: "https://github.com/adabox-aio/ogmios-java-client",
    getstarted: null,
    tags: ["ogmios", "websocket", "java", "sdk"],
  },
  {
    title: "@dotare/cardano-delegation",
    description: "A delegation button that uses cip30 to improve the quality of life for developers and delegators.",
    preview: require("./builder-tools/dotare-cardano-delegation.png"),
    website: "https://www.npmjs.com/package/@dotare/cardano-delegation",
    getstarted: null,
    tags: ["http", "typescript", "javascript", "wallet", "serialization", "operatortool"],
  },
  {
    title: "DCOne Crypto Webhook API",
    description:"API for developers to receive information on changing stake balance.",
    preview: require("./builder-tools/dconecrypto-webhook.png"),
    website: "https://github.com/DCOneCrypto/StakeAddress-Tracking-Webhook-API",
    getstarted: null,
    tags: ["http"],
  },
  {
    title: "blockfrost-crystal",
    description: "A Crystal SDK for the Blockfrost.io API.",
    preview: require("./builder-tools/blockfrost-crystal.png"),
    website: "https://github.com/blockfrost/blockfrost-crystal",
    getstarted: null,
    tags: ["crystal", "sdk", "json"],
  },
  {
    title: "cardano-kit-crystal",
    description: "At toolkit for Crystal to ease development for the Cardano blockchain.",
    preview: require("./builder-tools/cardano-kit-crystal.png"),
    website: "https://github.com/wout/cardano-kit",
    getstarted: null,
    tags: ["crystal", "serialization"]
  },
  {
    title: "Maestro",
    description: "Fund, build & scale. The developer platform for Cardano.",
    preview: require("./builder-tools/maestro.png"),
    website: "https://gomaestro.org/",
    getstarted: "https://docs.gomaestro.org/",
    tags: ["http", "hosted"]
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

export const LanguagesOrTechnologiesTags = [
  "cli",
  "crystal",
  "golang",
  "haskell",
  "http",
  "java",
  "javascript",
  "json",
  "koios",
  "kotlin",
  "net",
  "ogmios",
  "purescript",
  "python",
  "redis",
  "rust",
  "sql",
  "typescript",
  "websocket",
];

export const DomainsTags = TagList.filter((tag) => {
  const others = LanguagesOrTechnologiesTags.concat("favorite");
  return !others.includes(tag);
});

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
    }
  }

  function checkOperatorTool() {
    const hasGetStarted = showcase.getstarted != null;
    const isOperatorTool = showcase.tags.includes("operatortool");

    if ((hasGetStarted && isOperatorTool) && !(typeof showcase.getstarted === "string" &&
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
