/*
 * SHOWCASE SECTION INFO
 *
 * The project showcase should be a place where someone new to the ecosystem 
 * can come to see what can be done - it should not be seen as a database where 
 * every project is promoted.
 * 
 * REQUIREMENTS FOR ADDING YOUR PROJECT TO THE SHOWCASE SECTION:
 * https://developers.cardano.org/docs/portal-contribute#add-a-project-to-showcase
 *
 * INSTRUCTIONS:
 * - Add your project in the JSON array below.
 * - Add a local image preview. (decent screenshot or logo of your project)
 * - The image must be added to the GitHub repository and use `require("image")`.
 */

import React from "react";
import { sortBy, difference } from "../utils/jsUtils";

// List of available tags. The tag and the label should be in singular. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // PLEASE DO NOT USE THIS TAG: we add the favorite project tag (process TBD)
  favorite: {
    label: "Favorite",
    description:
      "Our favorite Cardano projects that you must absolutely check-out.",
    color: '#e9669e',  // Vibrant Pink
  },

  // Analytics
  analytics: {
    label: "Analytics",
    description: "Tools that provide special insights related to Cardano.",
    icon: null,
    color: '#6A8EAE',  // Cool Steel Blue
  },

  // Bridge 
  bridge: {
    label: "Bridge",
    description: "Projects that provide cross-chain bridge support.",
    icon: null,
    color: '#FFC107',  // Golden Yellow
  },

  // Block Explorer
  explorer: {
    label: "Block Explorer",
    description:
      "Block explorers are browsers for the Cardano blockchain. They can display the contents of individual blocks and transactions.",
    icon: null,
    color: '#2E3B4E',  // Deep Navy Blue
  },

  // Catalyst
  catalyst: {
    label: "Catalyst",
    description: "Projects that aid to Cardano's innovation fund. (Project Catalyst)",
    icon: null,
    color: '#3AA655',  // Vibrant Green
  },

  // DAO Tool
  daotool: {
    label: "DAO Tool",
    description: "DAO tools help in the proper control and management of a DAO.",
    icon: null,
    color: '#37BEB0',  // Bright Cyan
  },

  // DEX
  dex: {
    label: "DEX",
    description: "Decentralised exchanges allow direct peer-to-peer cryptocurrency transactions to take place online securely.",
    icon: null,
    color: '#3D5AFE',  // Bright Blue
  },

  // Ecosystem
  ecosystem: {
    label: "Ecosystem",
    description: "The Cardano ecosystem projects.",
    icon: null,
    color: '#9C27B0',  // Purple
  },

  // Educational
  educational: {
    label: "Educational",
    description: "Educational projects that will help you onboarding to Cardano.",
    icon: null,
    color: '#D81B60',  // Hot Pink
  },

  // Funding 
  funding: {
    label: "Funding",
    description: "Projects aimed at providing funding assistance to individuals.",
    icon: null,
    color: '#004BA0',  // Rich Blue
  },

  // Game
  game: {
    label: "Game",
    description: "Games on the Cardano blockchain.",
    icon: null,
    color: '#008080',  // Teal
  },

  // Gateways
  gateway: {
    label: "Gateway",
    description: "Payment Gateway Providers.",
    icon: null,
    color: '#FF5722',  // Bright Orange
  },

  // Governance
  governance: {
    label: "Governance",
    description: "Governance tools.",
    icon: null,
    color: '#673AB7',  // Deep Purple
  },

  // Identity
  identity: {
    label: "Identity",
    description: "Decentralized identifiers (DIDs).",
    icon: null,
    color: '#212121',  // Solid Black
  },

  // Lending 
  lending: {
    label: "Lending",
    description: "Projects that provide lending and borrowing of ada.",
    icon: null,
    color: '#9E1C1C',  // Deep Red
  },

  // Marketplace 
  marketplace: {
    label: "Marketplace",
    description: "Marketplace where you can buy or sell NFTs.",
    icon: null,
    color: '#E53935',  // Bright Red
  },

  // Meta data projects
  metadata: {
    label: "Metadata",
    description: "Transaction metadata.",
    icon: null,
    color: '#00ACC1',  // Bright Teal
  },

  // Minting 
  minting: {
    label: "Minting",
    description: "Minting Tool.",
    icon: null,
    color: '#42A5F5',  // Light Blue
  },

  // NFT Project (example: Spacebudz, Cardano Kidz)
  nftproject: {
    label: "NFT Project",
    description: "A project which main component is NFT.",
    icon: null,
    color: '#FFD700',  // Gold
  },

  // NFT Support (example: a wallet or marketplace)
  nftsupport: {
    label: "NFT Support",
    description: "A project that supports NFT.",
    icon: null,
    color: '#B8860B',  // Dark Gold
  },

  // Open-Source 
  opensource: {
    label: "Open-Source",
    description: "Open-Source sites can be useful for inspiration.",
    icon: null,
    color: '#8C2F00',  // Dark Orange-Red
  },

  // Oracle
  oracle: {
    label: "Oracle",
    description: "Oracles provide smart contracts with external data.",
    icon: null,
    color: '#1E88E5',  // Medium Blue
  },

  // Pool Tool
  pooltool: {
    label: "Pool Tool",
    description: "Pool tools provide delegates with the necessary tools to find a good pool.",
    icon: null,
    color: '#6C6FFF',  // Soft Blue
  },

  // Native token projects
  token: {
    label: "Native Token",
    description: "Native Tokens.",
    icon: null,
    color: '#FF1744',  // Bright Red
  },

  // Wallets
  wallet: {
    label: "Wallet",
    description: "Cardano wallets store the public and/or private keys to access and manage your funds.",
    icon: null,
    color: '#7BC8A6',  // Soft Green
  },
};

