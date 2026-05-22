/**
 * Mermaid source for the Cardano Developer Pathway diagram.
 * Consumed by overview.mdx via MermaidDiagramFrame + @theme/Mermaid.
 *
 * Node labels intentionally describe categories of work and tools
 * rather than specific products, SDKs, CIP numbers, or audit firms.
 * Concrete recommendations live in the dedicated docs pages so the
 * diagram does not need to be re-edited as the ecosystem evolves.
 */
const pathwayChart = `flowchart TD
  subgraph phase1 [Phase 1 · Orientation and entry]
    start([Where are you starting])
    beginner[Complete beginner no code yet]
    web2[Web2 developer any mainstream language]
    designer[Designer UI UX motion]
    evmEntry[Solidity or EVM background]
    start --> beginner
    start --> web2
    start --> designer
    start --> evmEntry
    beginner --> fund
    web2 --> fund
    designer --> fund
    evmEntry -->|Recommended same core as everyone| fund
    fund["Cardano fundamentals eUTxO native tokens consensus governance"]
    fund --> learnHere["Learn from official docs academies and community courses"]
  end

  subgraph phase2 [Phase 2 · Cross-cutting knowledge]
    stack2026["Pick a default stack an on-chain language an off-chain SDK an API provider"]
    noFullNode["Most dApps do not need a synced full node use an API provider"]
    cborNote["Binary encoding CBOR in transactions datums redeemers and addresses"]
    cipPick["Key CIPs wallet connection native tokens reference scripts datums governance"]
  end

  learnHere --> stack2026
  learnHere --> noFullNode
  fund --> cborNote
  fund --> cipPick

  subgraph phase3 [Phase 3 · Intermediate projects]
    rampVm[Vending machine or single-purpose contract]
    rampNft[NFT minter project]
    rampDex[Simple DEX or swap UTxO concurrency lesson]
    rampFull[Full stack app validator SDK UI APIs]
    rampVm --> rampNft --> rampDex --> rampFull
  end

  learnHere --> rampVm

  evmEntry -->|Or fast path after basics| evmMap["EVM to Cardano accounts vs UTxO no msg.sender execution units vs gas"]
  evmMap --> readySpec

  rampFull --> readySpec
  cipPick --> readySpec
  stack2026 --> readySpec

  readySpec[Ready to specialise pick a primary track]

  readySpec --> pickTrack{Choose primary track}

  pickTrack --> trackSc[Smart contracts on-chain logic]
  pickTrack --> trackFe[Frontend dApp UI]
  pickTrack --> trackInfra[Infrastructure node indexers APIs SPO]

  trackSc --> langPick{On-chain language}

  langPick --> langDefault[Recommended on-chain language for new developers]
  langPick --> langCore[Core original on-chain language]
  langPick --> langAlt[Alternative on-chain languages]

  langDefault --> langLearn
  langCore --> langLearn
  langAlt --> langLearn

  langLearn[Read docs install toolchain write tests]
  langLearn --> localDevnet

  localDevnet["Local devnet for fast feedback before testnet"]
  localDevnet --> scBuild["Build validators datums redeemers minting policies"]

  trackFe --> sdkPick{Off-chain SDK}

  sdkPick --> sdkJs[JavaScript or TypeScript SDK]
  sdkPick --> sdkOther[SDK in another language]

  sdkJs --> txAnatomy
  sdkOther --> txAnatomy

  txAnatomy["Transaction anatomy fees collateral execution units coin selection reference scripts"]

  txAnatomy --> walletCip["Wallet connection APIs browser hardware mobile"]

  walletCip --> walletOps["Connect flows errors mobile hardware light vs full node"]

  walletOps --> feBuild["dApp UI tx building chain state UX"]

  trackInfra --> nodeCli[Run a Cardano node and CLI]
  nodeCli --> indexerLayer[Indexer chain data and queryable store]
  indexerLayer --> apiLayer[API provider]
  apiLayer --> spoPath[Stake pool operations DevOps monitoring]

  noFullNode -.-> apiLayer

  designer -->|UX-heavy path skips core SDK track| uxLearn[Web3 UX wallet flows pending txs fees]
  uxLearn --> walletCip

  scBuild --> integrateFull
  feBuild --> integrateFull
  spoPath --> integrateFull

  integrateFull["Full-stack integration validators off-chain UI chain data"]

  integrateFull --> utxoConcurrency["UTxO concurrency batching beacons fan-in fan-out avoid hot UTxO"]

  utxoConcurrency --> testLayer["Tests property based integration CI full stack"]

  testLayer --> debugLayer["On-chain debugging evaluate traces execution units"]

  debugLayer --> auditGate{External audit needed}

  auditGate -->|DeFi or high value| auditFirm[Engage an external audit firm]
  auditGate -->|Simple dApp| shipTestnet

  auditFirm --> shipTestnet

  shipTestnet["Testnets and faucets SDK network config"]

  shipTestnet --> mainnetShip[Mainnet launch DeFi NFT DAO RWA gaming]

  mainnetShip --> catalyst[Grant program]
  mainnetShip --> community[Community hubs chat forum Q and A]

  catalyst --> growPick{Advanced specialisation}
  community --> growPick

  growPick --> corePath[Core protocol development ledger node CIPs]
  growPick --> defiPath[DeFi DEX lending stablecoins]
  growPick --> l2Path[Layer 2 and scaling research]
  growPick --> nftPath[NFT gaming marketplaces RWA]
  growPick --> govPath[Governance tooling voting delegates]
  growPick --> bridgePath[Cross-chain bridges wrapped assets]

  corePath --> outcomes
  defiPath --> outcomes
  l2Path --> outcomes
  nftPath --> outcomes
  govPath --> outcomes
  bridgePath --> outcomes

  outcomes["Outcomes builder contributor salary grants portfolio meetups"]

  outcomes -->|Keep shipping| catalyst`;

export default pathwayChart;
