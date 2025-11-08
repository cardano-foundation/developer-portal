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
    description: "C language",
    icon: null,
    color: '#eca882',
  },

  elm: {
    label: "Elm",
    description: "Elm language",
    icon: null,
    color: "#2D79C7"
  },

  golang: {
    label: "Go",
    description:
      "Go language",
    icon: null,
    color: '#50b7e0',
  },

  haskell: {
    label: "Haskell",
    description:
      "Haskell language",
    icon: null,
    color: "#5F5287"
  },

  java: {
    label: "Java",
    description:
      "Java language",
    icon: null,
    color: '#d5232d',
  },

  javascript: {
    label: "JavaScript",
    description:
      "JavaScript language",
    icon: null,
    color: '#fce300',
  },

  net: {
    label: ".NET",
    description: ".NET language",
    icon: null,
    color: '#e46fd9',
  },

  php: {
    label: "PHP",
    description: "PHP language",
    icon: null,
    color: "#777BB4"
  },

  purescript: {
    label: "Purescript",
    description:
      "PureScript language",
    icon: null,
    color: '#0F9D58',
  },

  python: {
    label: "Python",
    description:
      "Python language",
    icon: null,
    color: '#5dc942',
  },

  rust: {
    label: "Rust",
    description:
      "Rust language",
    icon: null,
    color: '#7e6a4c',
  },

  scala: {
    label: "Scala",
    description: "Scala language",
    icon: null,
    color: "#2D79C7"
  },

  typescript: {
    label: "TypeScript",
    description:
      "TypeScript language",
    icon: null,
    color: "#2D79C7"
  },

  // ===== PROTOCOLS/APIs =====
  http: {
    label: "HTTP",
    description:
      "API w/ HTTP",
    icon: null,
    color: "#7F8C8D"
  },

  websocket: {
    label: "WebSocket",
    description:
      "API w/ WebSocket",
    icon: null,
    color: "#1DB7ff"
  },

  // ===== DATA FORMATS =====
  json: {
    label: "JSON",
    description:
      "JSON data format",
    icon: null,
    color: "#FCE300"
  },

  // ===== DATABASES =====
  redis: {
    label: "Redis",
    description: "Redis",
    icon: null,
    color: "#FD7272"
  },

  sql: {
    label: "SQL",
    description: "SQL database (MySQL, PostgreSQL, SQLite...)",
    icon: null,
    color: "#FD7272"
  },

  // ===== TOOLS =====
  cli: {
    label: "CLI",
    description: "Command-line interface tools",
    icon: null,
    color: '#921f32',
  },

  // ===== DEVELOPMENT TOOLS =====
  IDE: {
    label: "IDE",
    description:
      "Integrated development environment",
    icon: null,
    color: '#001eff',
  },

  smartcontracts: {
    label: "Smart Contracts",
    description: "Smart contracts",
    icon: null,
    color: "#2D79C7"
  },

  transactionbuilder: {
    label: "Transaction Builder",
    description:
      "Tools for building and submitting Cardano transactions",
    icon: null,
    color: "#16A085"
  },

  serialization: {
    label: "Serialization",
    description:
      "Binary serialization / deserialization",
    icon: null,
    color: "#D6A2E8"
  },

  // ===== TESTING & QUALITY =====
  testing: {
    label: "Testing",
    description: "Testing / Quality Assurance tool",
    icon: null,
    color: "#B8E994"
  },

  // ===== INFRASTRUCTURE & DATA =====
  indexer: {
    label: "Indexer",
    description:
      "Indexer for Cardano blockchain data",
    icon: null,
    color: '#000'
  },

  provider: {
    label: "Provider",
    description: "Provider for Cardano blockchain data",
    icon: null,
    color: "#2D79C7"
  },

  nodeclient: {
    label: "Node Client",
    description: "Node Client for Cardano blockchain data",
    icon: null,
    color: "#2D79C7"
  },

  hosted: {
    label: "Hosted Service",
    description: "Hosted / 3rd-party service",
    icon: null,
    color: "#4a69BD"
  },

  // ===== APPLICATION DOMAINS =====
  wallet: {
    label: "Wallet",
    description:
      "Wallet integrations or implementations",
    icon: null,
    color: "#E1B12c"
  },

  nft: {
    label: "NFT",
    description: "Non-Fungible Token (NFT)",
    icon: null,
    color: '#fe6829',
  },

  governance: {
    label: "Governance",
    description: "Governance tools.",
    icon: null,
    color: '#673AB7',  // Deep Purple
  },

  operatortool: {
    label: "Operator Tool",
    description:
      "Stake pool operator tools.",
    icon: null,
    color: '#4267b2',
  },
};

export const TagList = Object.keys(Tags);

export const LanguagesOrTechnologiesTags = [
  // Programming Languages (alphabetical)
  "c",
  "elm",
  "golang",
  "haskell",
  "java",
  "javascript",
  "net",
  "php",
  "purescript",
  "python",
  "rust",
  "scala",
  "typescript",
  // Protocols/APIs
  "http",
  "websocket",
  // Data Formats
  "json",
  // Databases
  "redis",
  "sql",
  // Tools
  "cli",
];

export const DomainsTags = [
  // Development Tools
  "IDE",
  "smartcontracts",
  "transactionbuilder",
  "serialization",
  // Testing & Quality
  "testing",
  // Infrastructure & Data
  "indexer",
  "provider",
  "nodeclient",
  "hosted",
  // Application Domains
  "wallet",
  "nft",
  "governance",
  "operatortool",
];
