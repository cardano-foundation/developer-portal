// ============================================================================
// Reference smart contracts surfaced at /templates/contracts
// ============================================================================
// Each entry is one codebase for a use case. When a use case has independent
// codebases (e.g. the CF monitoring escrow and MeshJS's escrow), each is its own
// entry; the card tells them apart with a "via <source>" label naming the
// source it was aggregated from (see SOURCES in sources.js). Append an entry to
// add a contract. Validation runs at build (this file -> validation.js) and
// fail-fasts on bad fields.
// Full contributor guide + provenance: src/data/contracts/README.md.
//
// Most entries mirror the Cardano Foundation monitoring repo (MONITORING_BASE
// below); a chip means that implementation exists at the entry's repoUrl, not
// that it currently passes CI.
//
// Fields:
//   title        (required) display name
//   description  (required) one plain sentence
//   category     (required) one id from Categories (tags.js)
//   onchain      array of ids from OnchainLangs (tags.js); may be empty
//   offchain     array of ids from OffchainLangs (tags.js); may be empty
//   repoUrl      (required) the single canonical link for this codebase
//   source       (optional) which listed collection we aggregated this from: an
//                  id from SOURCES in ./sources.js (monitoring, anastasia,
//                  awesomeAiken, meshjs). Omit for a standalone contract not from a
//                  listed source; it is then credited by its repo owner. Distinct
//                  from repoUrl: source = where we found it, repoUrl = its own code.
//   reference    (optional) boolean; a written reference with no published code
// ============================================================================

// Repo roots for the two sources we mirror in bulk. Each entry below appends its
// own folder (e.g. `${MONITORING_BASE}/escrow`), so the long URL lives in one
// place and only the folder varies. Same repos as the monitoring/meshjs urls in
// sources.js, just pointed at the per-contract level.
const MONITORING_BASE =
  "https://github.com/cardano-foundation/cardano-template-and-ecosystem-monitoring/tree/main";
const MESH_CONTRACT_BASE =
  "https://github.com/MeshJS/mesh/tree/main/packages/mesh-contract/src";

