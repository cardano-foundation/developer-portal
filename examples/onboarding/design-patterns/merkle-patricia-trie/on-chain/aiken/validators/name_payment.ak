use aiken/collection/list
use aiken/merkle_patricia_forestry.{Proof} as mpf
use cardano/address.{Address, VerificationKey}
use cardano/assets.{PolicyId}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use fixtures.{alice, bob, policy, ref, registry}
use names.{registry_token}

// #region name-payment
/// Where a name points, with the proof.
pub type Resolution {
  target: ByteArray,
  proof: Proof,
}

/// ADA sent to a name. The datum is the name. Anyone may release the payment,
/// to the key the name points to at that moment, proven against the registry
/// read as a reference input.
validator name_payment(registry_policy: PolicyId) {
  spend(
    datum: Option<ByteArray>,
    resolution: Resolution,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(name) = datum
    // The registry is whichever reference input holds the registry token.
    expect Some(registry) = list.find(
      self.reference_inputs,
      fn(input) {
        assets.quantity_of(input.output.value, registry_policy, registry_token) == 1
      },
    )
    expect InlineDatum(root) = registry.output.datum
    expect root: ByteArray = root
    expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
    let tag: Data = own_ref
    and {
      mpf.has(mpf.from_root(root), name, resolution.target, resolution.proof),
      // Paid to that key, tagged so one payment cannot serve two.
      list.any(
        self.outputs,
        fn(output) {
          and {
            output.address.payment_credential == VerificationKey(
              resolution.target,
            ),
            output.datum == InlineDatum(tag),
            assets.lovelace_of(output.value) >= assets.lovelace_of(
              own_input.output.value,
            ),
          }
        },
      ),
    }
  }

  else(_) {
    fail
  }
}

// #endregion name-payment

fn pay(target: ByteArray, lovelace: Int, from: OutputReference) -> Output {
  let tag: Data = from
  Output {
    address: Address {
      payment_credential: VerificationKey(target),
      stake_credential: None,
    },
    value: assets.from_lovelace(lovelace),
    datum: InlineDatum(tag),
    reference_script: None,
  }
}

fn release(target: ByteArray, paid_to: ByteArray) -> Bool {
  let root: Data = mpf.root(mpf.insert(mpf.empty, "alice", alice, []))
  let payment = Input {
    output_reference: ref(5),
    output: Output {
      address: Address {
        payment_credential: address.Script(
          #"00000000000000000000000000000000000000000000000000000077",
        ),
        stake_credential: None,
      },
      value: assets.from_lovelace(10_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [payment],
    reference_inputs: [
      Input { output_reference: ref(0), output: registry(root) },
    ],
    outputs: [pay(paid_to, 10_000_000, ref(5))],
  }
  name_payment.spend(
    policy,
    Some("alice"),
    Resolution { target, proof: [] },
    ref(5),
    tx,
  )
}

test release_ok_to_where_the_name_points() {
  release(alice, alice)
}

test release_fails_claiming_the_name_points_elsewhere() fail {
  release(bob, bob)
}
