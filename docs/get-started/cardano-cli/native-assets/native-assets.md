---
id: native-assets
title: Native assets
sidebar_label: CLI - Native assets
sidebar_position: 3
description: Native assets in cardano
keywords: [native assets, cardano, cardano-node, cardano-cli]
---

From the Mary ledger upgrade and onwards, Cardano supports [multi-assets](https://github.com/intersectmbo/cardano-ledger/releases/download/cardano-ledger-spec-2023-01-18/mary-ledger.pdf), also referred to as a *native tokens* feature. This feature extends the ledger’s accounting infrastructure (originally designed for processing ada-only transactions) to accommodate transactions using a range of assets. These assets include ada and a variety of user-defined token types, the mixture of which can be transacted in a single tx output. Note that native tokens cannot exist on its own at a UTXO, a minimum number of lovelace is required at the UTXO to support the native tokens. 

## What are Native assets?

Native assets are user-defined, custom tokens. They are supported natively, which means that the ledger handles the accounting and tracking of token-related activities. This offers distinct advantages for developers as there is no need to create smart contracts to mint or burn custom tokens, removing a layer of added complexity and potential for manual errors.

An asset is uniquely identified by an *asset ID*, which is a pair of both the *policy ID* and an *asset name*:

+ *PolicyID* - the unique identifier that is associated with a minting policy (hash of the minting policy).
+ *Asset name* - an (immutable) property of an asset that is used to distinguish different assets within the same policy. Unlike the policyID, the asset name does not refer to any code or set of rules. It is a hex encoded arbitrary sequence of bytes. For example, `hex("couttscoin") = "636f75747473636f696e"`.

```shell
echo -n "couttscoin" | xxd -ps
636f75747473636f696e
```

Tokens that have the same asset ID have the property of being fungible with each other, and are not fungible with tokens that have a different asset ID.

Further reading:

- [Native token explainers](https://cardano-ledger.readthedocs.io/en/latest/)

Before you start, you should:

- have the [latest version of the node](https://github.com/intersectmbo/cardano-node/releases)
- configure the node to communicate with the [testnet environment](https://book.world.dev.cardano.org/environments.html)
- A [running cardano-node](docs/get-started/cardano-node/running-cardano.md) on the desired network.
- Cardano-cli installed 

### Syntax for expressing values in a transaction output

Lovelace values can be specified in two ways:

- `${quantity} lovelace` (where quantity is a signed integer)
- `${quantity}` (where quantity is a signed integer)
- `${assetName}` (where assetName is hex-encoded 61737365744e616d65)

Values for other assets can be specified as:

- `${quantity} ${policyId}.${assetName}`
- `${quantity} ${policyId}` 

Where `quantity` is a signed integer and `policyId` is a hex-encoded policy ID [a script hash], and `assetName` is a hex-encoded assetName.

### Syntax of native asset values

The `cardano-cli` can specify native asset values in transaction outputs and when minting or burning tokens. The syntax for these values has been designed to be backwards-compatible with the previous ada-only syntax (`address+lovelace`):

- ada values are defined as integer (INT) lovelace, e.g. `42 lovelace`
- native asset values can be defined as:
  - `INT policyid.assetName`, e.g. `42 $MYPOLICY.61737365744e616d65`
  - `INT policyid`, e.g. `42 $MYPOLICY` (No assetName specified)
  - `policyid.assetName`, e.g `$MYPOLICY.61737365744e616d65` (This will mint only one of `assetName`)
- Multiple assets can be combined in the same transaction output using the `+` operator, e.g:

`100 lovelace + 42 $MYPOLICY.666f6f + -2 $MYPOLICY.626172 + 10 lovelace`

**Negating individual values**

Any individual value can be negated using the `-` prefix operator. For example:

- `-42 $MYPOLICY`
- `-72191 $MYPOLICY.666f6f`
- `-100`
- `-920 lovelace`

**Combining individual values**

Values can be combined using the binary operator `+`. For example:

- `42 lovelace + -1 (this would result in a Value of 41 lovelace)`
- `20 $MYPOLICY + 12 $MYPOLICY.666f6f + -2 $MYPOLICY.626172`
- `201 4$MYPOLICY.666f6f + 12 + -1 + 9 lovelace + 10 $MYPOLICY`

### Creating a transaction

The native tokens syntax can be used in the following contexts:

- `cardano-cli transaction build-raw --tx-out="..."`
- `cardano-cli transaction build-raw --mint="..."`

The CLI command `cardano-cli transaction build-raw` creates the transaction body. The `--tx-out` option specifies the transaction output in the usual way *(This is expressed as address+lovelace, where address is a Bech32-encoded address, and lovelace is the amount in lovelace)*, and the `--mint` option specifies the value to be minted or burnt.

### Transaction outputs (TxOuts)

The syntax for TxOut values has been extended to include multi-asset tokens. These values can be specified in two different ways:

- `$address $value`
- `${address}+${value}`

(where *address* is a Cardano address and *value* is a value). The second form is provided for backwards compatibility with earlier versions of the node.

To receive tokens, you just need to specify any address. It is not necessary to use special addresses to hold multi-asset tokens.

To inspect the values in an address, you need to query your node for the UTXOs associated to that address using:

```
cardano-cli query utxo --address "$ADDRESS" 
```

## Token minting policies

Token minting policies are written using multi-signature scripts. This allows the asset controller to express conditions such as the need for specific token issuers to agree to mint new tokens, or to forbid minting tokens after a certain slot if [token locking](../simple-scripts/#type-before) is also used.

Here’s an example of a very simple minting policy, which grants the right to mint tokens to a single key:

```
{
  "keyHash": "fe38d7...599",
  "type": "sig"
}
```

This minting policy requires any transaction that mints tokens to be witnessed by the key with the hash `fe38d7...599`. More involved examples can be found in the [multi-signature simple scripts documentation](../simple-scripts/#json-script-syntax).

### Minting a new native token

#### Overview

This section describes how to manually mint a new native token ('customcoin') using cardano-cli, and send a transaction of this newly minted token to a new address. 
 
#### Pre-requisites 

1. Download the latest version of [cardano-node from the releases page](https://github.com/intersectmbo/cardano-node/releases) and config files for the public testnet from the [Cardano World](https://book.world.dev.cardano.org/environments.html)

2. Run the cardano-node:

```bash
cardano-node run --topology topology.json --database-path db --port 3001 --config config.json --socket-path node.socket

export CARDANO_NODE_SOCKET_PATH=~/node.socket
```
3. Generate a verification key and a signing key:

```bash
cardano-cli address key-gen \
    --verification-key-file payment.vkey \
    --signing-key-file payment.skey
```

The code should output something similar to this:

```bash
$ cat payment.skey 
{
    "type": "PaymentSigningKeyShelley_ed25519",
    "description": "Payment Signing Key",
    "cborHex": "58206c7c578e06f9175e20e63353b9beac984183f47ea7778960def47974435829f3"
}
$ cat payment.vkey 
{
    "type": "PaymentVerificationKeyShelley_ed25519",
    "description": "Payment Verification Key",
    "cborHex": "5820e70b3f8c2c18cdacc46efee076963029ca22c853d58e99cbe78f9a8e64c8c85f"
}
```

4. Generate the payment address:

```bash
cardano-cli address build \
--payment-verification-key-file payment.vkey \
--out-file payment.addr
```

This code produces the following payment address:

```bash
$ cat payment.addr
addr_test1vp6jzppqqegyvjnwc25dg853eam2xmxvydjntfw6d8x4p7qrnsnj9
```

5. Check the balance of the payment address:

```bash
cardano-cli query utxo --address
```

The response should show no funds:

```bash
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
```

6. Fund the address: 

Use the [testnet faucet]( https://docs.cardano.org/cardano-testnets/tools/faucet/) to fund your address,

and check again:

```bash
cardano-cli query utxo --address $(< payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
503c699e81d4abc3f8a1d2681425aee1e2ac5770a5be5b9314339591a7158f34     0        10000000000 lovelace + TxOutDatumNone
```

#### Start the minting process

1. Create a policy script:

```bash
mkdir policy

cardano-cli address key-gen \
    --verification-key-file policy.vkey \
    --signing-key-file policy.skey


touch policy.script && echo "" > policy.script 


echo "{" >> policy.script 
echo "  \"keyHash\": \"$(cardano-cli address key-hash --payment-verification-key-file policy.vkey)\"," >> policy.script 
echo "  \"type\": \"sig\"" >> policy.script 
echo "}" >> policy.script 

cat policy.script 
{
  "keyHash": "3c293ef7fa09577e8a656016d59abe042ed9fe38cdfd9d81568450c6",
  "type": "sig"
}
```

2. Generate the policy ID and the hex encoded asset name.

The policyID is the script hash of the `policy.script`:

```bash 
cardano-cli hash script --script-file policy.script 

11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74
```
get the asset name in hex, our token will be named "melcoin": 

```bash
echo -n "customcoin" | xxd -ps 

637573746f6d636f696e
```

#### Build the asset-minting transaction 

1. Query the protocol parameters:

```shell
cardano-cli query protocol-parameters --out-file pparams.json
```

2. Calculate the minimum utxo size required to hold the desired number of native assets. Let's mint 1000 `customcoin`:

```shell
cardano-cli babbage transaction calculate-min-required-utxo \
--protocol-params-file pparams.json \
--tx-out addr_test1vp6jzppqqegyvjnwc25dg853eam2xmxvydjntfw6d8x4p7qrnsnj9+"1000 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e"
Coin 1051640
```

This means that we need at least 1051640 lovelace at the utxo to support the 1000 `customcoin`. To give ourselves some room for future transactions where we might send `custocoin` to different addresses 
we will send 10 ada on the minting transaction.

1. This transaction will mint 1000 "customcoin", with asset id `11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e`

```bash
cardano-cli transaction build \
--tx-in 503c699e81d4abc3f8a1d2681425aee1e2ac5770a5be5b9314339591a7158f34#0 \
--tx-out $(< payment.addr)+10000000+"1000 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e" \
--mint="1000 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e" \
--mint-script-file policy.script \
--change-address $(< payment.addr) \
--out-file mint-tx.raw

Estimated transaction fee: Coin 175621
```

#### Sign the transaction:

```bash
cardano-cli transaction sign \
--tx-file mint-tx.raw \
--signing-key-file policy.skey \
--signing-key-file payment.skey \
--out-file mint-tx.signed

```

#### Submit the transaction:

```bash
cardano-cli transaction submit --tx-file mint-tx.signed
Transaction successfully submitted.
```

```bash
cardano-cli query utxo --address $(< payment.addr)
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
d4b158e58cb58da28b25837300f6ef8f9f7d67fd5a5ce07648d17a6fae31b88a     0        10000000 lovelace + 1000 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e + TxOutDatumNone
d4b158e58cb58da28b25837300f6ef8f9f7d67fd5a5ce07648d17a6fae31b88a     1        9989824379 lovelace + TxOutDatumNone

```

### Transferring tokens

Tokens can be sent just like ada by any token holder, just remember that it is not possible to send *only* native-assets in a transaction, some 
ada always needs to be included in each output. The minimum amount is determined by the `utxoCostPerByte` protocol parameter. Also note that, 
currently, the `build` command  cannot automatically balance native assets. This is, we need to manually balance native assets with `--tx-out` flags and 
use `--change-address` to automatically balance ada-only utxos. 

For example, to send 1 `customcoin` to the address `addr_test1vp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeuegh55grh` we do:

```shell
cardano-cli babbage transaction calculate-min-required-utxo \
--protocol-params-file pparams.json \
--tx-out addr_test1vp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeuegh55grh+"1 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e"
Coin 1043020
```

and build the transaction with: 

```shell
cardano-cli transaction build \
--tx-in d4b158e58cb58da28b25837300f6ef8f9f7d67fd5a5ce07648d17a6fae31b88a#0 \
--tx-in d4b158e58cb58da28b25837300f6ef8f9f7d67fd5a5ce07648d17a6fae31b88a#1 \
--tx-out addr_test1vp9khgeajxw8snjjvaaule727hpytrvpsnq8z7h9t3zeuegh55grh+1043020+"1 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e" \
--tx-out $(< payment.addr)+8956980+"999 11375f8ee31c280e1f2ec6fe11a73bca79d7a6a64f18e1e6980f0c74.637573746f6d636f696e" \
--change-address $(< payment.addr) \
--out-file tx.raw
```
```
cardano-cli transaction sign --tx-file tx.raw --signing-key-file policy.skey --signing-key-file payment.skey --out-file tx.signed
```
```
cardano-cli transaction submit --tx-file tx.signedTransaction successfully submitted.
```

### Buying and spending tokens

Token holders “buy” tokens from a token issuer. This will usually involve sending some ada to a specific address that has been set up by the token issuer and informing the token issuer about the address where the tokens should be sent. The token issuer will then set up a transaction that will transfer a multi-asset token to the specified address.

Tokens that have been issued to a token holder can be “spent” by returning them to a token issuer (i.e. by redeeming the tokens). This is done using a normal transaction. The token issuer will then provide the token holder with the agreed object in return (which may be an item of value, a service, a different kind of token, some ada, etc).

```
cardano-cli transaction build-raw ... --out-file txbody
 
cardano-cli transaction sign ... --tx-body-file txbody --out-file tx

cardano-cli transaction submit ... --tx-file tx 
```

### Destroying (burning) tokens

Tokens can be destroyed by a token issuer according to the token policy by supplying a negative value in the `--mint` field. That allows acquiring tokens in the UTXO entry in the input of a transaction, without adding them to one of the outputs, effectively destroying them. For example, tokens created in the previous section can be destroyed as follows:

```
TXID1=$(cardano-cli transaction txid --tx-body-file "$TX_BODY_FILE_1")
TX_BODY_FILE_2=...
TX_FILE_2=...
 
cardano-cli transaction build-raw \
--fee 0 \
--tx-in "$TXID1"#0 \
--tx-out="$ADDR+$LOVELACE" \
--mint="-5 $POLICYID.637573746f6d636f696e" \
--out-file "$TX_BODY_FILE_2"
 
cardano-cli transaction sign \
--signing-key-file "$SPENDING_KEY" \
--signing-key-file "$MINTING_KEY" \
--script-file "$SCRIPT" \
--tx-body-file  "$TX_BODY_FILE_2" \
--out-file  	"TX_FILE_2"
 
cardano-cli transaction submit --tx-file  "$TX_FILE_2" 
```

> Note: Destroying tokens requires both the payment credential for using the UTXO entry with the tokens, *and* a credential for the minting policy script.
