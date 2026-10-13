use aiken/merkle_patricia_forestry.{Proof} as mpf
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{alice, bob, change, holding, mint_name, ref, seed}
use names.{Action, Register, Release, Retarget, registry_token}

// #region by-hand
validator registry(seed: OutputReference) {
  /// The datum is the trie's root: 32 bytes, however many names it holds.
  spend(
    _datum: Option<Data>,
    action: Action<Proof>,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    let (policy, old, new) = names.continuation(self, own_ref)
    expect old: ByteArray = old
    expect new: ByteArray = new
    let before = mpf.from_root(old)
    let after = mpf.from_root(new)
    let minted = names.minted(self.mint, policy)
    // Each change is one proof, read against both roots.
    when action is {
      Register { name, target, proof } -> and {
          name != registry_token,
          minted == [Pair(name, 1)],
          // Without the name, the proof gives the old root...
          mpf.miss(before, name, proof),
          // ...and with it, the new one.
          mpf.has(after, name, target, proof),
        }
      Retarget { name, old: from, new: to, proof } -> and {
          minted == [],
          names.holds_name(self.inputs, policy, name),
          mpf.has(before, name, from, proof),
          mpf.has(after, name, to, proof),
        }
      Release { name, target, proof } -> and {
          minted == [Pair(name, -1)],
          mpf.has(before, name, target, proof),
          mpf.miss(after, name, proof),
        }
    }
  }

  mint(_redeemer: Data, policy: PolicyId, self: Transaction) {
    names.mint_ok(self, policy, seed, mpf.root(mpf.empty))
  }

  else(_) {
    fail
  }
}

// #endregion by-hand

// With one name or none, a proof is the empty list, so these tests can build
// real roots. The off-chain tests prove changes in tries of every size.

fn root_with(name: ByteArray, target: ByteArray) -> Data {
  let root: Data = mpf.root(mpf.insert(mpf.empty, name, target, []))
  root
}

const empty_root: Data = mpf.root(mpf.empty)

test register_ok_into_the_empty_trie() {
  let tx = change(
    empty_root,
    root_with("alice", alice),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", alice, []), ref(0), tx)
}

// A root that is not the one with the name added.
test register_fails_with_a_wrong_new_root() fail {
  let tx = change(
    empty_root,
    root_with("alice", bob),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", alice, []), ref(0), tx)
}

// "alice" is already in the trie, so the proof does not give its root
// without her.
test register_fails_for_a_taken_name() fail {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", bob),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", bob, []), ref(0), tx)
}

test retarget_ok_for_the_holder() {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", bob),
    assets.zero,
    [holding(alice, "alice")],
  )
  registry.spend(seed, None, Retarget("alice", alice, bob, []), ref(0), tx)
}

test retarget_fails_from_the_wrong_old_target() fail {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", bob),
    assets.zero,
    [holding(alice, "alice")],
  )
  registry.spend(seed, None, Retarget("alice", bob, bob, []), ref(0), tx)
}

test release_ok_back_to_the_empty_trie() {
  let tx = change(
    root_with("alice", alice),
    empty_root,
    mint_name("alice", -1),
    [],
  )
  registry.spend(seed, None, Release("alice", alice, []), ref(0), tx)
}

test release_fails_keeping_the_name_in_the_trie() fail {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", alice),
    mint_name("alice", -1),
    [],
  )
  registry.spend(seed, None, Release("alice", alice, []), ref(0), tx)
}
