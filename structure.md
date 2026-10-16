## Beginner, the base of Cardano

Goal: the concepts you need before building anything, each with an analogy and a hands-on step. After this you understand Cardano infrastructure (wallets, UTxOs, transactions, tokens) and how to read the chain.

- **Wallets, keys & addresses**
  Wallet = account + identity (it holds your keys, not your coins), a key signs, an address is like an "email" for money(tokens).
  _Try it:_ create a Preview wallet, fund it from the faucet, see it on the explorer.

- **UTxOs & transactions**
  UTxOs are the individual **bills and coins** in your wallet, a transaction spends whole bills and gives change (the eUTxO model).
  _Try it:_ make a transaction using the wallet and open it on the explorer and read its inputs/outputs. Also, open the funding transaction on the explorer.

- **Tokens: fungible & NFTs**
  Native tokens (policy id + name), no smart contract needed, fungible = interchangeable (like dollar bills), NFT(non fungible token) = a unique token (can be a numbered ticket, an art)
  _Try it:_ view a token on the explorer, or mint one via the Tutorial.

- **Metadata & native scripts**
  Metadata = a data(text, anything) attached to a transaction that can explain this transaction, native scripts = simple rules (multisig, time-locks) with no smart contract.
  _Try it:_ read a transaction's metadata, reason about a native-script JSON.

- **Providers & explorers**
  A provider is a hosted API your app calls (Blockfrost) that is required to build an dapp and read the chain… an explorer is a search engine for people (Cardanoscan). Also **mention the off-chain SDKs you'll build with, Mesh and Evolution (TypeScript)**
  _Try it:_ look up the same address two ways, a Blockfrost `curl` and the explorer.

---

## Intermediate, smart contracts

Goal: teach smart contracts from scratch, building on the Beginner base (transactions, UTxOs, tokens). After this you can **write and understand** a smart contract. Keep it simple, reuse the Beginner analogies.

- **On-chain vs off-chain**
  Every Cardano app has two halves: **on-chain** = the smart contract that lives on the blockchain and enforces the rules; **off-chain** = the code on your computer or server that builds transactions and asks the wallet to sign. Explain both and the difference (the app prepares, the chain enforces).
  _Try it:_ trace one transaction through both halves.

- **What a smart contract is (the validator)**
  A smart contract is a **validator** (a small yes/no function the network runs when someone tries to spend a locked UTxO. It never moves funds itself; it only approves or rejects) or a **set of validators that work together**.
  _Try it:_ write a tiny validator (always true, always false) and predict its answer.

- **Datum & redeemer**
  The **datum** is information/notes attached to a locked UTxO (the terms). The **redeemer** is the choice the spender makes (which action). Together with the transaction context, that's everything the validator gets to see.
  _Try it:_ Build a smart contract that checks if Datum > Redeemer.

- **Validator purposes: spend, mint, withdraw…**
  One validator can guard different things: **spend** (unlock a UTxO), **mint** (create/burn tokens), **withdraw** (stake rewards), and more (publish/vote). Same idea, different trigger.
  _Try it:_ match each purpose to a real action.

- **On-chain tools: Aiken & Scalus**
  The languages you write validators in, **Aiken** (purpose-built and friendly) and **Scalus** (Scala). Both compile to the same on-chain format (`plutus.json`).
  _Try it:_ compile a validator with `aiken check` / `aiken build`.

- **Off-chain SDKs: Mesh, Evolution and Tx3**
  The TypeScript libraries that build the transactions your contract needs (lock, spend, mint) and hand them to the wallet. **Mesh**, **Evolution**, **Tx3**.
  _Try it:_ build a lock/spend transaction with an SDK (or follow the Tutorial)

- **Handling time in Cardano (Vesting)**
  How we think about time in Cardano is different from real life time. To explain time on cardano, we will teach the user through a real example vesting.

- **Multi validators (Giftcard)**
  Explain how to use multiple validators together

- **Modifying state (Oracle)**
  Explain how to make state transitions to change data on a utxo

- **Reference Input & Ref. Script (Deploy and consume from Oracle)**
  Explain ref script and deploy oracle. After that, consume information from another validator using ref input.

- **Testing**
  Tracing, unit tests, property-based tests, and offline/headless scenario tests, so "what you read is what is tested."
  _Try it:_ run and extend a test suite.

_Final option: point to the Tutorial, a full on-chain + off-chain build._

---

## Advanced, high-quality smart contracts

Goal: go from "it works" to "it's safe and production-ready." After this you can write **secure, high-quality** smart contracts. Keep explanations simple even for the hard topics.

- **Common vulnerabilities**
  The classic ways contracts get exploited, double satisfaction, unauthenticated UTxOs, unbounded value/inputs, and how to defend against each.
  _Try it:_ spot the bug in a vulnerable validator.

- **Design patterns**
  Reusable structures that keep contracts correct and efficient, UTxO indexers, state machines, tx-level minting, reference inputs.
  _Try it:_ apply one pattern to a small contract.

- **Optimization**
  Keep scripts small and cheap, execution units, script size, min-ADA, verify, don't compute.
  _Try it:_ measure a validator's cost and shrink it.

- **Higher assurance: audits & formal verification**
  When and how to get external review and mathematical guarantees on a contract before it holds real value.

- **Going to production**
  Providers and infrastructure, deployment, and monitoring a live contract.