// Add your project to (THE END OF) this list.
// Please don't add the "favorite"-tag yourself.
// Provide pure NFT projects only get the tag NFT, not "tokens"
export const Showcases = [
  {
    title: "Cardano Kidz",
    description:
      "Each of these unique Limited Edition designs is being minted on the Cardano Blockchain as a Non Fungible Token (NFT).",
    preview: require("./showcase/cardanokidz.png"),
    website: "https://www.cardanokidz.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardano Wall",
    description:
      "Demonstrates several use cases for transaction metadata. You can sign messages and create proof of existence for files.",
    preview: require("./showcase/cardanowall.png"),
    website: "https://cardanowall.com/en/explore/",
    source: null,
    tags: ["favorite", "metadata"],
  },
  {
    title: "NMKR",
    description:
      "NFT Minting, FIAT & Crypto Sales, Token Launches, Secondary Markets - all available at the press of a button.",
    preview: require("./showcase/nmkr.png"),
    website: "https://www.nmkr.io/",
    source: null,
    tags: ["favorite", "minting", "nftsupport"],
  },
  {
    title: "SpaceBudz",
    description:
      "A collection of 10,000 unique little astronauts represented as NFTs on the Cardano blockchain. SpaceBudz offers a market place with contract based trades. CNFT of the year 2021.",
    preview: require("./showcase/spacebudz.png"),
    website: "https://spacebudz.io",
    source: "https://github.com/Berry-Pool/spacebudz",
    tags: ["favorite", "nftproject", "opensource"],
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
    title: "Cardano Foundation Explorer",
    description:
      "A Cardano explorer focused on the needs of a non technical target audience like regulators and policy makers built by Cardano Foundation, currently under development",
    preview: require("./showcase/cf-explorer.png"),
    website: "https://beta.explorer.cardano.org",
    source: "https://github.com/cardano-foundation/cf-explorer",
    tags: ["explorer", "opensource"],
  },
  {
    title: "CExplorer",
    description:
        "An independent Cardano Explorer that provides useful all-in-one dashboards additionally.",
    preview: require("./showcase/cexplorer.png"),
    website: "https://cexplorer.io/",
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
    tags: ["favorite", "explorer"],
  },
  {
    title: "Pool PM",
    description:
      "Block explorer that brought out a new, refreshing concept to visualize transactions.",
    preview: require("./showcase/poolpm.png"),
    website: "https://pool.pm",
    source: null,
    tags: ["favorite", "explorer"],
  },
  {
    title: "Adafolio",
    description:
      "Adafolio provides a place to create and share multi-delegation portfolios.",
    preview: require("./showcase/adafolio.png"),
    website: "https://adafolio.com",
    source: null,
    tags: ["favorite", "pooltool"],
  },
  {
    title: "PoolTool",
    description:
      "One of the most feature-rich, unbiased pool tools. Also offers a native app.",
    preview: require("./showcase/pooltool.png"),
    website: "https://pooltool.io",
    source: null,
    tags: ["favorite", "pooltool", "analytics", "explorer"],
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
    tags: ["wallet", "opensource"],
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
    title: "Cardano Warriors",
    description: "The retro RPG NFT Collection minted in Cardano Blockchain.",
    preview: require("./showcase/cardanowarriors.png"),
    website: "https://cardanowarriors.io/",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "Cardano Assets",
    description: "Overview of native tokens on Cardano.",
    preview: require("./showcase/cardanoassets.png"),
    website: "https://cardanoassets.com",
    source: null,
    tags: ["token", "analytics"],
  },
  {
    title: "Cardano Updates",
    description:
      "Follow the development of Cardano in real time without the hassle of GitHub.",
    preview: require("./showcase/cardanoupdates.png"),
    website: "https://cardanoupdates.com",
    source: null,
    tags: ["favorite", "analytics"],
  },
  {
    title: "Pool Stats",
    description: "Pool tool and insights visualized by heat maps.",
    preview: require("./showcase/poolstats.png"),
    website: "https://poolstats.io",
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
    tags: ["pooltool", "analytics"],
  },
  {
    title: "Cardano Blockchain Insights",
    description:
      "A Google Data Studio dashboard that visualizes many Cardano on-chain metrics.",
    preview: require("./showcase/cardano-blockchain-insights.png"),
    website:
      "https://datastudio.google.com/u/0/reporting/3136c55b-635e-4f46-8e4b-b8ab54f2d460/page/k5r9B",
    source: null,
    tags: ["favorite", "analytics"],
  },
  {
    title: "PoolTool Mobile",
    description:
      "Explore Cardano, track your rewards and get notified to take action on certain events.",
    preview: require("./showcase/pooltoolmobile.png"),
    website: "https://pooltool.io/mobile",
    source: null,
    tags: ["favorite", "pooltool", "analytics"],
  },
  {
    title: "NOWPayments",
    description:
      "Payment gateway provider to accept ada payments and ada donations.",
    preview: require("./showcase/nowpayments.png"),
    website: "https://nowpayments.io",
    source: null,
    tags: ["favorite", "gateway"],
  },
  {
    title: "Coti adaPay",
    description:
      "Payment gateway provider to accept ada payments and ada donations.",
    preview: require("./showcase/cotiadapay.png"),
    website: "https://adapay.finance/",
    source: null,
    tags: ["gateway"],
  },
  {
    title: "Gimbalabs",
    description:
      "Gimbalabs is a collaborative community and space where dApps and OpenSource tools are developed in the \"Playground\" (Project-Based Learning experiences). All are welcome to join every Tuesday at 4pm UTC!",
    preview: require("./showcase/gimbalabs.png"),
    website: "https://gimbalabs.com",
    source: "https://gitlab.com/gimbalabs",
    tags: ["favorite", "educational", "opensource"],
  },
  {
    title: "Eternl",
    description:
      "The alternative Cardano light wallet in the browser. Aims to add features most requested by the Cardano community.",
    preview: require("./showcase/eternl.jpg"),
    website: "https://eternl.io",
    source: null,
    tags: ["favorite", "wallet", "nftsupport"],
  },
  {
    title: "Milkomeda",
    description: "Cross-blockchain Level 2 solutions including EVM support on Cardano and wrapped native assets.",
    preview: require("./showcase/milkomeda.png"),
    website: "https://milkomeda.com",
    source: null,
    tags: ["bridge"]
  },
  {
    title: "Clay Mates",
    description:
      "Collectibles brought to life and re-homed on the Cardano blockchain. Winner of the CNFT Awards 2022 in the category \"best generative art\".",
    preview: require("./showcase/clay-mates.png"),
    website: "https://www.claymates.org",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "DEADPXLZ",
    description:
      "Interactive, web-based NFT collectibles.",
    preview: require("./showcase/deadpxlz.png"),
    website: "https://pxlz.org",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "JES-Art",
    description:
      "16 year old female fine art NFTs on the Cardano blockchain!",
    preview: require("./showcase/jesart.png"),
    website: "https://www.jes-art.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Stellar Hood",
    description:
      "Space, the final frontier: Discover and study the stars and planets in our galaxy, our Stellar Hood, as 3d interactive NFTs which are coded directly onto the Cardano blockchain! Customize your solar systems on the interactive map.",
    preview: require("./showcase/stellarhood.png"),
    website: "https://stellarhood.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Nami",
    description:
      "Nami was developed by Berry Pool. A browser based wallet extension to also interact with Cardano from any website.",
    preview: require("./showcase/namiwallet.png"),
    website: "https://namiwallet.io",
    source: "https://github.com/Berry-Pool/nami-wallet",
    tags: ["favorite", "wallet", "opensource", "nftsupport"],
  },
  {
    title: "Cardano Token and NFT Builder",
    description:
      "Create your own native tokens and NFT in a few clicks without any code.",
    preview: require("./showcase/token-builder.png"),
    website: "https://cardano-native-token.com/",
    source: null,
    tags: ["minting", "token", "nftsupport"],
  },
  {
    title: "cardano-tools.io",
    description:
      "An advanced CNFT maker. You just pay network fees.",
    preview: require("./showcase/cardano-tools.io.png"),
    website: "https://cardano-tools.io",
    source: "https://github.com/wutzebaer/cardano-tools",
    tags: ["minting", "nftsupport", "opensource"],
  },
  {
    title: "Veritree",
    description:
      "Veritree leverages blockchain technology to provide planting organizations with an integrated planting management platform.",
    preview: require("./showcase/veritree.png"),
    website: "https://veritree.com",
    source: null,
    tags: ["token", "nftproject"],
  },
  {
    title: "Typhon Wallet",
    description:
      "Light wallet from the creators of cardanoscan.io. It comes with features like NFT gallery, transaction metadata, vote registration, among other features.",
    preview: require("./showcase/typhonwallet.png"),
    website: "https://typhonwallet.io",
    source: null,
    tags: ["favorite", "wallet", "nftsupport", "metadata"],
  },
  {
    title: "Staking Rewards Calculator",
    description:
      "A detailed Staking Rewards Calculator thats shows expected return to the operator and delegators of each pool based on the current and alternative network parameters. It also runs a Monte Carlo simulation to show possible variability in the return.",
    preview: require("./showcase/dsio-reward-calculator.png"),
    website: "https://dynamicstrategies.io/crewardcalculator",
    source: null,
    tags: ["pooltool", "analytics", "educational"],
  },
  {
    title: "Cardahub - A services hub on Cardano",
    description:
      "One stop shop for everything CNFT. A smart-contract NFT platform on Cardano where user can mint, distribute, list and buy NFT in a few clicks.",
    preview: require("./showcase/cardahub.png"),
    website: "https://cardahub.io",
    source: null,
    tags: ["marketplace", "minting", "nftsupport"],
  },
  {
    title: "ADAdice",
    description:
      "A fully on-chain, provably fair game of dice on the Cardano blockchain.",
    preview: require("./showcase/adadice.png"),
    website: "https://www.adadice.com",
    source: null,
    tags: ["game"],
  },
  {
    title: "MuesliSwap",
    description:
      "MuesliSwap is a new decentralized exchange (DEX) operating on the Smart Bitcoin Cash blockchain and Cardano.",
    preview: require("./showcase/muesliswap.png"),
    website: "https://ada.muesliswap.com",
    source: null,
    tags: ["favorite", "dex", "token"],
  },
  {
    title: "SundaeSwap",
    description:
      "SundaeSwap is a native, scalable decentralized exchange and automated liquidity provision protocol.",
    preview: require("./showcase/sundaeswap.png"),
    website: "https://www.sundaeswap.finance",
    source: null,
    tags: ["favorite", "dex", "token"],
  },
  {
    title: "DripDropz",
    description:
      "We provide token dispensing services to the Cardano community. An intuitive platform that offers projects a comprehensive selection of distribution parameters.",
    preview: require("./showcase/dripdropz.png"),
    website: "https://dripdropz.io",
    source: null,
    tags: ["minting", "token"],
  },
  {
    title: "World Mobile Token",
    description:
      "Connecting everyone, everywhere. A mobile network owned by the people and built on blockchain.",
    preview: require("./showcase/wmt.png"),
    website: "https://worldmobile.io",
    source: null,
    tags: ["token"],
  },
  {
    title: "epoch.art",
    description:
      "A Cardano NFT marketplace to discover, collect and trade unique exciting digital arts.",
    preview: require("./showcase/epochart.png"),
    website: "https://epoch.art",
    source: null,
    tags: ["marketplace", "nftsupport"],
  },
  {
    title: "Open CNFT",
    description:
      "Leaderboards & Analytics of the Cardano NFT ecosystem.",
    preview: require("./showcase/opencnft.png"),
    website: "https://opencnft.io",
    source: null,
    tags: ["analytics", "nftsupport"],
  },
  {
    title: "ADAZOO MMORPG and Metaverse",
    description: "Start exploring ADAZOO, battle and capture CNFT's. Brag to your friends, show off your stats.",
    preview: require("./showcase/adazoo.png"),
    website: "https://adazoo.com",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "Minswap Dex",
    description:
      "Minswap is a multi-pool decentralized exchange on Cardano.",
    preview: require("./showcase/minswap.png"),
    website: "https://minswap.org",
    source: null,
    tags: ["dex", "token"],
  },
  {
    title: "GameChanger Wallet",
    description:
      "The ultimate wallet experience for the Web, with native NFT and token features, powered by Cardano and third party applications.",
    preview: require("./showcase/gamechanger.png"),
    website: "https://gamechanger.finance",
    source: null,
    tags: ["wallet"],
  },
  {
    title: "GeroWallet",
    description:
      "Start exploring the possibilities of Cardano. Purchase, send, and receive ADA - the cryptocurrency for Cardano. Available as a browser extension.",
    preview: require("./showcase/gerowallet.png"),
    website: "https://gerowallet.io",
    source: null,
    tags: ["wallet"],
  },
  {
    title: "Built on Cardano",
    description:
      "Discover projects and dApps building on Cardano along with the developer tools you can use to build on Cardano. Explore similar projects and tools with ease and simply find you way back to where you started.",
    preview: require("./showcase/buildoncardano.png"),
    website: "https://builtoncardano.com",
    source: null,
    tags: ["ecosystem"],
  },
  {
    title: "CardanoCube",
    description:
      "Explore 650+ Projects Building on Cardano.",
    preview: require("./showcase/cardanocube.png"),
    website: "https://www.cardanocube.io",
    source: null,
    tags: ["ecosystem"],
  },
  {
    title: "CNFT Jungle",
    description:
      "CNFT Jungle is the biggest automated Cardano NFT rarity database and market analytics platform.",
    preview: require("./showcase/cnftjungle.png"),
    website: "https://www.cnftjungle.io",
    source: null,
    tags: ["analytics", "nftsupport"],
  },
  {
    title: "Galaxy Of Art",
    description:
      "Galaxy of Art is an environmentally friendly digital marketplace for non-fungible tokens (NFTs) that aims to bring joy and wealth to the creatives of the world.",
    preview: require("./showcase/galaxyofart.png"),
    website: "https://galaxyof.art",
    source: null,
    tags: ["marketplace", "nftsupport"],
  },
  {
    title: "JPG Store",
    description:
      "Discover artwork, explore communities, and support artists on Cardano.",
    preview: require("./showcase/jpg.png"),
    website: "https://www.jpg.store",
    source: null,
    tags: ["marketplace", "nftsupport"],
  },
  {
    title: "Atala Scan",
    description:
      "Easy-to-use mobile app that gives customers real-time proof of products’ authenticity, recorded on the Cardano blockchain for life.",
    preview: require("./showcase/atalascan.png"),
    website: "https://atalascan.io",
    source: null,
    tags: ["metadata", "identity"],
  },
  {
    title: "Pavia",
    description:
      "Create, explore and trade in the Cardano virtual world owned by its users.",
    preview: require("./showcase/pavia.png"),
    website: "https://www.pavia.io",
    source: null,
    tags: ["game", "nftproject"],
  },
  {
    title: "Turf",
    description:
      "Turf creates cartographic NFTs / wall art. Each Turf is a gorgeous 1/1 map based artwork of your favorite place on earth, preserved as interactive 3D NFTs.",
    preview: require("./showcase/turf.png"),
    website: "https://www.turfnft.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "WingRiders",
    description:
      "The DEX on Cardano. Native and fast AMM decentralized exchange platform.",
    preview: require("./showcase/wingriders.png"),
    website: "https://www.wingriders.com",
    source: null,
    tags: ["dex", "token"],
  },
  {
    title: "Building On Cardano",
    description:
      "Place to view whats happening within the cardano ecosystem.",
    preview: require("./showcase/buildingoncardano.png"),
    website: "https://buildingoncardano.com",
    source: null,
    tags: ["ecosystem"],
  },
  {
    title: "Pool Peek",
    description:
      "An extensive Cardano stake pool explorer.",
    preview: require("./showcase/poolpeek.png"),
    website: "https://poolpeek.com",
    source: null,
    tags: ["pooltool", "analytics"],
  },
  {
    title: "Lido Nation",
    description:
      "Aggregation of existing catalyst proposals, results, feedbacks and many more.",
    preview: require("./showcase/lidonation.png"),
    website: "https://www.lidonation.com/en/project-catalyst/projects",
    source: null,
    tags: ["catalyst", "analytics"],
  },
  {
    title: "RoundTable",
    description:
      "A open source multi-sig DApp for the cardano blockchain.",
    preview: require("./showcase/roundtable.png"),
    website: "https://roundtable.adaodapp.xyz/",
    source: "https://github.com/ADAOcommunity/round-table",
    tags: ["opensource", "daotool"],
  },
  {
    title: "eUTxO",
    description:
      "Visual blockchain explorer for Cardano.",
    preview: require("./showcase/eutxo.png"),
    website: "https://eutxo.org",
    source: null,
    tags: ["analytics", "explorer"],
  },
  {
    title: "HAZELnet",
    description:
      "A community integration tool that allows stakepool operators and NFT projects to connect and engage with their audience, verify their delegators and holders, create polls, whitelists and more via Discord, Website, and other social media apps.",
    preview: require("./showcase/hazelnet.png"),
    website: "https://www.hazelnet.io",
    source: "https://github.com/nilscodes/hazelnet",
    tags: ["nftsupport", "opensource", "token"],
  },
  {
    title: "Profiler",
    description:
      "Cardano explorer tailored to boost security and decision-making. Users can thoroughly examine their wallets, receiving a detailed overview of their transactions, tokens, and NFTs, complemented by interactive visualizations.",
    preview: require("./showcase/profiler.png"),
    website: "https://profiler.biz/",
    source: null,
    tags: ["analytics", "explorer"],
  },
  {
    title: "Dapps on Cardano",
    description:
      "Provides insights in decentralized applications on Cardano. See total transactions, total scripts locked and script invocations.",
    preview: require("./showcase/dapps-on-cardano.png"),
    website: "https://dappsoncardano.com",
    source: null,
    tags: [ "analytics", "ecosystem", "nftsupport"],
  },
  {
    title: "Lending Pond",
    description:
      "Provide or Receive ada through a smart contract driven P2P lending marketplace using Cardano NFTs as collateral.",
    preview: require("./showcase/lending-pond.png"),
    website: "https://lendingpond.app",
    source: null,
    tags: [ "marketplace", "nftsupport", "lending"],
  },
  {
    title: "Book.io",
    description:
      "An NFT marketplace for buying, reading, and selling eBooks and Audiobooks.",
    preview: require("./showcase/book-token.png"),
    website: "https://www.book.io",
    source: null,
    tags: [ "marketplace", "nftsupport", "token"],
  },
  {
    title: "NuFi Wallet",
    description:
      "Non-custodial, multi-chain wallet with in-app DEX.",
    preview: require("./showcase/nufiwallet.png"),
    website: "https://nu.fi",
    source: null,
    tags: [ "wallet", "dex", "nftsupport"],
  }, 
  {
    title: "Voteaire",
    description:
      "Voteaire allows everyone in the ecosystem to create a poll. All results are weighted. All proposals and votes are stored publicly on-chain.",
    preview: require("./showcase/voteaire.png"),
    website: "https://voteaire.io/",
    source: null,
    tags: [ "daotool"],
  },
  {
    title: "Carda Station",
    description: 
      "Explore this virtual world on the moon with an in game avatar, and interact with other players through hangouts, games or events.",
    preview: require("./showcase/cardastation.png"),
    website: "https://cardastation.com/",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "STAMPD",
    description: 
      "Use the public blockchains to timestamp your files with indelible proof and mint with linked NFC physical tags for embedment in physical objects.",
    preview: require("./showcase/stampd.png"),
    website: "https://stampd.io/",
    source: null,
    tags: ["minting", "metadata"],
  },
  {
    title: "CNFTLab Party",
    description: 
      "Tool for minting CNFTs, manage your policyID, create royalties and start minting in few seconds.",
    preview: require("./showcase/cnftlab-party.png"),
    website: "https://www.cnftlab.party/",
    source: null,
    tags: ["minting", "nftsupport"],
  },
  {
    title: "TapTools",
    description:
      "All-in-one platform that offers free token distribution, comprehensive charts, NFT generation, and mint facilitation.",
    preview: require("./showcase/taptools.png"),
    website: "https://www.taptools.io",
    source: null,
    tags: [ "favorite", "analytics", "token", "minting"],
  },
  {
    title: "Chainport",
    description: 
      "ChainPort is a next-gen hard-security blockchain bridge that lets you hop across EVM chains to Cardano at a click.",
    preview: require("./showcase/chainport.png"),
    website: "https://www.chainport.io/",
    source: null,
    tags: ["bridge"],
  },
  {
    title: "Cardano Pet Registry",
    description: 
      "A virtually free, non profit, global pet registry system built on the Cardano blockchain, facilitates peer to peer pet rescue and historical proof of pet ownership.",
    preview: require("./showcase/petregistry.png"),
    website: "https://www.petregistry.io",
    source: null,
    tags: ["metadata", "identity"],
  }, 
  {
    title: "Cardano Studio",
    description:
      "Create and mint NFTs on Cardano all in your browser - without trusting a third party for minting.",
    preview: require("./showcase/cardano-studio.png"),
    website: "https://cardano-studio.app",
    source: null,
    tags: ["minting", "nftsupport"],
  },
  {
    title: "Raw Cardano Explorer",
    description: 
      "Cardano Blockchain Explorer to show data in a simple and fast way.",
    preview: require("./showcase/raw-cardano.png"),
    website: "https://www.rawcardano.app",
    source: null,
    tags: ["explorer"],
  },
  {
    title: "NFTada.io",
    description: 
      "Simple web interface and sophisticated API for automated printing and distribution.",
    preview: require("./showcase/nftada.png"),
    website: "https://nftada.io/",
    source: null,
    tags: ["minting", "nftsupport"],
  },
  {
    title: "Cardano Relay Map",
    description: 
      "Shows geographical distribution of Cardano stake pool relay nodes with flexible map features.",
    preview: require("./showcase/monadpool-relay-map.png"),
    website: "https://monadpool.com/cardano.html",
    source: null,
    tags: ["analytics"],
  },
  {
    title: "Finitum Bridge",
    description: 
      "Move supported tokens cross-chain, from BSC to Cardano and vice versa.",
    preview: require("./showcase/finitum-bridge.png"),
    website: "https://finitum.io/bridge",
    source: null,
    tags: ["bridge"],
  },
  {
    title: "BALANCE Analytics",
    description:
      "A Blockchain Intelligence app dedicated to supporting the Cardano Blockchain Ecosystem.",
    preview: require("./showcase/balance-analytics.png"),
    website: "https://balanceanalytics.io/",
    source: null,
    tags: ["analytics", "pooltool"],
  },
  {
    title: "Peer Review Money",
    description: 
      "Pretty straight forward site about the economics of ada, the native currency of the Cardano blockchain.",
    preview: require("./showcase/peerreview.money.png"),
    website: "https://peerreview.money",
    source: null,
    tags: ["analytics"],
  },
  {
    title: "Aeoniumsky",
    description: 
      "Winner of the CNFT Awards 2022 in the category \"best digital art\".",
    preview: require("./showcase/aeoniumsky.png"),
    website: "https://www.aeoniumsky.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "VyFinance",
    description: 
      "Winner of the CNFT Awards 2022 in the category \"best longterm utility\".",
    preview: require("./showcase/vyfinance.png"),
    website: "https://vyfi.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Universe 25",
    description: 
      "Winner of the CNFT Awards 2022 in the category \"Zeitgeist\".",
    preview: require("./showcase/universe25.png"),
    website: "https://www.universe25.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Unsigned Algorithms",
    description: 
      "Winner of the CNFT Awards 2022 in the category \"most innovative\".",
    preview: require("./showcase/unsigs.png"),
    website: "https://www.unsigs.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Hosky",
    description: 
      "Meme coin. Winner of the CNFT Awards 2022 in the category \"most impactful\".",
    preview: require("./showcase/hosky.png"),
    website: "https://hosky.io",
    source: null,
    tags: ["nftproject", "token"],
  },
  {
    title: "adahandle",
    description: 
      "A standardized NFT that developers and users can use to associate an address with a custom and human-readable address.",
    preview: require("./showcase/adahandle.png"),
    website: "https://adahandle.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Lace",
    description: 
      "A new light wallet platform from IOG, one of the creators of Cardano. Manually verified by an independent auditor, Lace lets you quickly, easily, and securely manage your digital assets and enjoy Web3.",
    preview: require("./showcase/lace.png"),
    website: "https://www.lace.io/",
    source: "https://github.com/input-output-hk/lace",
    tags: ["nftsupport", "wallet", "opensource"],
  },
  {
    title: "Do it with Lovelace",
    description:
      "A Cardano-based dApp platform for easy and secure donations with a focus on community impact and transparency.",
    preview: require("./showcase/do-it-with-lovelace.png"),
    website: "https://app.doitwithlovelace.io",
    source: null,
    tags: ["funding"],
  },
  {
    title: "flipr.io",
    description: 
      "flipr.io is a Web3 application that aspires to serve many purposes within the world of Cardano NFTs.",
    preview: require("./showcase/flipr.png"),
    website: "https://www.flipr.io/",
    source: null,
    tags: ["marketplace", "nftsupport", "minting"],
  },
  {
    title: "Aada.finance",
    description: 
      "Aada is a peer-to-peer lending and borrowing protocol on the Cardano blockchain.",
    preview: require("./showcase/aada-finance.png"),
    website: "https://app.aada.finance",
    source: null,
    tags: ["lending", "marketplace", "nftsupport"],
  },
  {
    title: "Continuity Token",
    description:
      "$COTO provides secure, global and long-lasting cold storage backups of Cardano NFT media.",
    preview: require("./showcase/coto.png"),
    website: "https://continuity.to/",
    source: null,
    tags: ["nftsupport", "token"],
  },
  {
    title: "BALANCE",
    description:
      "A Cardano Blockchain Research & Analytics Provider.",
    preview: require("./showcase/balanceanalytics.png"),
    website: "https://www.balanceanalytics.io/",
    source: null,
    tags: ["analytics", "pooltool"],
  },
  {
    title: "Summon Platform",
    description:
      "A DAO creation and governance platform on the Cardano blockchain.",
    preview: require("./showcase/summonplatform.png"),
    website: "https://summonplatform.io/",
    source: null,
    tags: ["daotool"],
  },
  {
    title: "VESPR Wallet",
    description:
      "VESPR is a non-custodial mobile light wallet for the Cardano network, prioritizing the security and safety of your digital assets while ensuring exceptional ease-of-use. Your private keys and assets always remain under your control.",
    preview: require("./showcase/vesprwallet.png"),
    website: "https://www.vespr.xyz/#/",
    source: null,
    tags: ["wallet", "nftsupport"],
  },
  {
    title: "DROPSPOT",
    description:
      "Premium NFT-as-a-Service, project advisory & design, minting services, white label services, claim services, loyalty programs, collectible design & development, activations and artist collaborations.",
    preview: require("./showcase/dropspot.png"),
    website: "https://dropspot.io/",
    source: null,
    tags: ["marketplace", "nftsupport", "minting"],
  },
  {
    title: "DexHunter",
    description:
      "DexHunter is a decentralized exchange aggregator with real-time alerts and an easy to use interface.",
    preview: require("./showcase/dexhunter.png"),
    website: "https://www.dexhunter.io/",
    source: null,
    tags: ["dex", "token"],
  },
  {
    title: "Liqwid",
    description:
      "Liqwid is a non-custodial pooled lending protocol with liquid staking built on Cardano.",
    preview: require("./showcase/liqwid.png"),
    website: "https://liqwid.finance/",
    source: null,
    tags: ["lending", "token", "marketplace", "nftsupport"],
  },
  {
    title: "decon",
    description:
      "decon is a decentralized social forum.",
    preview: require("./showcase/decon.png"),
    website: "https://decon.app/",
    source: "https://github.com/alucao/decon",
    tags: ["opensource", "metadata"],
  },
  {
    title: "Charli3",
    description:
      "Charli3 is a decentralized Oracle solution on Cardano, built natively for the chain, producing fully auditable data records on Cardano ledger.",
    preview: require("./showcase/charli3.jpg"),
    website: "https://charli3.io",
    source: null,
    tags: ["oracle", "metadata"],
  },
  {
    title: "Emurgo Academy",
    description:
      "Blockchain education and training programs designed to equip individuals with the knowledge and skills needed to understand and develop blockchain solutions. The paid courses cover various aspects of blockchain technology, including its fundamentals, development, and applications, with a focus on Cardano.",
    preview: require("./showcase/emurgo-academy.jpg"),
    website: "https://education.emurgo.io/cardano-courses/",
    source: null,
    tags: ["educational"],
  },
  {
    title: "Cardano Academy",
    description:
      "Learn blockchain fundamentals, consensus algorithms, and encryption methods. You’ll explore transaction models, risk mitigation, and scaling solutions. Additionally, you’ll delve into the Cardano blockchain, its governance, and practical uses of ada, including staking and decentralized applications.​",
    preview: require("./showcase/cardano-academy.jpg"),
    website: "https://academy.cardanofoundation.org",
    source: null,
    tags: ["favorite", "educational"],
  },
  {
    title: "Cardano Governance Tool",
    description:
      "A collection of tools to delegate voting power, become a DRep, become a direct voter, browse or proposa a governance actions on Cardano blockchain.",
    preview: require("./showcase/govtools.jpg"),
    website: "https://gov.tools",
    source: null,
    tags: ["favorite", "governance"],
  },
  {
    title: "Constitutional Committee Portal",
    description:
      "The Constitutional Committee Portal is your hub to read the Cardano Constitution, learn about the Committee, view member votes, and explore their rationales.",
    preview: require("./showcase/ccportal.jpg"),
    website: "https://constitution.gov.tools",
    source: null,
    tags: ["governance"],
  },
  {
    title: "Chang Watch",
    description:
      "Chang Watch provides various donut charts with insights on vote distribution and DReps.",
    preview: require("./showcase/changwatch.jpg"),
    website: "https://www.changwatch.com",
    source: null,
    tags: ["governance", "analytics"],
  },
  {
    title: "Danogo",
    description:
      "Danogo is a yield aggregator that provides lending and borrowing, obtaining optimized rates by combining data from multiple Cardano protocols.",
    preview: require("./showcase/danogo.png"),
    website: "https://danogo.io/",
    source: null,
    tags: ["lending", "marketplace", "dex", "token"],
  },
  {
    title: "Multisig Platform",
    description:
      "Secure your treasury and participant in governance, as a team with multi-signature.",
    preview: require("./showcase/mesh-multisig-platform.jpg"),
    website: "https://multisig.meshjs.dev/features",
    source: null,
    tags: ["governance", "wallet", "daotool"],
  },
  {
    title: "Tempo",
    description:
      "Tempo is a governance tool designed to streamline and enhance Cardano’s decision-making processes. We make it easier for DReps to register, gain delegations, and engage with their delegators. Additionally, Tempo supports DAOs and SPOs by providing essential tools for governance and transparency.",
    preview: require("./showcase/tempo.png"),
    website: "https://tempo.vote",
    source: null,
    tags: ["daotool", "governance"],
  },
  {
    title: "Begin Wallet",
    description:
      "Begin Wallet a non-custodial light Cardano Wallet, available as an Extension and Mobile. We offer payment link compatibility with deep link support, Begin ID user name based on ENS protocol for Wallet Address. Hardware wallet support Ledger and Keystone. Based on our own open source cryptographic core.",
    preview: require("./showcase/begin.png"),
    website: "https://begin.is",
    source: null,
    tags: ["wallet", "nftsupport"],
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
