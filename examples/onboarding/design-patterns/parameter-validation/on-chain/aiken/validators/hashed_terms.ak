use aiken/cbor
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken_design_patterns/parameter_validation
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use fixtures.{admin_key, mint, policy_id, prefix, terms, to_script}
use lockups.{Terms}
use reward_token

// #region hashed-terms
/// Rewards into `lockup_terms` instances: one per member, each with its own
/// unlock date, at or after `min_unlock_at`. The policy hashes each member's
/// terms the way the lock-up's wrapper does, and places the hash after the prefix.
validator rewards(
  admin: VerificationKeyHash,
  min_unlock_at: Int,
  lockup_prefix: ByteArray,
) {
  mint(members: List<Terms>, policy_id: PolicyId, self: Transaction) {
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
          fn(terms) {
            expect terms.unlock_at >= min_unlock_at
            parameter_validation.apply_param(
              3,
              lockup_prefix,
              cbor.serialise(terms),
            )
          },
        ) == quantity,
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion hashed-terms

fn lockup_of(terms: Terms) {
  parameter_validation.apply_param(3, prefix, cbor.serialise(terms))
}

test mint_ok_into_the_members_lockup() {
  let tx = mint(admin_key, 10, [to_script(lockup_of(terms), 10)])
  rewards.mint(admin_key, terms.unlock_at, prefix, [terms], policy_id, tx)
}

// The member's lock-up with a later date is not the one the redeemer names.
test mint_fails_into_a_lockup_with_other_terms() fail {
  let later = Terms { ..terms, unlock_at: terms.unlock_at + 1 }
  let tx = mint(admin_key, 10, [to_script(lockup_of(later), 10)])
  rewards.mint(admin_key, terms.unlock_at, prefix, [terms], policy_id, tx)
}

test mint_fails_even_when_earlier_terms_match_the_output() fail {
  let early = Terms { ..terms, unlock_at: terms.unlock_at - 1 }
  let tx = mint(admin_key, 10, [to_script(lockup_of(early), 10)])
  rewards.mint(admin_key, terms.unlock_at, prefix, [early], policy_id, tx)
}

test mint_ok_with_a_later_member_date() {
  let later = Terms { ..terms, unlock_at: terms.unlock_at + 1 }
  let tx = mint(admin_key, 10, [to_script(lockup_of(later), 10)])
  rewards.mint(admin_key, terms.unlock_at, prefix, [later], policy_id, tx)
}
