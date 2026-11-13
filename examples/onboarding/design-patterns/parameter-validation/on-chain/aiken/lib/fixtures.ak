//// Test-only values: keys, a stand-in policy and prefix, and transactions
//// that mint rewards or spend a lock-up. Only tests use them.

use aiken/crypto.{ScriptHash, VerificationKeyHash}
use aiken/interval
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{NoDatum, Output, OutputReference, Transaction}
use lockups.{Terms}
use reward_token.{reward_name}

/// The rewards program's admin, who decides who gets rewards.
pub const admin_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

/// A member.
pub const member_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

/// Another member.
pub const other_member_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000003"

/// Somebody else.
pub const stranger_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000004"

/// When the test lock-ups open, in POSIX milliseconds.
pub const unlock_at = 1_000_000

/// The member's terms, for the lock-ups that take them as one parameter.
pub const terms: Terms = Terms { owner: member_key, unlock_at }

/// Stands in for the reward policy's id, which the tests cannot compute.
pub const policy_id: PolicyId =
  #"000000000000000000000000000000000000000000000000000000ff"

/// Stands in for a compiled lock-up's prefix. The real one comes from the
/// blueprint, and the off-chain tests use it; here any bytes show the logic.
pub const prefix: ByteArray =
  #"5901520101003229800aba2aba1aab9faab9eaab9d4c011e581c"

/// Stands in for a script that is not a lock-up.
pub const other_script: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ee"

/// The reference of the `n`th input in a test transaction.
pub fn ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// A lock-up spend signed by `signer`, valid only after the unlock date.
pub fn spend_after(signer: VerificationKeyHash) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    extra_signatories: [signer],
    validity_range: interval.after(unlock_at + 1),
  }
}

/// A lock-up spend signed by `signer`, valid from before the unlock date.
pub fn spend_before(signer: VerificationKeyHash) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    extra_signatories: [signer],
    validity_range: interval.after(unlock_at - 1_000),
  }
}

/// An output at script `hash` holding `quantity` reward tokens.
pub fn to_script(hash: ScriptHash, quantity: Int) -> Output {
  Output {
    address: Address {
      payment_credential: Script(hash),
      stake_credential: None,
    },
    value: assets.from_lovelace(2_000_000)
      |> assets.add(policy_id, reward_name, quantity),
    datum: NoDatum,
    reference_script: None,
  }
}

/// An output at key `key` holding `quantity` reward tokens.
pub fn to_key(key: VerificationKeyHash, quantity: Int) -> Output {
  Output {
    ..to_script(other_script, quantity),
    address: Address {
      payment_credential: VerificationKey(key),
      stake_credential: None,
    },
  }
}

/// A transaction signed by `signer` that mints `quantity` reward tokens and
/// creates `outputs`.
pub fn mint(
  signer: VerificationKeyHash,
  quantity: Int,
  outputs: List<Output>,
) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    extra_signatories: [signer],
    mint: assets.from_asset(policy_id, reward_name, quantity),
    outputs,
  }
}
