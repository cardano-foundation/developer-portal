---
id: register-stake-pool
title: Registering a Pool (JSON Metadata)
sidebar_label: Registering a Pool
description: Registering a Pool (JSON Metadata)
image: ../img/og-developer-portal.png
---

Registering your stake pool requires:

* Create JSON file with your metadata and store it in the node and in a URL you maintain
* Get the hash of your JSON file
* Generate the stake pool registration certificate
* Create a delegation certificate pledge
* Submit the certificates to the blockchain

:::note
Generating the stake pool registration certificate and the delegation certificate requires the cold keys. So, when doing this on mainnet you may want to generate these certificates in your local machine taking the proper security measures to avoid exposing your cold keys to the internet.
:::

Before starting, make sure you have access to:

| File | Content |
| :--- | :--- |
| `payment.vkey` | payment verification key |
| `payment.skey` | payment signing key |
| `stake.vkey` | staking verification key |
| `stake.skey` | staking signing key |
| `stake.addr` | registered stake address |
| `payment.addr` | funded address linked to `stake` |
| `cold.vkey` | cold verification key |
| `cold.skey` | cold signing key |
| `cold.counter` | issue counter |
| `node.cert` | operational certificate |
| `kes.vkey` | KES verification key |
| `kes.skey` | KES signing key |
| `vrf.vkey` | VRF verification key |
| `vrf.skey` | VRF signing key |
| `protocol.json` | protocol parameters file |

## Create JSON file with your metadata

`ticker` must be between 3-9 characters in length. Characters must be A-Z and 0-9 only.
`description` cannot exceed 255 characters in length.

```
cat > poolMetaData.json << EOF
{
"name": "YourPoolName",
"description": "Your pool description",
"ticker": "PN",
"homepage": "https://yourpoollink.com"
}
EOF
```

Calculate the hash of your metadata file. Here it's saved to `poolMetaDataHash.txt`:

```
cardano-cli stake-pool metadata-hash --pool-metadata-file poolMetaData.json > poolMetaDataHash.txt
```

## Get the hash of your JSON file

Make your poolMetadata.json available as a web URL accessible on internet, ideally without  redirections. You can do so by uploading it to your website as well.
Verify the metadata hashes by comparing your uploaded .json file and your local .json file's hash.

```
cardano-cli stake-pool metadata-hash --pool-metadata-file <(curl -s -L <https://REPLACE WITH YOUR METADATA_URL>)

cat poolMetaDataHash.txt
```

Both the hashes must be equal. If the hashes do no match, then the uploaded .json file likely was truncated or extra whitespace caused issues. Upload the .json again or to a different web host.

## Generate the stake pool registration certificate

Find the minimum pool cost:

```
minPoolCost=$(cat protocol.json | jq -r .minPoolCost)
echo minPoolCost: ${minPoolCost}
```

Generate the stake pool registration certificate:

```
cardano-cli stake-pool registration-certificate \
    --cold-verification-key-file cold.vkey \
    --vrf-verification-key-file vrf.vkey \
    --pool-pledge 100000000 \
    --pool-cost 340000000 \
    --pool-margin 0.01 \
    --pool-reward-account-verification-key-file stake.vkey \
    --pool-owner-stake-verification-key-file stake.vkey \
    --testnet-magic 1 \
    --single-host-pool-relay <dns based relay, example ~ relaynode1.yourpoolname.com>  \
    --pool-relay-port 6000 \
    --metadata-url <url where you uploaded poolMetaData.json> \
    --metadata-hash $(cat poolMetaDataHash.txt) \
    --out-file pool.cert
```
:::important
In case you have multiple relays, please substitute the `single-host-pool-relay` & `pool-relay-port` lines from above with the below code accordingly.

DNS based relays, 1 entry per DNS record
```
    --single-host-pool-relay <relaynode1.yourpoolname.com> \
    --pool-relay-port 6000 \
    --single-host-pool-relay <relaynode2.yourpoolname.com> \
    --pool-relay-port 6000 \
```

Round Robin DNS based relays, 1 entry per SRV DNS record
```
    --multi-host-pool-relay <relaynodes.yourpoolname.com> \
    --pool-relay-port 6000 \
```

IP based relays, 1 entry per IP address
```
    --pool-relay-port 6000 \
    --pool-relay-ipv4 <first relay node public IP> \
    --pool-relay-port 6000 \
    --pool-relay-ipv4 <second relay node public IP> \
```
:::

| Parameter | Explanation |
| :--- | :--- |
| cold-verification-key-file | verification _cold_ key |
| vrf-verification-key-file | verification _VRF_ key |
| pool-pledge | pledge lovelace |
| pool-cost | operational costs per epoch lovelace |
| pool-margin | operator margin |
| pool-reward-account-verification-key-file | verification staking key for the rewards |
| pool-owner-staking-verification-key-file | verification staking keys for the pool owners |
| single-host-pool-relay | relay node dns |
| pool-relay-port | port |
| metadata-url | url of your json file |
| metadata-hash | the hash of pools json metadata file |
| out-file | output file to write the certificate to |

