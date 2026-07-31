---
id: offline-testing
title: Offline Testing
sidebar_label: Offline testing
description: Test transaction-building code with no node and no devnet, using in-memory fixtures, offline script budgets, and assertions on the transaction you built.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Not every test needs a chain. Most of what goes wrong in transaction-building code goes wrong before anything is submitted: you selected the wrong UTXO, wrote the datum in the wrong shape, forgot a required signer, or set a validity window that has already passed. None of that needs a node to catch, and tests that skip the node run in milliseconds in CI.

Testing off-chain code without a chain splits into three jobs:

1. **Mock the data source** so a builder has UTXOs and protocol parameters to work with.
2. **Compute script execution budgets** offline, when a transaction runs a validator.
3. **Assert the shape** of the transaction you built, without submitting it.

Mesh ships a dedicated tool for each, below. When you do need a real chain, for the full build → sign → submit → confirm loop, run [a devnet your tests start and stop](/docs/developers/curriculum/start-building/networks-and-test-ada#a-devnet-your-tests-start-and-stop). For testing the validator itself, on-chain, see [Testing](/docs/developers/curriculum/smart-contracts/testing).

## Mock the data source

`OfflineFetcher` is an in-memory provider you populate with fixtures, then build and query against exactly like a real one. Construct it with a network, seed it with `addUTxOs([...])`, `addProtocolParameters({...})`, and `addAccount(...)`, and pass it anywhere a provider goes:

<Tabs>
<TabItem value="mesh" label="Mesh" default>

```typescript
import { OfflineFetcher, MeshTxBuilder } from "@meshsdk/core";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

const fetcher = new OfflineFetcher("preprod");
fetcher.addProtocolParameters({ minFeeA: 44, minFeeB: 155381 /* ... */ });
fetcher.addUTxOs([
  {
    input: { txHash: "abc123...", outputIndex: 0 },
    output: { address: "addr_test1...", amount: [{ unit: "lovelace", quantity: "100000000" }] },
  },
]);

const wallet = await MeshCardanoHeadlessWallet.fromMnemonic({
  networkId: 0,
  walletAddressType: AddressType.Base,
  fetcher,
  mnemonic: ["test", "test", /* ...24 words */],
});

const tx = await new MeshTxBuilder({ fetcher })
  .txOut("addr_test1...", [{ unit: "lovelace", quantity: "5000000" }])
  .changeAddress(await wallet.getChangeAddressBech32())
  .selectUtxosFrom(await wallet.getUtxosMesh())
  .complete();
```

</TabItem>
</Tabs>

Persist a populated fetcher with `fetcher.toJSON()` and rebuild it with `OfflineFetcher.fromJSON(json)`, so a fixture is a checked-in file, not setup code.

## Evaluate script budgets offline

`OfflineEvaluator` computes Plutus execution units offline. Pair it with an `OfflineFetcher` that holds the script UTxO and collateral, then call `evaluateTx(txCbor)`. It returns one budget per redeemer:

<Tabs>
<TabItem value="mesh" label="Mesh" default>

```typescript
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { OfflineFetcher, MeshTxBuilder } from "@meshsdk/core";

const fetcher = new OfflineFetcher("preprod");
// ... addUTxOs (script UTxO + collateral), addProtocolParameters

const evaluator = new OfflineEvaluator(fetcher, "preprod");

const unsignedTx = await new MeshTxBuilder({ fetcher, evaluator })
  .spendingPlutusScript("V3")
  // ... build the spend
  .complete();

const costs = await evaluator.evaluateTx(unsignedTx);
// [{ index: 0, tag: "SPEND", budget: { mem: 508703, steps: 164980381 } }]
```

</TabItem>
</Tabs>

The same mock supplies both data and budgets, so script tests run with no node and assert on `mem`/`steps` in CI.

## Assert what you built

`TxTester` checks what a transaction *is* without submitting it. Parse a tx with `TxParser`, call `toTester()`, then chain filters and assertions and read the verdict with `success()` / `errors()`:

<Tabs>
<TabItem value="mesh" label="Mesh" default>

```typescript
import { TxParser, MeshValue } from "@meshsdk/core";
import { CSLSerializer } from "@meshsdk/core-csl";

const txParser = new TxParser(new CSLSerializer(), fetcher);
await txParser.parse(txHex, utxos);
const txTester = txParser.toTester();

txTester
  .outputsAt("addr_test1qz...")
  .outputsValue(MeshValue.fromAssets([{ unit: "lovelace", quantity: "5000000" }]));
txTester.tokenMinted(policyId, "MeshToken", 1);
txTester.validAfter(now).validBefore(now + 60 * 60 * 1000);
txTester.keySigned(keyHash);

console.log(txTester.success(), txTester.errors());
```

</TabItem>
</Tabs>

You assert that your *builder* produced the outputs, mint, validity window, and signers you intended, without submitting anything.

## The same ground in Evolution

Evolution covers this differently. For unit tests it leans on pure encoding round-trips through its schema codecs (`Codec.toCBORHex` / `fromCBORHex`, no node), which catch datum and schema mistakes where they are made. It has no in-memory mock-provider or transaction-assertion analog, so anything past encoding goes to [a devnet your tests start and stop](/docs/developers/curriculum/start-building/networks-and-test-ada#a-devnet-your-tests-start-and-stop) instead.

## Haskell: cardano-node-emulator

For developers working directly in Haskell or PlutusTx, IntersectMBO maintains the [cardano-node-emulator](https://github.com/IntersectMBO/cardano-node-emulator). It emulates the ledger inside your program, with no node and no containers, for fast, deterministic contract tests. It is Haskell-only and built from source; see the repository for setup.

## Next steps

- [When transactions fail](/docs/developers/curriculum/start-building/transaction-failures): the failure modes these tests catch before a network does
- [Testing](/docs/developers/curriculum/smart-contracts/testing): unit- and integration-test the validators themselves
- [Going to production](/docs/developers/curriculum/production/going-to-production): reliability and security before mainnet
