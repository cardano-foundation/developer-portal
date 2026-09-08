// #region oracle-imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{AssetName, PolicyId, Value, from_lovelace, quantity_of}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion oracle-imports

// A UTxO that carries a number and is updated instead of emptied. Every other
// contract here lets the funds go; this one demands they come straight back,
// with the beacon token still on them.
// #region oracle
pub type AssetClass {
  policy_id: PolicyId,
  name: AssetName,
}

pub type OracleParams {
  beacon: AssetClass,
  operator: VerificationKeyHash,
}

pub type OracleAction {
  Update
  Delete
}

pub type Rate =
  Int

// One beacon and no more. The consumer in the next lecture calls this too, so
// both contracts agree on what "the real oracle" means.
pub fn holds_beacon(value: Value, beacon: AssetClass) -> Bool {
  quantity_of(value, beacon.policy_id, beacon.name) == 1
}

validator oracle(params: OracleParams) {
  spend(
    _datum: Option<Rate>,
    redeemer: OracleAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)

    and {
      // Both actions need these two, so they sit above the branch.
      list.has(self.extra_signatories, params.operator)?,
      holds_beacon(own_input.output.value, params.beacon)?,
      when redeemer is {
        Update -> {
          let own_address = own_input.output.address
          expect [continuing] = list.filter(
            self.outputs,
            fn(output) { output.address == own_address },
          )
          expect InlineDatum(returned) = continuing.datum
          expect _new_rate: Rate = returned
          holds_beacon(continuing.value, params.beacon)?
        }
        Delete ->
          (quantity_of(self.mint, params.beacon.policy_id, params.beacon.name) == -1)?
      },
    }
  }

  else(_) {
    fail
  }
}

// #endregion oracle

// Tests.
// #region oracle-tests

// A key hash is 28 bytes, so any 28 bytes stand in for one.
const operator: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

// The beacon the oracle was compiled around.
const beacon: AssetClass =
  AssetClass {
    policy_id: #"000000000000000000000000000000000000000000000000000000ee",
    name: "ORACLE",
  }

const params: OracleParams = OracleParams { beacon, operator }

// The oracle's own address. The input it spends and the output it sends back
// have to carry exactly this value, which is what the rule compares.
const script_address: Address =
  Address {
    payment_credential: Script(
      #"000000000000000000000000000000000000000000000000000000ff",
    ),
    stake_credential: None,
  }

// Somewhere else to send the funds, for the test that takes them away.
const wallet_address: Address =
  Address {
    payment_credential: VerificationKey(operator),
    stake_credential: None,
  }

// The UTxO being spent. The handler is handed this reference and looks for the
// matching input, so the two have to agree.
const own_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// Some ADA and the beacon: what a live oracle UTxO holds.
fn with_beacon(lovelace: Int) -> Value {
  from_lovelace(lovelace) |> assets.add(beacon.policy_id, beacon.name, 1)
}

// The oracle's UTxO, coming in. Its datum is the rate as it stands now.
fn oracle_input() -> Input {
  Input {
    output_reference: own_ref,
    output: Output {
      address: script_address,
      value: with_beacon(5_000_000),
      datum: InlineDatum(100),
      reference_script: None,
    },
  }
}

// One output, going wherever the test says, holding whatever the test says.
fn output_to(address: Address, value: Value) -> Output {
  Output { address, value, datum: InlineDatum(150), reference_script: None }
}

test update_ok_when_operator_signs_and_beacon_returns() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(script_address, with_beacon(5_000_000))],
    extra_signatories: [operator],
  }
  oracle.spend(params, Some(100), Update, own_ref, tx)
}

test update_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(script_address, with_beacon(5_000_000))],
    extra_signatories: [stranger],
  }
  oracle.spend(params, Some(100), Update, own_ref, tx)
}

// The output goes to an ordinary key address, so nothing comes back to the
// oracle and the funds are gone.
test update_fails_when_the_utxo_does_not_return() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(wallet_address, with_beacon(5_000_000))],
    extra_signatories: [operator],
  }
  oracle.spend(params, Some(100), Update, own_ref, tx)
}

// The UTxO comes back, but the beacon has been taken out of it. What is left
// behind is a UTxO at the oracle's address that no reader will trust.
test update_fails_when_the_beacon_does_not_return() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(script_address, from_lovelace(5_000_000))],
    extra_signatories: [operator],
  }
  oracle.spend(params, Some(100), Update, own_ref, tx)
}

test delete_ok_when_the_beacon_is_burned() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    mint: assets.from_asset(beacon.policy_id, beacon.name, -1),
    extra_signatories: [operator],
  }
  oracle.spend(params, Some(100), Delete, own_ref, tx)
}

// Closing without burning would leave the beacon loose in the operator's
// wallet, ready to be locked again beside a rate nobody agreed to.
test delete_fails_when_the_beacon_survives() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    extra_signatories: [operator],
  }
  oracle.spend(params, Some(100), Delete, own_ref, tx)
}
// #endregion oracle-tests
