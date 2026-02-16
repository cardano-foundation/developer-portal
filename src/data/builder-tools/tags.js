// List of available tags. The tag should be singular and the label in plural. (PLEASE DO NOT ADD NEW TAGS)
export const Tags = {
  // ===== SPECIAL =====
  // PLEASE DO NOT USE THIS TAG: we choose the favorite tools (process TBD)
  favorite: {
    label: "Favorite",
    description:
      "Our favorite Cardano builder tools that you must absolutely check-out.",
    color: '#e9669e',
  },

  // ===== PROGRAMMING LANGUAGES (alphabetical) =====
  c: {
    label: "C",
    description: "Tools written in or providing bindings for C",
    icon: null,
    color: '#eca882',
  },

  elm: {
    label: "Elm",
    description: "Tools written in or providing bindings for Elm",
    icon: null,
    color: "#60B5CC"
  },

  golang: {
    label: "Go",
    description: "Tools written in or providing bindings for Go",
    icon: null,
    color: '#50b7e0',
  },

  haskell: {
    label: "Haskell",
    description: "Tools written in or providing bindings for Haskell",
    icon: null,
    color: "#5F5287"
  },

  java: {
    label: "Java",
    description: "Tools written in or providing bindings for Java",
    icon: null,
    color: '#d5232d',
  },

  javascript: {
    label: "JavaScript",
    description: "Tools written in or providing bindings for JavaScript",
    icon: null,
    color: '#fce300',
  },

  net: {
    label: ".NET",
    description: "Tools written in or providing bindings for .NET",
    icon: null,
    color: '#e46fd9',
  },

  php: {
    label: "PHP",
    description: "Tools written in or providing bindings for PHP",
    icon: null,
    color: "#777BB4"
  },

  purescript: {
    label: "Purescript",
    description: "Tools written in or providing bindings for PureScript",
    icon: null,
    color: '#0F9D58',
  },

  python: {
    label: "Python",
    description: "Tools written in or providing bindings for Python",
    icon: null,
    color: '#5dc942',
  },

  rust: {
    label: "Rust",
    description: "Tools written in or providing bindings for Rust",
    icon: null,
    color: '#7e6a4c',
  },

  scala: {
    label: "Scala",
    description: "Tools written in or providing bindings for Scala",
    icon: null,
    color: "#DC322F"
  },

  typescript: {
    label: "TypeScript",
    description: "Tools written in or providing bindings for TypeScript",
    icon: null,
    color: "#3178C6"
  },

  // ===== PROTOCOLS/APIs =====
  http: {
    label: "HTTP",
    description: "Tools that expose an HTTP REST API",
    icon: null,
    color: "#7F8C8D"
  },

  websocket: {
    label: "WebSocket",
    description: "Tools that expose a WebSocket API for real-time streaming",
    icon: null,
    color: "#1DB7ff"
  },

  // ===== DATA FORMATS =====
  json: {
    label: "JSON",
    description: "Tools that use JSON as their primary data format",
    icon: null,
    color: "#F7931E"
  },

  // ===== DATABASES =====
  redis: {
    label: "Redis",
    description: "Tools that use Redis for caching or storage",
    icon: null,
    color: "#FD7272"
  },

  sql: {
    label: "SQL",
    description: "Tools backed by a SQL database (PostgreSQL, SQLite, etc.)",
    icon: null,
    color: "#336791"
  },

  // ===== TOOLS =====
  cli: {
    label: "CLI",
    description: "Tools usable from the command line",
    icon: null,
    color: '#921f32',
  },

  // ===== DEVELOPMENT TOOLS =====
  IDE: {
    label: "IDE",
    description: "Editor plugins and cloud development environments",
    icon: null,
    color: '#001eff',
  },

  smartcontracts: {
    label: "Smart Contracts",
    description: "Languages and platforms for writing on-chain validators",
    icon: null,
    color: "#FF6B6B"
  },

  transactionbuilder: {
    label: "Transaction Builder",
    description: "Libraries for building and submitting Cardano transactions",
    icon: null,
    color: "#16A085"
  },

  serialization: {
    label: "Serialization",
    description: "Libraries for encoding and decoding addresses, transactions, and other Cardano data",
    icon: null,
    color: "#D6A2E8"
  },

  // ===== TESTING & QUALITY =====
  testing: {
    label: "Testing",
    description: "Testing frameworks, local devnets, debuggers, and transaction inspectors",
    icon: null,
    color: "#B8E994"
  },

  // ===== INFRASTRUCTURE & DATA =====
  indexer: {
    label: "Indexer",
    description: "Services that index and query on-chain data",
    icon: null,
    color: '#000'
  },

  provider: {
    label: "Provider",
    description: "Hosted APIs for accessing blockchain data without running a node",
    icon: null,
    color: "#4ECDC4"
  },

  nodeclient: {
    label: "Node Client",
    description: "Alternative node implementations or libraries for connecting to Cardano nodes",
    icon: null,
    color: "#95E1D3"
  },

  hosted: {
    label: "Hosted Service",
    description: "Managed third-party services (no self-hosting required)",
    icon: null,
    color: "#4a69BD"
  },

  // ===== APPLICATION DOMAINS =====
  wallet: {
    label: "Wallet",
    description: "Tools for wallet integration, key management, or CIP-30 connectivity",
    icon: null,
    color: "#E1B12c"
  },

  nft: {
    label: "NFT",
    description: "Tools for minting, managing, or querying NFTs and tokens",
    icon: null,
    color: '#fe6829',
  },

  governance: {
    label: "Governance",
    description: "Tools for on-chain governance participation and voting",
    icon: null,
    color: '#673AB7',
  },

  operatortool: {
    label: "Operator Tool",
    description: "Tools for running and managing stake pools",
    icon: null,
    color: '#4267b2',
  },
};

export const TagList = Object.keys(Tags);

export const LanguagesOrTechnologiesTags = [
  "c",
  "cli",
  "elm",
  "golang",
  "haskell",
  "http",
  "java",
  "javascript",
  "json",
  "net",
  "php",
  "purescript",
  "python",
  "redis",
  "rust",
  "scala",
  "sql",
  "typescript",
  "websocket",
];

export const DomainsTags = [
  "governance",
  "hosted",
  "IDE",
  "indexer",
  "nft",
  "nodeclient",
  "operatortool",
  "provider",
  "serialization",
  "smartcontracts",
  "testing",
  "transactionbuilder",
  "wallet",
];
