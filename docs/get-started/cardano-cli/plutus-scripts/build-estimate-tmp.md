
## Building a transaction with the `build-estimate` command

You can use the `build-estimate` command to automatically balance transactions even if you don't have access to a live node that has caught up to the tip of the chain. 
 
```bash
cardano-cli latest transaction build-estimate                                                    
Usage: cardano-cli latest transaction build-estimate 
                                                       [ --script-valid
                                                       | --script-invalid
                                                       ]
                                                       --shelley-key-witnesses INT
                                                       [--byron-key-witnesses Int]
                                                       --protocol-params-file FILE
                                                       --total-utxo-value VALUE
                                                       (--tx-in TX-IN
                                                         [ --spending-tx-in-reference TX-IN
                                                           ( --spending-plutus-script-v2
                                                           | --spending-plutus-script-v3
                                                           )
                                                           ( --spending-reference-tx-in-datum-cbor-file CBOR FILE
                                                           | --spending-reference-tx-in-datum-file JSON FILE
                                                           | --spending-reference-tx-in-datum-value JSON VALUE
                                                           | --spending-reference-tx-in-inline-datum-present
                                                           )
                                                           ( --spending-reference-tx-in-redeemer-cbor-file CBOR FILE
                                                           | --spending-reference-tx-in-redeemer-file JSON FILE
                                                           | --spending-reference-tx-in-redeemer-value JSON VALUE
                                                           )
                                                         | --simple-script-tx-in-reference TX-IN
                                                         | --tx-in-script-file FILE
                                                           [
                                                             ( --tx-in-datum-cbor-file CBOR FILE
                                                             | --tx-in-datum-file JSON FILE
                                                             | --tx-in-datum-value JSON VALUE
                                                             | --tx-in-inline-datum-present
                                                             )
                                                             ( --tx-in-redeemer-cbor-file CBOR FILE
                                                             | --tx-in-redeemer-file JSON FILE
                                                             | --tx-in-redeemer-value JSON VALUE
                                                             )]
                                                         ])
                                                       [--read-only-tx-in-reference TX-IN]
                                                       [ --required-signer FILE
                                                       | --required-signer-hash HASH
                                                       ]
                                                       [--tx-in-collateral TX-IN]
                                                       [--tx-out-return-collateral ADDRESS VALUE]
                                                       [--tx-out ADDRESS VALUE
                                                         [ --tx-out-datum-hash HASH
                                                         | --tx-out-datum-hash-cbor-file CBOR FILE
                                                         | --tx-out-datum-hash-file JSON FILE
                                                         | --tx-out-datum-hash-value JSON VALUE
                                                         | --tx-out-datum-embed-cbor-file CBOR FILE
                                                         | --tx-out-datum-embed-file JSON FILE
                                                         | --tx-out-datum-embed-value JSON VALUE
                                                         | --tx-out-inline-datum-cbor-file CBOR FILE
                                                         | --tx-out-inline-datum-file JSON FILE
                                                         | --tx-out-inline-datum-value JSON VALUE
                                                         ]
                                                         [--tx-out-reference-script-file FILE]]
                                                       --change-address ADDRESS
                                                       [--mint VALUE
                                                         ( --mint-script-file FILE
                                                           [ --mint-redeemer-cbor-file CBOR FILE
                                                           | --mint-redeemer-file JSON FILE
                                                           | --mint-redeemer-value JSON VALUE
                                                           ]
                                                         | --simple-minting-script-tx-in-reference TX-IN
                                                           --policy-id HASH
                                                         | --mint-tx-in-reference TX-IN
                                                           ( --mint-plutus-script-v2
                                                           | --mint-plutus-script-v3
                                                           )
                                                           ( --mint-reference-tx-in-redeemer-cbor-file CBOR FILE
                                                           | --mint-reference-tx-in-redeemer-file JSON FILE
                                                           | --mint-reference-tx-in-redeemer-value JSON VALUE
                                                           )
                                                           --policy-id HASH
                                                         )]
                                                       [--invalid-before SLOT]
                                                       [--invalid-hereafter SLOT]
                                                       [--certificate-file FILE
                                                         [ --certificate-script-file FILE
                                                           [ --certificate-redeemer-cbor-file CBOR FILE
                                                           | --certificate-redeemer-file JSON FILE
                                                           | --certificate-redeemer-value JSON VALUE
                                                           ]
                                                         | --certificate-tx-in-reference TX-IN
                                                           ( --certificate-plutus-script-v2
                                                           | --certificate-plutus-script-v3
                                                           )
                                                           ( --certificate-reference-tx-in-redeemer-cbor-file CBOR FILE
                                                           | --certificate-reference-tx-in-redeemer-file JSON FILE
                                                           | --certificate-reference-tx-in-redeemer-value JSON VALUE
                                                           )
                                                         ]]
                                                       [--withdrawal WITHDRAWAL
                                                         [ --withdrawal-script-file FILE
                                                           [ --withdrawal-redeemer-cbor-file CBOR FILE
                                                           | --withdrawal-redeemer-file JSON FILE
                                                           | --withdrawal-redeemer-value JSON VALUE
                                                           ]
                                                         | --withdrawal-tx-in-reference TX-IN
                                                           ( --withdrawal-plutus-script-v2
                                                           | --withdrawal-plutus-script-v3
                                                           )
                                                           ( --withdrawal-reference-tx-in-redeemer-cbor-file CBOR FILE
                                                           | --withdrawal-reference-tx-in-redeemer-file JSON FILE
                                                           | --withdrawal-reference-tx-in-redeemer-value JSON VALUE
                                                           )
                                                         ]]
                                                       [--tx-total-collateral INTEGER]
                                                       [ --json-metadata-no-schema
                                                       | --json-metadata-detailed-schema
                                                       ]
                                                       [--auxiliary-script-file FILE]
                                                       [ --metadata-json-file FILE
                                                       | --metadata-cbor-file FILE
                                                       ]
                                                       [--update-proposal-file FILE]
                                                       --out-file FILE
```
 
