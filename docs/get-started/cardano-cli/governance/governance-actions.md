---
id: create-governance-actions
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

```shell
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

Please note that both the **update committee** and **motion of no confidence** actions share the same space, referred to as 'Committee' within the
governance state. Consequently, the governance state stores a single value to represent both of these actions. The system also verifies either of these
actions against this single stored value.

**Anchors**

When proposing a governance action, the proposer must employ an *anchor*, which comprises a *URL* hosting a document that outlines additional context
for the proposed changes, along with the document's *hash*.

The document at the URL can be of a free form. It's important that it should communicate to ada holders the *why* and the *how* of the proposal. This tutorial mostly uses 'https://github.com/cardano-foundation/CIPs/blob/master/CIP-0108/examples/treasury-withdrawal.jsonld' as an example, see [here](https://github.com/cardano-foundation/CIPs/blob/4640b74025c4d7f233c47ebc8319e634d2de39de/CIP-0108/test-vector.md) for more details.

See [CIP-100 | Governance Metadata](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0100) and [CIP-0108 | Governance Metadata - Governance Actions](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0108) for standard.

You can use `cardano-cli` to get the hash:

```shell
cardano-cli hash anchor-data --file-text treasury-withdrawal.jsonld
311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4
```
Alternatively, utilize b2sum to hash the document:

```shell
b2sum -l 256 treasury-withdrawal.jsonld
311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4  treasury-withdrawal.jsonld
```
You will need to supply the hash of the document when creating a governance action.

## Update committee actions

### Update committee to *add* a new CC member:

Assume you want to add three CC members who have generated cold keys and have provided their key hashes:
- `89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de`
- `ea8738081fca0726f4e781f5e55fda05f8745432a5f8a8d09eb0b34b`
- `7f6721067362d4ae9ca73469fe983ce5572dad9028386100104b0da0`

You can create a proposal to add them as new CC members with an expiration epoch (`--epoch`) for each of them. This is a good time to review the threshold. Let’s say that our proposal will change the Committee threshold to 66%:

* Create the proposal:

```shell
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli query protocol-parameters | jq -r '.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
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

```shell
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --remove-cc-cold-verification-key-hash 89181f26b47c3d3b6b127df163b15b74b45bba7c3b7a1d185c05c2de \
  --threshold 1/2 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file update-committee.action
```

### Update committee to only change the *threshold*:

```shell
cardano-cli conway governance action update-committee \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --threshold 60/100 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file update-committee.action
```

## Updating the constitution

This section describes how to propose a new constitution. Lets's use as an example the interim constitution that is to be used 
on Mainnet. It is available in https://ipfs.io/ipfs/bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm

### Find the last enacted Constitution governance action 

Find the last enacted governance action of this type, If the query returns `null` it means the current constitution (if it exists) is not enacted in a governance action, but instead supplied on the Conway genesis file.

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

### Prepare the constitution anchor.

