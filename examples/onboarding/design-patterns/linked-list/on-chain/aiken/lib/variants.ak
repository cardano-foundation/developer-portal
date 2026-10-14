//// Tested helper-level examples of the other library variants. These are not
//// extra deployment branches of the ascending registry benchmark.

use aiken/cbor
use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{blake2b_224}
use aiken/primitive/bytearray
use aiken_design_patterns/linked_list
use aiken_design_patterns/linked_list/advanced
use aiken_design_patterns/linked_list/nested
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use fixtures
use registry.{NodeState, RootState}

// #region advanced
/// Advanced insertion can carry a reference script and an unrelated RECEIPT
/// mint. Every captured output is selected from the real transaction outputs.
pub fn insert_with_receipt(tx: Transaction, policy: PolicyId) -> Bool {
  let continued = list.expect_at(tx.outputs, 0)
  let node = list.expect_at(tx.outputs, 1)
  advanced.insert_ascending(
    continued,
    node,
    tx.inputs,
    tx.mint,
    fn(
      _anchor,
      delta,
      _anchor_key,
      old,
      next,
      _ada,
      key,
      data,
      _link,
      script,
      extra,
      external_inputs,
    ) {
      expect state: NodeState = data
      and {
        delta >= 0,
        old == next,
        registry.valid_entry(key, state),
        script == Some(policy),
        dict.to_pairs(extra) == [Pair("RECEIPT", 1)],
        external_inputs == [],
      }
    },
  )
    |> linked_list.run_element_with(
        policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

// #endregion advanced

// #region nested
pub type NestedDatum =
  nested.Element<RootState, NodeState, NodeState>

pub type NestedRole {
  Directory
  Participant
}

/// One consumed nonce creates one directory and one child. Role tags separate
/// their 28-byte keys; the NODE prefix brings each asset name to 32 bytes.
pub fn nested_key(nonce: OutputReference, role: NestedRole) -> ByteArray {
  blake2b_224(cbor.serialise((nonce, role)))
}

/// Insert a directory containing its first participant. Outer and inner
/// ordering is local; nonce-derived keys enforce uniqueness across all chains.
/// Every nested mint branch must use the same key rule and role assignments.
pub fn insert_directory(
  tx: Transaction,
  policy: PolicyId,
  nonce: OutputReference,
) -> Bool {
  expect registry.nonce_spent(nonce, tx)
  nested.insert_inner_list_ascending(
    nested.Ascending,
    list.expect_at(tx.outputs, 0),
    list.expect_at(tx.outputs, 1),
    tx.inputs,
    [list.expect_at(tx.outputs, 2)],
    tx.mint,
    fn(_ada, key, data, _child_link, script) {
      expect state: NodeState = data
      expect key == nested_key(nonce, Directory)
      expect registry.valid_entry(key, state) && script == None
      0
    },
    fn(count, _index, address, _ada, key, data, _link, script) {
      expect state: NodeState = data
      expect key == nested_key(nonce, Participant)
      expect registry.valid_entry(key, state)
      expect address.payment_credential == Script(policy) && script == None
      count + 1
    },
    fn(
      _anchor,
      delta,
      _key,
      old,
      next,
      _old_link,
      count,
      extra,
      external_inputs,
    ) {
      delta >= 0 && old == next && count == 1 && dict.is_empty(extra) && external_inputs == []
    },
  )
    |> linked_list.run_element_with(
        policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

// #endregion nested

fn receipt_tx() -> Transaction {
  let tx = fixtures.insertion()
  let node = list.expect_at(tx.outputs, 1)
  Transaction {
    ..tx,
    outputs: [
      list.expect_at(tx.outputs, 0),
      Output { ..node, reference_script: Some(fixtures.policy) },
    ],
    mint: assets.add(tx.mint, fixtures.policy, "RECEIPT", 1),
  }
}

test advanced_accepts_reference_script_and_receipt() {
  insert_with_receipt(receipt_tx(), fixtures.policy)
}

test advanced_refuses_an_extra_reserved_node_mint() fail {
  let tx = receipt_tx()
  insert_with_receipt(
    Transaction {
      ..tx,
      mint: assets.add(
        tx.mint,
        fixtures.policy,
        bytearray.concat(registry.node_prefix, fixtures.c),
        1,
      ),
    },
    fixtures.policy,
  )
}

test advanced_refuses_an_extra_root_mint() fail {
  let tx = receipt_tx()
  insert_with_receipt(
    Transaction {
      ..tx,
      mint: assets.add(tx.mint, fixtures.policy, registry.root_key, 1),
    },
    fixtures.policy,
  )
}

fn directory_tx(
  anchor: Input,
  directory_key: ByteArray,
  child_key: ByteArray,
) -> Transaction {
  expect InlineDatum(raw) = anchor.output.datum
  expect old: NestedDatum = raw
  let continued: NestedDatum = nested.Element {
    ..old,
    link: Some(directory_key),
  }
  let directory: NestedDatum = nested.Element {
    data: nested.InnerRoot {
      data: NodeState { label: "directory" },
      child_link: Some(child_key),
    },
    link: old.link,
  }
  let child: NestedDatum = nested.Element {
    data: nested.Node { data: NodeState { label: "participant" } },
    link: None,
  }
  Transaction {
    ..transaction.placeholder,
    inputs: [anchor],
    outputs: [
      Output { ..anchor.output, datum: InlineDatum(continued) },
      fixtures.output(
        bytearray.concat(registry.node_prefix, directory_key),
        directory,
      ),
      fixtures.output(bytearray.concat(registry.node_prefix, child_key), child),
    ],
    mint: assets.zero
      |> assets.add(
          fixtures.policy,
          bytearray.concat(registry.node_prefix, directory_key),
          1,
        )
      |> assets.add(
          fixtures.policy,
          bytearray.concat(registry.node_prefix, child_key),
          1,
        ),
  }
}

fn first_directory_tx() -> Transaction {
  directory_tx(
    fixtures.input(0, fixtures.root(None)),
    nested_key(fixtures.ref(0), Directory),
    nested_key(fixtures.ref(0), Participant),
  )
}

fn fresh_nonce() -> Input {
  fixtures.input(
    99,
    Output {
      ..fixtures.root(None),
      address: address.from_verification_key(fixtures.operator),
      value: assets.from_lovelace(10_000_000),
      datum: NoDatum,
    },
  )
}

/// Use actual outputs of the first insertion. Choose the gap that fits the
/// proposed directory key so collision tests cannot fail merely on ordering.
fn next_directory_tx(
  directory_key: ByteArray,
  child_key: ByteArray,
) -> Transaction {
  let first = first_directory_tx()
  expect insert_directory(first, fixtures.policy, fixtures.ref(0))
  let before_first = bytearray.compare(
    directory_key,
    nested_key(fixtures.ref(0), Directory),
  ) == Less
  let anchor_index = if before_first {
    0
  } else {
    1
  }
  let tx = directory_tx(
    fixtures.input(
      10 + anchor_index,
      list.expect_at(first.outputs, anchor_index),
    ),
    directory_key,
    child_key,
  )
  Transaction { ..tx, inputs: list.concat(tx.inputs, [fresh_nonce()]) }
}

test nested_inserts_a_directory_and_child() {
  insert_directory(first_directory_tx(), fixtures.policy, fixtures.ref(0))
}

test nested_inserts_a_second_directory_with_fresh_keys() {
  insert_directory(
    next_directory_tx(
      nested_key(fixtures.ref(99), Directory),
      nested_key(fixtures.ref(99), Participant),
    ),
    fixtures.policy,
    fixtures.ref(99),
  )
}

test nested_refuses_a_reference_only_nonce() fail {
  let tx = directory_tx(
    fixtures.input(0, fixtures.root(None)),
    nested_key(fixtures.ref(99), Directory),
    nested_key(fixtures.ref(99), Participant),
  )
  insert_directory(
    Transaction { ..tx, reference_inputs: [fresh_nonce()] },
    fixtures.policy,
    fixtures.ref(99),
  )
}

test nested_refuses_a_child_key_from_another_directory() fail {
  insert_directory(
    next_directory_tx(
      nested_key(fixtures.ref(99), Directory),
      nested_key(fixtures.ref(0), Participant),
    ),
    fixtures.policy,
    fixtures.ref(99),
  )
}

test nested_refuses_an_existing_directory_key_as_a_child() fail {
  insert_directory(
    next_directory_tx(
      nested_key(fixtures.ref(99), Directory),
      nested_key(fixtures.ref(0), Directory),
    ),
    fixtures.policy,
    fixtures.ref(99),
  )
}

test nested_refuses_an_existing_child_key_as_a_directory() fail {
  insert_directory(
    next_directory_tx(
      nested_key(fixtures.ref(0), Participant),
      nested_key(fixtures.ref(99), Participant),
    ),
    fixtures.policy,
    fixtures.ref(99),
  )
}

test nested_refuses_a_broken_child_link() fail {
  let tx = first_directory_tx()
  let directory: NestedDatum = nested.Element {
    data: nested.InnerRoot {
      data: NodeState { label: "directory" },
      child_link: Some(fixtures.c),
    },
    link: None,
  }
  insert_directory(
    Transaction {
      ..tx,
      outputs: [
        list.expect_at(tx.outputs, 0),
        fixtures.output(
          bytearray.concat(
            registry.node_prefix,
            nested_key(fixtures.ref(0), Directory),
          ),
          directory,
        ),
        list.expect_at(tx.outputs, 2),
      ],
    },
    fixtures.policy,
    fixtures.ref(0),
  )
}

test descending_insertion() {
  let mint = assets.zero
    |> assets.add(
        fixtures.policy,
        bytearray.concat(registry.node_prefix, fixtures.b),
        1,
      )
  linked_list.insert_descending(
    fixtures.node(fixtures.c, Some(fixtures.b)),
    fixtures.node(fixtures.b, Some(fixtures.a)),
    [fixtures.input(0, fixtures.node(fixtures.c, Some(fixtures.a)))],
    mint,
    fn(_i, delta, _key, _data, _ada, key, data, _link) {
      expect state: NodeState = data
      delta >= 0 && registry.valid_entry(key, state)
    },
  )
    |> linked_list.run_element_with(
        fixtures.policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

test unordered_append() {
  let mint = assets.zero
    |> assets.add(
        fixtures.policy,
        bytearray.concat(registry.node_prefix, fixtures.a),
        1,
      )
  linked_list.append_unordered(
    fixtures.node(fixtures.c, Some(fixtures.a)),
    fixtures.node(fixtures.a, None),
    [fixtures.input(0, fixtures.node(fixtures.c, None))],
    mint,
    fn(_i, delta, _key, _data, _ada, key, data) {
      expect state: NodeState = data
      delta >= 0 && registry.valid_entry(key, state)
    },
  )
    |> linked_list.run_element_with(
        fixtures.policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

test unordered_prepend() {
  let mint = assets.zero
    |> assets.add(
        fixtures.policy,
        bytearray.concat(registry.node_prefix, fixtures.c),
        1,
      )
  linked_list.prepend_unordered(
    fixtures.root(Some(fixtures.c)),
    fixtures.node(fixtures.c, Some(fixtures.a)),
    [fixtures.input(0, fixtures.root(Some(fixtures.a)))],
    mint,
    fn(_i, delta, _data, _ada, key, data, _link) {
      expect state: NodeState = data
      delta >= 0 && registry.valid_entry(key, state)
    },
  )
    |> linked_list.run_element_with(
        fixtures.policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

test fold_first_node_into_root() {
  let next: registry.ListDatum = linked_list.Element {
    data: linked_list.Root { data: RootState { version: 1 } },
    link: Some(fixtures.c),
  }
  let mint = assets.zero
    |> assets.add(
        fixtures.policy,
        bytearray.concat(registry.node_prefix, fixtures.a),
        -1,
      )
  linked_list.fold_from_root(
    fixtures.ref(0),
    fixtures.output(registry.root_key, next),
    [
      fixtures.input(0, fixtures.root(Some(fixtures.a))),
      fixtures.input(1, fixtures.node(fixtures.a, Some(fixtures.c))),
    ],
    mint,
    fn(_root, delta, old, _node, _ada, _key, _data, _link, new) {
      expect RootState { version } = old
      let expected: Data = RootState { version: version + 1 }
      delta >= 0 && new == expected
    },
  )
    |> linked_list.run_element_with(
        fixtures.policy,
        registry.root_key,
        registry.node_prefix,
        registry.prefix_length,
      )
}

test reads_only_a_root() {
  linked_list.get_root_element_info(
    fixtures.root(Some(fixtures.a)),
    fn(_address, _ada, data, link) {
      expect RootState { version } = data
      version == 0 && link == Some(fixtures.a)
    },
  )
    |> linked_list.run_root_with(fixtures.policy, registry.root_key)
}

test reads_only_a_node() {
  linked_list.get_node_element_info(
    fixtures.node(fixtures.a, Some(fixtures.c)),
    fn(_address, _ada, key, data, link) {
      expect state: NodeState = data
      registry.valid_entry(key, state) && key == fixtures.a && link == Some(
        fixtures.c,
      )
    },
  )
    |> linked_list.run_node_with(
        fixtures.policy,
        registry.node_prefix,
        registry.prefix_length,
      )
}
