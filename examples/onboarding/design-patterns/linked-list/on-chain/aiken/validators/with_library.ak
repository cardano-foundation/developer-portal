use aiken/collection/list
use aiken_design_patterns/linked_list
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Output, OutputReference, Transaction}
use fixtures
use registry.{
  Deinit, Init, Insert, ListDatum, MintAction, NodeState, Remove, RootState,
  SpendAction, Structural, Update,
}

// #region validator
validator registry_list(seed: OutputReference, operator: ByteArray) {
  mint(action: MintAction, policy: PolicyId, tx: Transaction) {
    expect registry.authorized(operator, tx)
    when action is {
      Init { output_index } ->
        linked_list.init(
          registry.nonce_spent(seed, tx),
          list.expect_at(tx.outputs, output_index),
          tx.mint,
          fn(address, _ada, data) {
            let expected: Data = RootState { version: 0 }
            address.payment_credential == Script(policy) && data == expected
          },
        )
          |> linked_list.run_root_with(policy, registry.root_key)
      Insert { anchor_output, node_output } -> {
        let node = list.expect_at(tx.outputs, node_output)
        linked_list.insert_ascending(
          list.expect_at(tx.outputs, anchor_output),
          node,
          tx.inputs,
          tx.mint,
          fn(_anchor, delta, _key, _data, _ada, key, data, _link) {
            expect state: NodeState = data
            delta >= 0 && registry.valid_entry(key, state)
          },
        )
          |> linked_list.run_element_with(
              policy,
              registry.root_key,
              registry.node_prefix,
              registry.prefix_length,
            )
      }
      Remove { anchor_ref, anchor_output } ->
        linked_list.remove(
          anchor_ref,
          list.expect_at(tx.outputs, anchor_output),
          tx.inputs,
          tx.mint,
          fn(
            _anchor,
            delta,
            _key,
            _data,
            _removed,
            _ada,
            _removed_key,
            _removed_data,
            _link,
          ) {
            delta >= 0
          },
        )
          |> linked_list.run_element_with(
              policy,
              registry.root_key,
              registry.node_prefix,
              registry.prefix_length,
            )
      Deinit ->
        linked_list.deinit(tx.inputs, tx.mint, fn(_input, _ada, _data) { True })
          |> linked_list.run_root_with(policy, registry.root_key)
    }
  }

  spend(
    _datum: Option<ListDatum>,
    action: SpendAction,
    ref: OutputReference,
    tx: Transaction,
  ) {
    expect registry.authorized(operator, tx)
    let input_index = when action is {
      Structural { input_index } | Update { input_index, .. } -> input_index
    }
    let input = list.expect_at(tx.inputs, input_index)
    expect input.output_reference == ref
    let policy = registry.policy_of(input)
    when action is {
      Structural { .. } ->
        linked_list.spend_for_adding_or_removing_an_element(policy, tx.mint)
      Update { output_index, .. } ->
        linked_list.spend_for_updating_elements_data(
          input_index,
          output_index,
          ref,
          tx.inputs,
          tx.outputs,
          tx.mint,
          fn(_address, delta, key, _old, new, _link) {
            expect Some(key) = key
            expect state: NodeState = new
            delta >= 0 && registry.valid_entry(key, state)
          },
        )
          |> linked_list.run_element_with(
              policy,
              registry.root_key,
              registry.node_prefix,
              registry.prefix_length,
            )
    }
  }

  else(_) {
    fail
  }
}

// #endregion validator

test inserts_between_two_nodes() {
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 0, node_output: 1 },
    fixtures.policy,
    fixtures.insertion(),
  )
}

test removes_the_linked_node() {
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Remove { anchor_ref: fixtures.ref(0), anchor_output: 0 },
    fixtures.policy,
    fixtures.removal(),
  )
}

test refuses_a_reference_script_on_the_new_node() fail {
  let tx = fixtures.insertion()
  let node = list.expect_at(tx.outputs, 1)
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 0, node_output: 1 },
    fixtures.policy,
    Transaction {
      ..tx,
      outputs: [
        list.expect_at(tx.outputs, 0),
        Output { ..node, reference_script: Some(fixtures.policy) },
      ],
    },
  )
}
