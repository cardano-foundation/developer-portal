/**
 * Bootcamp curriculum data.
 * Drives the landing page accordion timeline. Update this to add modules or topics.
 */

const modules = [
  {
    number: 1,
    title: "Theory",
    description: "Application-layer fundamentals. What builders need to know, nothing they don't.",
    topics: [
      { title: "How Cardano Works", description: "Application-layer overview. What the blockchain does and why it's built this way." },
      { title: "The eUTxO Model", description: "Inputs, outputs, datums, redeemers. Why this shapes everything." },
      { title: "Transactions & Fees", description: "How transactions are constructed, fee mechanics, min-UTXO." },
      { title: "Native Assets", description: "Minting policies, asset IDs, fungible vs non-fungible." },
      { title: "Smart Contracts on Cardano", description: "Validators, script contexts, the validator lifecycle." },
    ],
  },
  {
    number: 2,
    title: "Practical Course",
    description: "Hands-on exercises. From your first transaction to multi-validator production systems.",
    topics: [
      { title: "Hello World", description: "Set up Mesh SDK, connect a wallet, send your first transaction." },
      { title: "Multisig", description: "Multi-signature transactions with a NextJS frontend." },
      { title: "First Aiken Contract", description: "Write, compile, and deploy a smart contract in Aiken." },
      { title: "Testing Contracts", description: "Test Aiken contracts with mock transactions." },
      { title: "Validation Best Practices", description: "Lean validators, less on-chain work." },
      { title: "Reading Blueprints", description: "CIP-57 blueprints. Bridging on-chain and off-chain." },
      { title: "Vesting Contract", description: "Lockup contract. Real DeFi primitive." },
      { title: "Multi-Validator NFT", description: "Multi-validator system with state threads." },
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