When proposing a new constitution, you are required to put it on a URL that is publicly accessible and, ideally, in some sort of persistent form. For example 
put it on IPFS, like the [interim constitution](https://ipfs.io/ipfs/bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm)

* Download the file from its url:

```shell
wget https://ipfs.io/ipfs/bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm -O constitution.txt
```

* Get its hash, you can do it with blake2 or with cardano-cli:

```shell
b2sum -l 256 constitution.txt
a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d  constitution.txt
```
or

```shell
cardano-cli conway governance hash anchor-data --file-text constitution.txt
a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d
```

### The guardrails script

While the constitution is an informal, off-chain document, there will also be an optional script that can enforce some guidelines. This script acts 
to supplement the constitutional committee by restricting some proposal types.

At the Chang hardfork, the interim constitution will be supplemented with a Guardrails script. The raw files can be found at [Plutus/cardano-constitution](https://github.com/IntersectMBO/plutus/tree/master/cardano-constitution).

The guardrails script applies only to protocol parameter update and treasury withdrawal proposals.

Follow the instructions in the README.md file to compile the PlutusV3 script. A successful compilation creates the following:

```shell
cat guardrails-script.plutus 
```

```json
{
    "type": "PlutusScriptV3",
    "description": "",
    "cborHex": "5908545908510101003232323232323232323232323232323232323232323232323232323232323232323232323232323232259323255333573466e1d20000011180098111bab357426ae88d55cf00104554ccd5cd19b87480100044600422c6aae74004dd51aba1357446ae88d55cf1baa3255333573466e1d200a35573a002226ae84d5d11aab9e00111637546ae84d5d11aba235573c6ea800642b26006003149a2c8a4c301f801c0052000c00e0070018016006901e4070c00e003000c00d20d00fc000c0003003800a4005801c00e003002c00d20c09a0c80e1801c006001801a4101b5881380018000600700148013003801c006005801a410100078001801c006001801a4101001f8001800060070014801b0038018096007001800600690404002600060001801c0052008c00e006025801c006001801a41209d8001800060070014802b003801c006005801a410112f501c3003800c00300348202b7881300030000c00e00290066007003800c00b003482032ad7b806038403060070014803b00380180960003003800a4021801c00e003002c00d20f40380e1801c006001801a41403f800100a0c00e0029009600f0030078040c00e002900a600f003800c00b003301a483403e01a600700180060066034904801e00060001801c0052016c01e00600f801c006001801980c2402900e30000c00e002901060070030128060c00e00290116007003800c00b003483c0ba03860070018006006906432e00040283003800a40498003003800a404d802c00e00f003800c00b003301a480cb0003003800c003003301a4802b00030001801c01e0070018016006603490605c0160006007001800600660349048276000600030000c00e0029014600b003801c00c04b003800c00300348203a2489b00030001801c00e006025801c006001801a4101b11dc2df80018000c0003003800a4055802c00e007003012c00e003000c00d2080b8b872c000c0006007003801809600700180060069040607e4155016000600030000c00e00290166007003012c00e003000c00d2080c001c000c0003003800a405d801c00e003002c00d20c80180e1801c006001801a412007800100a0c00e00290186007003013c0006007001480cb005801801e006003801800e00600500403003800a4069802c00c00f003001c00c007003803c00e003002c00c05300333023480692028c0004014c00c00b003003c00c00f003003c00e00f003800c00b00301480590052008003003800a406d801c00e003002c00d2000c00d2006c00060070018006006900a600060001801c0052038c00e007001801600690006006901260003003800c003003483281300020141801c005203ac00e006027801c006001801a403d800180006007001480f3003801804e00700180060069040404af3c4e302600060001801c005203ec00e006013801c006001801a4101416f0fd20b80018000600700148103003801c006005801a403501c3003800c0030034812b00030000c00e0029021600f003800c00a01ac00e003000c00ccc08d20d00f4800b00030000c0000000000803c00c016008401e006009801c006001801807e0060298000c000401e006007801c0060018018074020c000400e00f003800c00b003010c000802180020070018006006019801805e0003000400600580180760060138000800c00b00330134805200c400e00300080330004006005801a4001801a410112f58000801c00600901260008019806a40118002007001800600690404a75ee01e00060008018046000801801e000300c4832004c025201430094800a0030028052003002c00d2002c000300648010c0092002300748028c0312000300b48018c0292012300948008c0212066801a40018000c0192008300a2233335573e00250002801994004d55ce800cd55cf0008d5d08014c00cd5d10011263009222532900389800a4d2219002912c80344c01526910c80148964cc04cdd68010034564cc03801400626601800e0071801226601800e01518010096400a3000910c008600444002600244004a664600200244246466004460044460040064600444600200646a660080080066a00600224446600644b20051800484ccc02600244666ae68cdc3801000c00200500a91199ab9a33710004003000801488ccd5cd19b89002001800400a44666ae68cdc4801000c00a00122333573466e20008006005000912a999ab9a3371200400222002220052255333573466e2400800444008440040026eb400a42660080026eb000a4264666015001229002914801c8954ccd5cd19b8700400211333573466e1c00c006001002118011229002914801c88cc044cdc100200099b82002003245200522900391199ab9a3371066e08010004cdc1001001c002004403245200522900391199ab9a3371266e08010004cdc1001001c00a00048a400a45200722333573466e20cdc100200099b820020038014000912c99807001000c40062004912c99807001000c400a2002001199919ab9a357466ae880048cc028dd69aba1003375a6ae84008d5d1000934000dd60010a40064666ae68d5d1800c0020052225933006003357420031330050023574400318010600a444aa666ae68cdc3a400000222c22aa666ae68cdc4000a4000226600666e05200000233702900000088994004cdc2001800ccdc20010008cc010008004c01088954ccd5cd19b87480000044400844cc00c004cdc300100091119803112c800c60012219002911919806912c800c4c02401a442b26600a004019130040018c008002590028c804c8888888800d1900991111111002a244b267201722222222008001000c600518000001112a999ab9a3370e004002230001155333573466e240080044600823002229002914801c88ccd5cd19b893370400800266e0800800e00100208c8c0040048c0088cc008008005"
}
```

Now, get the script hash with:

```shell
cardano-cli hash script --script-file guardrails-script.plutus 
fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64
```

#### Create the proposal to update the constitution:

When there is no previously enacted constitution: 

```shell
cardano-cli conway governance action create-constitution \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0100/cip-0100.common.schema.json \
  --anchor-data-hash "9d99fbca260b2d77e6d3012204e1a8658f872637ae94cdb1d8a53f4369400aa9" \
  --constitution-url https://ipfs.io/ipfs/bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm \
  --constitution-hash "a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d" \
  --constitution-script-hash "fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64"
  --out-file 
```
When there is a previously enacted constitution, we need to reference the previous governance action id (TXID and INDEX):

```shell
cardano-cli conway governance action create-constitution \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --constitution-url https://ipfs.io/ipfs/bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm \
  --constitution-hash "a77245f63bc7504c6ce34383633729692388dc1823723b0ee9825743a87a6a6d" \
  --constitution-script-hash "fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64" \
  --prev-governance-action-tx-id "bf4832f443fe34f26f929ce2fbb26cc35ef4fda31150b2da45969a9bac4f7a8c" \
  --prev-governance-action-index 0 \
  --out-file constitution.action
```
From here, you just need to [submit the proposal in a transaction](#build-sign-and-submit-the-transaction) 

## Motion of no confidence

- Find the last governance action enacted of this type:

```shell
cardano-cli conway query gov-state | jq -r '.nextRatifyState.nextEnactState.prevGovActionIds.Committee'
```
```json
{
  "govActionIx": 0,
  "txId": "fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec"
}
```

#### Create a motion no-confidence governance action:

```shell
cardano-cli conway governance action create-no-confidence \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --prev-governance-action-tx-id fe2c99fe6bc75a9666427163d51ae7dbf5a60df40135361b7bfd53ac6c7912ec \
  --prev-governance-action-index 0 \
  --out-file no-confidence.action
```
From here, you just need to [submit the proposal in a transaction](#build-sign-and-submit-the-transaction) 

## Treasury withdrawal

In addition to the stake credential required to obtain a deposit refund, the proposer must also furnish stake credentials for receiving funds from the treasury in the event that the governance action is approved.

Also, treasury withdrawals must reference the Guardrails script when present. 

#### Create the treasury withdrawal proposal:

```shell
cardano-cli conway governance action create-treasury-withdrawal \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --funds-receiving-stake-verification-key-file stake.vkey \
  --constitution-script-hash "fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64" \
  --transfer 50000000000 \
  --out-file treasury.action
```

* Note that you do not need to provide any previous governance action ID on treasury withdrawals.

From here, you just need to [submit the proposal in a transaction](#build-sign-and-submit-the-transaction) 

## Info

#### Create the 'info' governance action:

```shell
cardano-cli conway governance action create-info --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url  https://raw.githubusercontent.com/cardano-foundation/CIPs/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --out-file info.action
```
From here, you just need to [submit the proposal in a transaction](#build-sign-and-submit-the-transaction) 

## Update protocol parameters

When updating protocol parameters, you must reference the Guardrails script. This reference is not automatically inferred 
because, actions can be created off-line so the cli may not have access to a node, and also because a governance action may be submitted in advance, 
anticipating that a new Guardrails script will be ratified and enacted during the proposal's lifespan.

```shell
cardano-cli conway governance action create-protocol-parameters-update \
  --testnet \
  --governance-action-deposit $(cardano-cli conway query gov-state | jq -r '.currentPParams.govActionDeposit') \
  --deposit-return-stake-verification-key-file stake.vkey \
  --anchor-url https://raw.githubusercontent.com/cardano-foundation/CIPs/refs/heads/master/CIP-0108/examples/treasury-withdrawal.jsonld \
  --anchor-data-hash 311b148ca792007a3b1fee75a8698165911e306c3bc2afef6cf0145ecc7d03d4 \
  --constitution-script-hash "fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64" \
  --key-reg-deposit-amt 1000000 \
  --out-file pp-update.action
```

* Note: If there is a **previously enacted** governance action to update the protocol parameters, the proposal must also include `--prev-governance-action-tx-id` and `--prev-governance-action-index`.

Continue with [build, sign and submit the transactions](#build-sign-and-submit-the-transaction) 

## Submitting Motion of no-confidence, Update committee, New Constitution, Hardfork initiation or Info proposals in a transaction

Submitting the `*.action` file to the blockchain is the essential step in bringing your proposal to life and making it accessible for the community to participate in the
voting process. This process essentially transforms your proposal from a conceptual idea into an actionable item. Once submitted, it becomes part of the public ledger,
while also allowing members of the governance bodies to review, discuss, and ultimately cast their votes on its approval or rejection.

* Note that you can also use `build-raw` and `calculate-min-fee` to build transactions in an off-line setting. The example below uses the convenient `build`:

```shell
cardano-cli conway transaction build \
  --tx-in "$(cardano-cli query utxo --address "$(< payment.addr)" --output-json | jq -r 'keys[0]')" \
  --change-address $(< payment.addr) \
  --proposal-file info.action \
  --out-file tx.raw
```

```shell
cardano-cli conway transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --out-file tx.signed
```

```shell
cardano-cli conway transaction submit \
  --tx-file tx.signed
```

## Submitting a Treasury-withdrawal or Protocol-parameter-update governance action

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

```shell
cardano-cli conway transaction sign \
  --tx-file pparams-tx.raw \
  --signing-key-file payment.skey \
  --out-file pparams-tx.signed 
```

- Submit it to the chain with:

```shell
cardano-cli conway transaction submit \
  --tx-file pparams-tx.signed
```

## Finding the governance action ID of your proposal

You may want to find your governance action ID to share it with others on Discord1 and seek their support. The transaction ID and the index of the transaction that submitted the
proposal serve as the action ID. An effective way to find your governance action ID is by querying the governance state and filtering by (the proposer) stake key hash.

First, find your key hash with:

```shell
cardano-cli conway stake-address key-hash --stake-verification-key-file stake.vkey
```
`8e0debc9fdc6c616ac40d98bf3950b436895eea9cccf0396a6e5e12b`

Use `jq` to filter the `gov-state` output by the stake key hash. The output contains all the relevant information about your governance actions, including `actionId`:

```shell
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
