// #region splitter-imports
use aiken/collection/list
// #region attack-import
use aiken/primitive/bytearray
// #endregion attack-import
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{Assets, PolicyId}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}

// #endregion splitter-imports

// A shared pot. Anyone may donate to it, and anyone may split it: every
// benefactor named in the parameter receives an equal share of everything the
// pot holds. The pot is the one UTxO at this script's address that holds the
// beacon NFT, so a UTxO somebody else sends to the address is not mistaken for
// it.
//
// This is the closed version. A donation may only add ADA: every other asset in
// the pot stays exactly as it was. splitter_open.ak is the contract as first
// written, and the Advanced lecture "Detecting vulnerabilities" walks from one
// to the other.
// #region splitter
pub type AssetClass {
  policy_id: PolicyId,
  name: ByteArray,
}

pub type SplitterAction {
  Donate
  Split
}

// True if `left` holds at least as much of every asset, ADA included, as `right`.
fn value_geq(left: Assets, right: Assets) -> Bool {
  assets.merge(left, assets.negate(right))
    |> assets.reduce(True, fn(_policy, _name, qty, acc) { acc && qty >= 0 })
}

validator splitter(beacon: AssetClass, benefactors: List<Address>) {
  spend(
    _datum: Option<Data>,
    redeemer: SplitterAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    let pot = own_input.output
    // Only the UTxO holding the beacon is the pot.
    expect assets.has_nft(pot.value, beacon.policy_id, beacon.name)
    // The pot continues at the same address, beacon included.
    expect Some(new_pot) = list.find(
      self.outputs,
      fn(o) { o.address == pot.address },
    )
    expect assets.has_nft(new_pot.value, beacon.policy_id, beacon.name)
    when redeemer is {
      // #region donate-closed
      // Every token stays exactly as it was, and the ADA may only grow.
      Donate -> assets.match(new_pot.value, pot.value, >=)?
      // #endregion donate-closed
      Split -> {
        let n = list.length(benefactors)
        expect n > 0
        // Each share: every asset in the pot except the beacon, divided by n.
        // What does not divide evenly stays in the pot.
        let share = assets.reduce(
          pot.value,
          assets.zero,
          fn(policy_id, name, qty, acc) {
            if policy_id == beacon.policy_id && name == beacon.name {
              acc
            } else {
              assets.add(acc, policy_id, name, qty / n)
            }
          },
        )
        // Every benefactor is paid at least their share.
        list.all(
          benefactors,
          fn(b) {
            list.any(
              self.outputs,
              fn(o) { o.address == b && value_geq(o.value, share) },
            )
          },
        )?
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion splitter

// Tests.
// #region splitter-tests

// The beacon that marks the pot.
const beacon: AssetClass =
  AssetClass {
    policy_id: #"000000000000000000000000000000000000000000000000000000bb",
    name: "POT",
  }

// The script's own address.
const pot_address: Address =
  Address {
    payment_credential: Script(
      #"000000000000000000000000000000000000000000000000000000ff",
    ),
    stake_credential: None,
  }

// Two benefactors, each a plain key address.
const alice: Address =
  Address {
    payment_credential: VerificationKey(
      #"00000000000000000000000000000000000000000000000000000001",
    ),
    stake_credential: None,
  }

const bob: Address =
  Address {
    payment_credential: VerificationKey(
      #"00000000000000000000000000000000000000000000000000000002",
    ),
    stake_credential: None,
  }

const benefactors: List<Address> = [alice, bob]

const pot_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// The beacon plus some ADA.
fn pot_holding(lovelace: Int) -> Assets {
  assets.from_lovelace(lovelace)
    |> assets.add(beacon.policy_id, beacon.name, 1)
}

fn output_at(address: Address, value: Assets) -> Output {
  Output { address, value, datum: NoDatum, reference_script: None }
}

// A transaction that spends the pot, holding `before`, into `outputs`.
fn spend_pot(before: Assets, outputs: List<Output>) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [
      Input {
        output_reference: pot_ref,
        output: output_at(pot_address, before),
      },
    ],
    outputs,
  }
}

test donate_ok_when_the_pot_grows() {
  let tx = spend_pot(
    pot_holding(100_000_000),
    [output_at(pot_address, pot_holding(110_000_000))],
  )
  splitter.spend(beacon, benefactors, None, Donate, pot_ref, tx)
}

test donate_fails_when_the_pot_shrinks() fail {
  let tx = spend_pot(
    pot_holding(100_000_000),
    [output_at(pot_address, pot_holding(90_000_000))],
  )
  splitter.spend(beacon, benefactors, None, Donate, pot_ref, tx)
}

test split_ok_when_everyone_is_paid() {
  let tx = spend_pot(
    pot_holding(100_000_000),
    [
      output_at(pot_address, pot_holding(0)),
      output_at(alice, assets.from_lovelace(50_000_000)),
      output_at(bob, assets.from_lovelace(50_000_000)),
    ],
  )
  splitter.spend(beacon, benefactors, None, Split, pot_ref, tx)
}

test split_fails_when_bob_is_short() fail {
  let tx = spend_pot(
    pot_holding(100_000_000),
    [
      output_at(pot_address, pot_holding(0)),
      output_at(alice, assets.from_lovelace(50_000_000)),
      output_at(bob, assets.from_lovelace(40_000_000)),
    ],
  )
  splitter.spend(beacon, benefactors, None, Split, pot_ref, tx)
}

// #endregion splitter-tests

// The same attack. A donation of worthless tokens is now refused, so the test
// fails, which is what `fail` asks for. The pot in the second test is one no
// donation can build any more.
// #region attack-dust-closed
// The attacker's own policy. Minting under it costs them almost nothing.
const dust_policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000dd"

// `value` plus `count` dust tokens, named 1, 2, 3 and so on, two of each.
fn with_dust(value: Assets, count: Int) -> Assets {
  list.foldl(
    list.range(1, count),
    value,
    fn(i, v) {
      assets.add(v, dust_policy, bytearray.from_int_big_endian(i, 2), 2)
    },
  )
}

test donate_dust_ok() fail {
  let tx = spend_pot(
    pot_holding(100_000_000),
    [output_at(pot_address, with_dust(pot_holding(100_000_000), 5))],
  )
  splitter.spend(beacon, benefactors, None, Donate, pot_ref, tx)
}

const dusty_pot: Assets = with_dust(pot_holding(100_000_000), 60)

const dusty_share: Assets = with_dust(assets.from_lovelace(50_000_000), 60)

test split_with_60_dust_tokens() {
  let tx = spend_pot(
    dusty_pot,
    [
      output_at(pot_address, pot_holding(0)),
      output_at(alice, dusty_share),
      output_at(bob, dusty_share),
    ],
  )
  splitter.spend(beacon, benefactors, None, Split, pot_ref, tx)
}
// #endregion attack-dust-closed
