// #region imports
use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/bytearray
use aiken_design_patterns/linked_list.{Element, Node, Root}
use cardano/address.{Script}
use cardano/assets.{Assets, PolicyId}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion imports

// #region types
/// Disjoint NFT namespaces: the empty name is the root; NODE + a 28-byte key
/// identifies a participant. Keys are compared lexicographically.
pub const root_key = #""

pub const node_prefix = "NODE"

pub const prefix_length = 4

pub type RootState {
  version: Int,
}

pub type NodeState {
  label: ByteArray,
}

pub type ListDatum =
  Element<RootState, NodeState>

/// The baseline stores every participant in one authenticated datum.
pub type Entry {
  key: ByteArray,
  state: NodeState,
}

pub type Registry {
  entries: List<Entry>,
}

// #endregion types

// #region actions
pub type MintAction {
  Init { output_index: Int }
  Insert { anchor_output: Int, node_output: Int }
  Remove { anchor_ref: OutputReference, anchor_output: Int }
  Deinit
}

pub type SpendAction {
  Structural { input_index: Int }
  Update { input_index: Int, output_index: Int }
}

pub type ArrayAction {
  Add { entry: Entry, output_index: Int }
  Delete { key: ByteArray, output_index: Int }
  Relabel { key: ByteArray, state: NodeState, output_index: Int }
  Close
}

/// Query demonstrations spend a separate probe, reading the registry without
/// spending it. In an application, the query key comes from its business rules.
pub type Query {
  Member { key: ByteArray, reference_index: Int }
  Absent { key: ByteArray, reference_index: Int }
}

// #endregion actions

// #region application
pub fn valid_entry(key: ByteArray, state: NodeState) -> Bool {
  bytearray.length(key) == 28 && bytearray.length(state.label) <= 32
}

pub fn authorized(operator: VerificationKeyHash, tx: Transaction) -> Bool {
  list.has(tx.extra_signatories, operator)
}

pub fn nonce_spent(seed: OutputReference, tx: Transaction) -> Bool {
  list.any(tx.inputs, fn(input) { input.output_reference == seed })
}

pub fn own_input(ref: OutputReference, inputs: List<Input>) -> Input {
  list.expect_find(inputs, fn(input) { input.output_reference == ref })
}

pub fn policy_of(input: Input) -> PolicyId {
  expect Script(policy) = input.output.address.payment_credential
  policy
}

pub fn only_mint(
  mint: Assets,
  policy: PolicyId,
  name: ByteArray,
  qty: Int,
) -> Bool {
  dict.to_pairs(assets.tokens(mint, policy)) == [Pair(name, qty)]
}

pub fn no_mint(mint: Assets, policy: PolicyId) -> Bool {
  dict.is_empty(assets.tokens(mint, policy))
}

// #endregion application

// #region authenticate
/// An address alone is not an identity. Require exactly ada and one NFT from
/// the pinned policy, an inline typed datum, and no reference script.
pub fn read_element(
  output: Output,
  policy: PolicyId,
) -> (Option<ByteArray>, ListDatum) {
  expect output.reference_script == None
  expect [(p, name, quantity)] = assets.flatten(
    assets.without_lovelace(output.value),
  )
  expect p == policy && quantity == 1
  expect InlineDatum(raw) = output.datum
  expect element: ListDatum = raw
  let key = when element.data is {
    Root { .. } -> {
      expect name == root_key
      None
    }
    Node { data } -> {
      expect bytearray.take(name, prefix_length) == node_prefix
      let key = bytearray.drop(name, prefix_length)
      expect valid_entry(key, data)
      Some(key)
    }
  }
  (key, element)
}

pub fn read_array(output: Output, policy: PolicyId) -> Registry {
  expect output.reference_script == None
  expect [(p, name, quantity)] = assets.flatten(
    assets.without_lovelace(output.value),
  )
  expect p == policy && name == root_key && quantity == 1
  expect InlineDatum(raw) = output.datum
  expect registry: Registry = raw
  registry
}

// #endregion authenticate

// #region ordering
/// Missing neighbors are the beginning/end of the list, not bytearray keys.
pub fn between(
  previous: Option<ByteArray>,
  key: ByteArray,
  next: Option<ByteArray>,
) -> Bool {
  let after_previous = when previous is {
    None -> True
    Some(previous) -> bytearray.compare(previous, key) == Less
  }
  let before_next = when next is {
    None -> True
    Some(next) -> bytearray.compare(key, next) == Less
  }
  after_previous && before_next
}

pub fn proves(
  query: Query,
  key: Option<ByteArray>,
  link: Option<ByteArray>,
) -> Bool {
  when query is {
    Member { key: wanted, .. } -> key == Some(wanted)
    Absent { key: wanted, .. } -> between(key, wanted, link)
  }
}

pub fn reference_index(query: Query) -> Int {
  when query is {
    Member { reference_index, .. } | Absent { reference_index, .. } ->
      reference_index
  }
}
// #endregion ordering
