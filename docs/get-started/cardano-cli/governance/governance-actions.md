---
id: create governance actions
sidebar_label: Submitting governance actions
title: Submitting governance actions
sidebar_position: 4
description: How to submit a governance action
keywords: [Governance, governance action, submit proposal, CIP1694]
---

## Common aspects of all types of governance actions

A proposal is the process of putting together all the information required to submit a governance action to the chain. A proposal consists of:

- A deposit
- The reward account that will receive the deposit return
- The governance action
- An anchor

When using the `cardano-cli` to create a governance action, you will notice that it creates a proposal.

**Deposit and stake credentials**

Any ada holder can submit a governance action to the chain. They must provide a deposit, which will be returned when the action is finalized (whether it is ratified or has expired). To facilitate this process, the proposer must specify the stake credential that will receive the refunded deposit.

**Previous governance action ID**

To prevent unintended conflicts between governance actions of the same type, some governance actions must include the governance action ID of
the most recently enacted action of its respective type. Notably, this requirement does not apply to **treasury withdrawal** and **info** governance actions.

You can get the last enacted governance action IDs with:

```bash
cardano-cli conway query gov-state | jq -r .nextRatifyState.nextEnactState.prevGovActionIds
```
```json
{
  "Committee": {
    "govActionIx": 0,
    "txId": "fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec"
  },
  "Constitution": {
    "govActionIx": 0,
    "txId": "2bcf2a93cb840d72e6fbbad4d52419fa69a3971dee2e32fab414e32a44ecbaf7"
  },
  "HardFork": null,
  "PParamUpdate": null
}
```

Please note that both the **update committee** and **motion of no confidence** actions share the same space, referred to as 'Committee,' within the
governance state. Consequently, the governance state stores a single value to represent both of these actions. The system also verifies either of these
actions against this single stored value.

**Anchors**

When proposing a governance action, the proposer may employ an *anchor*, which comprises a *URL* hosting a document that outlines the rationale
for the proposed changes, along with the document's *hash*.

The document at the URL can be of a free form. It's important that it should communicate to ada holders the *what* and the *why* of the proposal. This tutorial mostly uses 'https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld' as an example, see [here](https://github.com/Ryun1/CIPs/blob/governance-metadata-actions/CIP-0108/test-vector.md) for more details.

