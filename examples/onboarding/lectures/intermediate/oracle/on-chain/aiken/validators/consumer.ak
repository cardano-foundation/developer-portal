// #region consumer-imports
use aiken/collection/list
use cardano/address.{Address, Script}
use cardano/assets.{from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use oracle.{AssetClass, Rate, holds_beacon}

// #endregion consumer-imports

// A second contract that reads the oracle without touching it.
//
// The oracle's UTxO is attached as a *reference input*: the transaction can
// read its datum, but does not spend it. So the oracle stays exactly where it
// is, and any number of contracts can consult the same one in the same block.
//
// Anybody can put a UTxO at the oracle's address with any rate in it, so this
// contract does not read whatever it is handed. It looks for the beacon.
// #region consumer
validator consumer(beacon: AssetClass) {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(oracle_input) = list.find(
      self.reference_inputs,
      fn(input) { holds_beacon(input.output.value, beacon) },
    )
    expect InlineDatum(published) = oracle_input.output.datum
    expect rate: Rate = published
    (rate > 0)?
  }

  else(_) {
    fail
  }
}

// #endregion consumer

// Tests.
// #region consumer-tests

const beacon: AssetClass =
  AssetClass {
    policy_id: #"000000000000000000000000000000000000000000000000000000ee",
    name: "ORACLE",
  }

const dummy_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
    output_index: 0,
  }

const oracle_address: Address =
  Address {
    payment_credential: Script(
      #"000000000000000000000000000000000000000000000000000000ff",
    ),
    stake_credential: None,
  }

// A UTxO at the oracle's address, carrying a rate. Whether it also carries the
// beacon is what each test below varies.
fn published(rate: Rate, with_beacon: Bool) -> Input {
  let value = if with_beacon {
    from_lovelace(5_000_000)
      |> assets.add(beacon.policy_id, beacon.name, 1)
  } else {
    from_lovelace(5_000_000)
  }
  Input {
    output_reference: OutputReference {
      transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
      output_index: 0,
    },
    output: Output {
      address: oracle_address,
      value,
      datum: InlineDatum(rate),
      reference_script: None,
    },
  }
}

// Attached for reading only. Nothing spends it, so the oracle stays where it is
// and the consumer never touches the oracle's contract.
fn tx_reading_oracle(rate: Rate, with_beacon: Bool) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    reference_inputs: [published(rate, with_beacon)],
  }
}

test spend_ok_when_the_oracle_rate_is_positive() {
  consumer.spend(beacon, None, Void, dummy_ref, tx_reading_oracle(150, True))
}

test spend_fails_when_the_oracle_rate_is_zero() fail {
  consumer.spend(beacon, None, Void, dummy_ref, tx_reading_oracle(0, True))
}

// A UTxO at the oracle's address with a rate anybody could have put there. No
// beacon, so the contract refuses to read it at all.
test spend_fails_without_the_beacon() fail {
  consumer.spend(beacon, None, Void, dummy_ref, tx_reading_oracle(150, False))
}
// #endregion consumer-tests
