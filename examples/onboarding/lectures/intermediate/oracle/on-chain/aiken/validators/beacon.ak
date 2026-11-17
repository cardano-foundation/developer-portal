// #region beacon-imports
use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address, VerificationKey}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}

// #endregion beacon-imports

// The token that says which UTxO is the real oracle.
//
// This is the gift card's policy from the last lecture with the spend handler
// taken off. It is compiled around one UTxO, creating the token requires that
// UTxO to be spent, and a UTxO can only be spent once. So the token can only be
// created once.
//
// It is a file of its own so that the oracle can hold the beacon as a
// parameter and be told which token to trust. The gift card fuses its policy
// and its spend handler into one validator, and the oracle could do the same by
// reading the policy id off its own address; the parameter is a design choice.
// #region beacon
const beacon_name: ByteArray = "ORACLE"

pub type BeaconAction {
  Mint
  Burn
}

validator beacon(utxo_ref: OutputReference) {
  mint(redeemer: BeaconAction, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, quantity)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    and {
      (name == beacon_name)?,
      when redeemer is {
        Mint -> and {
            (quantity == 1)?,
            list.any(
              self.inputs,
              fn(input) { input.output_reference == utxo_ref },
            )?,
          }
        Burn -> (quantity == -1)?
      },
    }
  }

  else(_) {
    fail
  }
}

// #endregion beacon

// Tests.
// #region beacon-tests

// The policy id, which is the script's own hash. 28 bytes, like any hash.
const policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000ff"

// An ordinary wallet address, for the UTxO the seed is spent from.
const wallet_address: Address =
  Address {
    payment_credential: VerificationKey(
      #"00000000000000000000000000000000000000000000000000000001",
    ),
    stake_credential: None,
  }

// The UTxO the policy is compiled around. A transaction id is 32 bytes.
const seed: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
    output_index: 0,
  }

// Some other UTxO, which is not the seed.
const other_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000002",
    output_index: 0,
  }

// One UTxO being spent. Only its reference matters here, which is what the
// policy compares against the seed.
fn input_at(ref: OutputReference) -> Input {
  Input {
    output_reference: ref,
    output: Output {
      address: wallet_address,
      value: from_lovelace(5_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
}

test mint_ok_when_the_seed_is_spent() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(seed)],
    mint: assets.from_asset(policy, beacon_name, 1),
  }
  beacon.mint(seed, Mint, policy, tx)
}

// Without the seed among the inputs, nothing stops a second beacon being made,
// and a second beacon means a second UTxO claiming to be the oracle.
test mint_fails_without_the_seed() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(other_ref)],
    mint: assets.from_asset(policy, beacon_name, 1),
  }
  beacon.mint(seed, Mint, policy, tx)
}

test mint_fails_for_two_beacons() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(seed)],
    mint: assets.from_asset(policy, beacon_name, 2),
  }
  beacon.mint(seed, Mint, policy, tx)
}

// Burning needs no seed. The seed was already spent when the beacon was made.
test burn_ok() {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(policy, beacon_name, -1),
  }
  beacon.mint(seed, Burn, policy, tx)
}
// #endregion beacon-tests
