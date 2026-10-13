use aiken/collection/list
use aiken/collection/pairs
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{alice, bob, change, holding, mint_name, policy, ref, seed}
use names.{Action, Register, Release, Retarget, registry_token}

// #region naive
/// The obvious registry: every name and its target, in its datum.
pub type Names =
  Pairs<ByteArray, ByteArray>

validator registry(seed: OutputReference) {
  spend(
    _datum: Option<Data>,
    action: Action<Void>,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    let (policy, old, new) = names.continuation(self, own_ref)
    expect old: Names = old
    expect new: Names = new
    let minted = names.minted(self.mint, policy)
    when action is {
      Register { name, target, .. } -> and {
          name != registry_token,
          minted == [Pair(name, 1)],
          !pairs.has_key(old, name),
          new == [Pair(name, target), ..old],
        }
      Retarget { name, old: from, new: to, .. } -> and {
          minted == [],
          names.holds_name(self.inputs, policy, name),
          pairs.get_first(old, name) == Some(from),
          new == list.map(
            old,
            fn(Pair(key, value)) {
              if key == name {
                Pair(key, to)
              } else {
                Pair(key, value)
              }
            },
          ),
        }
      Release { name, target, .. } -> and {
          minted == [Pair(name, -1)],
          pairs.get_first(old, name) == Some(target),
          new == list.filter(old, fn(Pair(key, _)) { key != name }),
        }
    }
  }

  mint(_redeemer: Data, policy: PolicyId, self: Transaction) {
    let none: Names = []
    names.mint_ok(self, policy, seed, none)
  }

  else(_) {
    fail
  }
}

// #endregion naive

fn as_data(names: Names) -> Data {
  let data: Data = names
  data
}

const one: Names = [Pair("alice", alice)]

// The checks every version shares, attacked once here.

test register_ok_for_a_free_name() {
  let tx = change(as_data([]), as_data(one), mint_name("alice", 1), [])
  registry.spend(seed, None, Register("alice", alice, Void), ref(0), tx)
}

test register_fails_for_a_taken_name() fail {
  let two = [Pair("alice", bob), ..one]
  let tx = change(as_data(one), as_data(two), mint_name("alice", 1), [])
  registry.spend(seed, None, Register("alice", bob, Void), ref(0), tx)
}

test register_fails_without_minting_the_name() fail {
  let tx = change(as_data([]), as_data(one), assets.zero, [])
  registry.spend(seed, None, Register("alice", alice, Void), ref(0), tx)
}

test register_fails_for_the_empty_name() fail {
  let tx = change(as_data([]), as_data([Pair("", alice)]), mint_name("", 1), [])
  registry.spend(seed, None, Register("", alice, Void), ref(0), tx)
}

test retarget_ok_for_the_holder() {
  let tx = change(
    as_data(one),
    as_data([Pair("alice", bob)]),
    assets.zero,
    [holding(alice, "alice")],
  )
  registry.spend(seed, None, Retarget("alice", alice, bob, Void), ref(0), tx)
}

test retarget_fails_without_the_name_token() fail {
  let tx = change(as_data(one), as_data([Pair("alice", bob)]), assets.zero, [])
  registry.spend(seed, None, Retarget("alice", alice, bob, Void), ref(0), tx)
}

test release_ok_when_the_token_is_burned() {
  let tx = change(as_data(one), as_data([]), mint_name("alice", -1), [])
  registry.spend(seed, None, Release("alice", alice, Void), ref(0), tx)
}

test release_fails_without_burning() fail {
  let tx = change(as_data(one), as_data([]), assets.zero, [])
  registry.spend(seed, None, Release("alice", alice, Void), ref(0), tx)
}

// The registry must come back holding nothing but ADA and its token.
test register_fails_when_the_registry_gains_a_token() fail {
  let tx = change(as_data([]), as_data(one), mint_name("alice", 1), [])
  let polluted = transaction.Output {
    ..fixtures.registry(as_data(one)),
    value: fixtures.registry(as_data(one)).value
      |> assets.add(policy, "alice", 1),
  }
  registry.spend(
    seed,
    None,
    Register("alice", alice, Void),
    ref(0),
    transaction.Transaction { ..tx, outputs: [polluted] },
  )
}

test names_mint_only_with_the_registry() fail {
  let tx = transaction.Transaction {
    ..transaction.placeholder,
    mint: mint_name("alice", 1),
  }
  registry.mint(seed, Void, policy, tx)
}

test genesis_ok_spending_the_seed() {
  let none: Names = []
  let tx = transaction.Transaction {
    ..transaction.placeholder,
    inputs: [
      transaction.Input {
        output_reference: seed,
        output: holding(alice, "x").output,
      },
    ],
    outputs: [fixtures.registry(as_data(none))],
    mint: mint_name(registry_token, 1),
  }
  registry.mint(seed, Void, policy, tx)
}

test genesis_fails_without_the_seed() fail {
  let none: Names = []
  let tx = transaction.Transaction {
    ..transaction.placeholder,
    outputs: [fixtures.registry(as_data(none))],
    mint: mint_name(registry_token, 1),
  }
  registry.mint(seed, Void, policy, tx)
}
