use aiken/crypto.{sha2_256}
use aiken/primitive/bytearray
use allowlist.{CommittedGrant, Left, ListedGrant, Proof, Right}
use cardano/transaction.{OutputReference, Transaction}

pub const alice = #"00000000000000000000000000000000000000000000000000000001"

pub const bob = #"00000000000000000000000000000000000000000000000000000002"

pub const carol = #"00000000000000000000000000000000000000000000000000000003"

pub const stranger = #"00000000000000000000000000000000000000000000000000000004"

pub const members = [alice, bob, carol]

pub fn leaf(key: ByteArray) -> ByteArray {
  sha2_256(allowlist.serialise_member(key))
}

pub fn root_hash() -> ByteArray {
  sha2_256(
    bytearray.concat(
      leaf(alice),
      sha2_256(bytearray.concat(leaf(bob), leaf(carol))),
    ),
  )
}

pub fn bob_proof() -> Proof {
  [Right { hash: leaf(carol) }, Left { hash: leaf(alice) }]
}

pub fn grant() -> CommittedGrant {
  CommittedGrant { root: root_hash() }
}

pub fn listed() -> ListedGrant {
  ListedGrant { members }
}

pub fn ref() -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }
}

pub fn signed_by(key: ByteArray) -> Transaction {
  Transaction { ..transaction.placeholder, extra_signatories: [key] }
}
