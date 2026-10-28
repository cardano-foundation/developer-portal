//// The donation pool's check, shared by every version of the pool in this
//// project. Only *where* it runs changes from one validator to the next: once
//// per spent input in `naive.ak`, once per transaction in the other two.

use aiken/collection/list
use aiken/collection/pairs
use aiken/crypto.{ScriptHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{Assets}
use cardano/transaction.{InlineDatum, Input, Output, Transaction}

// #region check
/// Everything taken from the pool reaches the beneficiary.
///
/// `pool` is the pool's own script hash. Every asset the transaction takes from
/// it, ADA and tokens alike, must be paid to the beneficiary's exact address in
/// at least the same amount, in outputs tagged with that same hash.
pub fn is_paid(
  self: Transaction,
  pool: ScriptHash,
  beneficiary: Address,
) -> Bool {
  let taken = taken_from(self, pool)
  let paid = paid_to(self.outputs, beneficiary, pool)
  assets.flatten(taken)
    |> list.all(
        fn((policy, name, quantity)) {
          assets.quantity_of(paid, policy, name) >= quantity
        },
      )
}

/// What the transaction takes from the pool: every input locked under it, and
/// any rewards withdrawn from its stake credential.
pub fn taken_from(self: Transaction, pool: ScriptHash) -> Assets {
  let credential = Script(pool)
  let from_inputs = list.foldl(
    self.inputs,
    assets.zero,
    fn(input, total) {
      if input.output.address.payment_credential == credential {
        assets.merge(total, input.output.value)
      } else {
        total
      }
    },
  )
  // A withdrawal must take the account's whole balance. That is zero unless
  // someone paid rewards in, and if they did, they belong to the beneficiary.
  when pairs.get_first(self.withdrawals, credential) is {
    Some(rewards) -> assets.add(from_inputs, "", "", rewards)
    None -> from_inputs
  }
}

/// What the transaction pays the beneficiary on this pool's behalf: outputs at
/// their exact address, stake credential included, whose inline datum is the
/// pool's hash. The tag stops one payment from counting for two pools.
pub fn paid_to(
  outputs: List<Output>,
  beneficiary: Address,
  pool: ScriptHash,
) -> Assets {
  let tag: Data = pool
  list.foldl(
    outputs,
    assets.zero,
    fn(output, total) {
      if output.address == beneficiary && output.datum == InlineDatum(tag) {
        assets.merge(total, output.value)
      } else {
        total
      }
    },
  )
}

// #endregion check

// #region signed
/// Whether the beneficiary signed the transaction. Only a key can sign, so a
/// beneficiary whose address is a script can never pass this.
pub fn beneficiary_signs(self: Transaction, beneficiary: Address) -> Bool {
  when beneficiary.payment_credential is {
    VerificationKey(key) -> list.has(self.extra_signatories, key)
    Script(_) -> False
  }
}
// #endregion signed
