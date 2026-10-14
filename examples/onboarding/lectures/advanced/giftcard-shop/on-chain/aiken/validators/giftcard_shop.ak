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
// This is the closed version. The spend handler counts the locked UTxOs being
// spent and asks for one burned card per UTxO. giftcard_shop_open.ak is the
// contract as first written, and the Advanced lecture "Detecting
// vulnerabilities" walks from one to the other.
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

  // #region spend-closed
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
    let locked = list.count(
      self.inputs,
      fn(input) { input.output.address.payment_credential == Script(policy_id) },
    )
    and {
      (name == card_name)?,
      (quantity == -locked)?,
    }
  }

  // #endregion spend-closed

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

// The same attack. With the count in place, one of the three handlers says no,
// so the test fails, which is what `fail` asks for.
// #region attack-test-closed
// A second UTxO at the script's address, behind a card the attacker never bought.
const locked_b: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 1,
  }

test one_card_takes_two_utxos() fail {
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

test two_cards_take_two_utxos() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [
      input_at(locked_a, script_address),
      input_at(locked_b, script_address),
    ],
    mint: assets.from_asset(policy, card_name, -2),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(shop_key, None, Void, locked_a, tx),
    giftcard_shop.spend(shop_key, None, Void, locked_b, tx),
  }
}

// #endregion attack-test-closed

// #region attack-any-utxo
// The customer's card was sold for 5 ADA. The UTxO behind somebody else's
// card holds 50 ADA. Nothing ties a card to the UTxO it may release.
test a_card_takes_another_cards_utxo() {
  let expensive = Input {
    output_reference: locked_b,
    output: Output {
      address: script_address,
      value: from_lovelace(50_000_000),
      datum: NoDatum,
      reference_script: None,
    },
  }
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [expensive],
    mint: assets.from_asset(policy, card_name, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(shop_key, None, Void, locked_b, tx),
  }
}
// #endregion attack-any-utxo
