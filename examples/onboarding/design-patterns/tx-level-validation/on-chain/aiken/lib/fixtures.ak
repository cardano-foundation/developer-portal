//// Test-only values: pools, a beneficiary, and donations to sweep. Only tests
//// use them, so none of it reaches the chain.

use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets
use cardano/transaction.{InlineDatum, Input, NoDatum, Output, OutputReference}

/// The beneficiary's key.
pub const beneficiary_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

/// Who the pool pays out to: their key, and their own stake credential.
pub const beneficiary: Address =
  Address {
    payment_credential: VerificationKey(beneficiary_key),
    stake_credential: Some(
      Inline(
        VerificationKey(
          #"00000000000000000000000000000000000000000000000000000011",
        ),
      ),
    ),
  }

/// Somebody else.
pub const stranger_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

/// The beneficiary's key under a stake credential somebody else chose.
pub const restaked: Address =
  Address {
    payment_credential: VerificationKey(beneficiary_key),
    stake_credential: Some(Inline(VerificationKey(stranger_key))),
  }

/// Stands in for the pool's script hash, which the tests cannot compute.
pub const pool_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ff"

/// A second pool paying the same beneficiary.
pub const other_pool_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ee"

/// The reference of the `n`th donation in a test transaction.
pub fn donation_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// `count` donations of `lovelace` each, locked at `pool`, numbered from
/// `first`.
pub fn donations_to(
  pool: ScriptHash,
  first: Int,
  count: Int,
  lovelace: Int,
) -> List<Input> {
  list.range(first, first + count - 1)
    |> list.map(
        fn(n) {
          Input {
            output_reference: donation_ref(n),
            output: Output {
              address: Address {
                payment_credential: Script(pool),
                stake_credential: None,
              },
              value: assets.from_lovelace(lovelace),
              datum: NoDatum,
              reference_script: None,
            },
          }
        },
      )
}

/// `count` donations of `lovelace` each, locked at the test pool.
pub fn donations(count: Int, lovelace: Int) -> List<Input> {
  donations_to(pool_hash, 0, count, lovelace)
}

/// One output paying `lovelace` to `to`, tagged as paid on behalf of `pool`.
pub fn payment(to: Address, lovelace: Int, pool: ScriptHash) -> Output {
  let tag: Data = pool
  Output {
    address: to,
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}
