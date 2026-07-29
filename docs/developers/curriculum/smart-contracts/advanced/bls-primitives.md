---
id: bls-primitives
title: BLS Signatures, VRFs, and Anonymous Credentials
sidebar_label: BLS signatures & beyond
description: "The BLS12-381 builtins beyond proof verification: aggregated BLS signatures, on-chain key derivation, verifiable random functions, and BBS+ selective disclosure in Aiken."
---

## Introduction

The [zero-knowledge proofs page](/docs/developers/curriculum/smart-contracts/advanced/zero-knowledge) covers the headline use of the BLS12-381 builtins: verifying a SNARK inside a validator. But proof verification is only one member of a family. Because BLS12-381 is a **pairing-friendly** curve, the same handful of operations, scalar multiplication, point addition, hashing-to-curve, and the pairing check, compose into several other protocols that run entirely on-chain:

- **BLS signatures**: thousands of signatures or public keys collapse into one small value, verified with a constant number of pairings.
- **Key derivation functions**: turn seeds or shared secrets into valid curve keys, natively in a validator.
- **Verifiable random functions**: pseudorandom outputs that anyone can verify came from a specific key.
- **BBS+ anonymous credentials**: prove selected attributes from a signed credential without revealing the rest.

For what the builtins are and when they shipped (CIP-0381 in Chang, cheaper via CIP-0133 and CIP-0109 in van Rossem), see [the primitives section](/docs/developers/curriculum/smart-contracts/advanced/zero-knowledge#the-primitives-what-shipped-when) of the ZK page; this page assumes them and builds up. The worked examples come from the [Cardano Foundation's BLS repository](https://github.com/cardano-foundation/bls), and the protocols were introduced in depth in [this article on the Aiken primitives](https://cardanofoundation.org/blog/aiken-primitives-explained).

## The primitives in Aiken

Aiken exposes the raw Plutus builtins through `aiken/builtin` and wraps them in a type-safe interface under [`aiken/crypto/bls12_381`](https://aiken-lang.github.io/stdlib/aiken/crypto.html), with one module per group: `g1` (48-byte compressed points) and `g2` (96-byte compressed points). Deriving a public key from a secret is one scalar multiplication:

```aiken
use aiken/builtin
use aiken/crypto/bls12_381/g1

fn sk_to_pk(sk: ByteArray) -> ByteArray {
  let s = builtin.bytearray_to_integer(True, sk)
  expect s != 0
  builtin.bls12_381_g1_compress(builtin.bls12_381_g1_scalar_mul(s, g1.generator))
}
```

Uncompressed points are twice the size, so anything stored in a datum or redeemer is compressed first. That size difference also drives a convention: with **public keys in G1 and signatures in G2** (the *minimal public key size* variant of BLS), the long-lived data (keys, held in datums and UTXOs) stays at 48 bytes, while the larger 96-byte signatures are usually transient.

The second primitive everything below leans on is **hash-to-curve**: hashing a message directly to a point on the curve rather than to an integer. Signing is then one more scalar multiplication:

```aiken
use aiken/builtin

fn hash_and_sign(sk: ByteArray, message: ByteArray, dst: ByteArray) -> ByteArray {
  let s = builtin.bytearray_to_integer(True, sk)
  expect s != 0
  let h = builtin.bls12_381_g2_hash_to_group(message, dst)
  builtin.bls12_381_g2_compress(builtin.bls12_381_g2_scalar_mul(s, h))
}
```

The `dst` argument is a **domain separation tag**, a public string baked into the hash so that a hash computed for a signature can never collide with one computed for a VRF or any other protocol, even on identical input.

Finally the pairing itself, always a two-step dance: a **Miller loop** per point pair produces intermediate results, and one `bls12_381_final_verify` compares them:

```aiken
use aiken/builtin.{
  bls12_381_final_verify, bls12_381_g1_scalar_mul, bls12_381_g2_scalar_mul,
  bls12_381_miller_loop,
}
use aiken/crypto/bls12_381/g1
use aiken/crypto/bls12_381/g2

/// Bilinearity: e(2*G1, 3*G2) == e(6*G1, G2)
test bilinearity_demo() {
  bls12_381_final_verify(
    bls12_381_miller_loop(
      bls12_381_g1_scalar_mul(2, g1.generator),
      bls12_381_g2_scalar_mul(3, g2.generator),
    ),
    bls12_381_miller_loop(
      bls12_381_g1_scalar_mul(6, g1.generator),
      g2.generator,
    ),
  )
}
```

The split matters for cost: intermediate Miller-loop results can be multiplied together with `bls12_381_mul_miller_loop_result`, so verifying *many* relationships still ends in a *single* final verify. That one property is what makes signature aggregation affordable on-chain.

## BLS signatures and aggregation

BLS (Boneh-Lynn-Shacham) signatures do everything Ed25519 does, plus one thing no ordinary scheme can: signatures are curve points, so they **add together**. A hundred signers produce a hundred signatures that aggregate into one 96-byte value. With ECDSA or Ed25519, verification cost and witness size grow linearly with the signer set; with BLS they barely grow at all. That is why Ethereum's consensus layer runs on BLS attestations, and it is what makes large on-chain committees, vote tallies, and k-of-n schemes with big n practical inside one script budget. (For small, fixed signer sets, [native-script multisig](/docs/developers/curriculum/smart-contracts/write-a-validator#native-scripts-multisig-and-time-locks-without-plutus) remains the simpler tool, no Plutus required.)

Two aggregation patterns, with different costs:

- **Signature aggregation, distinct messages.** Each party signs its own message; the signatures sum into one value. The verifier runs one Miller loop per `(public key, message)` pair, multiplies the intermediate results, and finishes with a single final verify. Cost is roughly one pairing per message, but the witness is one signature instead of n.
- **Public-key aggregation, same message.** When everyone signs the *same* message, the public keys themselves aggregate too (point addition in G1, 48 bytes total). Verification is then **two pairings, no matter how many signers**: aggregated key against the hashed message, aggregated signature against the generator.

The [`ilap/bls`](https://github.com/ilap/bls) library (Apache-2.0) implements the [IETF BLS signature draft](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-bls-signature) on top of the builtins, and the [`signature-aggregation-case`](https://github.com/cardano-foundation/bls/tree/main/aiken/signature-aggregation-case) and [`publickey-aggregation-case`](https://github.com/cardano-foundation/bls/tree/main/aiken/publickey-aggregation-case) examples exercise both patterns end to end. The library's API is small: `sk_to_pk`, `sign`, `verify`, `aggregate`, `aggregate_verify`.

```aiken
use bls/g1/basic as bls

// Off-chain: anyone can aggregate the collected signatures
let sig_aggr = bls.aggregate([sig1, sig2, sig3])

// On-chain: one check covers all three signers
bls.aggregate_verify([pk1, pk2, pk3], [msg1, msg2, msg3], sig_aggr)
```

### The rogue-key attack, and the three modes that defend against it

Aggregation introduces an attack that plain signatures do not have. Public keys are just points, so an attacker who sees honest keys `pk_1` and `pk_2` can *claim* the key `pk_rogue = pk_att - (pk_1 + pk_2)` for a secret `sk_att` they control. They never knew the secrets behind the honest keys, but the aggregate `pk_1 + pk_2 + pk_rogue` collapses to `pk_att`, so a signature they produce alone verifies as if all three signed. The IETF draft defines three signing modes, `ilap/bls` implements all of them, and the difference is exactly how each one kills this attack:

| Mode | How it works | Defense | When to use |
|---|---|---|---|
| **Basic** (`bls/g1/basic`) | Sign the raw message | `aggregate_verify` rejects duplicate messages, so cancellation cannot pay off | Trusted or pre-validated keys, messages known to be distinct |
| **Augmented** (`bls/g1/aug`) | Sign `pk ‖ message` | Each hash input is unique per signer, so a forged aggregate never matches | Untrusted keys that change often, duplicate messages allowed |
| **Proof-of-possession** (`bls/g1/pop`) | Register each key once with a signature over itself | Registration proves the key's owner holds its secret, rogue keys cannot register | Fixed committees or pools that register once and sign many times |

One composition rule to respect: **public-key aggregation only works in Basic mode with an identical message.** Augmented and PoP signatures bind each signature to the individual signer's key, so the pairing equation over an aggregated key no longer balances; the `publickey-aggregation-case` example demonstrates the failure explicitly.

## Deriving keys on-chain: KDFs

The examples above assume a curve-ready 32-byte secret. Real inputs are messier, a seed, a Diffie-Hellman shared secret, a password, and interpreting raw bytes as a scalar can fall outside the curve's prime field. A **key derivation function** bridges the gap, and the [`kdf`](https://github.com/cardano-foundation/bls/tree/main/aiken/kdf) example implements two RFC-compliant ones purely from Plutus builtins, plus helpers (`gen_keys_hkdf`, `gen_keys_pbkdf2`) that reduce the output modulo the field order and hand back a valid `(sk, pk)` pair:

- **HKDF ([RFC 5869](https://datatracker.ietf.org/doc/html/rfc5869))** for input that is already high-entropy. Cheap: a 32-byte derivation costs around 15M CPU units, background noise in a script budget. The `info` parameter gives domain separation, so one master secret can yield many unlinkable keys.
- **PBKDF2 ([RFC 8018](https://datatracker.ietf.org/doc/html/rfc8018#page-11))** for low-entropy input, made deliberately slow through iteration. On-chain the iteration count must stay modest: a handful of iterations costs a few million CPU units, while the classic off-chain recommendation of 4,096 iterations measures around 5.7 billion, more than half of an entire transaction's execution budget. (This is the same PBKDF2 your wallet uses off-chain, at full strength, to [stretch mnemonics into master keys](/docs/developers/curriculum/fundamentals/core-concepts/wallets-and-keys).)

:::warning Everything in a transaction is public, forever
A password or salt passed to a validator through a datum or redeemer is published on-chain permanently; anyone can extract it and rerun the KDF off-chain at leisure. On-chain KDFs are therefore **not** a password-hashing mechanism. Their legitimate inputs are values that are already public or already committed, and their legitimate uses are narrow: deriving session or child keys from strong secrets, and testing or teaching. Hash human passwords off-chain, in the wallet or application layer, and put only the resulting key or hash on-chain.
:::

The same project also documents a boundary worth knowing: **memory-hard KDFs (Argon2, Balloon) are fundamentally incompatible with on-chain execution.** Argon2's minimum recommended settings want 64 MiB to 4 GiB of RAM against a per-transaction memory budget orders of magnitude smaller, it needs a 64-byte BLAKE2b variant Plutus does not expose, and its data-dependent memory access is exactly what execution-unit pricing punishes. If you need memory-hard hashing, it happens off-chain, and the chain verifies the result.

## Verifiable random functions

A **VRF** is a keyed hash with a public verification story: only the secret key holder can compute the output for a given input, the output is deterministic and looks random to everyone else, and it comes with a proof that anyone can check against the public key. Three properties do the work: **verifiability** (the proof binds output to key and input), **uniqueness** (exactly one valid output per key and input, nothing to grind), and **non-interactivity** (one published tuple, no challenge rounds).

You have met VRFs before: [Ouroboros uses one for leader election](/docs/developers/curriculum/fundamentals/cryptographic-primitives#what-are-verifiable-random-functions-vrfs). The [`vrf`](https://github.com/cardano-foundation/bls/tree/main/aiken/vrf) example brings the same tool into application space, an ECVRF over BLS12-381 G2 written entirely in Aiken. The API is four functions, and the proof is 144 bytes (a compressed G2 point, a 16-byte challenge, a 32-byte response):

```aiken
use vrf/core as vrf

let (sk, pk) = vrf.keys_from_secret(operator_secret)

// Operator, per round: input is public (say, a block hash or round number)
let pi = vrf.prove(sk, round_input, "ECVRF_")
let Some(beta) = vrf.proof_to_hash(pi)

// Anyone, including a validator: recompute and confirm the same beta
vrf.verify(pk, round_input, pi, "ECVRF_", False) == Some(beta)
```

What it buys you on-chain:

- **A randomness beacon a validator can enforce.** An operator publishes a key in advance; each round's input is public and fixed, so they get exactly one possible output and one shot, no grinding. Because verification is just curve arithmetic on the same builtins (an ECVRF never actually computes a pairing), the *validator itself* can check the proof, rather than trusting an oracle's signature. How this compares with commit-reveal and oracle-published block VRFs, including the liveness trust you still carry, is covered in [on-chain randomness](/docs/developers/curriculum/dapps/oracles/randomness).
- **Enumeration-resistant data structures.** Store records in a public Merkle tree keyed by `sha2_256(record_name)` and anyone can guess common names and probe for them. Key the tree by the owner's VRF output instead and outsiders see only unlinkable pseudorandom addresses, while the owner can still prove any record's membership later by revealing the name and its proof.
- **Proofs of knowledge without revealing it**, such as proving you held a secret at some point in time (use the secret as VRF input) or passwordless authentication (prove the password-derived key, never send the password).

## Anonymous credentials with BBS+

**BBS+ signatures** turn a signed list of attributes into a privacy-preserving credential. An issuer signs n attributes (name, birthdate, citizenship, tier, ...) into one constant-size signature. Later the holder proves, to a verifier or a validator, that they hold a valid signature over all n attributes **while revealing only a chosen subset**. The signature itself never leaves the holder's hands: each showing randomizes it and wraps it in a zero-knowledge proof, so verifiers cannot link two showings to each other or to issuance. "Over 18 and an EU citizen", without the birthdate, the name, or a trackable identifier.

This runs on the same builtins: attributes are hashed to curve points, the issuer's key lives in G2, and verification reduces to a pairing equation plus checks that the disclosed values match the proof. The [`lambdasistemi/cardano-bbs`](https://github.com/lambdasistemi/cardano-bbs) project implements the scheme with Aiken on-chain verification (check its repository for licensing before depending on it), and the CF BLS repository has a related [`selective-disclosure`](https://github.com/cardano-foundation/bls/tree/main/aiken/selective-disclosure) example. For the full issuer, holder, and verifier lifecycle in one place, the [ZeroJ reusable-KYC example](https://github.com/bloxbean/zeroj-usecases/tree/main/reusable-kyc) runs the flow end to end from Java, with a Plutus V3 validator performing the BBS proof verification on-chain at roughly a quarter of a script's CPU budget; it shares its parent project's experimental, not-for-production status. On-chain, the shape is the familiar one from the ZK page:

```aiken
use bbs/types.{BBSProof, RegulatorRegistry}
use bbs/verify

validator bbs_credential {
  spend(datum: Option<RegulatorRegistry>, redeemer: BBSProof, own_ref, _self) {
    when datum is {
      // Registry datum: issuer's G2 public key + the credential's attribute schema
      Some(registry) ->
        verify.verify(registry, redeemer, nonce_from_output_reference(own_ref))
      None -> False
    }
  }
}
```

The trust anchor (issuer key and attribute schema) sits in the datum; the proof travels in the redeemer with its disclosed indices and values; and the challenge nonce is derived from the `OutputReference` being spent, so a proof lifted from one transaction is useless in any other. That last move is the same replay defense the ZK page insists on for [proofs in redeemers](/docs/developers/curriculum/smart-contracts/advanced/zero-knowledge#what-to-watch-for): bind every proof to its context. Proof size is constant regardless of how many attributes the credential carries, and the dominant cost is a few pairings, which is what makes membership, compliance, and identity checks with selective disclosure practical inside a Plutus budget.

## Key takeaways

- The BLS12-381 builtins are a **protocol construction kit**, not just a SNARK verifier: signatures, KDFs, VRFs, and credentials all compose from the same five operations.
- **BLS aggregation changes the economics of many-party signing**: one 96-byte signature for any number of signers, and constant two-pairing verification when everyone signs the same message. Pick the IETF mode by your key-trust model; the rogue-key attack is what the modes exist for.
- **On-chain KDFs are for already-public or high-entropy inputs.** Datums and redeemers are public forever, so passwords are hashed off-chain, always.
- **A VRF gives applications what Ouroboros already has**: deterministic, unpredictable, publicly verifiable randomness, now checkable inside a validator.
- **BBS+ selective disclosure** is the first credential primitive on this list with no other home in the Cardano stack: prove attributes, keep the credential.

:::info Research-grade, and moving fast
As with the ZK verifiers, the builtins themselves sit on an audited library, but every protocol library on this page (`ilap/bls`, the CF examples, `cardano-bbs`) is unaudited, experimental code. Prototype on testnets, read the code you depend on, and treat cost figures as measured snapshots, not guarantees.
:::
