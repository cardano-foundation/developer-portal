use aiken/collection/list
use aiken/primitive/bytearray
use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use fixtures
use manual
use registry.{
  Init, Insert, ListDatum, MintAction, SpendAction, Structural, Update,
}

// #region validator
validator registry_list(seed: OutputReference, operator: ByteArray) {
  mint(action: MintAction, policy: PolicyId, tx: Transaction) {
    expect registry.authorized(operator, tx)
    expect
      when action is {
        Init { .. } -> registry.nonce_spent(seed, tx)
        _ -> True
      }
    manual.transition(action, policy, tx)
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
      Structural { .. } -> !registry.no_mint(tx.mint, policy)
      Update { output_index, .. } -> {
        expect registry.no_mint(tx.mint, policy)
        let output = list.expect_at(tx.outputs, output_index)
        let (key, old) = registry.read_element(input.output, policy)
        let (next_key, next) = registry.read_element(output, policy)
        // Only node labels are mutable; root configuration stays fixed.
        expect Some(_) = key
        and {
          output.address == input.output.address,
          key == next_key,
          old.link == next.link,
          assets.lovelace_of(output.value) >= assets.lovelace_of(
            input.output.value,
          ),
        }
      }
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
    registry.Remove { anchor_ref: fixtures.ref(0), anchor_output: 0 },
    fixtures.policy,
    fixtures.removal(),
  )
}

test refuses_a_duplicate_key() fail {
  let tx = fixtures.insertion()
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 0, node_output: 1 },
    fixtures.policy,
    Transaction {
      ..tx,
      outputs: [
        fixtures.node(fixtures.a, Some(fixtures.a)),
        fixtures.node(fixtures.a, Some(fixtures.c)),
      ],
      mint: assets.zero
        |> assets.add(
            fixtures.policy,
            bytearray.concat(registry.node_prefix, fixtures.a),
            1,
          ),
    },
  )
}

test refuses_an_extra_authentic_input() fail {
  let tx = fixtures.insertion()
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 0, node_output: 1 },
    fixtures.policy,
    Transaction {
      ..tx,
      inputs: list.concat(
        tx.inputs,
        [fixtures.input(1, fixtures.node(fixtures.c, None))],
      ),
    },
  )
}

test refuses_a_wrong_output_index() fail {
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 1, node_output: 0 },
    fixtures.policy,
    fixtures.insertion(),
  )
}

test refuses_an_unsigned_transition() fail {
  let tx = fixtures.insertion()
  registry_list.mint(
    fixtures.ref(99),
    fixtures.operator,
    Insert { anchor_output: 0, node_output: 1 },
    fixtures.policy,
    Transaction { ..tx, extra_signatories: [] },
  )
}
