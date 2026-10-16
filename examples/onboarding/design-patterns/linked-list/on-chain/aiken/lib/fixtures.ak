use aiken/primitive/bytearray
use aiken_design_patterns/linked_list.{Element, Node, Root}
use cardano/address.{Address, Script}
use cardano/assets
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use registry.{ListDatum, NodeState, RootState}

pub const policy = #"000000000000000000000000000000000000000000000000000000ff"

pub const operator = #"00000000000000000000000000000000000000000000000000000001"

pub const a = #"0000000000000000000000000000000000000000000000000000000a"

pub const b = #"0000000000000000000000000000000000000000000000000000000b"

pub const c = #"0000000000000000000000000000000000000000000000000000000c"

pub fn ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

pub fn output(name: ByteArray, datum: Data) -> Output {
  Output {
    address: Address {
      payment_credential: Script(policy),
      stake_credential: None,
    },
    value: assets.from_lovelace(10_000_000) |> assets.add(policy, name, 1),
    datum: InlineDatum(datum),
    reference_script: None,
  }
}

pub fn root(link: Option<ByteArray>) -> Output {
  let datum: ListDatum = Element {
    data: Root { data: RootState { version: 0 } },
    link,
  }
  output(registry.root_key, datum)
}

pub fn node(key: ByteArray, link: Option<ByteArray>) -> Output {
  let datum: ListDatum = Element {
    data: Node { data: NodeState { label: "participant" } },
    link,
  }
  output(bytearray.concat(registry.node_prefix, key), datum)
}

pub fn input(n: Int, output: Output) -> Input {
  Input { output_reference: ref(n), output }
}

pub fn insertion() -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [input(0, node(a, Some(c)))],
    outputs: [node(a, Some(b)), node(b, Some(c))],
    mint: assets.zero
      |> assets.add(policy, bytearray.concat(registry.node_prefix, b), 1),
    extra_signatories: [operator],
  }
}

pub fn removal() -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [input(0, node(a, Some(b))), input(1, node(b, Some(c)))],
    outputs: [node(a, Some(c))],
    mint: assets.zero
      |> assets.add(policy, bytearray.concat(registry.node_prefix, b), -1),
    extra_signatories: [operator],
  }
}
