// #region shop-imports
use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/transaction.{Input, NoDatum, Output, OutputReference, Transaction}

// #endregion shop-imports

// The gift card from the Intermediate track, grown into a shop. The shop signs
// to create as many cards as it likes, and each card is backed by its own UTxO
// at this script's address. Burning a card releases the funds behind it.
//
// This is the contract as first written. The spend handler asks whether a card
// is being burned, and nothing more. giftcard_shop.ak is the closed version,
// and the Advanced lecture "Detecting vulnerabilities" walks from one to the
// other.
// #region shop
const card_name: ByteArray = "GIFT"

pub type CardAction {
  Create
  Burn
}

validator giftcard_shop(shop: VerificationKeyHash) {
  mint(redeemer: CardAction, policy_id: PolicyId, self: Transaction) {
    expect [Pair(name, quantity)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    and {
      (name == card_name)?,
      when redeemer is {
        Create -> and {
            (quantity >= 1)?,
            list.has(self.extra_signatories, shop)?,
          }
        Burn -> and {
            (quantity <= -1)?,
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
    expect Some(own_input) = list.find(
      self.inputs,
      fn(input) { input.output_reference == own_ref },
    )
    expect Script(policy_id) = own_input.output.address.payment_credential
    expect [Pair(name, quantity)] = assets.tokens(self.mint, policy_id)
      |> dict.to_pairs()
    and {
      (name == card_name)?,
      (quantity == -1)?,
    }
  }

  else(_) {
    fail
  }
}

// #endregion shop

// Tests.
// #region shop-tests

// The script's own hash, which is also its policy id. 28 bytes, like any hash.
const policy: PolicyId =
  #"000000000000000000000000000000000000000000000000000000ff"

// The script's own address, holding the policy id as its payment credential.
const script_address: Address =
  Address { payment_credential: Script(policy), stake_credential: None }

// The shop's key hash, the parameter every call leads with.
const shop_key: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

// Somebody who is not the shop.
const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

// A UTxO at the script's address, behind one card.
const locked_a: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// One UTxO being spent. Only its reference and its address matter here.
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

test create_ok_when_the_shop_signs() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [shop_key],
    mint: assets.from_asset(policy, card_name, 3),
  }
  giftcard_shop.mint(shop_key, Create, policy, tx)
}

test create_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger],
    mint: assets.from_asset(policy, card_name, 3),
  }
  giftcard_shop.mint(shop_key, Create, policy, tx)
}

test burn_ok_when_a_locked_utxo_is_spent() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(locked_a, script_address)],
    mint: assets.from_asset(policy, card_name, -1),
  }
  giftcard_shop.mint(shop_key, Burn, policy, tx)
}

test redeem_ok_when_the_card_is_burned() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(locked_a, script_address)],
    mint: assets.from_asset(policy, card_name, -1),
  }
  giftcard_shop.spend(shop_key, None, Void, locked_a, tx)
}

test redeem_fails_when_the_card_is_kept() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [input_at(locked_a, script_address)],
  }
  giftcard_shop.spend(shop_key, None, Void, locked_a, tx)
}

// #endregion shop-tests

// The attack, written as a test. One card is burned and two locked UTxOs are
// spent. Every handler the transaction runs says yes, so this test passes,
// and that is the problem.
// #region attack-test
// A second UTxO at the script's address, behind a card the attacker never bought.
const locked_b: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 1,
  }

test one_card_takes_two_utxos() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [
      input_at(locked_a, script_address),
      input_at(locked_b, script_address),
    ],
    mint: assets.from_asset(policy, card_name, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(shop_key, None, Void, locked_a, tx),
    giftcard_shop.spend(shop_key, None, Void, locked_b, tx),
  }
}
// #endregion attack-test
