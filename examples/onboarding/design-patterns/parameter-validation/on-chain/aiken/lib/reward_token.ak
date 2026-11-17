//// The reward token, and the checks every version of its minting policy
//// shares. The versions differ only in how they recognize a lock-up.
//// Positive mints require the output total to equal the minted quantity.
//// By value conservation, they cannot consume existing reward tokens.

use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{ScriptHash}
use cardano/address.{Script}
use cardano/assets.{AssetName, Assets, PolicyId}
use cardano/transaction.{Output}

// #region token
/// The one token name the policy mints.
pub const reward_name: AssetName = "REWARD"

/// How many reward tokens the transaction mints: positive to mint, negative to
/// burn. Fails if anything else is minted under the policy.
pub fn minted(mint: Assets, policy: PolicyId) -> Int {
  expect [Pair(name, quantity)] = assets.tokens(mint, policy) |> dict.to_pairs
  expect name == reward_name
  quantity
}

/// The reward tokens an output holds.
pub fn rewards_in(output: Output, policy: PolicyId) -> Int {
  assets.quantity_of(output.value, policy, reward_name)
}

// #endregion token

// #region delivered
/// Every output holding reward tokens is a lock-up, and returns how many they
/// hold in total. Each such output, in order, belongs to the next entry of
/// `members`, and `lockup_of` gives the script hash that member's lock-up must
/// have. Fails on an output that is not that lock-up.
pub fn delivered(
  outputs: List<Output>,
  policy: PolicyId,
  members: List<member>,
  lockup_of: fn(member) -> ScriptHash,
) -> Int {
  do_deliver(outputs, policy, members, lockup_of, 0)
}

fn do_deliver(
  outputs: List<Output>,
  policy: PolicyId,
  members: List<member>,
  lockup_of: fn(member) -> ScriptHash,
  total: Int,
) -> Int {
  when outputs is {
    [] -> total
    [output, ..rest] -> {
      let quantity = rewards_in(output, policy)
      if quantity > 0 {
        expect [member, ..others] = members
        expect output.address.payment_credential == Script(lockup_of(member))
        do_deliver(rest, policy, others, lockup_of, total + quantity)
      } else {
        do_deliver(rest, policy, members, lockup_of, total)
      }
    }
  }
}

// #endregion delivered

// #region listed
/// Every output holding reward tokens sits at one of `lockups`, and returns how
/// many they hold in total.
pub fn delivered_to_listed(
  outputs: List<Output>,
  policy: PolicyId,
  lockups: List<ScriptHash>,
) -> Int {
  list.foldl(
    outputs,
    0,
    fn(output, total) {
      let quantity = rewards_in(output, policy)
      if quantity > 0 {
        expect Script(hash) = output.address.payment_credential
        expect list.has(lockups, hash)
        total + quantity
      } else {
        total
      }
    },
  )
}
// #endregion listed