export const Contracts = [
  {
    title: "Anonymous data",
    description:
      "Commit data on-chain under an identifier derived from a wallet and a secret nonce, then prove ownership later by revealing the nonce.",
    category: "data",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/anonymous-data`,
  },
  {
    title: "Atomic transaction",
    description:
      "Spend from a script and mint a token in one transaction to show how Cardano transactions succeed or fail as a single unit.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/atomic-transaction`,
  },
  {
    title: "Auction",
    description:
      "Run an on-chain English auction where bids are locked in the contract, outbid bidders reclaim their funds, and the highest bid settles when the deadline passes.",
    category: "defi",
    onchain: ["aiken", "scalus"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/auction`,
  },
  {
    title: "Bet",
    description:
      "Let two players stake an equal amount and have a restricted oracle announce the winner, who then claims the whole pot.",
    category: "defi",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/bet`,
  },
  {
    title: "Constant product AMM",
    description:
      "A written specification for an automated market maker that prices swaps with the constant product formula and lets anyone provide liquidity.",
    category: "defi",
    reference: true,
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/constant-product-amm`,
  },
  {
    title: "Crowdfund",
    description:
      "Collect donations toward a funding goal where the beneficiary withdraws only if the goal is met by the deadline, and contributors otherwise reclaim their funds.",
    category: "defi",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/crowdfund`,
  },
  {
    title: "Decentralized identity",
    description:
      "Manage self-sovereign identities where an address controls ownership through signatures and can authorize time-limited delegates.",
    category: "identity",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/decentralized-identity`,
  },
  {
    title: "Editable NFT",
    description:
      "A written specification for an NFT whose owner can update its data, transfer it, and permanently seal it against further edits.",
    category: "tokens",
    reference: true,
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/editable-nft`,
  },
  {
    title: "Escrow",
    description:
      "Hold assets from two parties until both sign off, then complete or cancel the exchange.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/escrow`,
  },
  {
    title: "Escrow",
    description:
      "Hold assets from two parties until both sign off, then complete or cancel the exchange.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/escrow`,
  },
  {
    title: "Factory",
    description:
      "Deterministically create and track many product contracts from a single factory instance using a marker NFT and on-chain registry.",
    category: "access",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/factory`,
  },
  {
    title: "HTLC",
    description:
      "Lock funds behind a secret and an expiry so anyone can claim them by guessing the secret before the deadline, after which the owner reclaims them.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/htlc`,
  },
  {
    title: "Lottery",
    description:
      "Run a fair two-player lottery using a commit-reveal-punish protocol that needs no external randomness or oracle.",
    category: "defi",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/lottery`,
  },
  {
    title: "Payment splitter",
    description:
      "Distribute locked funds equally among a fixed list of known payees.",
    category: "payments",
    onchain: ["aiken", "scalus"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/payment-splitter`,
  },
  {
    title: "Payment splitter",
    description:
      "Distribute locked funds equally among a fixed list of known payees.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/payment-splitter`,
  },
  {
    title: "Price bet",
    description:
      "Let two players bet on whether an oracle exchange rate reaches a target before a deadline, with the pot going to the winning side.",
    category: "defi",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/pricebet`,
  },
  {
    title: "Simple transfer",
    description:
      "Deposit assets at a script and name a receiver who can later withdraw them.",
    category: "basics",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/simple-transfer`,
  },
  {
    title: "Simple wallet",
    description:
      "An on-chain ADA wallet where the owner creates payment intents, executes them to pay recipients, and can withdraw the full balance.",
    category: "basics",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/simple-wallet`,
  },
  {
    title: "Storage",
    description:
      "Anchor SHA-256 commitments of off-chain data on-chain so anyone can re-hash the data and verify its integrity and existence.",
    category: "data",
    onchain: ["aiken"],
    offchain: ["blaze", "ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/storage`,
  },
  {
    title: "Token transfer",
    description:
      "Lock a specific native asset that only a designated receiver can withdraw by signing the spending transaction.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/token-transfer`,
  },
  {
    title: "Upgradable proxy",
    description:
      "Point a stable proxy address at a logic script hash stored in its datum, so the logic version can be swapped by updating the datum.",
    category: "access",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/upgradable-proxy`,
  },
  {
    title: "Vault",
    description:
      "Protect funds with time-delayed withdrawals and a separate recovery key that can cancel a pending withdrawal during the wait period.",
    category: "access",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/vault`,
  },
  {
    title: "Vesting",
    description:
      "Lock funds for a period and let the beneficiary withdraw them once the lockup elapses.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["ccl", "evolution", "meshjs", "pycardano"],
    source: "monitoring",
    repoUrl: `${MONITORING_BASE}/vesting`,
  },
  {
    title: "Vesting",
    description:
      "Lock funds for a period and let the beneficiary withdraw them once the lockup elapses.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/vesting`,
  },
  // MeshJS smart-contract library
  {
    title: "Hello World",
    description:
      "Lock and unlock assets, a hands-on intro to validation and transaction building.",
    category: "basics",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/hello-world`,
  },
  {
    title: "Marketplace",
    description: "Buy and sell native assets such as NFTs.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/marketplace`,
  },
  {
    title: "Swap",
    description: "Exchange assets between two parties.",
    category: "defi",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/swap`,
  },
  {
    title: "Giftcard",
    description: "Lock assets into a card that anyone can redeem.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/giftcard`,
  },
  {
    title: "NFT minting machine",
    description: "Mint NFTs with an automatically incremented index.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/plutus-nft`,
  },
  {
    title: "Content ownership",
    description: "A registry where users create and own content.",
    category: "data",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/content-ownership`,
  },
  {
    title: "Royalties",
    description:
      "Enforce creator royalty payments on NFT sales using the CIP-102 royalty datum standard.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: ["meshjs"],
    source: "meshjs",
    repoUrl: `${MESH_CONTRACT_BASE}/royalties`,
  },
  // Anastasia Labs
  {
    title: "Upgradable multisig",
    description: "Collective fund management requiring multiple approvals.",
    category: "access",
    onchain: ["aiken"],
    offchain: ["evolution"],
    source: "anastasia",
    repoUrl: "https://github.com/Anastasia-Labs/aiken-upgradable-multisig",
  },
  {
    title: "Payment subscription",
    description:
      "Automated recurring payments between subscribers and merchants.",
    category: "payments",
    onchain: ["aiken"],
    offchain: ["evolution"],
    source: "anastasia",
    repoUrl: "https://github.com/Anastasia-Labs/payment-subscription",
  },
  // awesome-aiken: production dApps from github.com/aiken-lang/awesome-aiken,
  // referenced on the on-chain Aiken side (no off-chain chip). source is set
  // explicitly because these repos are not one of the auto-detected catalogs.
  {
    title: "SundaeSwap V3",
    description: "An automated market maker decentralized exchange.",
    category: "defi",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/SundaeSwap-finance/sundae-contracts",
  },
  {
    title: "Minswap V2",
    description: "An automated market maker decentralized exchange.",
    category: "defi",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/minswap/minswap-dex-v2",
  },
  {
    title: "Minswap Stableswap",
    description: "A stableswap exchange for price-pegged assets.",
    category: "defi",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/minswap/minswap-stableswap",
  },
  {
    title: "SundaeSwap Yield Farming v2",
    description: "Yield farming reward-distribution contracts.",
    category: "defi",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/SundaeSwap-finance/sundae-yield-v2/tree/main/contracts/freezer",
  },
  {
    title: "Jpg Store",
    description: "An NFT marketplace.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/jpg-store/contracts-v3",
  },
  {
    title: "Nebula",
    description:
      "An NFT marketplace contract with a chain indexer and event listener for individual projects.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/spacebudz/nebula/tree/main/contract/src/nebula",
  },
  {
    title: "Projected NFT Whirlpool",
    description:
      "A protocol that lets NFTs from other ecosystems be used in games while keeping custody.",
    category: "tokens",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/PaimaStudios/projected-nft-whirlpool/tree/main/cardano",
  },
  {
    title: "Seedelf",
    description: "A stealth wallet that hides the recipient of a payment.",
    category: "privacy",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/logical-mechanism/Seedelf-Wallet/tree/main/seedelf-contracts",
  },
  {
    title: "ENCOINS",
    description: "An NFT-based private transactions protocol.",
    category: "privacy",
    onchain: ["aiken"],
    offchain: [],
    source: "awesomeAiken",
    repoUrl: "https://github.com/encryptedcoins/encoins-core-aiken",
  },
];
