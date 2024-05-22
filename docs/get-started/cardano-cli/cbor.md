---
id: about-cbor
title: About CBOR
sidebar_position: 13
sidebar_label: CBOR and CDDL
keywords: [cardano-cli, cbor, cddl, cardano-node]
---

## A very needed explanation about CDDL and CBOR with examples.

TODO


Many commands require the user to provide a **credential**. The CDDLs define it as:

```cddl 
credential =
  [  0, addr_keyhash
  // 1, scripthash
  ]
```

Take for example the following verification key:

cat payment.vkey 
{
    "type": "PaymentVerificationKeyShelley_ed25519",
    "description": "Payment Verification Key",
    "cborHex": "5820094f5ae8dcb6a1c84e7261863580bf49a5c716b5315c9e1fbd6b9a08ab1bc315"
}

cardano-cli conway address key-hash --payment-verification-key-file payment.vkey 
52c9550c8fad5ccc7940621e1234e0d1c75b16360b60efda42304e88

