use aiken/collection/list
use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use fixtures.{
  admin_key, member_key, mint, other_script, policy_id, stranger_key, to_key,
  to_script,
}
use reward_token

// The obvious policy: it knows the lock-ups by their hashes, a list fixed when
// the policy is deployed.
// #region naive
validator rewards(admin: VerificationKeyHash, lockups: List<ScriptHash>) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    let quantity = reward_token.minted(self.mint, policy_id)
    if quantity < 0 {
      // Whoever holds reward tokens may burn them.
      True
    } else {
      and {
        list.has(self.extra_signatories, admin),
        reward_token.delivered_to_listed(self.outputs, policy_id, lockups) == quantity,
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion naive

/// Stands in for two lock-ups' hashes.
const lockup_a: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000a1"

const lockup_b: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000b2"

const listed = [lockup_a, lockup_b]

// The checks every version shares, attacked once here.

test mint_ok_into_listed_lockups() {
  let tx = mint(
    admin_key,
    30,
    [to_script(lockup_a, 10), to_script(lockup_b, 20)],
  )
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

test mint_fails_without_the_admin() fail {
  let tx = mint(stranger_key, 10, [to_script(lockup_a, 10)])
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

test mint_fails_into_a_script_that_is_not_a_lockup() fail {
  let tx = mint(admin_key, 10, [to_script(other_script, 10)])
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

test mint_fails_into_a_key_address() fail {
  let tx = mint(admin_key, 10, [to_key(member_key, 10)])
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

// Ten minted, nine delivered: one is left in the admin's change.
test mint_fails_when_some_rewards_go_elsewhere() fail {
  let tx = mint(admin_key, 10, [to_script(lockup_a, 9), to_key(admin_key, 1)])
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

test burn_ok_for_anyone() {
  let tx = mint(stranger_key, -10, [])
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

test mint_fails_for_another_token_name() fail {
  let tx = transaction.Transaction {
    ..mint(admin_key, 10, [to_script(lockup_a, 10)]),
    mint: assets.from_asset(policy_id, "OTHER", 10),
  }
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}

// The list is the policy: a lock-up added after deployment is not on it.
test mint_fails_into_a_lockup_added_later() fail {
  let tx = mint(
    admin_key,
    10,
    [to_script(#"000000000000000000000000000000000000000000000000000000c3", 10)],
  )
  rewards.mint(admin_key, listed, Void, policy_id, tx)
}
