//// The name registry's shared parts: its actions, and the checks every version
//// runs. The versions differ only in how they keep the names, and so in how
//// they check that an action changed them correctly.

use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address, Script}
use cardano/assets.{AssetName, Assets, PolicyId}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #region token
/// The token that marks the one registry UTxO. Names are minted under the same
/// policy, with the name as the token name, so a name may never be empty.
pub const registry_token: AssetName = ""

// #endregion token

// #region action
/// What a transaction does to the registry. `proof` is whatever the version
/// needs to check the change: a trie proof, or nothing at all.
pub type Action<proof> {
  /// Claim a free name, pointing at `target`. Mints the name's token.
  Register { name: ByteArray, target: ByteArray, proof: proof }
  /// Point a name at a new target. Only whoever holds the name's token may.
  Retarget { name: ByteArray, old: ByteArray, new: ByteArray, proof: proof }
  /// Give a name up. Burns the name's token, so only its holder can.
  Release { name: ByteArray, target: ByteArray, proof: proof }
}

// #endregion action

// #region continuation
/// The registry being spent, and the registry it becomes. Checks the input is
/// the registry, by its token, and the output is the one registry UTxO again:
/// the same address, holding only ADA and the registry token. Returns the
/// policy, the old datum and the new one.
pub fn continuation(
  self: Transaction,
  own_ref: OutputReference,
) -> (PolicyId, Data, Data) {
  expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
  let Output { address, value, datum, .. } = own_input.output
  expect Script(policy) = address.payment_credential
  expect assets.quantity_of(value, policy, registry_token) == 1
  expect InlineDatum(old) = datum
  // Locate the registry's next UTxO by its address, then check all of it.
  expect Some(next) = list.find(
    self.outputs,
    fn(output) { output.address == address },
  )
  expect
    assets.flatten(assets.without_lovelace(next.value)) == [
      (policy, registry_token, 1),
    ]
  expect next.reference_script == None
  expect InlineDatum(new) = next.datum
  (policy, old, new)
}

// #endregion continuation

// #region minted
/// Everything the transaction mints or burns under `policy`.
pub fn minted(mint: Assets, policy: PolicyId) -> Pairs<AssetName, Int> {
  assets.tokens(mint, policy) |> dict.to_pairs
}

/// Whether the transaction spends an input holding the token for `name`:
/// whoever can spend it holds the name.
pub fn holds_name(
  inputs: List<Input>,
  policy: PolicyId,
  name: ByteArray,
) -> Bool {
  list.any(
    inputs,
    fn(input) { assets.quantity_of(input.output.value, policy, name) > 0 },
  )
}

// #endregion minted

// #region policy
/// The policy's rule. Its first mint creates the registry: the one registry
/// token, minted by spending `seed`, so it can happen only once, sent to the
/// registry's own address with `empty` as its datum. After that, names are
/// minted and burned only while the registry is spent, so its spend handler
/// checks every one.
pub fn mint_ok(
  self: Transaction,
  policy: PolicyId,
  seed: OutputReference,
  empty: Data,
) -> Bool {
  if minted(self.mint, policy) == [Pair(registry_token, 1)] {
    let registry = Address {
      payment_credential: Script(policy),
      stake_credential: None,
    }
    and {
      list.any(self.inputs, fn(input) { input.output_reference == seed }),
      list.any(
        self.outputs,
        fn(output) {
          and {
            output.address == registry,
            assets.flatten(assets.without_lovelace(output.value)) == [
              (policy, registry_token, 1),
            ],
            output.datum == InlineDatum(empty),
          }
        },
      ),
    }
  } else {
    list.any(
      self.inputs,
      fn(input) {
        assets.quantity_of(input.output.value, policy, registry_token) == 1
      },
    )
  }
}
// #endregion policy
