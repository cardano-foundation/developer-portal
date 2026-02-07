/*
 * ============================================================================
 * HOW TO ADD YOUR BUILDER TOOL
 * ============================================================================
 *
 * 1. Add image: Place PNG/JPG in src/data/builder-tools/images/your-tool-name.png
 *
 * 2. Add entry: Copy the template below and add to END of Showcases array
 *
 *    {
 *      title: "Your Tool Name",
 *      description: "Brief description (avoid 'best/first/only' claims)",
 *      preview: require("./images/your-tool-name.png"),
 *      website: "https://your-tool.com",
 *      getstarted: "https://docs.url" OR null,
 *      tags: ["tag1", "tag2"]  // See tags.js for all available tags
 *    },
 *
 * 3. Test: Run `yarn build` (must complete without errors)
 *
 * 4. Submit: Create PR using "Add Builder Tool" template
 *
 * Notes:
 *  - Do NOT add "favorite" tag (maintainers choose favorites)
 *  - Available tags are in ./tags.js
 *  - All fields are required (use null for getstarted if no docs)
 *
 * ============================================================================
 */

export const Showcases = [
  {
    title: "cardano-cli",
    description: "The companion command-line to interact with a Cardano node, manipulate addresses or create transactions.",
    preview: require("./images/cardano-cli.png"),
    website: "https://github.com/IntersectMBO/cardano-cli#overview-of-the-cardano-cli-repository",
    getstarted: null,
    tags: ["favorite", "cli", "transactionbuilder"]
  },
  {
    title: "bech32",
    description: "Convert to and from bech32 strings from the command-line. A simple and easy-to-use unix utility.",
    preview: require("./images/bech32.png"),
    website: "https://github.com/IntersectMBO/bech32/#readme",
    getstarted: null,
    tags: ["cli", "serialization"]
  },
  {
    title: "cardano-wallet",
    description: "An HTTP server and command-line for managing UTxOs and hierarchical deterministic wallets in Cardano.",
    preview: require("./images/cardano-wallet.png"),
    website: "https://github.com/cardano-foundation/cardano-wallet/#overview",
    getstarted: "https://cardano-foundation.github.io/cardano-wallet/",
    tags: ["http", "json", "wallet"]
  },
  {
    title: "cardano-graphql",
    description: "A cross-platform, typed, and queryable API for Cardano.",
    preview: require("./images/cardano-graphql.png"),
    website: "https://github.com/cardano-foundation/cardano-graphql/#overview",
    getstarted: "https://github.com/cardano-foundation/cardano-graphql#getting-started",
    tags: ["indexer", "http"]
  },
  {
    title: "cardano-rosetta-java",
    description: "A lightweight Java implementation of the Mesh (formerly Rosetta) API for Cardano, built on Yaci-store for reduced resource footprint.",
    preview: require("./images/cardano-rosetta-java.png"),
    website: "https://github.com/cardano-foundation/cardano-rosetta-java",
    getstarted: "https://cardano-foundation.github.io/cardano-rosetta-java/",
    tags: ["http", "json", "java"]
  },
  {
    title: "cardano-db-sync",
    description: "A PostgreSQL database layer which stores all data from the Cardano blockchain in a structured  and normalized way.",
    preview: require("./images/cardano-db-sync.png"),
    website: "https://github.com/IntersectMBO/cardano-db-sync#cardano-db-sync",
    getstarted: null,
    tags: ["indexer", "sql"]
  },
  {
    title: "cardano-addresses",
    description: "A command-line utility and library for manipulating addresses, keys and recovery phrases on Cardano.",
    preview: require("./images/cardano-addresses.png"),
    website: "https://github.com/IntersectMBO/cardano-addresses#overview",
    getstarted: "https://github.com/IntersectMBO/cardano-addresses#command-line",
    tags: ["cli", "serialization"]
  },
  {
    title: "Blockfrost",
    description: "Instant and scalable API to the Cardano blockchain.",
    preview: require("./images/blockfrost.png"),
    website: "https://blockfrost.io",
    getstarted: "/docs/get-started/blockfrost/get-started/",
    tags: ["favorite", "http", "json", "hosted", "provider"],
  },
  {
    title: "StakePool Operator Scripts",
    description: "CLI scripts to manage your stake pool (online or offline), use and migrate to hardware wallets, send transactions with messages, register for Catalyst, mint/burn Tokens, generate the Token Registry, and more.",
    preview: require("./images/spo-scripts-gitmachtl.png"),
    website: "https://github.com/gitmachtl/scripts",
    getstarted: null,
    tags: ["operatortool", "cli"],
  },
  {
    title: "Cardano Serialization Library",
    description:
      "Library for serialization & deserialization of data structures used in Cardano's Haskell implementation.",
    preview: require("./images/cardano-serialization-lib.png"),
    website: "https://github.com/Emurgo/cardano-serialization-lib",
    getstarted: "/docs/get-started/cardano-serialization-lib/overview",
    tags: ["serialization", "rust"],
  },
  {
    title: "Cardano Transaction Library",
    description: "A Purescript library for building smart contract transactions on Cardano (NodeJS & the browser)",
    preview: require("./images/cardano-transaction-lib.png"),
    website: "https://github.com/Plutonomicon/cardano-transaction-lib/",
    getstarted: "https://github.com/Plutonomicon/cardano-transaction-lib/blob/develop/doc/getting-started.md",
    tags: ["purescript", "transactionbuilder"]
  },
  {
    title: "cardanocli-js",
    description: "A library that wraps the cardano-cli in JavaScript.",
    preview: require("./images/cardanocli-js.png"),
    website: "https://github.com/Berry-Pool/cardanocli-js",
    getstarted: "/docs/get-started/cardanocli-js",
    tags: ["javascript", "cli"],
  },
  {
    title: "Ogmios",
    description: "Ogmios is a lightweight bridge interface (WebSocket + JSON/RPC) for cardano-node.",
    preview: require("./images/ogmios.png"),
    website: "https://ogmios.dev",
    getstarted: "/docs/get-started/ogmios",
    tags: ["favorite", "websocket", "json", "nodeclient"],
  },
  {
    title: "Cardano Client Library",
    description:
      "A client library for Cardano in Java. For some features like transaction signing and address generation, it currently uses cardano-serialization-lib rust library though JNI.",
    preview: require("./images/cardano-client-lib.png"),
    website: "https://github.com/bloxbean/cardano-client-lib",
    getstarted: null,
    tags: ["java", "transactionbuilder"],
  },
  {
    title: "cardano-addresses TypeScript binding",
    description: "This is a Typescript/Javascript version of the cardano-addresses API. It includes a web demo.",
    preview: require("./images/cardano-addresses-typescript-binding.png"),
    website: "https://www.npmjs.com/package/cardano-addresses",
    getstarted: null,
    tags: ["typescript", "serialization"],
  },
  {
    title: "cardano-wallet-js",
    description: "A JavaScript SDK for Cardano Wallet with a extra functionalities. You can use it as a client for the official cardano-wallet and also to create Native Tokens and NFTs.",
    preview: require("./images/cardano-wallet-js.png"),
    website: "https://github.com/tango-crypto/cardano-wallet-js",
    getstarted: "/docs/get-started/cardano-wallet-js",
    tags: ["javascript", "wallet"]
  },
  {
    title: "CardanoSharp Wallet",
    description:
      "CardanoSharp Wallet is a .NET library for Creating/Managing Wallets and Building/Signing Transactions.",
    preview: require("./images/cardanosharp.png"),
    website: "https://www.cardanosharp.com",
    getstarted: "/docs/get-started/cardanosharp-wallet",
    tags: ["net", "transactionbuilder"],
  },
  {
    title: "Guild Operators Suite",
    description: "A collection of tools (CNTools, gLiveView, topologyUpdater and more) to simplify typical operations to help community simplify wallet keys, pool management and interact with blockchain.",
    preview: require("./images/guild-operators.png"),
    website: "https://cardano-community.github.io/guild-operators/",
    getstarted: "/docs/operate-a-stake-pool/guild-ops-suite",
    tags: ["favorite", "operatortool"],
  },
  {
    title: "Marlowe",
    description: "Marlowe is a domain-specific language (DSL) that enables users to create blockchain applications that are specifically designed for financial contracts.",
    preview: require("./images/marlowe.png"),
    website: "https://marlowe-lang.org/",
    getstarted: "https://playground.marlowe-lang.org/",
    tags: ["smartcontracts"],
  },
  {
    title: "Automint",
    description:
      "A Python library that benefits the token & NFT communities. Scripts allow easy wallet management, automatic creation of unlocked and time-locked policy IDs, as well as the ability to quickly: build, sign, and submit transactions, and much more. Note: This library relies on wrapping cardano-cli.",
    preview: require("./images/automint.png"),
    website: "https://github.com/creativequotient/automint",
    getstarted: null,
    tags: ["python", "nft"],
  },
  {
    title: "PyCardano",
    description:
      "A Cardano library written in Python. It allows users to build and sign transactions without depending on other Cardano serialization tools (such as cardano-cli and cardano-serialization-lib), making it a lightweight library that is easy and fast to set up in all kinds of environments.",
    preview: require("./images/pycardano.png"),
    website: "https://github.com/Python-Cardano/pycardano",
    getstarted: "https://pycardano.readthedocs.io/en/latest",
    tags: ["python", "transactionbuilder"],
  },
  {
    title: "Oura",
    description:
      "Oura is a rust-native implementation of a pipeline that connects to the tip of a Cardano node through a combination of Ouroboros mini-protocol, filters the events that match a particular pattern and then submits a succint, self-contained payload to pluggable observers called 'sinks'.",
    preview: require("./images/oura.png"),
    website: "https://github.com/txpipe/oura",
    getstarted: null,
    tags: ["rust", "nodeclient"],
  },
  {
    title: "Typhonjs",
    description:
      "A pure javascript Cardano transaction builder library.",
    preview: require("./images/typhonjs.jpg"),
    website: "https://github.com/StricaHQ/typhonjs",
    getstarted: null,
    tags: ["javascript", "transactionbuilder"],
  },
  {
    title: "IntelliJ IDE",
    description:
      "An IntelliJ plugin for Cardano blockchain.",
    preview: require("./images/IDE.png"),
    website: "https://intelliada.bloxbean.com",
    getstarted: null,
    tags: ["java", "IDE"],
  },
  {
    title: "Cardano Blockchain Snapshots",
    description:
      "Download the latest Cardano blockchain snapshot.",
    preview: require("./images/cardano-snapshots.png"),
    website: "https://cSnapshots.io",
    getstarted: null,
    tags: ["operatortool", "hosted"],
  },
  {
    title: "Koios",
    description: "Elastic light/full-mode API query-layer for Cardano Blockchain.",
    preview: require("./images/koios.png"),
    website: "https://koios.rest",
    getstarted: "/docs/get-started/koios",
    tags: ["http", "json", "hosted", "provider"],
  },
  {
    title: "Pallas",
    description: "Rust-native building blocks for the Cardano blockchain ecosystem.",
    preview: require("./images/pallas.png"),
    website: "https://github.com/txpipe/pallas#readme",
    getstarted: null,
    tags: ["rust", "serialization"]
  },
  {
    title: "Scrolls",
    description: "Read-optimized cache of Cardano on-chain entities.",
    preview: require("./images/scrolls.png"),
    website: "https://github.com/txpipe/scrolls#readme",
    getstarted: null,
    tags: ["indexer", "redis"]
  },
  {
    title: "Kupo",
    description: "A lightweight & configurable chain-index for Cardano.",
    preview: require("./images/kupo.png"),
    website: "https://github.com/CardanoSolutions/kupo#readme",
    getstarted: null,
    tags: ["indexer", "http", "json"]
  },
  {
    title: "cardano-multiplatform-lib",
    description: "A library of utilities and codecs for serialization/deserialization of core data-stuctures. Replacement for 'cardano-serialization-lib'.",
    preview: require("./images/cardano-multiplatform-lib.png"),
    website: "https://github.com/dcSpark/cardano-multiplatform-lib#cardano-multiplatform-lib",
    getstarted: null,
    tags: ["rust", "serialization"]
  },
  {
    title: "cardano-js-sdk",
    description: "JavaScript SDK for interacting with Cardano, providing various key management options, with support for popular hardware wallets",
    preview: require("./images/cardano-js-sdk.png"),
    website: "https://github.com/input-output-hk/cardano-js-sdk/#readme",
    getstarted: null,
    tags: ["transactionbuilder", "javascript"]
  },
  {
    title: "Lucid",
    description: "Lucid is a library, which allows you to create Cardano transactions and off-chain code for your Plutus contracts in JavaScript and Node.js.",
    preview: require("./images/lucid.png"),
    website: "https://github.com/Berry-Pool/lucid#readme",
    getstarted: "https://lucid.spacebudz.io/docs/getting-started/choose-wallet/",
    tags: ["typescript", "transactionbuilder"]
  },
  {
    title: "Plutarch",
    description: "Plutarch is a typed eDSL in Haskell for writing efficient Plutus Core validators.",
    preview: require("./images/plutarch.png"),
    website: "https://github.com/Plutonomicon/plutarch#plutarch",
    getstarted: null,
    tags: ["smartcontracts", "haskell"]
  },
  {
    title: "gOuroboros",
    description: "Golang implementation of the Cardano Ouroboros network protocol.",
    preview: require("./images/gOuroboros.png"),
    website: "https://github.com/blinklabs-io/gouroboros",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/gouroboros",
    tags: ["golang", "nodeclient"],
  },
  {
    title: "Adder",
    description: "A tool for tailing the Cardano blockchain and emitting events for each block and transaction seen, based on user configurable filters.",
    preview: require("./images/adder.png"),
    website: "https://github.com/blinklabs-io/adder",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/adder",
    tags: ["cli", "golang", "nodeclient"],
  },
  {
    title: "Cardano Node API",
    description: "An HTTP API for interfacing with a local Cardano Node and providing the node internal data for HTTP clients.",
    preview: require("./images/cardano-node-api.png"),
    website: "https://github.com/blinklabs-io/cardano-node-api",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/cardano-node-api",
    tags: ["http", "golang", "json", "websocket", "nodeclient"],
  },
  {
    title: "HeliosLang",
    description: "A DSL for writing Cardano Smart Contracts. Reference compiler is a single Javascript file without dependencies.",
    preview: require("./images/helioslang.png"),
    website: "https://github.com/Hyperion-BT/Helios",
    getstarted: null,
    tags: ["javascript", "smartcontracts"],
  },
  {
    title: "Pebble",
    description: "Pebble is a strongly-typed domain-specific language (DSL) for writing Cardano smart contracts. A simple, yet rock solid, functional language with an imperative bias, targeting UPLC.",
    preview: require("./images/plu-ts.png"),
    website: "https://pluts.harmoniclabs.tech/",
    getstarted: "/docs/get-started/plu-ts",
    tags: ["smartcontracts", "typescript"],
  },
  {
    title: "Aiken",
    description: "A modern smart contract platform for Cardano.",
    preview: require("./images/aiken.png"),
    website: "https://aiken-lang.org",
    getstarted: "/docs/get-started/aiken",
    tags: ["favorite", "smartcontracts"],
  },
  {
    title: "Cardano Signer",
    description: "Tool to sign data with a Cardano-Secret-Key and verify data with a Cardano-Public-Key",
    preview: require("./images/cardano-signer.png"),
    website: "https://github.com/gitmachtl/cardano-signer",
    getstarted: null,
    tags: ["operatortool", "cli", "json"],
  },
  {
    title: "Mesh",
    description: "A feature-complete, open-source TypeScript SDK and off-chain framework including wallet integration, transaction building, a smart contract library, third-party API integration, and UI components: with thorough documentation and live demos for all skill levels.",
    preview: require("./images/mesh.png"),
    website: "https://meshjs.dev/",
    getstarted: "/docs/get-started/mesh/overview",
    tags: ["favorite", "typescript", "transactionbuilder"]
  },
  {
    title: "UTXOS Web3 Services",
    description: "UTXOS is a suite of tools and services that aim to simplify the onboarding experience for users and businesses to adopt Cardano.",
    preview: require("./images/utxos.png"),
    website: "https://utxos.dev/",
    getstarted: "/docs/get-started/utxos/overview",
    tags: ["hosted", "http", "wallet", "typescript"]
  },
  {
    title: "Cardano Leader Slot",
    description: "Lightweight and Portable Scheduled Blocks Checker for Next, Current and Previous Epochs.",
    preview: require("./images/leader-slot.png"),
    website: "https://github.com/QuixoteSystems/cardano-leader-slot",
    getstarted: null,
    tags: ["python", "operatortool", "cli"],
  },
  {
    title: "Cardano connect with wallet",
    description: "Useful hooks and React components to simplify the Cardano dApp integration e.g. to connect browser wallets, fetch addresses and provide signing.",
    preview: require("./images/cardano-connect-with-wallet.png"),
    website: "https://github.com/cardano-foundation/cardano-connect-with-wallet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "Frankenwallet",
    description: "An encrypted, air-gapped Linux bootable USB drive for Cardano transaction signing, sandboxed access to files on your main computer, and storage & backup of secure assets & documents.",
    preview: require("./images/frankenwallet.png"),
    website: "https://frankenwallet.com",
    getstarted: "/docs/operate-a-stake-pool/frankenwallet",
    tags: ["operatortool"],
  },
  {
    title: "CARP (Cardano Postgres Indexer)",
    description: "A modular indexer for Cardano with an SQL Postgres backend.",
    preview: require("./images/carp.png"),
    website: "https://github.com/dcSpark/carp",
    getstarted: "https://dcspark.github.io/carp/docs/intro",
    tags: ["indexer", "sql"],
  },
  {
    title: "Plutip",
    description: "Cardano tool that aims to help dApp developers with integration testing and contracts debugging using disposable private network",
    preview: require("./images/plutip.png"),
    website: "https://github.com/mlabs-haskell/plutip",
    getstarted: null,
    tags: ["haskell", "testing"],
  },
  {
    title: "Demeter.run",
    description: "A cloud environment with all the tools for building your dApp.",
    preview: require("./images/demeter.png"),
    website: "https://demeter.run/",
    getstarted: null,
    tags: ["favorite", "IDE", "hosted"],
  },
  {
    title: "Cardano Verify Datasignature",
    description: "A lightweight typescript library to verify a cip30 datasignature.",
    preview: require("./images/cardano-verify-datasignature.png"),
    website: "https://github.com/cardano-foundation/cardano-verify-datasignature",
    getstarted: null,
    tags: ["typescript"],
  },
  {
    title: "Periodic DNS resolver",
    description: "System service to configure a DDNS address firewall rule on a BP and send a message via Telegram Bot if your relay IP address has changed. Keeps Cardano nodes connected and secure on residential ISPs with rolling public IPs.",
    preview: require("./images/pdr_bot.png"),
    website: "https://github.com/Fuma419/periodic-dns-resolver",
    getstarted: null,
    tags: ["operatortool", "cli"],
  },
  {
    title: "OpShin",
    description:
      "Opshin is a pythonic language for writing smart contracts on the Cardano blockchain. Opshin is a strict subset of Python, this means anyone who knows Python can get up to speed on Opshin pretty quickly.",
    preview: require("./images/opshin.png"),
    website: "https://github.com/OpShin/opshin",
    getstarted: "https://opshin.dev/user-manual",
    tags: ["python", "smartcontracts"],
  },
  {
    title: "DCOne Crypto Webhook API",
    description: "API for developers to receive information on changing stake balance.",
    preview: require("./images/dconecrypto-webhook.png"),
    website: "https://github.com/DCOneCrypto/StakeAddress-Tracking-Webhook-API",
    getstarted: null,
    tags: ["http"],
  },
  {
    title: "Maestro",
    description: "Blockchain indexer, APIs and event management system for the Cardano blockchain.",
    preview: require("./images/maestro.png"),
    website: "https://www.gomaestro.org/dapp-platform",
    getstarted: "https://docs.gomaestro.org/",
    tags: ["http", "hosted", "provider"]
  },
  {
    title: "potential-robot",
    description: "A TypeScript API for test-driven development with Helios.",
    preview: require("./images/potential-robot.png"),
    website: "https://github.com/aleeusgr/potential-robot",
    getstarted: null,
    tags: ["typescript", "testing"]
  },
  {
    title: "Hydra",
    description: "Hydra is the layer-two scalability solution for Cardano, which aims to increase the speed of transactions (low latency, high throughput) and minimize transaction cost.",
    preview: require("./images/hydra.png"),
    website: "https://hydra.family/head-protocol/",
    getstarted: "https://hydra.family/head-protocol/docs/getting-started",
    tags: ["haskell"]
  },
  {
    title: "NFTCDN",
    description: "Display all Cardano NFTs effortlessly & efficiently on your website/app using the low-code & high-speed NFTCDN service.",
    preview: require("./images/nftcdn.png"),
    website: "https://nftcdn.io",
    getstarted: null,
    tags: ["nft", "http", "hosted"]
  },
  {
    title: "Atlas",
    description:
      "Atlas is an all-in-one, Haskell-native application backend for writing off-chain code for on-chain Plutus smart contracts.",
    preview: require("./images/atlas.jpg"),
    website: "https://atlas-app.io/",
    getstarted: null,
    tags: ["haskell", "transactionbuilder"],
  },
  {
    title: "NFT Vending Machine",
    description: "A simple CNFT mint-and-vend machine Python library that leverages cardano-cli and Blockfrost.",
    preview: require("./images/nft-vending-machine.png"),
    website: "https://github.com/thaddeusdiamond/cardano-nft-vending-machine",
    getstarted: null,
    tags: ["python", "nft"]
  },
  {
    title: "Yaci DevKit",
    description: "Create your own local Cardano devnet with ease! It includes an Indexer, minimal Explorer interface, and support for Cardano Client Lib or Lucid JS library's Blockfrost provider.",
    preview: require("./images/yaci-devkit.png"),
    website: "https://github.com/bloxbean/yaci-devkit",
    getstarted: null,
    tags: ["cli", "testing"]
  },
  {
    title: "whisky",
    description: "This is a library for building off-chain code on Cardano. It is a cardano-cli like wrapper on cardano-serialization-lib (equivalent on MeshJS's lower level APIs), supporting serious DApps' backend on rust codebase.",
    preview: require("./images/whisky.png"),
    website: "https://github.com/sidan-lab/whisky",
    getstarted: "https://whisky.sidan.io/",
    tags: ["rust", "transactionbuilder"]
  },
  {
    title: "UTxORPC",
    description: "UTxORPC (u5c for short) is a gRPC interface for UTxO Blockchains, Interact with UTxO-based blockchains using a shared specification with focus on developer experience and performance.",
    preview: require("./images/u5c.png"),
    website: "https://utxorpc.org/",
    getstarted: "https://utxorpc.org/introduction",
    tags: ["http", "json", "websocket", "provider"]
  },
  {
    title: "Mumak",
    description: "A custom PostgreSQL extension to interact with Cardano CBOR data directly.",
    preview: require("./images/mumak.png"),
    website: "https://github.com/txpipe/mumak",
    getstarted: "https://github.com/txpipe/mumak/blob/main/docs/INSTALL.md",
    tags: ["serialization", "sql"]
  },
  {
    title: "Pallas.Dotnet",
    description: "Pallas.DotNet is a .NET wrapper around the Pallas Rust library, which provides building blocks for the Cardano blockchain ecosystem. This library allows .NET developers to access the functionality of Pallas in a seamless and straightforward manner.",
    preview: require("./images/pallas-dotnet.png"),
    website: "https://github.com/SAIB-Inc/Pallas.Dotnet",
    getstarted: null,
    tags: ["net", "serialization"]
  },
  {
    title: "Argus | Cardano.Sync",
    description: "Argus | Cardano.Sync is a .NET library that simplifies interactions with the Cardano blockchain by providing an efficient indexing framework. ",
    preview: require("./images/argus.png"),
    website: "https://github.com/SAIB-Inc/Cardano.Sync",
    getstarted: null,
    tags: ["net", "indexer"]
  },
  {
    title: "NFT Playground",
    description: "An integrated development environment for building CIP54-compliant Smart NFTs.",
    preview: require("./images/nft-playground.png"),
    website: "https://nft-playground.dev/",
    getstarted: "https://nft-playground.dev/help",
    tags: ["IDE", "hosted", "nft", "javascript"]
  },
  {
    title: "Cardano Audit Script for SPOs",
    description: "A security and compliance audit script for Cardano stakepool nodes, to help SPOs check their node and security configuration.",
    preview: require("./images/cardano-node-audit.png"),
    website: "https://github.com/Kirael12/cardano-node-audit",
    getstarted: "/docs/operate-a-stake-pool/audit-your-node",
    tags: ["operatortool", "cli"]
  },
  {
    title: "ZhuLi",
    description: "A validator & companion command-line tool to provide hot/cold account management to delegate representatives (a.k.a DReps) on Cardano. The on-chain validator provides an authentication mechanism for an administrator multisig script (m-of-n type), itself granting powers to multisig-like delegate to manage voting stake rights.",
    preview: require("./images/zhuli.jpg"),
    website: "https://github.com/CardanoSolutions/zhuli",
    getstarted: null,
    tags: ["cli", "governance"]
  },
  {
    title: "cf-java-rewards-calculation",
    description: "This project aims to achieve multiple goals: re-implement Cardano ledger rules for calculating ada pots and rewards, validate Cardano's rewards calculation through an alternative implementation of the ledger specification, provide a library for use in other projects (like yaci-store) independent of DB Sync, and offer insights into protocol parameters and ada flow through interactive reports.",
    preview: require("./images/rewardcalc.jpg"),
    website: "https://github.com/cardano-foundation/cf-java-rewards-calculation",
    getstarted: null,
    tags: ["java", "testing"]
  },
  {
    title: "cf-ledger-sync",
    description: "This repository provides applications for indexing Cardano blockchain data into a PostgreSQL database, scheduling jobs, and streaming blockchain events to messaging systems like Kafka or RabbitMQ, offering flexible data management and customization options.",
    preview: require("./images/ledgersync.jpg"),
    website: "https://github.com/cardano-foundation/cf-ledger-sync",
    getstarted: null,
    tags: ["java", "indexer"]
  },
  {
    title: "CFD: Cardano Fast Deployment tool",
    description: "CFD simplifies and accelerates Cardano software deployment, stake pool management, software updates, and secure key handling, including GPG keychain integration and automated encryption, all with minimal user effort.",
    preview: require("./images/cfd.png"),
    website: "https://github.com/cardano-community/cfd",
    getstarted: null,
    tags: ["cli", "operatortool"]
  },
  {
    title: "pg_cardano",
    description: "A PostgreSQL extension providing a suite of Cardano-related tools, including cryptographic functions, address encoding/decoding, and blockchain data processing.",
    preview: require("./images/pg_cardano.png"),
    website: "https://github.com/cardano-community/pg_cardano",
    getstarted: "https://github.com/cardano-community/pg_cardano/blob/master/README.md#contents",
    tags: ["serialization", "sql"]
  },
  {
    title: "Cardano-C",
    description: "A pure C library for interacting with the Cardano blockchain. Compliant with MISRA standards and binding-friendly architecture.",
    preview: require("./images/cardano-c.png"),
    website: "https://github.com/Biglup/cardano-c",
    getstarted: "https://cardano-c.readthedocs.io/en/latest/getting_started.html",
    tags: ["c", "serialization"]
  },
  {
    title: "Evolution SDK",
    description:
      "Highly scalable, production-ready transaction builder & off-chain framework for users and dApps",
    preview: require("./images/evolution-sdk.png"),
    website: "https://no-witness-labs.github.io/evolution-sdk/",
    getstarted:
      "https://no-witness-labs.github.io/evolution-sdk/install",
    tags: ["typescript", "transactionbuilder"],
  },
  {
    title: "Scalus",
    description: "Scalus is a development platform for building decentralized applications (DApps) on the Cardano blockchain. It provides a unified environment where developers can write both on-chain smart contracts and off-chain logic using Scala 3 - a modern, expressive, and type-safe functional programming language.",
    preview: require("./images/scalus.png"),
    website: "https://scalus.org/",
    getstarted: "https://scalus.org/docs/get-started",
    tags: ["scala", "transactionbuilder", "smartcontracts"]
  },
  {
    title: "Lace Anatomy",
    description: "Renders transactions from CBOR and transaction hashes, providing a graphical representation of blockchain data for developers and analysts. Includes dissect functionality that breaks down CBOR structures for debugging and troubleshooting low-level Cardano transactions.",
    preview: require("./images/lace-anatomy.png"),
    website: "https://laceanatomy.com",
    getstarted: "https://laceanatomy.com",
    tags: ["testing"]
  },
  {
    title: "Gastronomy",
    description: "A powerful UPLC debugger that lets you step through UPLC execution, travel backwards in time, and map directly to smart contract source code making complex debugging simple and intuitive.",
    preview: require("./images/gastronomy.png"),
    website: "https://sundae.fi/products/gastronomy",
    getstarted: "https://github.com/SundaeSwap-finance/gastronomy",
    tags: ["testing"]
  },
  {
    title: "Datum Explorer",
    description: "Designed to decode, understand, and build with CBOR data. The tool simplifies working with CBOR by leveraging schema definitions to provide a more human-readable and structured representation of the data.",
    preview: require("./images/datum-explorer.png"),
    website: "https://github.com/WingRiders/datum-explorer#readme",
    getstarted: "https://datum-explorer.wingriders.com/?schema=detect",
    tags: ["typescript", "cli", "serialization", "hosted"]
  },
  {
    title: "Apollo",
    description: "Building blocks for serialization and pure Golang development: a layer to interact with the Cardano Node including providers for commonly used services.",
    preview: require("./images/apollo.png"),
    website: "https://github.com/Salvionied/apollo",
    getstarted: null,
    tags: ["golang", "serialization"]
  },
  {
    title: "Weld Wallet Connector",
    description:
      "Manage wallet connections across multiple blockchains using a single intuitive interface",
    preview: require("./images/weld.png"),
    website: "https://github.com/Cardano-Forge/weld/",
    getstarted:
      "https://github.com/Cardano-Forge/weld/tree/main/documentation/",
    tags: ["typescript", "wallet"],
  },
  {
    title: "Elm Cardano",
    description: "Elm offchain package for Cardano. This project aims to be the friendliest and most productive way of handling an offchain Cardano frontend. It should be a perfect match to Aiken for onchain code.",
    preview: require("./images/elm-cardano.png"),
    website: "https://github.com/elm-cardano/elm-cardano",
    getstarted: "https://elm-doc-preview.netlify.app/Cardano-TxIntent?repo=elm-cardano%2Felm-cardano&version=elm-doc-preview",
    tags: ["elm", "transactionbuilder"],
  },
  {
    title: "Blaze",
    description: "Blaze is a library, which allows you to create Cardano transactions and off-chain code for your Aiken contracts in JavaScript.",
    preview: require("./images/blaze.png"),
    website: "https://github.com/butaneprotocol/blaze-cardano",
    getstarted: "https://blaze.butane.dev/",
    tags: ["javascript", "transactionbuilder"],
  },
  {
    title: "Kuber",
    description: "Haskell library and API server for composing balanced Cardano transactions.",
    preview: require("./images/kuber.png"),
    website: "https://github.com/dQuadrant/kuber",
    getstarted: "https://kuberide.com/",
    tags: ["haskell", "transactionbuilder"],
  },
  {
    title: "Sorbet",
    description: "A mock wallet implementation for testing out different products as if you were the user.",
    preview: require("./images/sorbet.png"),
    website: "https://github.com/SundaeSwap-finance/Sorbet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "p2p-wallet",
    description: "A fully p2p desktop Cardano wallet with builtin DeFi support, and a transaction builder for executing multiple actions in one transaction.",
    preview: require("./images/p2p-wallet.png"),
    website: "https://github.com/fallen-icarus/p2p-wallet",
    getstarted: null,
    tags: ["haskell", "wallet"],
  },
  {
    title: "Cardano Dev Wallet",
    description: "A desktop wallet for Cardano development. It allows you to test your smart contracts and transactions without having to use a full node.",
    preview: require("./images/cardano-dev-wallet.png"),
    website: "https://github.com/mlabs-haskell/cardano-dev-wallet",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "Bursa",
    description: "A programmatic Cardano Wallet",
    preview: require("./images/bursa.png"),
    website: "https://github.com/blinklabs-io/bursa",
    getstarted: null,
    tags: ["golang", "wallet"],
  },
  {
    title: "CShell",
    description: "A Cardano wallet built for developers and power users.",
    preview: require("./images/cshell.png"),
    website: "https://github.com/txpipe/cshell",
    getstarted: null,
    tags: ["cli", "wallet"],
  },
  {
    title: "Cardano HW CLI",
    description: "Cardano CLI tool for hardware wallets.",
    preview: require("./images/cardano-hw-cli.png"),
    website: "https://github.com/vacuumlabs/cardano-hw-cli",
    getstarted: null,
    tags: ["cli", "wallet"],
  },
  {
    title: "Cardanopress",
    description: "Cardano & WordPress plugin integration",
    preview: require("./images/cardanopress.png"),
    website: "https://cardanopress.io/",
    getstarted: "https://github.com/CardanoPress/cardanopress",
    tags: ["php", "wallet"],
  },
  {
    title: "Cardano Peer Connect",
    description: "This library aims to provide simple interfaces to implement CIP-0045 (WebRTC communication) for dApps and wallets",
    preview: require("./images/cardano-peer-connect.png"),
    website: "https://github.com/fabianbormann/cardano-peer-connect",
    getstarted: null,
    tags: ["typescript", "wallet"],
  },
  {
    title: "NMKR Studio",
    description: "NMKR Studio is a comprehensive platform for Cardano NFT management, built with C# and .NET 8.0. The project provides a complete solution for minting, burning, and managing NFTs on the Cardano blockchain.",
    preview: require("./images/nmkr-studio.png"),
    website: "https://github.com/nftmakerio/NMKR-Studio",
    getstarted: null,
    tags: ["net", "nft"],
  },
  {
    title: "Yaci Store",
    description: "aci Store is a modular, high-performance Cardano blockchain indexer and datastore that provides a flexible foundation for building blockchain applications. Built on top of the Yaci library, it offers both out-of-the-box functionality and extensive customization options through its plugin framework.",
    preview: require("./images/yaci-store.png"),
    website: "https://github.com/bloxbean/yaci-store",
    getstarted: "https://store.yaci.xyz/",
    tags: ["indexer", "java"],
  },
  {
    title: "Dingo",
    description: "A Cardano blockchain data node written in Go which actively participates in network communications on the Cardano blockchain using the Ouroboros Network Node-to-Node family of mini-protocols.",
    preview: require("./images/dingo.png"),
    website: "https://github.com/blinklabs-io/dingo",
    getstarted: "https://pkg.go.dev/github.com/blinklabs-io/dingo",
    tags: ["golang", "nodeclient"],
  },
  // ============================================================================
  // ADD YOUR BUILDER TOOL ABOVE THIS LINE
  // Copy the template from the top of this file
  // ============================================================================
];