See [CIP-100 | Governance Metadata](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0100) and [CIP-0108? | Governance Metadata - Governance Actions](https://github.com/cardano-foundation/CIPs/pull/632) for standard.
Following CIP-100, we canonize the metadata anchor first, via [JSON-LD playground](https://json-ld.org/playground/), which we then hash.

You can use `cardano-cli` to get the hash:

```bash
cardano-cli hash anchor-data --file-text treasury-withdrawal.canonical
931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5
```
Alternatively, utilize b2sum to hash the document:

```bash
b2sum -l 256 treasury-withdrawal.canonical
931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5  treasury-withdrawal.canonical
```
You will need to supply the hash of the document when creating a governance action.

## Update committee actions

### Update committee to *add* a new CC member:

Assume you want to add three CC members who have generated cold keys and have provided their key hashes:
- `89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de`
- `ea8738081fca0726f4e781f5e55fda05f8745432a5f8a8d09eb0b34b`
- `7f6721067362d4ae9ca73469fe983ce5572dad9028386100104b0da0`

You can create a proposal to add them as new CC members with an expiration epoch (`--epoch`) for each of them. This is a good time to review the threshold. Let’s say that our proposal will change the Committee threshld to 66%:

* Create the proposal:

```bash
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli query protocol-parameters | jq -r '.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --add-cc-cold-verification-key-hash 89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de \
  --epoch 100 \
  --add-cc-cold-verification-key-hash ea8738081fca0726f4e781f5e55fda05f8745432a5f8a8d09eb0b34b \
  --epoch 95 \
  --add-cc-cold-verification-key-hash 7f6721067362d4ae9ca73469fe983ce5572dad9028386100104b0da0 \
  --epoch 90 \
  --threshold 0.66 \
  --out-file update-committee.action
```

* Note: If there is a **previously enacted** governance action to update the committee, the proposal must also include `--prev-governance-action-tx-id` and `--prev-governance-action-index`.

### Update committee to *remove* an existing CC member:

Assume that you want to remove the CC member with the key hash `89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de`. You can do this with:

```bash
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --remove-cc-cold-verification-key-hash 89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de \
  --threshold 1/2 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file update-committee.action
```

### Update committee to only change the *threshold*:

```bash
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --threshold 60/100 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file update-committee.action
```

## Updating the constitution

This section describes how to propose a new constitution. Lets's use as an axample the interim constitution that is to be used 
on Mainnet. It is available in https://ipfs.io/ipfs/Qmdo2J5vkGKVu2ur43PuTrM7FdaeyfeFav8fhovT6C2tto

### Find the last enacted Constitution governance action 

Find the last enacted governance action of this type, If the query returns `null` it means the current consitution (if it exists) is not enacted in a governance action, but instead supplied on the Conway genesis file.

```shell
cardano-cli conway query gov-state | jq -r '.nextRatifyState.nextEnactState.prevGovActionIds.Constitution'
null
```

When the constitution has been enacted through a governance action, you will see the transaction ID and index of the proposing transaction, we will use this information later:

```shell
cardano-cli conway query gov-state | jq -r '.nextRatifyState.nextEnactState.prevGovActionIds.Constitution'
{
  "govActionIx": 0,
  "txId": "bf4832f443fe34f26f929ce2fbb26cc35ef4fda31150b2da45969a9bac4f7a8c"
}
```

### Prepare the constiution anchor.

When proposing a new constitution, you are required to put it on a URL that is publicly accessible and, idealy, in some sort of persistent form. For example 
put it on IPFS, like the [interim constitution](https://ipfs.io/ipfs/Qmdo2J5vkGKVu2ur43PuTrM7FdaeyfeFav8fhovT6C2tto)

* Download the file from its url:

```bash
wget https://ipfs.io/ipfs/Qmdo2J5vkGKVu2ur43PuTrM7FdaeyfeFav8fhovT6C2tto -O constitution.txt
```

* Get its hash, you can do it with blake2 or with cardano-cli:

```bash
b2sum -l 256 constitution.txt
a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d  constitution.txt
```
or

```bash
cardano-cli conway governance hash anchor-data --file-text constitution.txt
a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d
```

### The guardrails script

While the constitution is an informal, off-chain document, there will also be an optional script that can enforce some guidelines. This script acts 
to supplement the constitutional committee by restricting some proposal types.

At the Chang hardfork, the interim constitution will be suplemented with a Guardrails script. It is soon to be open sourced, you will find it here: https://github.com/IntersectMBO/constitution-priv 

The guardrails script applies only to protocol parameter update and treasury withdrawal proposals.

Follow the instructions in the README.md file to compile the PlutusV3 script. A successful compilation creates the 'compiled' directory containing the script in a text envelope.

```
cat compiled/guardrails-script.plutus 
```
```
{
    "type": "PlutusScriptV3",
    "description": "",
    "cborHex": "59082f59082c0101003232323232323232323232323232323232323232323232323232323232323232323232323232323232323225932325333573466e1d2000001180098121bab357426ae88d55cf001054ccd5cd19b874801000460042c6aae74004dd51aba1357446ae88d55cf1baa325333573466e1d200a35573a00226ae84d5d11aab9e0011637546ae84d5d11aba235573c6ea800642b26006003149a2c8a4c3021801c0052000c00e0070018016006901e40608058c00e00290016007003800c00b0034830268320306007001800600690406d6204e00060001801c0052004c00e007001801600690404001e0006007001800600690404007e00060001801c0052006c00e006023801c006001801a4101000980018000600700148023003801808e0070018006006904827600060001801c005200ac00e0070018016006904044bd4060c00e003000c00d2080ade204c000c0003003800a4019801c00e003002c00d2080cab5ee0180c100d1801c005200ec00e0060238000c00e00290086007003800c00b003483d00e0306007001800600690500fe00040243003800a4025803c00c01a0103003800a4029803c00e003002c00cc07520d00f8079801c006001801980ea4120078001800060070014805b00780180360070018006006603e900a4038c0003003800a4041801c00c04601a3003800a4045801c00e003002c00d20f02e80c1801c006001801a4190cb80010090c00e00290126000c00e0029013600b003803c00e003002c00cc0752032c000c00e003000c00cc075200ac000c0006007007801c006005801980ea418170058001801c006001801980ea41209d80018000c0003003800a4051802c00e007003011c00e003000c00d2080e89226c000c0006007003801808e007001800600690406c4770b7e000600030000c00e0029015600b003801c00c047003800c00300348202e2e1cb00030001801c00e006023801c006001801a410181f905540580018000c0003003800a4059801c00c047003800c00300348203000700030000c00e00290176007003800c00b003483200603060070018006006904801e00040243003800a4061801c00c0430001801c0052032c016006003801801e00600780180140100c00e002901a600b003001c00c00f003003c00c00f003002c00c007003001c00c007003803c00e003002c00c0560184014802000c00e002901b6007003800c00b003480030034801b0001801c006001801a4029800180006007001480e3003801c006005801a4001801a40498000c00e003000c00d20ca04c00080486007001480eb00380180860070018006006900f600060001801c005203cc00e006015801c006001801a4101012bcf138c09800180006007001480fb003801805600700180060069040505bc3f482e00060001801c0052040c00e0070018016006900d4060c00e003000c00d204ac000c0003003800a4085801c00c04601630000000000200f003006c00e003000c00c05a0166000200f003005c00e003000c00c057003010c0006000200f003800c00b003012c00cc05d2028c0004008801c01e007001801600602380010043000400e003000c00c04b003011c0006000800c00b00300d8049001801600601d801980924190038000801c0060010066000801c00600900f6000800c00b003480030034820225eb0001003800c003003483403f0003000400c023000400e003000c00d208094ebdc03c000c001003009c001003300f4800b0004006005801a40058001001801401c6014900518052402860169004180424008600a900a180324005003480030001806240cc6016900d18052402460129004180424004600e900018032400c6014446666aae7c004a0005003328009aab9d0019aab9e0011aba100298019aba200224c6012444a6520071300149a4432005225900689802a4d2219002912c998099bad0020068ac99807002800c4cc03001c00e300244cc03001c02a3002012c801460012218010c00888004c004880094cc8c0040048848c8cc0088c00888c00800c8c00888c00400c8d4cc01001000cd400c0044888cc00c896400a300090999804c00488ccd5cd19b87002001800400a01522333573466e2000800600100291199ab9a33712004003000801488ccd5cd19b89002001801400244666ae68cdc4001000c00a001225333573466e240080044004400a44a666ae68cdc4801000880108008004dd6801484cc010004dd6001484c8ccc02a002452005229003912999ab9a3370e0080042666ae68cdc3801800c00200430022452005229003911980899b820040013370400400648a400a45200722333573466e20cdc100200099b82002003800400880648a400a45200722333573466e24cdc100200099b82002003801400091480148a400e44666ae68cdc419b8200400133704004007002800122593300e0020018800c400922593300e00200188014400400233323357346ae8cd5d10009198051bad357420066eb4d5d08011aba2001268001bac00214800c8ccd5cd1aba3001800400a444b26600c0066ae8400626600a0046ae8800630020c0148894ccd5cd19b87480000045854ccd5cd19b88001480004cc00ccdc0a400000466e05200000113280099b8400300199b840020011980200100098021112999ab9a3370e9000000880109980180099b860020012223300622590018c002443200522323300d225900189804803488564cc0140080322600800318010004b20051900991111111001a3201322222222005448964ce402e444444440100020018c00a30000002225333573466e1c00800460002a666ae68cdc48010008c010600445200522900391199ab9a3371266e08010004cdc1001001c0020041191800800918011198010010009"
}
```

Now, get the script hash with:

```shell
cardano-cli hash script --script-file guardrails-script.plutus 
edcd84c10e36ae810dc50847477083069db796219b39ccde790484e0
```

#### Create the proposal to update the constitution:

When there is no previously enacted constiutition: 

```bash
cardano-cli conway governance action create-constitution \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0100/cip-0100.common.schema.json \
  --anchor-data-hash "9d99fbca260b2d77e6d3012204e1a8658f872637ae94cdb1d8a53f4369400aa9" \
  --constitution-url https://ipfs.io/ipfs/Qmdo2J5vkGKVu2ur43PuTrM7FdaeyfeFav8fhovT6C2tto \
  --constitution-hash "a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d" \
  --constitution-script-hash "edcd84c10e36ae810dc50847477083069db796219b39ccde790484e0"
  --out-file 
```
When there is a previously enacted constitution, we need to reference the previous governance action id (TXID and INDEX):

```bash
cardano-cli conway governance action create-constitution \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --constitution-url https://ipfs.io/ipfs/Qmdo2J5vkGKVu2ur43PuTrM7FdaeyfeFav8fhovT6C2tto \
  --constitution-hash "a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d" \
  --constitution-script-hash "edcd84c10e36ae810dc50847477083069db796219b39ccde790484e0" \
  --prev-governance-action-tx-id "bf4832f443fe34f26f929ce2fbb26cc35ef4fda31150b2da45969a9bac4f7a8c" \
  --prev-governance-action-index 0 \
  --out-file constitution.action
```
From here, you just need to [submit the proposal in a transaction](#submitting-the-action-file-in-a-transaction) 

## Motion of no confidence

- Find the last governance action enacted of this type:

```bash
cardano-cli conway query gov-state | jq -r '.nextRatifyState.nextEnactState.prevGovActionIds.Committee'
```
```json
{
  "govActionIx": 0,
  "txId": "fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec"
}
```

#### Create a motion no-confidence governance action:

```bash
cardano-cli conway governance action create-no-confidence \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file no-confidence.action
```
From here, you just need to [submit the proposal in a transaction](#submitting-the-action-file-in-a-transaction) 

## Treasury withdrawal

In addition to the stake credential required to obtain a deposit refund, the proposer must also furnish stake credentials for receiving funds from the treasury in the event that the governance action is approved.

Also, treasury withdrawals must reference the Guardrails script when present. 

#### Create the treasury withdrawal proposal:

```bash
cardano-cli conway governance action create-treasury-withdrawal \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --funds-receiving-stake-verification-key-file stake.vkey \
  --constitution-script-hash "edcd84c10e36ae810dc50847477083069db796219b39ccde790484e0" \
  --transfer 50000000000 \
  --out-file treasury.action
```

* Note that you do not need to provide any previous governance action ID on treasury withdrawals.

From here, you just need to [submit the proposal in a transaction](#submitting-the-action-file-in-a-transaction) 

## Info

#### Create the 'info' governance action:

```bash
cardano-cli conway governance action create-info --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url  https://tinyurl.com/yc74fxx4 \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --out-file info.action
```
From here, you just need to [submit the proposal in a transaction](#submitting-the-action-file-in-a-transaction) 

## Update protocol parameters

When updating protocol parameters, you must reference the Guardrails script. This reference is not automatically inferred 
because, actions can be created off-line so the cli may not have access to a node, and also because a governance action may be submitted in advance, 
anticipating that a new Guardrails script will be ratified and enacted during the proposal's lifespan.

```bash
cardano-cli conway governance action create-protocol-parameters-update \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/Ryun1/metadata/main/cip108/treasury-withdrawal.jsonld \
  --anchor-data-hash 931f1d8cdfdc82050bd2baadfe384df8bf99b00e36cb12bfb8795beab3ac7fe5 \
  --constitution-script-hash "edcd84c10e36ae810dc50847477083069db796219b39ccde790484e0" \
  --key-reg-deposit-amt 1000000 \
  --out-file pp-update.action
```

* Note: If there is a **previously enacted** governance action to update the protocol parameters, the proposal must also include `--prev-governance-action-tx-id` and `--prev-governance-action-index`.

Continue with [build, sign and submit the transactions](#submitting-a-treasuy-withdrawal-and-protocol-parameter-update-governance-action) 

## Submitting Motion of no-confidence, Update committee, New Constitution, Hardfork inititation or Info proposals in a transaction

Submitting the `*.action` file to the blockchain is the essential step in bringing your proposal to life and making it accessible for the community to participate in the
voting process. This process essentially transforms your proposal from a conceptual idea into an actionable item. Once submitted, it becomes part of the public ledger,
while also allowing members of the governance bodies to review, discuss, and ultimately cast their votes on its approval or rejection.

* Note that you can also use `build-raw` and `calculate-min-fee` to build transactions in an off-line settting. The example below uses the convenient `build`:

```bash
cardano-cli conway transaction build \
  \
  --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
  --change-address $(< payment.addr) \
  --proposal-file info.action \
  --out-file tx.raw
```
```bash
cardano-cli conway transaction sign \
  \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed
```
```bash
cardano-cli conway transaction submit \
  \
  --tx-file tx.signed
```

## Submitting a Treasuy-withdrawal or Protocol-parameter-update governance action

:::info
These types of proposals must reference the guardrails script, therefore must supply a collateral and the guardrails script either directly or as 
a reference script.
:::

#### Build, sign and submit the transaction 

When building the transaction, we include the `*.action` file and supply the guardrails script with --proposal-script-file. Note that the guardrails script does not require a datum to be passed, only a redeemer value, which can be just an empty json.

```shell
cardano-cli conway transaction build \
--proposal-script-file guardrails-script.plutus \
--tx-in-collateral "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
--proposal-redeemer-value {} \
--tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
--change-address "$(< payment.addr)" \
--proposal-file pp-update.action \
--out-file pparams-tx.raw

Estimated transaction fee: Coin 313228

```

- Sign the transaction with `payment.skey`:

```bash
cardano-cli conway transaction sign \
--tx-file pparams-tx.raw \
--signing-key-file payment.skey \
--out-file pparams-tx.signed 
```

- Submit it to the chain with:

```bash
cardano-cli conway transaction submit \
--tx-file pparams-tx.signed
```

## Finding the governance action ID of your proposal

You may want to find your governance action ID to share it with others on Discord1 and seek their support. The transaction ID and the index of the transaction that submitted the
proposal serve as the action ID. An effective way to find your governance action ID is by querying the governance state and filtering by (the proposer) stake key hash.

First, find your key hash with:

```bash
cardano-cli conway stake-address key-hash --stake-verification-key-file stake.vkey
```
`8e0debc9fdc6c616ac40d98bf3950b436895eea9cccf0396a6e5e12b`

Use `jq` to filter the `gov-state` output by the stake key hash. The output contains all the relevant information about your governance actions, including `actionId`:

```bash
cardano-cli conway query gov-state \
| jq -r --arg keyHash "8e0debc9fdc6c616ac40d98bf3950b436895eea9cccf0396a6e5e12b" '.proposals | to_entries[] | select(.value.returnAddr.credential.keyHash | contains($keyHash)) | .value'
```
```json
{
  "action": {
    "contents": [
      [
        {
          "credential": {
            "keyHash": "7249a71391f08399f06b492eae7892a33191699625cff50b7dee55c6"
          },
          "network": "Testnet"
        },
        20388738581
      ]
    ],
    "tag": "TreasuryWithdrawals"
  },
  "actionId": {
    "govActionIx": 0,
    "txId": "4fcd92abf2ce3d6796c5fae51ea83d563ca8611359c9624fd1cecd7fa1ce71cc"
  },
  "committeeVotes": {
    "keyHash-23e05ad2b71317a6348ce4b68dae37aa1c0e545cdea740b23c21742e": "VoteNo",
    "keyHash-540bedcd4bdcbf523e899c3ef43f2b96ecec4f6303af58d15a413ed1": "VoteYes",
    "keyHash-6c1d098a366f2274651943a7f778b3b5459c129f0407a0db2902253a": "VoteYes"
  },
  "dRepVotes": {
    "keyHash-13797df5308dfebf2348fa58b312a177cf97939f5f7d21168e1a54db": "VoteYes",
    "keyHash-9853551d8b99884f51608822e012bbf0d444eb7bea2807ee664f1241": "Abstain",
    "keyHash-cf09b59e134fa14e48da39b552c02299a054d7c8b895b3d827453672": "VoteNo"
  },
  "deposit": 1000000000,
  "expiresAfter": 34,
  "proposedIn": 33,
  "returnAddr": {
    "credential": {
      "keyHash": "8e0debc9fdc6c616ac40d98bf3950b436895eea9cccf0396a6e5e12b"
    },
    "network": "Testnet"
  },
  "stakePoolVotes": {}
}
```