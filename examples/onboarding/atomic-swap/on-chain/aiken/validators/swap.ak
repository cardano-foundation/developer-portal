use aiken/collection/list
use cardano/address.{Address, Inline, VerificationKey, from_verification_key}
use cardano/assets.{
  AssetName, Assets, PolicyId, from_asset, from_lovelace, quantity_of,
}
use cardano/transaction.{
  Datum, InlineDatum, NoDatum, Output, OutputReference, Transaction,
}

// #region types
// One asset the maker wants in return, with the exact quantity.
pub type PricedAsset {
  policy_id: PolicyId,
  asset_name: AssetName,
  quantity: Int,
}

// The offer, attached to the locked UTxO as an inline datum.
pub type SwapDatum {
  // The maker's full wallet address: where the payment must go, and (through its
  // payment key) who may cancel. Storing the whole address, not just a key hash,
  // means the payment lands where the maker's wallet can actually see it.
  owner: Address,
  // What the maker wants in return for the locked asset.
  price: List<PricedAsset>,
}

// What the spender wants to do with the locked UTxO.
pub type SwapAction {
  // A taker fulfills the offer by paying the price to the owner.
  Swap
  // The owner reclaims the locked asset.
  Cancel
}

// #endregion types

// #region validator
validator swap {
  // `spend` defines the rules for spending (taking) a UTxO locked at this contract.
  spend(
    datum: Option<SwapDatum>,
    redeemer: SwapAction,
    own_ref: OutputReference,
    tx: Transaction,
  ) {
    // Extract the offer terms, the `owner` to pay and the `price`, from the datum.
    expect Some(SwapDatum { owner, price }) = datum
    when redeemer is {
      // The owner reclaims the offer: prove it's them by signing with the
      // payment key of their address.
      Cancel -> {
        // A wallet address's payment credential is a `VerificationKey` (a public
        // key hash). Pull that key hash out.
        expect VerificationKey(owner_key) = owner.payment_credential
        // `tx.extra_signatories` is the list of key hashes that signed this
        // transaction; require the owner's to be among them.
        list.has(tx.extra_signatories, owner_key)
      }
      // A taker fulfills the offer.
      Swap -> {
        // Exactly one output must be "marked" with this UTxO's own reference as
        // its inline datum. Matching the filtered list as a singleton `[payment]`
        // fails unless there's exactly one such output, so a single payment can
        // settle exactly one swap (no double satisfaction).
        expect [payment] = list.filter(
          tx.outputs,
          fn(output) { marked_with(output, own_ref) },
        )
        // ...and that payment must go to the owner and cover the full price.
        pays_to_owner(payment, owner) && covers_price(payment.value, price)
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion validator

// #region helpers
// Is this output tagged with `expected` (the spent UTxO's reference) as its
// inline datum? `expected` is typed as `Data` so the `OutputReference` passed
// at the call site is upcast and compared against the raw inline datum.
fn marked_with(output: Output, expected: Data) -> Bool {
  when output.datum is {
    InlineDatum(data) -> data == expected
    _ -> False
  }
}

// Does this output pay to the owner's exact wallet address? Comparing the whole
// address (payment key AND stake key) makes the funds land where the owner's
// wallet can see them, not at a bare payment-key address it would overlook.
fn pays_to_owner(output: Output, owner: Address) -> Bool {
  output.address == owner
}

// Does `value` contain at least each asset in `price`?
fn covers_price(value: Assets, price: List<PricedAsset>) -> Bool {
  list.all(
    price,
    fn(asset) {
      quantity_of(value, asset.policy_id, asset.asset_name) >= asset.quantity
    },
  )
}

// #endregion helpers

// Tests (not imported into the docs).

// Key hashes and policy ids are 28 bytes, so any 28 bytes stand in for one.
const owner_key = #"00000000000000000000000000000000000000000000000000000001"

const owner_stake_key =
  #"00000000000000000000000000000000000000000000000000000003"

const silver = #"00000000000000000000000000000000000000000000000000000002"

// The offer being spent. Its reference is what the payment has to be marked with.
const own_ref =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// The owner's full wallet address: payment key + stake key.
const owner_address =
  Address {
    payment_credential: VerificationKey(owner_key),
    stake_credential: Some(Inline(VerificationKey(owner_stake_key))),
  }

const offer =
  SwapDatum {
    owner: owner_address,
    price: [
      PricedAsset { policy_id: silver, asset_name: "SILVER", quantity: 1 },
    ],
  }

// One output, to `address`, holding `value`, carrying `datum`.
fn output(address: Address, value: Assets, datum: Datum) -> Output {
  Output { address, value, datum, reference_script: None }
}

// The marker: this UTxO's reference as the payment's inline datum.
const marked = InlineDatum(own_ref)

test swap_ok_when_owner_paid_and_marked() {
  let tx = Transaction {
    ..transaction.placeholder,
    outputs: [output(owner_address, from_asset(silver, "SILVER", 1), marked)],
  }
  swap.spend(Some(offer), Swap, own_ref, tx)
}

test swap_fails_when_payment_not_marked() fail {
  // Owner is paid, but the output is not marked with this UTxO's reference.
  let tx = Transaction {
    ..transaction.placeholder,
    outputs: [output(owner_address, from_asset(silver, "SILVER", 1), NoDatum)],
  }
  swap.spend(Some(offer), Swap, own_ref, tx)
}

test swap_fails_when_underpaid() fail {
  // Output is marked, but pays no SILVER (only lovelace).
  let tx = Transaction {
    ..transaction.placeholder,
    outputs: [output(owner_address, from_lovelace(2_000_000), marked)],
  }
  swap.spend(Some(offer), Swap, own_ref, tx)
}

test swap_fails_when_paid_to_bare_payment_address() fail {
  // Pays the right payment key but at a bare enterprise address (no stake part),
  // so it isn't the owner's real wallet address. Rejected.
  let tx = Transaction {
    ..transaction.placeholder,
    outputs: [
      output(
        from_verification_key(owner_key),
        from_asset(silver, "SILVER", 1),
        marked,
      ),
    ],
  }
  swap.spend(Some(offer), Swap, own_ref, tx)
}

test cancel_ok_when_signed_by_owner() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [owner_key],
  }
  swap.spend(Some(offer), Cancel, own_ref, tx)
}

test cancel_fails_when_not_signed() fail {
  swap.spend(Some(offer), Cancel, own_ref, transaction.placeholder)
}
