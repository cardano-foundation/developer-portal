/*
 * HOW TO ADD YOUR BUILDER TOOL:
 *
 * 1. Add image: Place PNG/JPG in src/data/builder-tools/your-tool-name.png
 * 2. Add entry: Copy format below, add to END of Showcases array
 * 3. Required fields:
 *    - title: "Your Tool Name"
 *    - description: "Brief description (avoid 'best/first/only' claims)"  
 *    - preview: require("./builder-tools/your-tool-name.png")
 *    - website: "https://your-tool.com"
 *    - getstarted: "https://docs.url" OR null
 *    - tags: ["relevant", "tags"] (see available tags below)
 * 4. Test: Run `yarn build` (must complete without errors)
 * 5. Submit: Create PR using "Add Builder Tool" template
 *
 */

import { sortBy, difference } from "../utils/jsUtils";

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

  // C
  c: {
    label: "C",
    description: "C language",
    icon: null,
    color: '#eca882',
  },

  // Chain Index
  indexer: {
    label: "Indexer",
    description:
      "Indexer for Cardano blockchain data",
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

  // Stake Pool Operator Tools
  operatortool: {
    label: "Operator Tool",
    description:
      "Stake pool operator tools.",
    icon: null,
    color: '#4267b2',
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

  // Elixir
  elixir: {
    label: "Elixir",
    description:
      "Elixir language",
    icon: null,
    color: '#4B275F',
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

  // Transaction Builder
  transactionbuilder: {
    label: "Transaction Builder",
    description:
      "Tools for building and submitting Cardano transactions",
    icon: null,
    color: "#16A085"
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

  // Governance
  governance: {
    label: "Governance",
    description: "Governance tools.",
    icon: null,
    color: '#673AB7',  // Deep Purple
  },

  // Scala
  scala: {
    label: "Scala",
    description: "Scala language",
    icon: null,
    color: "#2D79C7"
  },
  // Elm
  elm: {
    label: "Elm",
    description: "Elm language",
    icon: null,
    color: "#2D79C7"
  },
  // Smart Contract Languages
  smartcontracts: {
    label: "Smart Contracts",
    description: "Smart contracts",
    icon: null,
    color: "#2D79C7"
  },
  // PHP
  php: {
    label: "PHP",
    description: "PHP language",
    icon: null,
    color: "#777BB4"
  },
  // Provider
  provider: {
    label: "Provider",
    description: "Provider for Cardano blockchain data",
    icon: null,
    color: "#2D79C7"
  },
  // Node Client
  nodeclient: {
    label: "Node Client",
    description: "Node Client for Cardano blockchain data",
    icon: null,
    color: "#2D79C7"
  },
};

// Add your builder tool to (THE END OF) this list.
// Please don't add the "favorite"-tag yourself.
export const Showcases = [
  {
    title: "cardano-cli",
    description: "The companion command-line to interact with a Cardano node, manipulate addresses or create transactions.",
    preview: require("./builder-tools/cardano-cli.png"),
    website: "https://github.com/IntersectMBO/cardano-cli#overview-of-the-cardano-cli-repository",
    getstarted: null,
    tags: ["favorite", "cli", "transactionbuilder"]
  },
  {
    title: "bech32",
    description: "Convert to and from bech32 strings from the command-line. A simple and easy-to-use unix utility.",
    preview: require("./builder-tools/bech32.png"),
    website: "https://github.com/IntersectMBO/bech32/#readme",
    getstarted: null,
    tags: ["cli", "serialization"]
  },
  {
    title: "cardano-wallet",
    description: "An HTTP server and command-line for managing UTxOs and hierarchical deterministic wallets in Cardano.",
    preview: require("./builder-tools/cardano-wallet.png"),
    website: "https://github.com/cardano-foundation/cardano-wallet/#overview",
    getstarted: "https://cardano-foundation.github.io/cardano-wallet/",
    tags: ["http", "json", "wallet"]
  },
  {
    title: "cardano-graphql",
    description: "A cross-platform, typed, and queryable API for Cardano.",
    preview: require("./builder-tools/cardano-graphql.png"),
    website: "https://github.com/cardano-foundation/cardano-graphql/#overview",
    getstarted: "https://github.com/cardano-foundation/cardano-graphql#getting-started",
    tags: ["indexer", "http"]
  },
  {
    title: "cardano-rosetta-java",
    description: "A lightweight Java implementation of the Mesh (formerly Rosetta) API for Cardano, built on Yaci-store for reduced resource footprint.",
    preview: require("./builder-tools/cardano-rosetta-java.png"),
    website: "https://github.com/cardano-foundation/cardano-rosetta-java",
    getstarted: "https://cardano-foundation.github.io/cardano-rosetta-java/",
    tags: ["http", "json", "java"]
  },
  {
    title: "cardano-db-sync",
    description: "A PostgreSQL database layer which stores all data from the Cardano blockchain in a structured  and normalized way.",
    preview: require("./builder-tools/cardano-db-sync.png"),
    website: "https://github.com/IntersectMBO/cardano-db-sync#cardano-db-sync",
    getstarted: null,
    tags: ["indexer", "sql"]
  },
  {
    title: "cardano-addresses",
    description: "A command-line utility and library for manipulating addresses, keys and recovery phrases on Cardano.",
    preview: require("./builder-tools/cardano-addresses.png"),
    website: "https://github.com/IntersectMBO/cardano-addresses#overview",
    getstarted: "https://github.com/IntersectMBO/cardano-addresses#command-line",
    tags: ["cli", "serialization"]
  },
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./builder-tools/blockfrost.png"),
    website: "https://blockfrost.io",
    getstarted: "/docs/get-started/blockfrost/get-started/",
    tags: ["favorite", "http", "json", "hosted", "provider"],
  },
  {
    title: "StakePool Operator Scripts",
    description: "CLI scripts to manage your stake pool (online or offline), use and migrate to hardware wallets, send transactions with messages, register for Catalyst, mint/burn Tokens, generate the Token Registry, and more.",
    preview: require("./builder-tools/spo-scripts-gitmachtl.png"),
    website: "https://github.com/gitmachtl/scripts",
    getstarted: null,
    tags: ["operatortool", "cli"],
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
    tags: ["purescript", "transactionbuilder"]
  },
  {
    title: "cardanocli-js",
    description: "A library that wraps the cardano-cli in JavaScript.",
    preview: require("./builder-tools/cardanocli-js.png"),
    website: "https://github.com/Berry-Pool/cardanocli-js",
    getstarted: "/docs/get-started/cardanocli-js",
    tags: ["javascript", "cli"],
  },
  {
    title: "Ogmios",
    description: "Ogmios is a lightweight bridge interface (WebSocket + JSON/RPC) for cardano-node.",
    preview: require("./builder-tools/ogmios.png"),
    website: "https://ogmios.dev",
    getstarted: "/docs/get-started/ogmios",
    tags: ["favorite", "websocket", "json", "nodeclient"],
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./builder-tools/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    getstarted: null,
    tags: ["java", "transactionbuilder"],
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
    title: "cardano-wallet-js",
    description: "A JavaScript SDK for Cardano Wallet with a extra functionalities. You can use it as a client for the official cardano-wallet and also to create Native Tokens and NFTs.",
    preview: require("./builder-tools/cardano-wallet-js.png"),
    website: "https://github.com/tango-crypto/cardano-wallet-js",
    getstarted: "/docs/get-started/cardano-wallet-js",
    tags: ["javascript", "wallet"]
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./builder-tools/cardanosharp.png"),
    website: "https://www.cardanosharp.com",
    getstarted: "/docs/get-started/cardanosharp-wallet",
    tags: ["net", "transactionbuilder"],
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
    title: "Marlowe",
    description: "Marlowe is a domain-specific language (DSL) that enables users to create blockchain applications that are specifically designed for financial contracts.",
    preview: require("./builder-tools/marlowe.png"),
    website: "https://marlowe-lang.org/",
    getstarted: "https://playground.marlowe-lang.org/",
    tags: ["smartcontracts"],
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
    title: "PyCardano",
    description:
      "A Cardano library written in Python. It allows users to build and sign transactions without depending on other Cardano serialization tools (such as cardano-cli and cardano-serialization-lib), making it a lightweight library that is easy and fast to set up in all kinds of environments.",
    preview: require("./builder-tools/pycardano.png"),
    website: "https://github.com/Python-Cardano/pycardano",
    getstarted: "https://pycardano.readthedocs.io/en/latest",
    tags: ["python", "transactionbuilder"],
  },
  {
    title: "Oura",
    description:
      "Oura is a rust-native implementation of a pipeline that connects to the tip of a Cardano node through a combination of Ouroboros mini-protocol, filters the events that match a particular pattern and then submits a succint, self-contained payload to pluggable observers called 'sinks'.",
    preview: require("./builder-tools/oura.png"),
    website: "https://github.com/txpipe/oura",
    getstarted: null,
    tags: ["rust", "nodeclient"],
  },
  {
    title: "Typhonjs",
    description:
      "A pure javascript Cardano transaction builder library.",
    preview: require("./builder-tools/typhonjs.jpg"),
    website: "https://github.com/StricaHQ/typhonjs",
    getstarted: null,
    tags: ["javascript", "transactionbuilder"],
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
    tags: ["operatortool", "hosted"],
  },
  {
    title: "Koios",
    description: "Elastic light/full-mode API query-layer for Cardano Blockchain.",
    preview: require("./builder-tools/koios.png"),
    website: "https://koios.rest",
    getstarted: "/docs/get-started/koios",
    tags: ["http", "json", "hosted", "provider"],
  },
  {
    title: "Pallas",
    description: "Rust-native building blocks for the Cardano blockchain ecosystem.",
    preview: require("./builder-tools/pallas.png"),
    website: "https://github.com/txpipe/pallas#readme",
    getstarted: null,
    tags: ["rust", "serialization"]
  },
  {
    title: "Scrolls",
    description: "Read-optimized cache of Cardano on-chain entities.",
    preview: require("./builder-tools/scrolls.png"),
    website: "https://github.com/txpipe/scrolls#readme",
    getstarted: null,
    tags: ["indexer", "redis"]
  },
  {
    title: "Kupo",
    description: "A lightweight & configurable chain-index for Cardano.",
    preview: require("./builder-tools/kupo.png"),
    website: "https://github.com/CardanoSolutions/kupo#readme",
    getstarted: null,
    tags: ["indexer", "http", "json"]
  },
  {
    title: "cardano-multiplatform-lib",
    description: "A library of utilities and codecs for serialization/deserialization of core data-stuctures. Replacement for 'cardano-serialization-lib'.",
    preview: require("./builder-tools/cardano-multiplatform-lib.png"),
    website: "https://github.com/dcSpark/cardano-multiplatform-lib#cardano-multiplatform-lib",
    getstarted: null,
    tags: ["rust", "serialization"]
  },
  {
    title: "cardano-js-sdk",
    description: "JavaScript SDK for interacting with Cardano, providing various key management options, with support for popular hardware wallets",
    preview: require("./builder-tools/cardano-js-sdk.png"),
    website: "https://github.com/input-output-hk/cardano-js-sdk/#readme",
    getstarted: null,
    tags: ["transactionbuilder", "javascript"]
  },
  {
    title: "Lucid",
    description: "Lucid is a library, which allows you to create Cardano transactions and off-chain code for your Plutus contracts in JavaScript and Node.js.",
    preview: require("./builder-tools/lucid.png"),
    website: "https://github.com/Berry-Pool/lucid#readme",
    getstarted: "https://lucid.spacebudz.io/docs/getting-started/choose-wallet/",
    tags: ["typescript", "transactionbuilder"]
  },
  {
    title: "Plutarch",
    description: "Plutarch is a typed eDSL in Haskell for writing efficient Plutus Core validators.",
    preview: require("./builder-tools/plutarch.png"),
    website: "https://github.com/Plutonomicon/plutarch#plutarch",
    getstarted: null,
    tags: ["smartcontracts", "haskell"]
  },
  {
    title: "gOuroboros",
    description: "Golang implementation of the Cardano Ouroboros network protocol.",
    preview: require("./builder-tools/gOuroboros.png"),
    website: "https://github.com/blinklabs-io/gouroboros",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/gouroboros",
    tags: ["golang", "nodeclient"],
  },
  {
    title: "Adder",
    description: "A tool for tailing the Cardano blockchain and emitting events for each block and transaction seen, based on user configurable filters.",
    preview: require("./builder-tools/adder.png"),
    website: "https://github.com/blinklabs-io/adder",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/adder",
    tags: ["cli", "golang", "nodeclient"],
  },
  {
    title: "Cardano Node API",
    description: "An HTTP API for interfacing with a local Cardano Node and providing the node internal data for HTTP clients.",
    preview: require("./builder-tools/cardano-node-api.png"),
    website: "https://github.com/blinklabs-io/cardano-node-api",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/cardano-node-api",
    tags: ["http", "golang", "json", "websocket", "nodeclient"],
  },
  {
    title: "HeliosLang",
    description: "A DSL for writing Cardano Smart Contracts. Reference compiler is a single Javascript file without dependencies.",
    preview: require("./builder-tools/helioslang.png"),
    website: "https://github.com/Hyperion-BT/Helios",
    getstarted: null,
    tags: ["javascript", "smartcontracts"],
  },
  {
    title: "Pebble",
    description: "Pebble is a strongly-typed domain-specific language (DSL) for writing Cardano smart contracts. A simple, yet rock solid, functional language with an imperative bias, targeting UPLC.",
    preview: require("./builder-tools/plu-ts.png"),
    website: "https://pluts.harmoniclabs.tech/",
    getstarted: "/docs/get-started/plu-ts",
    tags: ["smartcontracts", "typescript"],
  },
  {
    title: "Aiken",
    description: "A modern smart contract platform for Cardano.",
    preview: require("./builder-tools/aiken.png"),
    website: "https://aiken-lang.org",
    getstarted: "/docs/get-started/aiken",
    tags: ["favorite", "smartcontracts"],
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
    title: "Mesh",
    description: "A feature-complete, open-source TypeScript SDK and off-chain framework including wallet integration, transaction building, a smart contract library, third-party API integration, and UI components: with thorough documentation and live demos for all skill levels.",
    preview: require("./builder-tools/mesh.png"),
    website: "https://meshjs.dev/",
    getstarted: "/docs/get-started/mesh/overview",
    tags: ["favorite", "typescript", "transactionbuilder"]
  },
  {
    title: "UTXOS Web3 Services",
    description: "UTXOS is a suite of tools and services that aim to simplify the onboarding experience for users and businesses to adopt Cardano.",
    preview: require("./builder-tools/utxos.png"),
    website: "https://utxos.dev/",
    getstarted: "/docs/get-started/utxos/overview",
    tags: ["hosted", "http", "wallet", "typescript"]
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
    website: "https://frankenwallet.com",
    getstarted: "/docs/operate-a-stake-pool/frankenwallet",
    tags: ["operatortool"],
  },
  {
    title: "CARP (Cardano Postgres Indexer)",
    description: "A modular indexer for Cardano with an SQL Postgres backend.",
    preview: require("./builder-tools/carp.png"),
    website: "https://github.com/dcSpark/carp",
    getstarted: "https://dcspark.github.io/carp/docs/intro",
    tags: ["indexer", "sql"],
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
    title: "Cardano Verify Datasignature",
    description: "A lightweight typescript library to verify a cip30 datasignature.",
    preview: require("./builder-tools/cardano-verify-datasignature.png"),
    website: "https://github.com/cardano-foundation/cardano-verify-datasignature",
    getstarted: null,
    tags: ["typescript"],
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
    title: "OpShin",
    description:
      "Opshin is a pythonic language for writing smart contracts on the Cardano blockchain. Opshin is a strict subset of Python, this means anyone who knows Python can get up to speed on Opshin pretty quickly.",
    preview: require("./builder-tools/opshin.png"),
    website: "https://github.com/OpShin/opshin",
    getstarted: "https://opshin.dev/user-manual",
    tags: ["python", "smartcontracts"],
  },
  {
    title: "DCOne Crypto Webhook API",
    description: "API for developers to receive information on changing stake balance.",
    preview: require("./builder-tools/dconecrypto-webhook.png"),
    website: "https://github.com/DCOneCrypto/StakeAddress-Tracking-Webhook-API",
    getstarted: null,
    tags: ["http"],
  },
  {
    title: "Maestro",
    description: "Blockchain indexer, APIs and event management system for the Cardano blockchain.",
    preview: require("./builder-tools/maestro.png"),
    website: "https://www.gomaestro.org/dapp-platform",
    getstarted: "https://docs.gomaestro.org/",
    tags: ["http", "hosted", "provider"]
  },
  {
    title: "potential-robot",
    description: "A TypeScript API for test-driven development with Helios.",
    preview: require("./builder-tools/potential-robot.png"),
    website: "https://github.com/aleeusgr/potential-robot",
    getstarted: null,
    tags: ["typescript", "testing"]
  },
  {
    title: "Hydra",
    description: "Hydra is the layer-two scalability solution for Cardano, which aims to increase the speed of transactions (low latency, high throughput) and minimize transaction cost.",
    preview: require("./builder-tools/hydra.png"),
    website: "https://hydra.family/head-protocol/",
    getstarted: "https://hydra.family/head-protocol/docs/getting-started",
    tags: ["haskell"]
  },
  {
    title: "NFTCDN",
    description: "Display all Cardano NFTs effortlessly & efficiently on your website/app using the low-code & high-speed NFTCDN service.",
    preview: require("./builder-tools/nftcdn.png"),
    website: "https://nftcdn.io",
    getstarted: null,
    tags: ["nft", "http", "hosted"]
  },
  {
    title: "Atlas",
    description:
      "Atlas is an all-in-one, Haskell-native application backend for writing off-chain code for on-chain Plutus smart contracts.",
    preview: require("./builder-tools/atlas.jpg"),
    website: "https://atlas-app.io/",
    getstarted: null,
    tags: ["haskell", "transactionbuilder"],
  },
  {
    title: "NFT Vending Machine",
    description: "A simple CNFT mint-and-vend machine Python library that leverages cardano-cli and Blockfrost.",
    preview: require("./builder-tools/nft-vending-machine.png"),
    website: "https://github.com/thaddeusdiamond/cardano-nft-vending-machine",
    getstarted: null,
    tags: ["python", "nft"]
  },
  {
    title: "Yaci DevKit",
    description: "Create your own local Cardano devnet with ease! It includes an Indexer, minimal Explorer interface, and support for Cardano Client Lib or Lucid JS library's Blockfrost provider.",
    preview: require("./builder-tools/yaci-devkit.png"),
    website: "https://github.com/bloxbean/yaci-devkit",
    getstarted: null,
    tags: ["cli", "testing"]
  },
  {
    title: "whisky",
    description: "This is a library for building off-chain code on Cardano. It is a cardano-cli like wrapper on cardano-serialization-lib (equivalent on MeshJS's lower level APIs), supporting serious DApps' backend on rust codebase.",
    preview: require("./builder-tools/whisky.png"),
    website: "https://github.com/sidan-lab/whisky",
    getstarted: "https://whisky.sidan.io/",
    tags: ["rust", "transactionbuilder"]
  },
  {
    title: "UTxORPC",
    description: "UTxORPC (u5c for short) is a gRPC interface for UTxO Blockchains, Interact with UTxO-based blockchains using a shared specification with focus on developer experience and performance.",
    preview: require("./builder-tools/u5c.png"),
    website: "https://utxorpc.org/",
    getstarted: "https://utxorpc.org/introduction",
    tags: ["http", "json", "websocket", "provider"]
  },
  {
    title: "Mumak",
    description: "A custom PostgreSQL extension to interact with Cardano CBOR data directly.",
    preview: require("./builder-tools/mumak.png"),
    website: "https://github.com/txpipe/mumak",
    getstarted: "https://github.com/txpipe/mumak/blob/main/docs/INSTALL.md",
    tags: ["serialization", "sql"]
  },
  {
    title: "Pallas.Dotnet",
    description: "Pallas.DotNet is a .NET wrapper around the Pallas Rust library, which provides building blocks for the Cardano blockchain ecosystem. This library allows .NET developers to access the functionality of Pallas in a seamless and straightforward manner.",
    preview: require("./builder-tools/pallas-dotnet.png"),
    website: "https://github.com/SAIB-Inc/Pallas.Dotnet",
    getstarted: null,
    tags: ["net", "serialization"]
  },
  {
    title: "Argus | Cardano.Sync",
    description: "Argus | Cardano.Sync is a .NET library that simplifies interactions with the Cardano blockchain by providing an efficient indexing framework. ",
    preview: require("./builder-tools/argus.png"),
    website: "https://github.com/SAIB-Inc/Cardano.Sync",
    getstarted: null,
    tags: ["net", "indexer"]
  },
  {
    title: "NFT Playground",
    description: "An integrated development environment for building CIP54-compliant Smart NFTs.",
    preview: require("./builder-tools/nft-playground.png"),
    website: "https://nft-playground.dev/",
    getstarted: "https://nft-playground.dev/help",
    tags: ["IDE", "hosted", "nft", "javascript"]
  },
  {
    title: "Cardano Audit Script for SPOs",
    description: "A security and compliance audit script for Cardano stakepool nodes, to help SPOs check their node and security configuration.",
    preview: require("./builder-tools/cardano-node-audit.png"),
    website: "https://github.com/Kirael12/cardano-node-audit",
    getstarted: "/docs/operate-a-stake-pool/audit-your-node",
    tags: ["operatortool", "cli"]
  },
  {
    title: "ZhuLi",
    description: "A validator & companion command-line tool to provide hot/cold account management to delegate representatives (a.k.a DReps) on Cardano. The on-chain validator provides an authentication mechanism for an administrator multisig script (m-of-n type), itself granting powers to multisig-like delegate to manage voting stake rights.",
    preview: require("./builder-tools/zhuli.jpg"),
    website: "https://github.com/CardanoSolutions/zhuli",
    getstarted: null,
    tags: ["cli", "governance"]
  },
  {
    title: "cf-java-rewards-calculation",
    description: "This project aims to achieve multiple goals: re-implement Cardano ledger rules for calculating ada pots and rewards, validate Cardano's rewards calculation through an alternative implementation of the ledger specification, provide a library for use in other projects (like yaci-store) independent of DB Sync, and offer insights into protocol parameters and ada flow through interactive reports.",
    preview: require("./builder-tools/rewardcalc.jpg"),
    website: "https://github.com/cardano-foundation/cf-java-rewards-calculation",
    getstarted: null,
    tags: ["java", "testing"]
  },
  {
    title: "cf-ledger-sync",
    description: "This repository provides applications for indexing Cardano blockchain data into a PostgreSQL database, scheduling jobs, and streaming blockchain events to messaging systems like Kafka or RabbitMQ, offering flexible data management and customization options.",
    preview: require("./builder-tools/ledgersync.jpg"),
    website: "https://github.com/cardano-foundation/cf-ledger-sync",
    getstarted: null,
    tags: ["java", "indexer"]
  },
  {
    title: "CFD: Cardano Fast Deployment tool",
    description: "CFD simplifies and accelerates Cardano software deployment, stake pool management, software updates, and secure key handling, including GPG keychain integration and automated encryption, all with minimal user effort.",
    preview: require("./builder-tools/cfd.png"),
    website: "https://github.com/cardano-community/cfd",
    getstarted: null,
    tags: ["cli", "operatortool"]
  },
  {
    title: "pg_cardano",
    description: "A PostgreSQL extension providing a suite of Cardano-related tools, including cryptographic functions, address encoding/decoding, and blockchain data processing.",
    preview: require("./builder-tools/pg_cardano.png"),
    website: "https://github.com/cardano-community/pg_cardano",
    getstarted: "https://github.com/cardano-community/pg_cardano/blob/master/README.md#contents",
    tags: ["serialization", "sql"]
  },
  {
    title: "Cardano-C",
    description: "A pure C library for interacting with the Cardano blockchain. Compliant with MISRA standards and binding-friendly architecture.",
    preview: require("./builder-tools/cardano-c.png"),
    website: "https://github.com/Biglup/cardano-c",
    getstarted: "https://cardano-c.readthedocs.io/en/latest/getting_started.html",
    tags: ["c", "serialization"]
  },
  {
    title: "Evolution SDK",
    description:
      "Highly scalable, production-ready transaction builder & off-chain framework for users and dApps",
    preview: require("./builder-tools/evolution-sdk.png"),
    website: "https://no-witness-labs.github.io/evolution-sdk/",
    getstarted:
      "https://no-witness-labs.github.io/evolution-sdk/install",
    tags: ["typescript", "transactionbuilder"],
  },
  {
    title: "Scalus",
    description: "Scalus is a development platform for building decentralized applications (DApps) on the Cardano blockchain. It provides a unified environment where developers can write both on-chain smart contracts and off-chain logic using Scala 3 - a modern, expressive, and type-safe functional programming language.",
    preview: require("./builder-tools/scalus.png"),
    website: "https://scalus.org/",
    getstarted: "https://scalus.org/docs/get-started",
    tags: ["scala", "transactionbuilder", "smartcontracts"]
  },
  {
    title: "Lace Anatomy",
    description: "Renders transactions from CBOR and transaction hashes, providing a graphical representation of blockchain data for developers and analysts. Includes dissect functionality that breaks down CBOR structures for debugging and troubleshooting low-level Cardano transactions.",
    preview: require("./builder-tools/lace-anatomy.png"),
    website: "https://laceanatomy.com",
    getstarted: "https://laceanatomy.com",
    tags: ["testing"]
  },
  {
    title: "Gastronomy",
    description: "A powerful UPLC debugger that lets you step through UPLC execution, travel backwards in time, and map directly to smart contract source code making complex debugging simple and intuitive.",
    preview: require("./builder-tools/gastronomy.png"),
    website: "https://sundae.fi/products/gastronomy",
    getstarted: "https://github.com/SundaeSwap-finance/gastronomy",
    tags: ["testing"]
  },
  {
    title: "Datum Explorer",
    description: "Designed to decode, understand, and build with CBOR data. The tool simplifies working with CBOR by leveraging schema definitions to provide a more human-readable and structured representation of the data.",
    preview: require("./builder-tools/datum-explorer.png"),
    website: "https://github.com/WingRiders/datum-explorer#readme",
    getstarted: "https://datum-explorer.wingriders.com/?schema=detect",
    tags: ["typescript", "cli", "serialization", "hosted"]
  },
  {
    title: "Apollo",
    description: "Building blocks for serialization and pure Golang development: a layer to interact with the Cardano Node including providers for commonly used services.",
    preview: require("./builder-tools/apollo.png"),
    website: "https://github.com/Salvionied/apollo",
    getstarted: null,
    tags: ["golang", "serialization"]
  },
  {
    title: "Weld Wallet Connector",
    description:
      "Manage wallet connections across multiple blockchains using a single intuitive interface",
    preview: require("./builder-tools/weld.png"),
    website: "https://github.com/Cardano-Forge/weld/",
    getstarted:
      "https://github.com/Cardano-Forge/weld/tree/main/documentation/",
    tags: ["typescript", "wallet"],
  },
  {
    title: "Elm Cardano",
    description: "Elm offchain package for Cardano. This project aims to be the friendliest and most productive way of handling an offchain Cardano frontend. It should be a perfect match to Aiken for onchain code.",
    preview: require("./builder-tools/elm-cardano.png"),
    website: "https://github.com/elm-cardano/elm-cardano",
    getstarted: "https://elm-doc-preview.netlify.app/Cardano-TxIntent?repo=elm-cardano%2Felm-cardano&version=elm-doc-preview",
    tags: ["elm", "transactionbuilder"],
  },
  {
    title: "Blaze",
    description: "Blaze is a library, which allows you to create Cardano transactions and off-chain code for your Aiken contracts in JavaScript.",
    preview: require("./builder-tools/blaze.png"),
    website: "https://github.com/butaneprotocol/blaze-cardano",
    getstarted: "https://blaze.butane.dev/",
    tags: ["javascript", "transactionbuilder"],
  },
  {
    title: "Kuber",
    description: "Haskell library and API server for composing balanced Cardano transactions.",
    preview: require("./builder-tools/kuber.png"),
    website: "https://github.com/dQuadrant/kuber",
    getstarted: "https://kuberide.com/",
    tags: ["haskell", "transactionbuilder"],
  },
  {
    title: "Sorbet",
    description: "A mock wallet implementation for testing out different products as if you were the user.",
    preview: require("./builder-tools/sorbet.png"),
    website: "https://github.com/SundaeSwap-finance/Sorbet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "p2p-wallet",
    description: "A fully p2p desktop Cardano wallet with builtin DeFi support, and a transaction builder for executing multiple actions in one transaction.",
    preview: require("./builder-tools/p2p-wallet.png"),
    website: "https://github.com/fallen-icarus/p2p-wallet",
    getstarted: null,
    tags: ["haskell", "wallet"],
  },
  {
    title: "Cardano Dev Wallet",
    description: "A desktop wallet for Cardano development. It allows you to test your smart contracts and transactions without having to use a full node.",
    preview: require("./builder-tools/cardano-dev-wallet.png"),
    website: "https://github.com/mlabs-haskell/cardano-dev-wallet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "Bursa",
    description: "A programmatic Cardano Wallet",
    preview: require("./builder-tools/bursa.png"),
    website: "https://github.com/blinklabs-io/bursa",
    getstarted: null,
    tags: ["golang", "wallet"],
  },
  {
    title: "CShell",
    description: "A Cardano wallet built for developers and power users.",
    preview: require("./builder-tools/cshell.png"),
    website: "https://github.com/txpipe/cshell",
    getstarted: null,
    tags: ["cli", "wallet"],
  },
  {
    title: "Cardano HW CLI",
    description: "Cardano CLI tool for hardware wallets.",
    preview: require("./builder-tools/cardano-hw-cli.png"),
    website: "https://github.com/vacuumlabs/cardano-hw-cli",
    getstarted: null,
    tags: ["cli", "wallet"],
  },
  {
    title: "Cardanopress",
    description: "Cardano & WordPress plugin integration",
    preview: require("./builder-tools/cardanopress.png"),
    website: "https://cardanopress.io/",
    getstarted: "https://github.com/CardanoPress/cardanopress",
    tags: ["php", "wallet"],
  },
  {
    title: "Cardano Peer Connect",
    description: "This library aims to provide simple interfaces to implement CIP-0045 (WebRTC communication) for dApps and wallets",
    preview: require("./builder-tools/cardano-peer-connect.png"),
    website: "https://github.com/fabianbormann/cardano-peer-connect",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "NMKR Studio",
    description: "NMKR Studio is a comprehensive platform for Cardano NFT management, built with C# and .NET 8.0. The project provides a complete solution for minting, burning, and managing NFTs on the Cardano blockchain.",
    preview: require("./builder-tools/nmkr-studio.png"),
    website: "https://github.com/nftmakerio/NMKR-Studio",
    getstarted: null,
    tags: ["net", "nft"],
  },
  {
    title: "Yaci Store",
    description: "aci Store is a modular, high-performance Cardano blockchain indexer and datastore that provides a flexible foundation for building blockchain applications. Built on top of the Yaci library, it offers both out-of-the-box functionality and extensive customization options through its plugin framework.",
    preview: require("./builder-tools/yaci-store.png"),
    website: "https://github.com/bloxbean/yaci-store",
    getstarted: "https://store.yaci.xyz/docs/intro",
    tags: ["indexer", "java"],
  }
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
  "c",
  "golang",
  "haskell",
  "java",
  "javascript",
  "kotlin",
  "net",
  "php",
  "purescript",
  "python",
  "redis",
  "rust",
  "scala",
  "sql",
  "elm",
  "elixir",
  "typescript",
  "http",
  "websocket",
  "json",
];

export const DomainsTags = [
  "smartcontracts",
  "transactionbuilder",
  "nft",
  "testing",
  "provider",
  "indexer",
  "wallet",
  "serialization",
  "nodeclient",
  "IDE",
  "hosted",
  "operatortool",
  "governance",
  
  
];

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
