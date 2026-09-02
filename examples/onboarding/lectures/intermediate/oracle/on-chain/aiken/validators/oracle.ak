// #region oracle-imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
// #endregion oracle-imports

// A UTxO that carries a number, and is updated instead of emptied: every other
// contract here lets the funds go, this one demands they come straight back.
// #region oracle
pub type OracleDatum {
  owner: VerificationKeyHash,
  price: Int,
}

validator oracle {
  spend(
    datum: Option<OracleDatum>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(OracleDatum { owner, .. }) = datum

    expect Some(own_input) =
      list.find(self.inputs, fn(input) { input.output_reference == own_ref })

    // Without these three lines the owner could simply drain the UTxO.
    let own_address = own_input.output.address
    expect [continuing] =
      list.filter(self.outputs, fn(output) { output.address == own_address })
    expect InlineDatum(returned) = continuing.datum
    expect _updated: OracleDatum = returned

    list.has(self.extra_signatories, owner)?
  }

  else(_) {
    fail
  }
}

// #endregion oracle

// Tests.
// #region oracle-tests

// A key hash is 28 bytes, so any 28 bytes stand in for one.
const owner: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

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
    payment_credential: VerificationKey(owner),
    stake_credential: None,
  }

// The UTxO being spent. The handler is handed this reference and looks for the
// matching input, so the two have to agree.
const own_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

fn old_datum() -> OracleDatum {
  OracleDatum { owner, price: 100 }
}

fn new_datum() -> OracleDatum {
  OracleDatum { owner, price: 150 }
}

// The oracle's UTxO, coming in. Its datum is the price as it stands now.
fn oracle_input() -> Input {
  Input {
    output_reference: own_ref,
    output: Output {
      address: script_address,
      value: from_lovelace(5_000_000),
      datum: InlineDatum(old_datum()),
      reference_script: None,
    },
  }
}

// One output, going wherever the test says, carrying whatever datum it says.
fn output_to(address: Address, datum: Data) -> Output {
  Output {
    address,
    value: from_lovelace(5_000_000),
    datum: InlineDatum(datum),
    reference_script: None,
  }
}

test update_ok_when_owner_signs_and_utxo_returns() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(script_address, new_datum())],
    extra_signatories: [owner],
  }
  oracle.spend(Some(old_datum()), Void, own_ref, tx)
}

// The output goes to an ordinary key address, so nothing comes back to the
// oracle and the funds are gone.
test update_fails_when_the_utxo_does_not_return() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(wallet_address, new_datum())],
    extra_signatories: [owner],
  }
  oracle.spend(Some(old_datum()), Void, own_ref, tx)
}

test update_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [oracle_input()],
    outputs: [output_to(script_address, new_datum())],
    extra_signatories: [stranger],
  }
  oracle.spend(Some(old_datum()), Void, own_ref, tx)
}
// #endregion oracle-tests