Follow the process below to create a transaction: 
 
* Get the protocol parameters
* Get the value of the UTXOs you are spending
* Build a transaction
* Sign the transaction
* Submit the transaction.
 
### Get the protocol parameters
 
To retrieve the protocol parameters, obtain the JSON file from the shell script `cardano-cli/scripts/fetch-protocol-parameters.sh`. It is important to note that the JSON file must adhere to the format expected by `cardano-cli`, but you are free to retrieve it from any source you prefer.
 
### Get the value of the UTXOs being spent
 
It is important to enter the value of the UTXOs you are spending along with multi-assets.  
The total balance of the inputs in the transaction is required to calculate the change.
 
You can find this information on any explorer and enter the corresponding value. Refer to the overview of [multi-asset values syntax](https://github.com/input-output-hk/cardano-node-wiki/blob/main/docs/reference/native-tokens/02-getting-started.md#syntax-of-multi-asset-values)
to see some examples.
 
### Create the unsigned transaction
 
To create a transaction, run:
 
```bash
cardano-cli latest transaction build-estimate \
  --tx-in <TxHash>#<TxIx> \
  --tx-out <Address>+<Lovelace> \
  --total-utxo-value <Value>
  --change-address <Bech32Address>
  --out-file tx.draft
```
### Sign a transaction
 
To be valid, a transaction must be signed by the relevant signing keys associated with the payment addresses of the inputs it references. If the transaction contains certificates, it must also be signed by the authorized party who can issue those certificates. For instance, a stake address registration certificate must be signed by the signing key linked to the corresponding stake key pair.

To sign a transaction, run:
 
```bash
cardano-cli transaction sign \
  --tx-body-file tx.raw \
  --signing-key-file payment.skey \
  --mainnet \
  --out-file tx.signed
```
 
### Submit a transaction

To submit a transaction, run:
 
```bash
cardano-cli transaction submit \
  --tx-file tx.signed \
  --mainnet
```

