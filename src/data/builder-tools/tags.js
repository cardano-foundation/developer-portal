// ============================================================================
// Builder Tools taxonomy
// ============================================================================
// Industry-anchored: a tool has ONE primary `category` plus `properties` drawn
// from two facets — Language and Interface. Categories read to any web3/software
// developer (see the `analog` field), not Cardano jargon.
// ============================================================================

// Primary categories (each tool has exactly one). `prominent: true` leads the
// "Browse tools by category" section; the rest sit in the lower utilities band.
export const Categories = {
  "smart-contracts": {
    label: "Smart Contracts",
    description: "Languages and frameworks for writing on-chain validators.",
    analog: "Solidity, Move",
    color: "#FF6B6B",
    prominent: true,
  },
  sdk: {
    label: "SDKs & Libraries",
    description: "Build transactions and talk to the chain from your code.",
    analog: "ethers, viem, web3.py, CosmJS",
    color: "#16A085",
    prominent: true,
  },
  api: {
    label: "APIs & Providers",
    description: "Hosted APIs for accessing the chain without running infrastructure.",
    analog: "Infura, Alchemy",
    color: "#4ECDC4",
    prominent: true,
  },
  indexer: {
    label: "Indexers & Data",
    description: "Self-hosted indexing, querying, and data pipelines.",
    analog: "The Graph, Ponder",
    color: "#2E3B4E",
    prominent: true,
  },
  node: {
    label: "Nodes & Network",
    description: "Node implementations, bridges, and protocol libraries.",
    analog: "Geth, Reth",
    color: "#5b8a72",
    prominent: true,
  },
  wallet: {
    label: "Wallets & Connectivity",
    description: "Wallet backends, dApp connectors, hardware, and dev wallets.",
    analog: "wagmi, WalletConnect",
    color: "#E1B12c",
    prominent: true,
  },
  "dev-env": {
    label: "Developer Environments",
    description: "IDEs, cloud environments, and local devnets.",
    analog: "Remix, Hardhat, Tenderly",
    color: "#3742fa",
    prominent: false,
  },
  testing: {
    label: "Testing & Debugging",
    description: "Inspect, decode, debug, and simulate.",
    analog: "Tenderly debugger, forge test",
    color: "#6ab04c",
    prominent: false,
  },
  operations: {
    label: "Node Operations",
    description: "Tooling for stake pool and node operators.",
    analog: "validator / staking tooling",
    color: "#4267b2",
    prominent: false,
  },
  governance: {
    label: "Governance",
    description: "Tooling for on-chain governance and voting.",
    analog: "DAO / governance tooling",
    color: "#673AB7",
    prominent: false,
  },
  integration: {
    label: "Integration & Middleware",
    description: "Connectors and standardized integration interfaces.",
    analog: "middleware / interop connectors",
    color: "#9C27B0",
    prominent: false,
  },
};

// Properties — facet 1: Language (the implementation / familiar language).
export const LanguageProperties = {
  typescript: { label: "TypeScript", color: "#3178C6" },
  javascript: { label: "JavaScript", color: "#f0c000" },
  python: { label: "Python", color: "#5dc942" },
  rust: { label: "Rust", color: "#7e6a4c" },
  haskell: { label: "Haskell", color: "#5F5287" },
  java: { label: "Java", color: "#d5232d" },
  net: { label: ".NET", color: "#e46fd9" },
  golang: { label: "Go", color: "#50b7e0" },
  scala: { label: "Scala", color: "#DC322F" },
  c: { label: "C", color: "#a37c5b" },
  purescript: { label: "PureScript", color: "#0F9D58" },
  elm: { label: "Elm", color: "#60B5CC" },
  php: { label: "PHP", color: "#777BB4" },
};

// Properties — facet 2: Interface (how you talk to it; mainly API/data tools).
export const InterfaceProperties = {
  rest: { label: "REST", color: "#7F8C8D" },
  graphql: { label: "GraphQL", color: "#E10098" },
  grpc: { label: "gRPC", color: "#00ADD8" },
  websocket: { label: "WebSocket", color: "#1DB7ff" },
};

export const Properties = { ...LanguageProperties, ...InterfaceProperties };

// Backwards-compat union (lookup by name regardless of facet).
export const Tags = { ...Categories, ...Properties };

export const CategoryList = Object.keys(Categories);
export const PropertyList = Object.keys(Properties);
export const LanguageList = Object.keys(LanguageProperties);
export const InterfaceList = Object.keys(InterfaceProperties);
