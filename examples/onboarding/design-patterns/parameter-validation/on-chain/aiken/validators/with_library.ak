use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken_design_patterns/parameter_validation
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use fixtures.{
  admin_key, member_key, mint, other_member_key, policy_id, prefix, to_script,
}
use reward_token

// #region with-library
validator rewards(admin: VerificationKeyHash, lockup_prefix: ByteArray) {
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
          fn(owner) {
            parameter_validation.apply_prehashed_param(3, lockup_prefix, owner)
          },
        ) == quantity,
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion with-library

fn lockup_of(owner: VerificationKeyHash) {
  parameter_validation.apply_prehashed_param(3, prefix, owner)
}

test mint_ok_into_each_members_lockup() {
  let tx = mint(admin_key, 10, [to_script(lockup_of(member_key), 10)])
  rewards.mint(admin_key, prefix, [member_key], policy_id, tx)
}

test mint_fails_into_another_members_lockup() fail {
  let tx = mint(admin_key, 10, [to_script(lockup_of(other_member_key), 10)])
  rewards.mint(admin_key, prefix, [member_key], policy_id, tx)
}
