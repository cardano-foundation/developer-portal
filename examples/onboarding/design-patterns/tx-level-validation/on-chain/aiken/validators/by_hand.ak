use aiken/collection/dict
use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Address, Credential, Script}
use cardano/assets.{AssetName, PolicyId}
use cardano/certificate.{
  Certificate, DelegateCredential, RegisterCredential, UnregisterCredential,
}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{
  beneficiary, beneficiary_key, donation_ref, donations, donations_to,
  other_pool_hash, payment, pool_hash, stranger_key,
}
use sweep

// The same pool, with the sweep checked once per transaction by a stake
// validator. Spend, withdraw and publish live in one validator, so they share
// one hash: the pool's address and the coordinator's stake credential are the
// same script.
// #region withdraw
validator pool_withdraw(beneficiary: Address) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    let own_credential = own_input.output.address.payment_credential
    // The coordinator runs only if the transaction withdraws from it. Seeing
    // the withdrawal is enough: the ledger runs the coordinator in this same
    // transaction, and if it fails, so does everything else.
    pairs.has_key(self.withdrawals, own_credential)
  }

  withdraw(_redeemer: Data, own_credential: Credential, self: Transaction) {
    expect Script(own_hash) = own_credential
    // Runs once, however many donations the transaction sweeps.
    sweep.is_paid(self, own_hash, beneficiary)
  }

  // #region publish
  // The stake credential has to be registered before it can be withdrawn from.
  publish(_redeemer: Data, certificate: Certificate, self: Transaction) {
    when certificate is {
      // Anyone may register it: that only costs whoever pays the deposit.
      RegisterCredential { .. } -> True
      // Only the beneficiary may deregister it, which stops sweeps until it
      // is registered again, and takes the deposit back.
      UnregisterCredential { .. } -> sweep.beneficiary_signs(self, beneficiary)
      // Nothing else. Without delegation the account earns no rewards.
      _ -> False
    }
  }

  // #endregion publish

  else(_) {
    fail
  }
}

// #endregion withdraw

// #region sweep-token
/// The one token name the mint coordinator allows.
const sweep_token: AssetName = "SWEEP"

// #endregion sweep-token

// The same again, with a minting policy as the coordinator. The pool's hash is
// also its policy id, so the spend asks for a mint under its own policy.
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
    // The policy runs only if the transaction mints or burns under it.
    !dict.is_empty(assets.tokens(self.mint, own_hash))
  }

  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, quantity)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    and {
      name == sweep_token,
      // The token proves nothing: at most one per transaction, and anyone
      // holding one may burn it.
      quantity < 0 || quantity == 1,
      // The check runs on every mint and burn, so neither is a way around it.
      sweep.is_paid(self, policy_id, beneficiary),
    }
  }

  else(_) {
    fail
  }
}

// #endregion mint

// Each handler is tested on its own, the way the ledger runs it. The spend
// tests never run the sweep; the coordinator tests run nothing else.

test withdraw_spend_ok_when_the_coordinator_runs() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    withdrawals: [Pair(Script(pool_hash), 0)],
  }
  pool_withdraw.spend(beneficiary, None, Void, donation_ref(0), tx)
}

test withdraw_spend_fails_without_the_coordinator() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
  }
  pool_withdraw.spend(beneficiary, None, Void, donation_ref(0), tx)
}

// Another script's withdrawal is not this pool's coordinator.
test withdraw_spend_fails_with_another_coordinator() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    withdrawals: [Pair(Script(other_pool_hash), 0)],
  }
  pool_withdraw.spend(beneficiary, None, Void, donation_ref(0), tx)
}

test withdraw_coordinator_ok_when_the_beneficiary_is_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    withdrawals: [Pair(Script(pool_hash), 0)],
  }
  pool_withdraw.withdraw(beneficiary, Void, Script(pool_hash), tx)
}

test withdraw_coordinator_fails_when_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 29_999_999, pool_hash)],
    withdrawals: [Pair(Script(pool_hash), 0)],
  }
  pool_withdraw.withdraw(beneficiary, Void, Script(pool_hash), tx)
}

