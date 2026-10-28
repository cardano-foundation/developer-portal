//// The linear vesting grant, shared by every version of the contract in this
//// project. Every check here takes the moment as a plain number of POSIX
//// milliseconds. Only *how* a validator gets that number out of the
//// transaction's validity range changes from one version to the next.

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Credential, Script, VerificationKey}
use cardano/assets
use cardano/transaction.{InlineDatum, Input, OutputReference, Transaction}

// #region grant
/// What a grant remembers. Times are POSIX milliseconds, amounts are lovelace.
pub type Grant {
  /// Who the grant vests to: their whole address, stake credential included.
  beneficiary: Address,
  /// Who may take back what has not vested yet.
  grantor: VerificationKeyHash,
  /// Nothing has vested before this moment.
  start: Int,
  /// Everything has vested from this moment on.
  end: Int,
  /// How much the grant held when it was made.
  total: Int,
}

/// What the transaction does with the grant.
pub type Action {
  /// The beneficiary takes what has vested so far.
  Claim
  /// The grantor takes back what has not vested yet.
  Clawback
}

// #endregion grant

// #region unvested
/// How much of the grant is still unvested at moment `at`, as the fraction
/// `numerator / denominator` of a lovelace. Kept as a fraction so that no
/// check ever rounds in anybody's favor.
fn unvested(grant: Grant, at: Int) -> (Int, Int) {
  let Grant { start, end, total, .. } = grant
  if at >= end {
    (0, 1)
  } else if at <= start {
    (total, 1)
  } else {
    (total * ( end - at ), end - start)
  }
}

/// Whether `amount` is at least what is still unvested at `at`.
pub fn covers_unvested(grant: Grant, at: Int, amount: Int) -> Bool {
  let (numerator, denominator) = unvested(grant, at)
  amount * denominator >= numerator
}

/// Whether `amount` is at most what is still unvested at `at`.
pub fn within_unvested(grant: Grant, at: Int, amount: Int) -> Bool {
  let (numerator, denominator) = unvested(grant, at)
  amount * denominator <= numerator
}

// #endregion unvested

// #region claim
/// A claim at `earliest`, the first moment the transaction can happen. The
/// beneficiary signs and takes what has vested by then. Whatever is still
/// unvested goes back to the grant's own address, under the datum the grant
/// was spent with.
pub fn claim_ok(
  self: Transaction,
  own_ref: OutputReference,
  grant: Grant,
  earliest: Int,
) -> Bool {
  expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
  let own_address = own_input.output.address
  and {
    signed_by(self, grant.beneficiary.payment_credential),
    only_grant(self.inputs, own_address.payment_credential),
    when
      list.find(self.outputs, fn(output) { output.address == own_address })
    is {
      // Locate the rest by its address, then check everything about it.
      Some(rest) -> and {
          rest.datum == own_input.output.datum,
          rest.reference_script == None,
          covers_unvested(grant, earliest, assets.lovelace_of(rest.value)),
        }
      // Nothing goes back: only fine once everything has vested.
      None -> covers_unvested(grant, earliest, 0)
    },
  }
}

// #endregion claim

// #region clawback
/// A clawback at `latest`, the last moment the transaction can happen. The
/// grantor signs and takes at most what is still unvested by then. The rest
/// goes to the beneficiary, in one payment tagged with the grant's output
/// reference.
pub fn clawback_ok(
  self: Transaction,
  own_ref: OutputReference,
  grant: Grant,
  latest: Int,
) -> Bool {
  expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
  let held = assets.lovelace_of(own_input.output.value)
  let tag: Data = own_ref
  let paid = when
    list.find(
      self.outputs,
      fn(output) {
        output.address == grant.beneficiary && output.datum == InlineDatum(tag)
      },
    )
  is {
    Some(payment) -> assets.lovelace_of(payment.value)
    None -> 0
  }
  and {
    signed_by(self, VerificationKey(grant.grantor)),
    only_grant(self.inputs, own_input.output.address.payment_credential),
    within_unvested(grant, latest, held - paid),
  }
}

// #endregion clawback

// #region helpers
/// Whether the key behind `credential` signed the transaction. A script
/// credential cannot sign, so it never passes.
pub fn signed_by(self: Transaction, credential: Credential) -> Bool {
  when credential is {
    VerificationKey(key) -> list.has(self.extra_signatories, key)
    Script(_) -> False
  }
}

/// Whether the transaction spends exactly one input from this contract. Two
/// grants with the same datum could otherwise share one output: one claim's
/// rest, or one clawback's payment, would count for both.
pub fn only_grant(inputs: List<Input>, own: Credential) -> Bool {
  list.count(
    inputs,
    fn(input) { input.output.address.payment_credential == own },
  ) == 1
}
// #endregion helpers
