use aiken/collection/dict
use aiken_design_patterns/stake_validator
use aiken_design_patterns/tx_level_minter
use cardano/address.{Address, Credential, Script}
use cardano/assets.{AssetName, PolicyId}
use cardano/certificate.{Certificate, RegisterCredential, UnregisterCredential}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{beneficiary, donation_ref, donations, other_pool_hash, pool_hash}
use sweep

// `by_hand.ak` again, with the spend side taken from aiken-design-patterns.
// The coordinators are unchanged: the library supplies the check that a
// coordinator ran, and the check it runs is still yours.
// #region withdraw
validator pool_withdraw(beneficiary: Address) {
  spend(
    _datum: Option<Data>,
    withdrawal_index: Int,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    expect Script(own_hash) = own_input.output.address.payment_credential
    // The redeemer says where in `withdrawals` the coordinator sits, so the
    // library reads that one entry instead of searching.
    stake_validator.validate_withdraw_minimal(
      own_hash,
      self.withdrawals,
      withdrawal_index,
    )
  }

  withdraw(_redeemer: Data, own_credential: Credential, self: Transaction) {
    expect Script(own_hash) = own_credential
    sweep.is_paid(self, own_hash, beneficiary)
  }

  publish(_redeemer: Data, certificate: Certificate, self: Transaction) {
    when certificate is {
      RegisterCredential { .. } -> True
      UnregisterCredential { .. } -> sweep.beneficiary_signs(self, beneficiary)
      _ -> False
    }
  }

  else(_) {
    fail
  }
}

// #endregion withdraw

const sweep_token: AssetName = "SWEEP"

// #region mint
validator pool_mint(beneficiary: Address) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    expect Script(own_hash) = own_input.output.address.payment_credential
    tx_level_minter.validate_mint_minimal(own_hash, self.mint)
  }

  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, quantity)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    and {
      name == sweep_token,
      quantity < 0 || quantity == 1,
      sweep.is_paid(self, policy_id, beneficiary),
    }
  }

  else(_) {
    fail
  }
}

// #endregion mint

// Only the spend side differs from `by_hand.ak`, so only it is tested here.

test withdraw_spend_ok_at_the_given_index() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    withdrawals: [Pair(Script(pool_hash), 0)],
  }
  pool_withdraw.spend(beneficiary, None, 0, donation_ref(0), tx)
}

// The index is checked, not trusted: pointing it at another script's
// withdrawal fails.
test withdraw_spend_fails_at_the_wrong_index() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    withdrawals: [Pair(Script(other_pool_hash), 0), Pair(Script(pool_hash), 0)],
  }
  pool_withdraw.spend(beneficiary, None, 0, donation_ref(0), tx)
}

test mint_spend_ok_when_the_policy_runs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    mint: assets.from_asset(pool_hash, sweep_token, 1),
  }
  pool_mint.spend(beneficiary, None, Void, donation_ref(0), tx)
}

test mint_spend_fails_without_the_policy() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
  }
  pool_mint.spend(beneficiary, None, Void, donation_ref(0), tx)
}