In case an error similar to the one below appears, then the URL length needs to be reduced:

```
*--metadata-url: The provided string must have at most 64 characters, but it has 70 characters
```

and you must generate the certificate again with the new, shorter URL.

## Create a delegation certificate pledge

To honor your pledge, create a delegation certificate:

```
cardano-cli stake-address delegation-certificate \
    --stake-verification-key-file stake.vkey \
    --cold-verification-key-file cold.vkey \
    --out-file deleg.cert
```

This creates a delegation certificate which delegates funds from all stake addresses associated with key `stake.vkey` to the pool belonging to cold key `cold.vkey`. If there are many staking keys as pool owners in the first step, we need delegation certificates for all of them.

## Submit the certificates to the blockchain

To understand the basics of submitting a transaction on the chain, refer to [Register Stake Address](./register-stake-address).

Registering a stake pool requires a deposit. This amount is specified in the already created `protocol.json`:

```
stakePoolDeposit=$(cat protocol.json | jq -r '.stakePoolDeposit')
echo $stakePoolDeposit
```

Let's find out how much balance is in our wallet:

```
cardano-cli query utxo \
    --address $(cat payment.addr) \
    --testnet-magic 1 > fullUtxo.out

tail -n +3 fullUtxo.out | sort -k3 -nr > balance.out

cat balance.out

tx_in=""
total_balance=0
while read -r utxo; do
    type=$(awk '{ print $6 }' <<< "${utxo}")
    if [[ ${type} == 'TxOutDatumNone' ]]
    then
        in_addr=$(awk '{ print $1 }' <<< "${utxo}")
        idx=$(awk '{ print $2 }' <<< "${utxo}")
        utxo_balance=$(awk '{ print $3 }' <<< "${utxo}")
        total_balance=$((${total_balance}+${utxo_balance}))
        echo TxHash: ${in_addr}#${idx}
        echo ADA: ${utxo_balance}
        tx_in="${tx_in} --tx-in ${in_addr}#${idx}"
    fi
done < balance.out
txcnt=$(cat balance.out | wc -l)
echo Total available ADA balance: ${total_balance}
echo Number of UTXOs: ${txcnt}
```

You should get output similar to below:

```
Total available ADA balance: 9497237500
Number of UTXOs: 1
```

Calculate the change for `--tx-out`. Since we don't know the exact transaction fees yet, we take 1 ada for the calculation:

```
expr UTxO BALANCE - poolDeposit - TRANSACTION FEE
```

which in our case would be 9497237500 - 500000000 - 1000000 = 8996237500

```
cardano-cli transaction build \
    ${tx_in} \
    --tx-out $(cat payment.addr)+8996237500 \
    --change-address $(cat payment.addr) \
    --testnet-magic 1 \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --invalid-hereafter $(( ${currentSlot} + 1000)) \
    --witness-override 2 \
    --out-file tx.raw
```

would give transaction fees as output like:

```
Estimated transaction fee: Lovelace 172189
```

So now we replace the 1 ada with 172189 Lovelace in our calculation:

```
txOut=$((9497237500-${stakePoolDeposit}-172189))
echo ${txOut}
```

Build the transaction:
```
cardano-cli transaction build-raw \
    ${tx_in} \
    --tx-out $(cat payment.addr)+${txOut} \
    --invalid-hereafter $((${currentSlot} + 1000)) \
    --fee 172189 \
    --certificate-file pool.cert \
    --certificate-file deleg.cert \
    --out-file tx.raw
```

Sign the transaction:
```
cardano-cli transaction sign \
    --tx-body-file tx.raw \
    --signing-key-file payment.skey \
    --signing-key-file cold.skey \
    --signing-key-file stake.skey \
    --testnet-magic 1 \
    --out-file tx.signed
```

Submit the transaction:
```
cardano-cli transaction submit \
    --tx-file tx.signed \
    --testnet-magic 1
```

In case you took a break, you might have passed the `--invalid-hereafter` slot and would get an error. In that case you would need to submit the transaction again with it's updated value.
Another common error message is `FeeTooSmallUTxO`, which means that the transaction fee we provided before is not enough and we need to change the fees to the new value provided with the error message and resubmit.

## Verify that your stake pool registration was successful

Get pool ID:
```
cardano-cli stake-pool id --cold-verification-key-file cold.vkey --output-format hex > stakepoolid.txt
cat stakepoolid.txt
```

Check for the presence of your pool ID on the network, with:
```
cardano-cli query stake-snapshot --stake-pool-id $(cat stakepoolid.txt) --testnet-magic 1
```

A non-empty string returned means you're registered. Congratulations!

Additionally you can check your pool on any of the PreProd explorers like [PreProd Cexplorer](https://preprod.cexplorer.io/)
