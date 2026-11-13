use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken_design_patterns/parameter_validation/advanced
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use fixtures.{admin_key, mint, policy_id, terms, to_script}
use lockups.{Terms}
use reward_token

// #region raw-terms
/// Rewards into `lockup_raw` instances, whose parameter is the terms
/// themselves, with dates at or after `min_unlock_at`.
/// `lockup_flat_prefix` is the compiled lock-up up to the
/// parameter, without the outer CBOR header: the library encodes the terms
/// and every length around them on-chain.
validator rewards(
  admin: VerificationKeyHash,
  min_unlock_at: Int,
  lockup_flat_prefix: ByteArray,
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
            advanced.apply_param(3, lockup_flat_prefix, terms)
          },
        ) == quantity,
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion raw-terms

const flat_prefix: ByteArray = #"0101003229800aba2aba1aab9faab9eaab9d4c01"

test mint_ok_into_the_members_lockup() {
  let tx = mint(
    admin_key,
    10,
    [to_script(advanced.apply_param(3, flat_prefix, terms), 10)],
  )
  rewards.mint(admin_key, terms.unlock_at, flat_prefix, [terms], policy_id, tx)
}

test mint_fails_into_a_lockup_with_other_terms() fail {
  let later = Terms { ..terms, unlock_at: terms.unlock_at + 1 }
  let tx = mint(
    admin_key,
    10,
    [to_script(advanced.apply_param(3, flat_prefix, later), 10)],
  )
  rewards.mint(admin_key, terms.unlock_at, flat_prefix, [terms], policy_id, tx)
}

test mint_fails_even_when_earlier_terms_match_the_output() fail {
  let early = Terms { ..terms, unlock_at: terms.unlock_at - 1 }
  let tx = mint(
    admin_key,
    10,
    [to_script(advanced.apply_param(3, flat_prefix, early), 10)],
  )
  rewards.mint(admin_key, terms.unlock_at, flat_prefix, [early], policy_id, tx)
}

test mint_ok_with_a_later_member_date() {
  let later = Terms { ..terms, unlock_at: terms.unlock_at + 1 }
  let tx = mint(
    admin_key,
    10,
    [to_script(advanced.apply_param(3, flat_prefix, later), 10)],
  )
  rewards.mint(admin_key, terms.unlock_at, flat_prefix, [later], policy_id, tx)
}
