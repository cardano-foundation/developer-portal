---
id: lock-and-spend
title: Lock and Spend
sidebar_label: Lock and spend
description: "The two halves of every smart contract interaction: lock funds at a script address with a datum, then spend them by providing a redeemer that satisfies the validator."
image: /img/og/og-developer-portal.png
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Every smart contract interaction has two halves: you **lock** funds at a script address (sending value with a datum attached), and later you **spend** them (consuming the UTXO by providing a redeemer the validator accepts). This is the off-chain work. Your validator just says yes or no; this page is how you build the transactions it judges.

Pick your tool below. The SDK tabs use the same Evolution and Mesh setup as [Your first transaction](/docs/developers/curriculum/start-building/your-first-transaction).

## Before you start

- A **compiled validator** and its [blueprint](/docs/developers/curriculum/smart-contracts/choose-a-language#blueprints-the-contracts-interface) (`plutus.json`). If you don't have one yet, [choose a language](/docs/developers/curriculum/smart-contracts/choose-a-language) and write one.
- A **tool + provider key**: the tabs use Blockfrost on Preprod ([choose your tools](/docs/developers/curriculum/start-building/choose-your-tools)).
- **Test ADA** in a wallet you control ([faucet](/docs/developers/curriculum/start-building/networks-and-test-ada#get-test-ada)).
- Background, if you want it: [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context) explains what the datum and redeemer below actually are.

## Lock funds

Locking means sending ADA (and optionally native tokens) to the script address with a **datum** attached. The datum is the state your validator will check when someone later tries to spend the UTXO.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Address, Assets, Data, InlineDatum, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const scriptAddress = Address.fromBech32("addr_test1...")  // your script's address

const tx = await client
  .newTx()
  .payToAddress({
    address: scriptAddress,
    assets: Assets.fromLovelace(10_000_000n),                // 10 ADA
    datum: new InlineDatum.InlineDatum({ data: Data.constr(0n, []) })
  })
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
console.log("Locked funds at:", txHash)
```

For real contracts, define the datum with `TSchema` for type safety instead of a raw `Data.constr`. See [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context).

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
import { MeshTxBuilder, serializePlutusScript } from "@meshsdk/core";

const { address: scriptAddress } = serializePlutusScript(script); // script: PlutusScript

const utxos = await wallet.getUtxos();
const changeAddress = await wallet.getChangeAddress();

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .txOut(scriptAddress, [{ unit: "lovelace", quantity: "10000000" }]) // 10 ADA
  .txOutInlineDatumValue("meshsecretcode")                            // the datum
  .changeAddress(changeAddress)
  .selectUtxosFrom(utxos)
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

Use `.txOutDatumHashValue(data)` instead of `.txOutInlineDatumValue(data)` if you need a datum hash rather than an inline datum. See the [Mesh smart contracts guide](https://meshjs.dev/apis/txbuilder/smart-contract).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

With `cardano-cli` you build the datum as JSON, then send a normal transaction to the script address that attaches the datum (by hash or inline):

```bash
# Build to the script address, attaching an inline datum
cardano-cli latest transaction build \
  --tx-in <YourUTxO>#<Ix> \
  --tx-out "$(< script.addr)+10000000" \
  --tx-out-inline-datum-file datum.json \
  --change-address "$(< payment.addr)" \
  --out-file tx.raw

cardano-cli latest transaction sign \
  --tx-body-file tx.raw --signing-key-file payment.skey --out-file tx.signed
cardano-cli latest transaction submit --tx-file tx.signed
```

Derive the script address from the compiled validator with `cardano-cli address build --payment-script-file validator.plutus --out-file script.addr`; the datum file is JSON like `{"constructor":0,"fields":[]}`.

</TabItem>
</Tabs>

## Spend funds

Spending means consuming a UTXO locked at the script address by providing a **redeemer**: the data your validator checks to authorize the spend. Because a Plutus script runs, the transaction also needs **collateral** (see [Collateral](#collateral) below). The SDKs select it for you.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Data, preprod, type UTxO, Client } from "@evolution-sdk/evolution"

// reuse the client from the lock step
declare const scriptUtxos: UTxO.UTxO[]   // the UTxO(s) you locked, queried back
declare const validatorScript: any        // your compiled validator

const tx = await client
  .newTx()
  .collectFrom({
    inputs: scriptUtxos,
    redeemer: Data.constr(0n, [])          // the action your validator expects
  })
  .attachScript({ script: validatorScript })
  .addSigner({ keyHash: myKeyHash })       // if the validator checks a signature
  .build()

const signed = await tx.sign()
const txHash = await signed.submit()
```

Evolution handles script evaluation, redeemer indexing, and collateral automatically. For time-locked validators, add `.setValidity({ from, to })` so the script can check the current time. See [redeemer indexing](/docs/developers/curriculum/start-building/transaction-building#redeemer-indexing) for the static, self, and batch redeemer modes.

</TabItem>
<TabItem value="mesh" label="Mesh">

```typescript
const collateral = await wallet.getCollateral();
const changeAddress = await wallet.getChangeAddress();

const txBuilder = new MeshTxBuilder({ fetcher: provider });
const unsignedTx = await txBuilder
  .spendingPlutusScriptV3()                              // match your script's Plutus version
  .txIn(assetUtxo.input.txHash, assetUtxo.input.outputIndex)
  .txInInlineDatumPresent()                              // datum is inline on the UTxO
  .txInRedeemerValue(mConStr0([]))                       // the redeemer
  .txInScript(scriptCbor)                                // or .spendingTxInReference(...) for a reference script
  .txInCollateral(
    collateral[0].input.txHash,
    collateral[0].input.outputIndex,
  )
  .changeAddress(changeAddress)
  .selectUtxosFrom(await wallet.getUtxos())
  .complete();

const signedTx = await wallet.signTx(unsignedTx);
const txHash = await wallet.submitTx(signedTx);
```

To spend, Mesh needs three things beyond `.txIn()`: the **script** (supplied with `.txInScript()` or referenced with `.spendingTxInReference()`), the **datum** (`.txInInlineDatumPresent()` or `.txInDatumValue()`), and the **redeemer** (`.txInRedeemerValue()`). See the [Mesh smart contracts guide](https://meshjs.dev/apis/txbuilder/smart-contract).

</TabItem>
<TabItem value="cardano-cli" label="cardano-cli">

Spending a Plutus UTXO requires the script, the datum, the redeemer, and a collateral input:

```bash
cardano-cli latest transaction build \
  --tx-in <ScriptUTxO>#<Ix> \
  --tx-in-script-file validator.plutus \
  --tx-in-inline-datum-present \
  --tx-in-redeemer-file redeemer.json \
  --tx-in-collateral <CollateralUTxO>#<Ix> \
  --change-address "$(< payment.addr)" \
  --out-file tx.raw
```

Then `sign` and `submit` as usual. Pass the wrong redeemer and `build` fails up front with the script's own error message, a quick way to sanity-check validator logic before submitting.

</TabItem>
</Tabs>

### Collateral

A transaction that runs a Plutus script is validated in two phases: phase 1 checks structure (inputs exist, signatures, balancing), and phase 2 runs the scripts. **Collateral** is a set of ADA-only UTXOs the node consumes only if a script fails phase 2. A transaction that succeeds never loses its collateral, so honest users are safe, while flooding the network with failing scripts becomes expensive.

The SDKs pick collateral automatically from your wallet's ADA-only UTXOs; with cardano-cli you mark it explicitly with `--tx-in-collateral`. Keep a few pure-ADA UTXOs around for this. With [CIP-40](https://cips.cardano.org/cip/CIP-40) any excess is returned to a collateral-change address.

## Reference scripts

Including a multi-kilobyte validator in every spend transaction is wasteful. A **reference script** (Plutus V2+) stores the script once in a UTXO; later transactions point at that UTXO with `readFrom` instead of attaching the script: much smaller transactions and lower fees.

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Assets, Data, type UTxO } from "@evolution-sdk/evolution"

// 1. Deploy: park the script in a UTXO (the `script` field makes it a reference script)
const deploy = await client
  .newTx()
  .payToAddress({ address: await client.address(), assets: Assets.fromLovelace(10_000_000n), script: validatorScript })
  .build()
await (await deploy.sign()).submit()

// 2. Spend by referencing it: no attachScript, the node reads the script from the referenced UTXO
declare const scriptUtxos: UTxO.UTxO[]
declare const referenceScriptUtxo: UTxO.UTxO
const spend = await client
  .newTx()
  .collectFrom({ inputs: scriptUtxos, redeemer: Data.constr(0n, []) })
  .readFrom({ referenceInputs: [referenceScriptUtxo] })
  .build()
```

</TabItem>
</Tabs>

`readFrom` also reads a UTXO **without consuming it**, the same mechanism oracles use to expose price data and contracts use to read shared configuration (a reference input can carry a datum, not just a script). Reach for a reference script once a script is used across more than a few transactions; the one-time deploy cost pays for itself quickly.

## Parameterized scripts

A parameterized validator leaves values like an owner key or a deadline as compile-time holes, so one validator serves many deployments: each set of parameters produces a distinct script (and address). Apply the parameters off-chain before use:

<Tabs groupId="sdk">
<TabItem value="evolution" label="Evolution" default>

```typescript
import { Bytes, Data, TSchema, UPLC } from "@evolution-sdk/evolution"

declare const compiledScript: string   // the parameterized script from `aiken build`

// Raw data params, applied in the order of the script's lambda bindings
const applied = UPLC.applyParamsToScript(compiledScript, [
  Data.bytearray("abc123def456abc123def456abc123def456abc123def456abc123de"),  // owner
  Data.int(1735689600000n),                                                     // deadline
])

// Or type-safe via a schema
const Params = Data.withSchema(TSchema.Struct({ owner: TSchema.ByteArray, deadline: TSchema.Integer }))
const appliedTyped = UPLC.applyParamsToScriptWithSchema(
  compiledScript,
  [Params.toData({ owner: Bytes.fromHex("abc1...23de"), deadline: 1735689600000n })],
  (v) => v,
)
```

</TabItem>
</Tabs>

The applied script is what you attach (or deploy as a reference script). Use parameters for per-deployment config (owner, deadline, token policy, oracle address); use **datum fields** instead for state that changes per transaction. `applyParamsToScript` defaults to Aiken-compatible CBOR: pass `CBOR.CML_DATA_DEFAULT_OPTIONS` for CML-compiled scripts.

## A complete example: vesting

The lock-then-spend shape above becomes a real contract when the datum carries meaningful state and the validator enforces a rule. A **vesting** contract is the canonical first example: lock funds with a `{ beneficiary, deadline }` datum, and the validator only allows the spend if the transaction is signed by the beneficiary and its validity interval starts after the deadline.

- The on-chain side (the validator logic and tests) is walked through in [Datum, redeemer & context](/docs/developers/curriculum/smart-contracts/datum-redeemer-context#putting-it-together-a-vesting-example).
- The off-chain side is the [lock](#lock-funds) and [spend](#spend-funds) flows above, with the validator deployed as a [parameterized script](#parameterized-scripts) carrying the beneficiary and deadline.

## Next steps

- [Testing](/docs/developers/curriculum/smart-contracts/testing): test the validator before you deploy it
- [Security](/docs/developers/curriculum/smart-contracts/advanced/security/vulnerabilities/overview): the vulnerabilities to guard against when spending logic gets real
- [Contract library](/docs/developers/curriculum/smart-contracts/contracts-library): escrow, marketplace, swap, and more
- Reference: [contract library](/docs/developers/curriculum/smart-contracts/contracts-library) and the [Mesh smart contracts guide](https://meshjs.dev/apis/txbuilder/smart-contract)
