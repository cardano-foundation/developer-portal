// #region giftcard-imports
use aiken/collection/dict
use aiken/collection/list
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}
// #endregion giftcard-imports

// One validator, two handlers, cooperating inside a single transaction. The
// token is the key: creating one makes a gift card, burning it releases the
// funds locked at this same script's address.
//
// The policy is compiled around one UTxO. Creating a card requires that UTxO to
// be spent, and a UTxO can only be spent once, so the card can only be created
// once. That is what makes it an NFT.
//
// Destroying a card requires spending a UTxO at this same script's address, so
// the card cannot be destroyed on its own. Only one card can ever exist, so a
// card burnt by itself would strand the funds behind it for good.
// #region giftcard
const card_name: ByteArray = "GIFT"

pub type CardAction {
  Create
  Burn
}

validator giftcard(utxo_ref: OutputReference) {
  mint(redeemer: CardAction, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, quantity)] =
      assets.tokens(self.mint, policy_id) |> dict.to_pairs()
    and {
      (name == card_name)?,
      when redeemer is {
        Create -> and {
            (quantity == 1)?,
            list.any(
              self.inputs,
              fn(input) { input.output_reference == utxo_ref },
            )?,
          }
        Burn -> and {
            (quantity == -1)?,
            list.any(
              self.inputs,
              fn(input) {
                input.output.address.payment_credential == Script(policy_id)
              },
            )?,
          }
      },
    }
  }

  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(own_input) =
      list.find(self.inputs, fn(input) { input.output_reference == own_ref })
    expect Script(policy_id) = own_input.output.address.payment_credential
    expect [Pair(name, quantity)] =
      assets.tokens(self.mint, policy_id) |> dict.to_pairs()
    and {
      (name == card_name)?,
      (quantity == -1)?,
    }
  }

  else(_) {
    fail
  }
}

// #endregion giftcard

// Tests.
// #region giftcard-tests

// The script's own hash, which is also its policy id. 28 bytes, like any hash.
const policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000ff"

// The script's own address. Its payment credential holds the policy id, which
// is what the spend handler reads back out of it.
const script_address: Address =
  Address { payment_credential: Script(policy), stake_credential: None }

// An ordinary wallet address, for the UTxO the seed is spent from.
const wallet_address: Address =
  Address {
    payment_credential: VerificationKey(
      #"00000000000000000000000000000000000000000000000000000001",
    ),
    stake_credential: None,
  }

// The UTxO the policy is compiled around. Spending it is what allows the card
// to be created. A transaction id is 32 bytes.
const seed: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
    output_index: 0,
  }

// Some other UTxO, which is not the seed.
const other_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000002",
    output_index: 0,
  }

// The UTxO at the script's address that the spend handler is guarding.
const own_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// One UTxO being spent. Only two things about it matter: the reference, which
// the handlers compare against, and the address, which the spend handler reads
// the policy id out of.
fn input_at(ref: OutputReference, address: Address) -> Input {
  Input {
    output_reference: ref,
    output: Output {
      address,
      value: from_lovelace(5_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
}

test create_ok_when_the_seed_is_spent() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(seed, wallet_address)],
    mint: assets.from_asset(policy, card_name, 1),
  }
  giftcard.mint(seed, Create, policy, tx)
}

test create_fails_without_the_seed() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(other_ref, wallet_address)],
    mint: assets.from_asset(policy, card_name, 1),
  }
  giftcard.mint(seed, Create, policy, tx)
}

test create_fails_for_two_cards() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(seed, wallet_address)],
    mint: assets.from_asset(policy, card_name, 2),
  }
  giftcard.mint(seed, Create, policy, tx)
}

test burn_ok_when_the_locked_utxo_is_spent() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(own_ref, script_address)],
    mint: assets.from_asset(policy, card_name, -1),
  }
  giftcard.mint(seed, Burn, policy, tx)
}

// Destroying the card on its own would leave the funds with nothing that can
// ever release them, since no second card can be created.
test burn_fails_on_its_own() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    mint: assets.from_asset(policy, card_name, -1),
  }
  giftcard.mint(seed, Burn, policy, tx)
}

test redeem_ok_when_the_card_is_burned() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(own_ref, script_address)],
    mint: assets.from_asset(policy, card_name, -1),
  }
  giftcard.spend(seed, None, Void, own_ref, tx)
}

test redeem_fails_when_the_card_is_kept() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(own_ref, script_address)],
  }
  giftcard.spend(seed, None, Void, own_ref, tx)
}
// #endregion giftcard-tests
