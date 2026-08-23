// ============================================================================
// Builder Tools taxonomy
// ============================================================================
// A tool has ONE primary `category` plus `properties` drawn from two facets:
// Language and Interface. Categories are written to read to any web3/software
// developer, not in Cardano jargon.
// ============================================================================

// Primary categories (each tool has exactly one). `prominent: true` leads the
// "Browse tools by category" section; the rest sit in the lower utilities band.
export const Categories = {
  "smart-contracts": {
    label: "Smart Contracts",
    description: "Languages and frameworks for writing on-chain validators.",
    prominent: true,
  },
  sdk: {
    label: "SDKs & Libraries",
    description: "Build transactions and talk to the chain from your code.",
    prominent: true,
  },
  // --------------------------------------------------------------------------
  // Chain data & nodes form a stack: pick the layer a tool operates at:
  //   node         run / be a node ............. the node software itself
  //   node-access  talk to a node .............. CLIs, RPC bridges + protocol libs over a node
  //   indexer      self-host a queryable store . ingest chain data and serve it back
  //   api          hosted, run nothing ......... someone else runs the above for you
  // SDKs sit across the top: one library wrapping the node-access / indexer / api layers.
  // --------------------------------------------------------------------------
  api: {
    label: "APIs & Providers",
    description: "Hosted APIs and RPC providers for accessing the chain without running infrastructure.",
    prominent: true,
  },
  indexer: {
    label: "Indexers & Data",
    description: "Self-host a queryable store of chain data: indexers, data nodes, and pipelines.",
    prominent: true,
  },
  node: {
    label: "Nodes & Clients",
    description: "Run a Cardano node, or an alternative client implementation.",
    prominent: true,
  },
  "node-access": {
    label: "Node Access & RPC",
    description: "Connect to a node and talk to it: CLIs, RPC bridges, and protocol libraries.",
    prominent: true,
  },
  wallet: {
    label: "Wallets & Connectivity",
    description: "Wallet backends, dApp connectors, hardware signers, and programmatic wallets.",
    prominent: true,
  },
  "dev-env": {
    label: "Developer Environments",
    description: "IDEs, cloud environments, and local devnets.",
    prominent: false,
  },
  testing: {
    label: "Testing & Debugging",
    description: "Inspect, decode, debug, simulate, and test dApp integrations.",
    prominent: false,
  },
  operations: {
    label: "Node Operations",
    description: "Tooling for stake pool and node operators.",
    prominent: false,
  },
  governance: {
    label: "Governance",
    description: "Tooling for on-chain governance and voting.",
    prominent: false,
  },
  integration: {
    label: "Integration & Middleware",
    description: "Connectors and standardized integration interfaces.",
    prominent: false,
  },
  oracle: {
    label: "Oracles & Data Feeds",
    description: "On-chain price feeds and external data sources for smart contracts.",
    prominent: false,
  },
};

// Properties, facet 1: Language (the implementation / familiar language).
export const LanguageProperties = {
  typescript: { label: "TypeScript" },
  javascript: { label: "JavaScript" },
  python: { label: "Python" },
  rust: { label: "Rust" },
  haskell: { label: "Haskell" },
  java: { label: "Java" },
  net: { label: ".NET" },
  golang: { label: "Go" },
  scala: { label: "Scala" },
  c: { label: "C" },
  purescript: { label: "PureScript" },
  elm: { label: "Elm" },
  php: { label: "PHP" },
  swift: { label: "Swift" },
};

// Properties, facet 2: Interface (how you talk to it; mainly API/data tools).
export const InterfaceProperties = {
  rest: { label: "REST" },
  graphql: { label: "GraphQL" },
  grpc: { label: "gRPC" },
  websocket: { label: "WebSocket" },
};

export const Properties = { ...LanguageProperties, ...InterfaceProperties };

// Backwards-compat union (lookup by name regardless of facet).
export const Tags = { ...Categories, ...Properties };

export const CategoryList = Object.keys(Categories);
export const PropertyList = Object.keys(Properties);
export const LanguageList = Object.keys(LanguageProperties);
export const InterfaceList = Object.keys(InterfaceProperties);
