use aiken/collection/list
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Output, OutputReference, Transaction}
use fixtures
use registry.{
  Add, ArrayAction, Close, Deinit, Delete, Init, MintAction, Registry, Relabel,
}

// #region validator
validator registry_array(seed: OutputReference, operator: ByteArray) {
  mint(action: MintAction, policy: PolicyId, tx: Transaction) {
    expect registry.authorized(operator, tx)
    when action is {
      Init { output_index } -> {
        expect registry.nonce_spent(seed, tx)
        let output = list.expect_at(tx.outputs, output_index)
        expect registry.read_array(output, policy) == Registry { entries: [] }
        output.address.payment_credential == Script(policy) && registry.only_mint(
          tx.mint,
          policy,
          registry.root_key,
          1,
        )
      }
      Deinit -> registry.only_mint(tx.mint, policy, registry.root_key, -1)
      _ -> fail
    }
  }

  spend(
    _datum: Option<Registry>,
    action: ArrayAction,
    ref: OutputReference,
    tx: Transaction,
  ) {
    expect registry.authorized(operator, tx)
    let input = registry.own_input(ref, tx.inputs)
    let policy = registry.policy_of(input)
    let old = registry.read_array(input.output, policy)
    when action is {
      Close ->
        old.entries == [] && registry.only_mint(
          tx.mint,
          policy,
          registry.root_key,
          -1,
        )
      _ -> {
        expect registry.no_mint(tx.mint, policy)
        let (entries, output_index) = when action is {
          Add { entry, output_index } -> {
            expect registry.valid_entry(entry.key, entry.state)
            expect !list.any(old.entries, fn(e) { e.key == entry.key })
            (list.concat(old.entries, [entry]), output_index)
          }
          Delete { key, output_index } -> {
            expect list.any(old.entries, fn(e) { e.key == key })
            (list.filter(old.entries, fn(e) { e.key != key }), output_index)
          }
          Relabel { key, state, output_index } -> {
            expect registry.valid_entry(key, state)
            expect list.any(old.entries, fn(e) { e.key == key })
            (
              list.map(
                old.entries,
                fn(e) {
                  if e.key == key {
                    registry.Entry { ..e, state }
                  } else {
                    e
                  }
                },
              ),
              output_index,
            )
          }
          Close -> fail
        }
        let output = list.expect_at(tx.outputs, output_index)
        and {
          output.address == input.output.address,
          registry.read_array(output, policy) == Registry { entries },
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

fn addition() -> Transaction {
  let old: Registry = Registry {
    entries: [
      registry.Entry {
        key: fixtures.a,
        state: registry.NodeState { label: "A" },
      },
    ],
  }
  let next: Registry = Registry {
    entries: list.concat(
      old.entries,
      [
        registry.Entry {
          key: fixtures.b,
          state: registry.NodeState { label: "B" },
        },
      ],
    ),
  }
  Transaction {
    ..transaction.placeholder,
    inputs: [fixtures.input(0, fixtures.output(registry.root_key, old))],
    outputs: [fixtures.output(registry.root_key, next)],
    extra_signatories: [fixtures.operator],
  }
}

fn add_action() -> ArrayAction {
  Add {
    entry: registry.Entry {
      key: fixtures.b,
      state: registry.NodeState { label: "B" },
    },
    output_index: 0,
  }
}

test adds_one_new_entry() {
  registry_array.spend(
    fixtures.ref(99),
    fixtures.operator,
    None,
    add_action(),
    fixtures.ref(0),
    addition(),
  )
}

test refuses_duplicate_entry() fail {
  let action = Add {
    entry: registry.Entry {
      key: fixtures.a,
      state: registry.NodeState { label: "duplicate" },
    },
    output_index: 0,
  }
  registry_array.spend(
    fixtures.ref(99),
    fixtures.operator,
    None,
    action,
    fixtures.ref(0),
    addition(),
  )
}

test refuses_an_unsigned_add() fail {
  let tx = addition()
  registry_array.spend(
    fixtures.ref(99),
    fixtures.operator,
    None,
    add_action(),
    fixtures.ref(0),
    Transaction { ..tx, extra_signatories: [] },
  )
}

test refuses_a_fake_registry() fail {
  let tx = addition()
  let input = list.expect_at(tx.inputs, 0)
  let fake = Output { ..input.output, value: assets.from_lovelace(10_000_000) }
  registry_array.spend(
    fixtures.ref(99),
    fixtures.operator,
    None,
    add_action(),
    fixtures.ref(0),
    Transaction { ..tx, inputs: [fixtures.input(0, fake)] },
  )
}
