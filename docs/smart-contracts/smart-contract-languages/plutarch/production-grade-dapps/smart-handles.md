---
id: smart-handles
title: Smart Handles
sidebar_label: Smart Handles
description: Instantiating validators that are meant to be carried out by incentivised agents to handle the requests in a decentralized and trustless manner.
---

## Introduction

Smart Handles is an abstract Cardano contract generator for instantiating
validators that are meant to be carried out by incentivised agents to handle
the requests in a decentralized and trustless manner.

One of the simplest use-cases can be an instance for swapping one specific token
to another without going through a DEX UI directly. This instance will have its
unique address, which can be complemented with AdaHandles (e.g. `@ada-to-min`)
and therefore any wallet that supports Smart Handles configurations can send
some $ADA directly to this address to be swapped for $MIN.

This is not limited to swaps of course. For instance, sending funds to
`@offer-spacebudz` (which resolves to a router smart contract for SpaceBudz
collection offers) could create a collection offer for SpaceBudz.

The example here uses Smart Handles for swapping any token pairs through Minswap
exchange.

:::info
The source code for these dApps can be found [here](https://github.com/Anastasia-Labs/smart-handles).
:::

## Documentation

### What problems do Smart Beacons solve?

Right now, most interaction with smart contract protocols is done through
centralized front-end services where the transactions are built and submitted
through centralized backend infrastructure. In addition to the negative impact
this has on decentralization, it also hampers adoption due to the restrictions
it imposes. For instance, users with mobile wallets have severely limited
options when it comes to interacting with DApps. Also, regular users will be
unable to interact with most DApps if the DApp front-ends were to become
unavailable for any reason or if the backend was down.

There are a few attempts to address this problem, such as
[DApp Schemas](https://cardano.ideascale.com/c/idea/64468) or
[Smart Contract Blueprints](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/cip-0057/); however,
all of these solutions rely on off-chain infrastructure to specify how to
interpret a DApp's datums, redeemers, and other on-chain data in order to build
transactions. Smart Beacons differ from these other approaches in that it is a
fully onchain solution that does not rely on offchain infrastructure.

UTxOs locked at a Smart Handles instance can carry datums that determine how a
routing agent should reproduce them at their specified destination addresses
(or route addresses).

In case of simple datums however, the interaction logic is hard-coded in the
instance itself, and their corresponding off-chain agents should provide routers
with all they need to handle requests.

## Contract Logic

Smart Handles framework offers two datums:

```rust
data PSmartHandleDatum (s :: S)
  = PSimple (Term s (PDataRecord '["owner" ':= PAddress]))
  | PAdvanced
      ( Term
          s
          ( PDataRecord
              '[ "mOwner" ':= PMaybeData PAddress
               , "routerFee" ':= PInteger
               , "reclaimRouterFee" ':= PInteger
               , "routeRequiredMint" ':= PRequiredMint
               , "reclaimRequiredMint" ':= PRequiredMint
               , "extraInfo" ':= PData
               ]
          )
      )
```

- `Simple`, which only carries an owner address
- `Advanced`, which allows for a more involved routing/reclaim scenarios:
  - `mOwner` is an optional owner (if this is set to `Nothing` it makes the UTxO
    un-reclaimable)
  - `routerFee` specifies how much an agent must be compensated for routing a
    request
  - `reclaimRouterFee` is similar to `routerFee` for invoking the advanced
    reclaim endpoint (this helps with balancing of the incentive structure)
  - `routeRequiredMint` is a value (isomorphic with
    `Maybe (PolicyID, TokenName)`) that specifies whether a route output must
    append the same quantity of mints/burns present in the transaction
  - `reclaimRequiredMint` is similar to `routeRequiredMint`, but for the
    advanced reclaim endpoint
  - `extraInfo` is an arbitrary `PData` provided for instances

On top of that, each instance can also support a "single" variant and a "batch"
variant: Single will be a spending script that only supports a single
route/reclaim per transaction. Batch, on the other hand, is a staking script for
handling multiple requests in single transactions.

Single variants will have 3 redeemers: routing, simple reclaims, and advanced
reclaims:

```rust
data PSmartHandleRedeemer (s :: S)
  = PRoute (Term s (PDataRecord '["ownIndex" ':= PInteger, "routerIndex" ':= PInteger]))
  | PReclaim (Term s (PDataRecord '[]))
  | PAdvancedReclaim (Term s (PDataRecord '["ownIndex" ':= PInteger, "routerIndex" ':= PInteger]))
```

Simple reclaim only applies to simple datums, and the only requirement is
imposes on withdrawals is the signature of the owner. Advanced reclaim passes
the spending UTxO to instance's underlying validator, and therefore has a
redeemer similar to the routing endpoint.

Batch variants' scripts (spending and staking) will have 2 redeemers each:

```rust
-- for the staking script
data PRouterRedeemer (s :: S)
  = PRouterRedeemer
      ( Term
          s
          ( PDataRecord
              '[ "inputIdxs" ':= PBuiltinList (PAsData PInteger)
               , "outputIdxs" ':= PBuiltinList (PAsData PInteger)
               ]
          )
      )

-- for the batch spend script
data PSmartRedeemer (s :: S)
  = PRouteSmart (Term s (PDataRecord '[]))
  | PReclaimSmart (Term s (PDataRecord '[]))
```

The underlying logic of an instance is shared between the two variants, and
therefore utilizing either one will be very similar.

You may have noticed that both redeemers are using the [UTxO indexer pattern](https://github.com/Anastasia-Labs/design-patterns/blob/main/utxo-indexers/UTXO-INDEXERS.md)
for a more optimized performance.

## Off-Chain Tools

There are 2 packages available for working with smart handles instances:

- [`smart-handles-offchain`](https://github.com/Anastasia-Labs/smart-handles-offchain)
  offers config interfaces to build transactions for all possible endpoints
- [`smart-handles-agent`](https://github.com/Anastasia-Labs/smart-handles-agent)
  provides a CLI application generator function that allows instances to have
  curated user-friendly Node applications for submitting, routing and reclaiming
  requests

### Using Routing Contract

Head over to the [off-chain SDK of smart handles](https://github.com/Anastasia-Labs/smart-handles-offchain) to
learn how to define your instance's off-chain, or look
through [an example with Minswap V1](https://github.com/Anastasia-Labs/smart-handles-offchain/tree/main/example).
