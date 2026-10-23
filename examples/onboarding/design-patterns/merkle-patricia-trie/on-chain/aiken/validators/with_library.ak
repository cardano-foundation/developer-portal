use aiken/merkle_patricia_forestry.{Proof} as mpf
use aiken/primitive/bytearray
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use fixtures.{alice, bob, change, holding, mint_name, ref, seed}
use names.{Action, Register, Release, Retarget, registry_token}

// #region with-library
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
    let trie = mpf.from_root(old)
    let minted = names.minted(self.mint, policy)
    when action is {
      Register { name, target, proof } -> and {
          name != registry_token,
          bytearray.length(target) == 28,
          minted == [Pair(name, 1)],
          mpf.root(mpf.insert(trie, name, target, proof)) == new,
        }
      Retarget { name, old: from, new: to, proof } -> and {
          minted == [],
          bytearray.length(to) == 28,
          names.holds_name(self.inputs, policy, name),
          mpf.root(mpf.update(trie, name, proof, from, to)) == new,
        }
      Release { name, target, proof } -> and {
          minted == [Pair(name, -1)],
          mpf.root(mpf.delete(trie, name, target, proof)) == new,
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

// #endregion with-library

// With one name or none, a proof is the empty list, so these tests can build
// real roots. The Mesh tests exercise multi-name tries and shared checks.

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

test register_fails_for_a_taken_name() fail {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", bob),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", bob, []), ref(0), tx)
}

test register_fails_with_a_wrong_new_root() fail {
  let tx = change(
    empty_root,
    root_with("alice", bob),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", alice, []), ref(0), tx)
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

test register_fails_with_a_malformed_target() fail {
  let tx = change(
    empty_root,
    root_with("alice", #"00"),
    mint_name("alice", 1),
    [],
  )
  registry.spend(seed, None, Register("alice", #"00", []), ref(0), tx)
}

test retarget_fails_with_a_malformed_target() fail {
  let tx = change(
    root_with("alice", alice),
    root_with("alice", #"00"),
    assets.zero,
    [holding(alice, "alice")],
  )
  registry.spend(seed, None, Retarget("alice", alice, #"00", []), ref(0), tx)
}
