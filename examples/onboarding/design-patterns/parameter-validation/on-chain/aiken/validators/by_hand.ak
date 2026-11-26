use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash, blake2b_224}
use aiken/primitive/bytearray
use aiken_design_patterns/parameter_validation
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use fixtures.{
  admin_key, member_key, mint, other_member_key, other_script, policy_id, prefix,
  to_script,
}
use reward_token

// #region lockup-hash
/// A script hash covers a one-byte language tag, then the script's bytes.
const plutus_v3: ByteArray = #"03"

/// What follows a script's last parameter when that parameter is a byte
/// string: the byte that ends it, and the padding that ends the script.
const tail: ByteArray = #"0001"

/// The hash of `owner`'s lock-up. `prefix` is the compiled lock-up, with the
/// program's unlock date already applied, up to where the owner's key goes.
pub fn lockup_hash(prefix: ByteArray, owner: VerificationKeyHash) -> ScriptHash {
  plutus_v3
    |> bytearray.concat(prefix)
    |> bytearray.concat(owner)
    |> bytearray.concat(tail)
    |> blake2b_224
}

// #endregion lockup-hash

// #region by-hand
validator rewards(admin: VerificationKeyHash, lockup_prefix: ByteArray) {
  /// `members` names the owner of each output that receives rewards, in order.
  mint(
    members: List<VerificationKeyHash>,
    policy_id: PolicyId,
    self: Transaction,
  ) {
    let quantity = reward_token.minted(self.mint, policy_id)
    if quantity < 0 {
      True
    } else {
      and {
        list.has(self.extra_signatories, admin),
        reward_token.delivered(
          self.outputs,
          policy_id,
          members,
          fn(owner) { lockup_hash(lockup_prefix, owner) },
        ) == quantity,
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion by-hand

test lockup_hash_matches_the_library() {
  lockup_hash(prefix, member_key) == parameter_validation.apply_prehashed_param(
    3,
    prefix,
    member_key,
  )
}

test mint_ok_into_each_members_lockup() {
  let tx = mint(
    admin_key,
    30,
    [
      to_script(lockup_hash(prefix, member_key), 10),
      to_script(lockup_hash(prefix, other_member_key), 20),
    ],
  )
  rewards.mint(admin_key, prefix, [member_key, other_member_key], policy_id, tx)
}

// The output is a lock-up, but not the one of the member the redeemer names.
test mint_fails_into_another_members_lockup() fail {
  let tx = mint(
    admin_key,
    10,
    [to_script(lockup_hash(prefix, other_member_key), 10)],
  )
  rewards.mint(admin_key, prefix, [member_key], policy_id, tx)
}

test mint_fails_into_a_script_that_is_not_a_lockup() fail {
  let tx = mint(admin_key, 10, [to_script(other_script, 10)])
  rewards.mint(admin_key, prefix, [member_key], policy_id, tx)
}

test mint_fails_with_fewer_members_than_outputs() fail {
  let tx = mint(
    admin_key,
    20,
    [
      to_script(lockup_hash(prefix, member_key), 10),
      to_script(lockup_hash(prefix, member_key), 10),
    ],
  )
  rewards.mint(admin_key, prefix, [member_key], policy_id, tx)
}

// A lock-up for a member who joined after deployment needs nothing new.
test mint_ok_for_any_member() {
  let newcomer = #"00000000000000000000000000000000000000000000000000000099"
  let tx = mint(admin_key, 10, [to_script(lockup_hash(prefix, newcomer), 10)])
  rewards.mint(admin_key, prefix, [newcomer], policy_id, tx)
}