// Rewards someone paid into the pool's account are taken too, so they are owed
// to the beneficiary as well.
test withdraw_coordinator_fails_when_rewards_are_kept() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    withdrawals: [Pair(Script(pool_hash), 5_000_000)],
  }
  pool_withdraw.withdraw(beneficiary, Void, Script(pool_hash), tx)
}

test withdraw_coordinator_ok_when_rewards_are_paid_on() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 35_000_000, pool_hash)],
    withdrawals: [Pair(Script(pool_hash), 5_000_000)],
  }
  pool_withdraw.withdraw(beneficiary, Void, Script(pool_hash), tx)
}

// Double satisfaction: two pools for the same beneficiary, swept together. One
// payment tagged for this pool cannot also pay for the other one.
test withdraw_coordinator_fails_when_one_payment_serves_two_pools() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: list.concat(
      donations(3, 10_000_000),
      donations_to(other_pool_hash, 3, 3, 10_000_000),
    ),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    withdrawals: [Pair(Script(pool_hash), 0), Pair(Script(other_pool_hash), 0)],
  }
  pool_withdraw.withdraw(beneficiary, Void, Script(other_pool_hash), tx)
}

// The same two pools, each paid in its own tagged output: both pass.
test withdraw_coordinator_ok_when_each_pool_is_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: list.concat(
      donations(3, 10_000_000),
      donations_to(other_pool_hash, 3, 3, 10_000_000),
    ),
    outputs: [
      payment(beneficiary, 30_000_000, pool_hash),
      payment(beneficiary, 30_000_000, other_pool_hash),
    ],
    withdrawals: [Pair(Script(pool_hash), 0), Pair(Script(other_pool_hash), 0)],
  }
  and {
    pool_withdraw.withdraw(beneficiary, Void, Script(pool_hash), tx),
    pool_withdraw.withdraw(beneficiary, Void, Script(other_pool_hash), tx),
  }
}

test publish_ok_for_anyone_registering() {
  let tx = transaction.placeholder
  pool_withdraw.publish(
    beneficiary,
    Void,
    RegisterCredential { credential: Script(pool_hash), deposit: Never },
    tx,
  )
}

test publish_ok_when_the_beneficiary_deregisters() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary_key],
  }
  pool_withdraw.publish(
    beneficiary,
    Void,
    UnregisterCredential { credential: Script(pool_hash), refund: Never },
    tx,
  )
}

test publish_fails_when_a_stranger_deregisters() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger_key],
  }
  pool_withdraw.publish(
    beneficiary,
    Void,
    UnregisterCredential { credential: Script(pool_hash), refund: Never },
    tx,
  )
}

test publish_fails_for_delegation() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [beneficiary_key],
  }
  pool_withdraw.publish(
    beneficiary,
    Void,
    DelegateCredential {
      credential: Script(pool_hash),
      delegate: certificate.DelegateBlockProduction {
        stake_pool: #"00000000000000000000000000000000000000000000000000000099",
      },
    },
    tx,
  )
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

test mint_coordinator_ok_when_the_beneficiary_is_paid() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    mint: assets.from_asset(pool_hash, sweep_token, 1),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

test mint_coordinator_fails_when_paid_short() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 29_999_999, pool_hash)],
    mint: assets.from_asset(pool_hash, sweep_token, 1),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

// Minting with nothing swept is allowed: the check passes, because nothing
// is taken. It is harmless, because the token proves nothing.
test mint_coordinator_ok_without_a_sweep() {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(pool_hash, sweep_token, 1),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

test mint_coordinator_fails_for_two_tokens() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    mint: assets.from_asset(pool_hash, sweep_token, 2),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

test mint_coordinator_fails_for_another_name() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    outputs: [payment(beneficiary, 30_000_000, pool_hash)],
    mint: assets.from_asset(pool_hash, "RECEIPT", 1),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

test mint_coordinator_ok_for_anyone_burning() {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(pool_hash, sweep_token, -3),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}

// A burn runs the coordinator too, so it is no way to sweep without paying.
test mint_coordinator_fails_when_a_burn_sweeps_unpaid() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: donations(3, 10_000_000),
    mint: assets.from_asset(pool_hash, sweep_token, -1),
  }
  pool_mint.mint(beneficiary, Void, pool_hash, tx)
}
