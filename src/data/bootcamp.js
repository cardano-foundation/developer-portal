/**
 * Bootcamp curriculum data.
 * Drives the landing page accordion timeline.
 */

const modules = [
  {
    number: 1,
    title: "Theory",
    description: "Blockchain and Cardano fundamentals. What builders need to know.",
    topics: [
      { title: "What is a Blockchain?", description: "Distributed ledgers, the trust problem, and how blockchains solve it." },
      { title: "Cryptographic Primitives", description: "Hashing, digital signatures, and the crypto behind the chain." },
      { title: "Consensus Mechanisms", description: "How networks agree. Proof of Stake and Ouroboros." },
      { title: "The UTxO Model", description: "Inputs, outputs, and why Cardano doesn't use accounts." },
      { title: "Wallets, Keys & Addresses", description: "Key derivation, address types, and wallet architecture." },
      { title: "Transactions", description: "How transactions are constructed and submitted." },
      { title: "Smart Contracts", description: "What validators are and how they work on Cardano." },
      { title: "Smart Contract Languages", description: "Aiken, Plutus, OpShin, and the landscape of choices." },
      { title: "Datum, Redeemer, Context", description: "The three pieces of data every validator receives." },
      { title: "Native Tokens", description: "Minting policies, asset IDs, fungible vs non-fungible." },
      { title: "DeFi Concepts", description: "DEXes, lending, stablecoins, and how they work on UTxO." },
      { title: "Stake Pools & Delegation", description: "How staking works and what it means for dApps." },
      { title: "Developer Infrastructure", description: "Nodes, APIs, indexers, and the tools you'll use." },
      { title: "Blockchain Security", description: "Threat models and security considerations for builders." },
      { title: "Cardano Governance", description: "On-chain governance, DReps, and the Conway era." },
    ],
  },
  {
    number: 2,
    title: "Practical Course",
    description: "Hands-on exercises. From your first transaction to multi-validator production systems.",
    topics: [
      { title: "Hello World", description: "Set up Mesh SDK, create a wallet, send your first lovelace." },
      { title: "Multisig", description: "Multi-signature transactions with a NextJS frontend." },
      { title: "Aiken Contracts", description: "Write, compile, and deploy a smart contract in Aiken." },
      { title: "Contract Testing", description: "Test Aiken contracts with mock transactions." },
      { title: "Validation Best Practices", description: "Lean validators, less on-chain work." },
      { title: "Interpreting Blueprints", description: "CIP-57 blueprints. Bridging on-chain and off-chain." },
      { title: "Vesting Contract", description: "Lockup contract. Real DeFi primitive." },
      { title: "Plutus NFT", description: "Multi-validator system with state threads." },
      { title: "Hydra", description: "Layer 2 scaling with Hydra heads." },
      { title: "Web3 Services", description: "Integrating with Web3 services and APIs." },
      { title: "Project: Token-Gated Voting", description: "Build a voting dApp with token-gated access." },
      { title: "Project: Escrow Marketplace", description: "Build an escrow-based marketplace." },
      { title: "Project: Full-Stack dApp", description: "End-to-end dApp with frontend, contracts, and deployment." },
    ],
  },
  {
    number: 3,
    title: "Design Patterns",
    description: "The patterns that make production Cardano code work.",
    topics: [
      { title: "Stake Validator", description: "Using stake validators for efficient global state." },
      { title: "UTxO Indexers", description: "Indexing and finding UTxOs efficiently." },
      { title: "Tx-Level Minter", description: "Minting controlled at the transaction level." },
      { title: "Validity Range Normalization", description: "Handling time correctly in validators." },
      { title: "Merkelized Validator", description: "Storing large logic off-chain, proving on-chain." },
      { title: "Parameter Validation", description: "Parameterizing validators safely." },
      { title: "Linked List", description: "On-chain linked list data structure." },
      { title: "Merkle Tree", description: "On-chain merkle tree for proofs." },
      { title: "Trie", description: "On-chain trie data structure." },
    ],
  },
  {
    number: 4,
    title: "Optimization",
    description: "Make your contracts cheaper and faster to run.",
    topics: [
      { title: "Reducing Script Sizes", description: "Techniques for smaller compiled validators." },
      { title: "Minimizing Execution Units", description: "Less CPU and memory per transaction." },
      { title: "Datum Optimization", description: "Efficient datum structures and storage patterns." },
    ],
  },
  {
    number: 5,
    title: "Vulnerabilities",
    description: "How your validator can be exploited. Know the attacks before you ship.",
    topics: [
      { title: "Double Satisfaction", description: "When multiple validators share a satisfaction condition." },
      { title: "Missing UTxO Authentication", description: "Failing to verify the right UTxO is consumed." },
      { title: "Time Handling", description: "Exploiting validity range assumptions." },
      { title: "Token Security", description: "Token name and policy ID edge cases." },
      { title: "Unbounded Value / Datum / Inputs", description: "Validators that don't bound what they accept." },
      { title: "Other Redeemer", description: "Attacks via unexpected redeemer values." },
      { title: "Other Token Name", description: "Exploiting asset name assumptions." },
      { title: "Arbitrary Datum", description: "Injecting unexpected datum values." },
      { title: "UTxO Contention", description: "Concurrency issues from shared UTxOs." },
      { title: "Cheap Spam", description: "Low-cost denial-of-service on contract UTxOs." },
      { title: "Insufficient Staking Control", description: "Missing staking credential checks." },
      { title: "Locked Value", description: "Funds permanently locked by validator logic errors." },
    ],
  },
  {
    number: 6,
    title: "CTF Challenges",
    description: "Capture the flag. Find bugs in intentionally vulnerable contracts.",
    topics: [
      { title: "CTF Exercises", description: "Individual challenges with vulnerable contracts to exploit." },
    ],
  },
  {
    number: 7,
    title: "Testing & Verification",
    description: "Prove your code works. The highest level of assurance.",
    topics: [
      { title: "Property-Based Testing", description: "Test invariants, not just examples." },
      { title: "Mutation Testing", description: "Verify your tests actually catch bugs." },
      { title: "Integration Testing", description: "End-to-end testing with real chain interactions." },
      { title: "Formal Verification", description: "Using formal methods for validator correctness." },
    ],
  },
];

module.exports = modules;
