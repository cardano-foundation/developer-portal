//// Test-only values: a grant, its parties, and transactions that claim from it
//// or claw it back. Only tests use them, so none of it reaches the chain.

use aiken/crypto.{ScriptHash, VerificationKeyHash}
use aiken/interval.{Finite, Interval, IntervalBound, IntervalBoundType}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
  ValidityRange,
}
use schedule.{ScheduledGrant}
use vesting.{Grant}

/// The beneficiary's key.
pub const beneficiary_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

/// Who the grant vests to: their key, and their own stake credential.
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

/// The grantor's key.
pub const grantor_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

/// Somebody else.
pub const stranger_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000003"

/// Stands in for the contract's script hash, which the tests cannot compute.
pub const contract_hash: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ff"

/// The contract's address.
pub const contract: Address =
  Address { payment_credential: Script(contract_hash), stake_credential: None }

/// When the test grant starts vesting.
pub const start = 1_000_000

/// When the test grant has fully vested.
pub const end = 11_000_000

/// 10 ADA over 10,000,000 milliseconds: one lovelace vests every millisecond,
/// so a moment read one millisecond off moves every amount by one lovelace.
pub const grant: Grant =
  Grant { beneficiary, grantor: grantor_key, start, end, total: 10_000_000 }

/// The reference of the `n`th grant in a test transaction.
pub fn grant_ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// The `n`th grant, untouched, as an input.
pub fn grant_input(n: Int) -> Input {
  let datum: Data = grant
  Input {
    output_reference: grant_ref(n),
    output: Output {
      address: contract,
      value: assets.from_lovelace(grant.total),
      datum: InlineDatum(datum),
      reference_script: None,
    },
  }
}

/// What a claim sends back to the contract: `lovelace`, under the same grant.
pub fn rest(lovelace: Int) -> Output {
  let datum: Data = grant
  Output {
    address: contract,
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(datum),
    reference_script: None,
  }
}

/// What a clawback pays the beneficiary: `lovelace`, tagged with the
/// reference of the grant it comes from.
pub fn payment(lovelace: Int, from: OutputReference) -> Output {
  let tag: Data = from
  Output {
    address: beneficiary,
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}

/// An output to anybody, carrying no datum.
pub fn paid_to(address: Address, lovelace: Int) -> Output {
  Output {
    address,
    value: assets.from_lovelace(lovelace),
    datum: NoDatum,
    reference_script: None,
  }
}

/// Spend the first grant, signed by `signer`, inside `window`, creating
/// `outputs`.
pub fn spend(
  signer: VerificationKeyHash,
  window: ValidityRange,
  outputs: List<Output>,
) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [grant_input(0)],
    outputs,
    extra_signatories: [signer],
    validity_range: window,
  }
}

/// A validity range written out bound by bound, in any of its encodings.
pub fn window(
  lower: IntervalBoundType,
  lower_included: Bool,
  upper: IntervalBoundType,
  upper_included: Bool,
) -> ValidityRange {
  Interval {
    lower_bound: IntervalBound {
      bound_type: lower,
      is_inclusive: lower_included,
    },
    upper_bound: IntervalBound {
      bound_type: upper,
      is_inclusive: upper_included,
    },
  }
}

/// The encoding the ledger uses today for a window with both bounds set: the
/// first slot's start included, the end slot's start excluded.
pub fn today(first: Int, end_excluded: Int) -> ValidityRange {
  window(Finite(first), True, Finite(end_excluded), False)
}

/// The test grant again, with its period stored as an interval.
pub fn scheduled(period: ValidityRange) -> ScheduledGrant {
  ScheduledGrant {
    beneficiary,
    grantor: grantor_key,
    period,
    total: grant.total,
  }
}

/// A grant with a period, untouched, as the first input.
pub fn scheduled_input(datum: ScheduledGrant) -> Input {
  let data: Data = datum
  Input {
    output_reference: grant_ref(0),
    output: Output {
      address: contract,
      value: assets.from_lovelace(grant.total),
      datum: InlineDatum(data),
      reference_script: None,
    },
  }
}

/// What a claim on `datum` sends back to the contract: `lovelace`, under the
/// same datum.
pub fn rest_of(datum: ScheduledGrant, lovelace: Int) -> Output {
  let data: Data = datum
  Output {
    address: contract,
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(data),
    reference_script: None,
  }
}

/// Spend a grant with a period, signed by `signer`, inside `window`,
/// creating `outputs`.
pub fn spend_scheduled(
  datum: ScheduledGrant,
  signer: VerificationKeyHash,
  window: ValidityRange,
  outputs: List<Output>,
) -> Transaction {
  Transaction {
    ..spend(signer, window, outputs),
    inputs: [scheduled_input(datum)],
  }
}
