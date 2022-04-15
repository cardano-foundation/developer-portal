/*
 * SHOWCASE SECTION INFO
 *
 * The project showcase should be a place where someone new to the ecosystem 
 * can come to see what can be done - it should not be seen as a database where 
 * every project is promoted.
 * 
 * REQUIREMENTS FOR ADDING YOUR PROJECT TO THE SHOWCASE SECTION:
 * - It must be built on Cardano and have a real use case. For example, a forum where 
 *   people can talk about Cardano is great, but nothing for this showcase section.
 * - It has to run on Cardano mainnet.
 * - It has to have a running product. (no presale, no protected pages, no coming soon messages)
 * - It has to have enough community reputation.
 * - It has to provide a unique value from existing showcase items. (we can't list 
 *   thousands of NFT or native tokens with the current UI)
 * - It has to have a stable domain name. (a random Netlify/Vercel domain is not allowed, no 
 *   URL shortener, no app store links, or similar)
 * - The GitHub account that adds the project must not be new. 
 * - The GitHub account must have a history/or already be known in the Cardano community.
 * - Describe what makes your project special, avoid phrases like "the first this and that". Granular 
 *   details like which project was first is tribal attribute known to cause rift and conflicts.
 * - IF YOU ADD A PROJECT WHICH MAIN COMPONENT IS NFT, PLEASE SELECT "NFTPROJECT" AS TAG. (NOT "NFTSUPPORT")
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
      color: '#e9669e',
  },

  // Analytics
  analytics: {
    label: "Analytics",
    description: "Tools that provide special insights related to Cardano.",
    icon: null,
    color: '#39ca30',
  },

  // DEX
  dex: {
    label: "DEX",
    description: "Decentralised exchanges allow direct peer-to-peer cryptocurrency transactions to take place online securely.",
    icon: null,
    color: '#1B32F0'
  },

  // Ecosystem
  ecosystem: {
    label: "Ecosystem",
    description:
      "The Cardano ecosystem projects",
    icon: null,
    color: '#800080'
  },

  // Educational
  educational: {
    label: "Educational",
    description:
      "Educational projects that will help you onboarding to Cardano.",
    icon: null,
    color: '#a44fb7',
  },

  // Cardano Block Explorer
  explorer: {
    label: "Block Explorer",
    description:
      "Block explorers are browsers for the Cardano blockchain. They can display the contents of individual blocks and transactions.",
    icon: null,
    color: '#293133',
  },
 
  // Game
  game: {
    label: "Game",
    description: "Games on the Cardano blockchain.",
    icon: null,
    color: '#127f82'
  },

  // Gateways
  gateway: {
    label: "Gateway",
    description: "Payment Gateway Providers.",
    icon: null,
    color: '#fe6829',
  },

  // Identity
  identity: {
    label: "Identity",
    description: "Decentralized identifiers (DIDs)",
    icon: null,
    color: '#000'
  },

  // Marketplace 
  marketplace: {
    label: "Marketplace",
    description: "Marketplace where you can buy or sell nfts.",
    icon: null,
    color: '#f44f25',
  },
  
  // Meta data projects
  metadata: {
    label: "Metadata",
    description: "Transaction metadata",
    icon: null,
    color: '#14cfc3',
  },

  // Minting 
  minting: {
    label: "Minting",
    description: "Minting Tool",
    icon: null,
    color: '#23a5da',
  },

  // NFT Project (example: Spacebudz, Cardano Kidz)
  nftproject: {
    label: "NFT project",
    description: "A project which main component is NFT.",
    icon: null,
    color: '#F5D033'
  },

  // NFT (example: a wallet or marketplace)
  nftsupport: {
    label: "NFT support",
    description: "A project that supports NFT.",
    icon: null,
    color: '#D19412'
  },

  // For open-source sites, a link to the source code is required
  opensource: {
    label: "Open-Source",
    description: "Open-Source sites can be useful for inspiration.",
    icon: null,
    color: '#8c2f00',
  },

  // Pool Tool
  pooltool: {
    label: "Pool Tool",
    description:
      "Pool tools provide delegates with the necessary tools to find a good pool.",
    icon: null,
    color: '#4267b2', 
  },

  // Native token projects
  token: {
    label: "Native Token",
    description: "Native Tokens",
    icon: null,
    color: '#E63244'
  },

  // Wallets
  wallet: {
    label: "Wallet",
    description:
      "Cardano wallets store the public and/or private keys to access and manage your funds.",
    icon: null,
    color: '#7BC8A6'
  },

   // Ecosystem
   ecosystem: {
    label: "Ecosystem",
    description:
      "The Cardano ecosystem projects",
    icon: null,
    color: '#800080'
  },

};

// Add your project to (THE END OF) this list.
// Please don't add the "favorite"-tag yourself.
// Provide pure NFT projects only get the tag NFT, not "tokens"
const Showcases = [
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
      "Demonstrates serveral use cases for transaction metadata. You can sign messages and create proof of existence for files.",
    preview: require("./showcase/cardanowall.png"),
    website: "https://cardanowall.com/en/explore/",
    source: null,
    tags: ["favorite", "metadata"],
  },
  {
    title: "Crypto Heroez",
    description:
      "Cardano NFT pixelart collectibles. Tribute to heroes of the cryptospace. Including interactive NFTs and a game in progress where you use NFTs from your wallet.",
    preview: require("./showcase/cryptoheroez.png"),
    website: "https://cryptoheroez.io",
    source: null,
    tags: ["nftproject", "game"],
  },

  {
    title: "NFT Maker",
    description:
      "Create your own NFT by uploading an image and paying some ada.",
    preview: require("./showcase/nft-maker.png"),
    website: "https://www.nft-maker.io",
    source: null,
    tags: ["favorite", "minting", "nftsupport"],
  },
  {
    title: "SpaceBudz",
    description:
      "A collection of 10,000 unique little astronauts represented as NFTs on the Cardano blockchain. SpaceBudz offers a market place with contract based trades.",
    preview: require("./showcase/spacebudz.png"),
    website: "https://spacebudz.io",
    source: "https://github.com/Berry-Pool/spacebudz",
    tags: ["favorite", "nftproject", "opensource"],
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
    tags: ["favorite", "explorer"],
  },
  {
    title: "Pool PM",
    description:
      "Block explorer that brought out a new, refreshing concept to visualize transactions.",
    preview: require("./showcase/poolpm.png"),
    website: "https://pool.pm",
    source: null,
    tags: ["favorite", "favorite", "explorer"],
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
    title: "Adapools",
    description:
      "Well established stake pool explorer in Cardano. Yoroi is using our data to list stake pools in the wallet.",
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
    tags: ["favorite", "pooltool", "analytics"],
  },
  {
    title: "CardaStat",
    description:
      "A fresh look at pool performances for delegators in the ecosystem. Built as a progressive web application, ideal for mobile and desktop environments",
    preview: require("./showcase/cardastat.png"),
    website: "https://cardastat.info",
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
    tags: ["wallet", "opensource", "favorite"],
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
    description: "This game centered around incredible wizards who create magic, increase their skills, find totems, learn craft, complete quests, and much more.",
    preview: require("./showcase/cryptomage.png"),
    website: "https://cryptomage.net",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "Cardano Warriors",
    description: "The retro RPG NFT Collection minted in Cardano Blockchain.",
    preview: require("./showcase/cardanowarriors.png"),
    website: "https://www.cardanowarriors.io",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "Native Tokens",
    description: "Provides insights into native tokens on Cardano mainnet.",
    preview: require("./showcase/nativetokens.png"),
    website: "https://nativetokens.da.iogservices.io",
    source: null,
    tags: ["token", "analytics"],
  },
  {
    title: "Cardano Cubes & Blockemon",
    description: "Play Blockemon and have your moves quickly verified by, and forever stored on Cardano.",
    preview: require("./showcase/cardanocubes.png"),
    website: "https://cardanocubes.com",
    source: null,
    tags: ["nftproject", "game"],
  },
  {
    title: "Cardano Assets",
    description: "Overview of native tokens on Cardano.",
    preview: require("./showcase/cardanoassets.png"),
    website: "https://cardanoassets.com",
    source: null,
    tags: ["favorite", "analytics"],
  },
  {
    title: "NFTea",
    description: "Sometimes all you need is a good cup of NFTea.",
    preview: require("./showcase/nftea.png"),
    website: "https://cardanonftea.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardano Bits",
    description: "A collection of 10,000 unique pieces, minted with a time-locked policy, before the smart contracts were launched. Each collectible was generated with a mix of art pieces and computer algorithms.",
    preview: require("./showcase/cardanobits.png"),
    website: "https://cardanobits.art",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Crypto Knitties",
    description:
      "Adorable, cuddly and unique, CryptoKnitties are collectable knitted NFT companions for your Cardano wallet.",
    preview: require("./showcase/cryptoknitties.png"),
    website: "https://adaknitties.com",
    source: null,
    tags: ["nftproject"],
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
    title: "Token Tool",
    description: "Keep track of native token on testnet and mainnet.",
    preview: require("./showcase/tokentool.png"),
    website: "https://tokentool.io",
    source: null,
    tags: ["favorite", "token", "analytics"],
  },
  {
    title: "Transaction Meta Data Browser",
    description:
      "Browse and search different types of transaction metadata on Cardano.",
    preview: require("./showcase/transaction-meta-data-browser.png"),
    website: "https://bi.stakepoolcentral.com/transactiondata",
    source: null,
    tags: ["favorite", "metadata"],
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
    title: "Rewards Calendar",
    description:
      "Shows the epochs and rewards in a calendar.",
    preview: require("./showcase/rewardscalendar.png"),
    website: "https://dbooster.io/calendar",
    source: null,
    tags: ["favorite", "analytics"],
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
    website: "https://adapay.coti.io",
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
    title: "ccvault.io",
    description:
      "The alternative Cardano light wallet in the browser. Aims to add features most requested by the Cardano community.",
    preview: require("./showcase/ccvault.png"),
    website: "https://ccvault.io",
    source: null,
    tags: ["favorite", "wallet", "nftsupport"],
  },
  {
    title: "Jetchicken",
    description:
      "From the guys who brought you spacecoins, comes jetchickens. A collectible trading card game on the Cardano.",
    preview: require("./showcase/jetchicken.png"),
    website: "https://jetchicken.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "ADA Dolls",
    description:
      "There are 10,000 unique dolls. These will be randomly generated from a possible outcome of 1,000,000 doll combinations.",
    preview: require("./showcase/ada-dolls.png"),
    website: "https://adadolls.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "ADA Monsterz",
    description:
      "Collect. Trade. Share. Have Fun!",
    preview: require("./showcase/ada-monsterz.png"),
    website: "https://adamonsterz.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Canuckz NFTs",
    description:
      "Limited Edition Collectibles on the Cardano Blockchain.",
    preview: require("./showcase/canuckz.png"),
    website: "https://canuckz-nft.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardacity",
    description:
      "Your city is coming to Cardano.",
    preview: require("./showcase/cardacity.png"),
    website: "https://carda.city",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardano Gods",
    description:
      "Behold the mighty Cardano Gods. A full on-chain NFT art project on Cardano network.",
    preview: require("./showcase/cardano-gods.png"),
    website: "https://cardanogods.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardano Idols",
    description:
      "Tributes to our Cardano idols.",
    preview: require("./showcase/cardano-idols.png"),
    website: "https://www.cardanoidols.com",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Cardinos",
    description:
      "Cardinos were born from a late night conversation about how simply awesome Dinosaurs and NFTs are.",
    preview: require("./showcase/cardinos.png"),
    website: "https://cardinos.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Clay Mates",
    description:
      "Of clay - duh! Collectibles brought to life and re-homed on the Cardano blockchain.",
    preview: require("./showcase/clay-mates.png"),
    website: "https://www.claymates.org",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "Crypto Doggies",
    description:
      "Collect, trade, have fun, save real dogs!",
    preview: require("./showcase/crypto-doggies.png"),
    website: "https://cryptodoggies.org",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "The Galgos",
    description:
      "The Galgos is a set of limited edition hand drawn NFT collectibles with functionality. Collect, trade, discover.",
    preview: require("./showcase/the-galgos.png"),
    website: "https://thegalgos.io",
    source: null,
    tags: ["nftproject"],
  },
  {
    title: "The Hoskinsons",
    description:
      "The Hoskinsons is an original NFT collection commemorating the founders, developers, and personalities of the Cardano platform.",
    preview: require("./showcase/the-hoskinsons.png"),
    website: "https://thehoskinsons.com",
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
    title: "Kryptoids",
    description:
      "Legendary creatures on the Cardano blockchain!",
    preview: require("./showcase/kryptoids.png"),
    website: "https://kryptoids.monster",
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
    title: "Politikoz | NFTs on Cardano!",
    description: "The Cardano On-Chain Lottery Game.",
    preview: require("./showcase/politikoz.png"),
    website: "https://www.politikoz.io",
    source: null,
    tags: ["nftproject", "game"],
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
    title: "Tokhun.io",
    description:
        "Powerful yet easy to use NFT & FT Minting and Marketplace on Cardano.",
    preview: require("./showcase/tokhun.png"),
    website: "https://tokhun.io",
    source: null,
    tags: ["favorite", "marketplace", "nftsupport"],
  },
  {
    title: "H.Y.P.E. Skulls",
    description:
      "A new level of collectible NFT is hitting the Cardano Network! 1,500 unique 3D-animated cards featuring the HYPE Skull. No two are alike. Always handcrafted. Never automated.",
    preview: require("./showcase/hypeskulls.png"),
    website: "https://seehype.com/",
    source: null,
    tags: ["nftproject"],
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
    tags: ["pooltool","analytics","educational"],
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
    title: "Flint Wallet",
    description:
      "Flint is a friendly go-to wallet for DeFi and NFTs. As a light wallet, Flint allows you to easily manage multiple assets from different chains in your browser.",
    preview: require("./showcase/flintwallet.png"),
    website: "https://chrome.google.com/webstore/detail/flint/hnhobjmcibchnmglfbldbfabcgaknlkj",
    source: null,
    tags: ["favorite", "wallet", "nftsupport", "metadata"],
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
    title: "MermADA Minting",
    description:
      "Cardano NFT Minting Service providing white label solutions for your branding needs from our single NFT Mint tool to NFT Vending Machines to Token Faucets.",
    preview: require("./showcase/mermada.png"),
    website: "https://mermada.com/",
    source: null,
    tags: ["minting", "metadata", "token", "nftsupport", "educational"],
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
    title: "Adax.pro",
    description:
      "Adax.pro is a Decentralized Digital Assets Exchange built on the Cardano blockchain.",
    preview: require("./showcase/adax-pro.png"),
    website: "https://dex.adax.pro",
    source: null,
    tags: ["dex", "token"],
  },
  {
    title: "Minswap Dex",
    description:
      "Minswap is a multi-pool decentralized exchange on Cardano",
    preview: require("./showcase/minswap.png"),
    website: "https://app.minswap.org",
    source: null,
    tags: [ "dex", "token"],
  },
  {
    title: "CWallet",
    description:
      "Cross-Chain Non-Custodial Wallet & Liquidity Engine",
    preview: require("./showcase/cwallet.png"),
    website: "https://cwallet.finance",
    source: null,
    tags: ["wallet"],
  },
  {
    title: "GameChanger Wallet",
    description:
      "The ultimate wallet experience for the Web, with native NFT and token features, powered by Cardano and third party applications",
    preview: require("./showcase/gamechanger.png"),
    website: "https://gamechanger.finance",
    source: null,
    tags: [ "wallet"],
  },
  {
    title: "GeroWallet",
    description:
      "Start exploring the possibilities of Cardano. Purchase, send, and receive ADA - the cryptocurrency for Cardano. Available as a browser extension.",
    preview: require("./showcase/gerowallet.png"),
    website: "https://gerowallet.io",
    source: null,
    tags: [ "wallet"],
  },
  {
    title: "Built on Cardano",
    description:
      "Discover projects and dApps building on Cardano along with the developer tools you can use to build on Cardano. Explore similar projects and tools with ease and simply find you way back to where you started.",
    preview: require("./showcase/buildoncardano.png"),
    website: "https://builtoncardano.com",
    source: null,
    tags: [ "ecosystem"],
  },
  {
    title: "CardanoCube",
    description:
      "Explore 650+ Projects Building on Cardano",
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
    tags: [ "analytics", "nftsupport"],
  },
  {
    title: "Explorer Png",
    description:
      "Token Viewer on Cardano Blockchain",
    preview: require("./showcase/explorerxyz.png"),
    website: "https://ex.plorer.xyz",
    source: null,
    tags: [ "nftsupport"],
  },
  {
    title: "Galaxy Of Art",
    description:
      "Galaxy of Art is an environmentally friendly digital marketplace for non-fungible tokens (NFTs) that aims to bring joy and wealth to the creatives of the world.",
    preview: require("./showcase/galaxyofart.png"),
    website: "https://galaxyof.art",
    source: null,
    tags: [ "marketplace", "nftsupport"],
   },
   {
    title: "JPG Store",
    description:
      "Discover artwork, explore communities, and support artists on Cardano.",
    preview: require("./showcase/jpg.png"),
    website: "https://www.jpg.store",
    source: null,
    tags: [ "marketplace", "nftsupport"],
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
    tags: [ "game", "nftproject"],
  },
  {
    title: "WingRiders",
    description:
      "The DEX on Cardano. Native and fast AMM decentralized exchange platform.",
    preview: require("./showcase/wingriders.png"),
    website: "https://www.wingriders.com",
    source: null,
    tags: [ "dex", "token"],
  },
  {
    title: "Building On Cardano",
    description:
      "Place to view whats happening within the cardano ecosystem.",
    preview: require("./showcase/buildingoncardano.png"),
    website: "https://buildingoncardano.com",
    source: null,
    tags: [ "ecosystem"],
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
