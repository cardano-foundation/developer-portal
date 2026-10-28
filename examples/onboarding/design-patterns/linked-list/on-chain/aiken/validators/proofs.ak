use aiken/collection/list
use aiken_design_patterns/linked_list
use cardano/assets.{PolicyId}
use cardano/transaction.{Output, OutputReference, Transaction}
use fixtures
use registry.{Absent, Member, Query}

// #region manual-proof
validator by_hand(policy: PolicyId) {
  spend(
    _datum: Option<Data>,
    query: Query,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    let reference = list.expect_at(
      tx.reference_inputs,
      registry.reference_index(query),
    )
    let (key, element) = registry.read_element(reference.output, policy)
    registry.proves(query, key, element.link)
  }

  else(_) {
    fail
  }
}

// #endregion manual-proof

// #region library-proof
validator with_library(policy: PolicyId) {
  spend(
    _datum: Option<Data>,
    query: Query,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    let reference = list.expect_at(
      tx.reference_inputs,
      registry.reference_index(query),
    )
    linked_list.get_element_info(
      reference.output,
      fn(_address, _ada, key, _data, link) { registry.proves(query, key, link) },
    )
      |> linked_list.run_element_with(
          policy,
          registry.root_key,
          registry.node_prefix,
          registry.prefix_length,
        )
  }

  else(_) {
    fail
  }
}

// #endregion library-proof

// #region array-proof
validator naive(policy: PolicyId) {
  spend(
    _datum: Option<Data>,
    query: Query,
    _ref: OutputReference,
    tx: Transaction,
  ) {
    let reference = list.expect_at(
      tx.reference_inputs,
      registry.reference_index(query),
    )
    let registry = registry.read_array(reference.output, policy)
    when query is {
      Member { key, .. } -> list.any(registry.entries, fn(e) { e.key == key })
      Absent { key, .. } -> !list.any(registry.entries, fn(e) { e.key == key })
    }
  }

  else(_) {
    fail
  }
}

// #endregion array-proof

test membership_reads_one_node() {
  let tx = Transaction {
    ..transaction.placeholder,
    reference_inputs: [
      fixtures.input(0, fixtures.node(fixtures.b, Some(fixtures.c))),
    ],
  }
  by_hand.spend(
    fixtures.policy,
    None,
    Member { key: fixtures.b, reference_index: 0 },
    fixtures.ref(99),
    tx,
  ) && with_library.spend(
    fixtures.policy,
    None,
    Member { key: fixtures.b, reference_index: 0 },
    fixtures.ref(99),
    tx,
  )
}

test absence_reads_a_gap() {
  let tx = Transaction {
    ..transaction.placeholder,
    reference_inputs: [
      fixtures.input(0, fixtures.node(fixtures.a, Some(fixtures.c))),
    ],
  }
  by_hand.spend(
    fixtures.policy,
    None,
    Absent { key: fixtures.b, reference_index: 0 },
    fixtures.ref(99),
    tx,
  ) && with_library.spend(
    fixtures.policy,
    None,
    Absent { key: fixtures.b, reference_index: 0 },
    fixtures.ref(99),
    tx,
  )
}

test absence_cannot_claim_the_anchor_is_absent() {
  !registry.proves(
    Absent { key: fixtures.a, reference_index: 0 },
    Some(fixtures.a),
    Some(fixtures.c),
  )
}

test absence_cannot_claim_the_successor_is_absent() {
  !registry.proves(
    Absent { key: fixtures.c, reference_index: 0 },
    Some(fixtures.a),
    Some(fixtures.c),
  )
}

test absence_before_first_and_after_last_and_in_empty_list() {
  registry.proves(
    Absent { key: fixtures.a, reference_index: 0 },
    None,
    Some(fixtures.b),
  ) && registry.proves(
    Absent { key: fixtures.c, reference_index: 0 },
    Some(fixtures.b),
    None,
  ) && registry.proves(
    Absent { key: fixtures.b, reference_index: 0 },
    None,
    None,
  )
}

test a_forged_node_at_the_right_address_is_not_a_proof() fail {
  let node = fixtures.node(fixtures.b, None)
  let fake = Output { ..node, value: assets.from_lovelace(10_000_000) }
  let tx = Transaction {
    ..transaction.placeholder,
    reference_inputs: [fixtures.input(0, fake)],
  }
  with_library.spend(
    fixtures.policy,
    None,
    Member { key: fixtures.b, reference_index: 0 },
    fixtures.ref(99),
    tx,
  )
}
