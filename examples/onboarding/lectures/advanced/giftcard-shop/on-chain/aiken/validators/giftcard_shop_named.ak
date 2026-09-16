// #region named-imports
use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId, from_lovelace}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion named-imports

// The gift card shop with both doors closed. Every card has its own name, the
// UTxO locked behind a card carries that name in its datum, and the spend
// handler asks for the card named in its own datum, counted per name.
// giftcard_shop.ak is the version with only the count, and the Advanced
// lecture "Detecting vulnerabilities" walks from one to the other.
// #region named
pub type CardAction {
  Create
  Burn
}

/// The datum of a locked UTxO: the name of the card that releases it.
pub type CardDatum {
  card: ByteArray,
}

validator giftcard_shop(shop: VerificationKeyHash) {
  mint(redeemer: CardAction, policy_id: PolicyId, self: Transaction) {
    let tokens = assets.tokens(self.mint, policy_id) |> dict.to_pairs()
    when redeemer is {
      Create -> and {
          list.all(tokens, fn(token) { token.2nd >= 1 })?,
          list.has(self.extra_signatories, shop)?,
        }
      Burn -> and {
          list.all(tokens, fn(token) { token.2nd <= -1 })?,
          list.any(
            self.inputs,
            fn(input) {
              input.output.address.payment_credential == Script(policy_id)
            },
          )?,
        }
    }
  }

  // #region spend-named
  spend(
    datum: Option<CardDatum>,
    _redeemer: Data,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(CardDatum { card }) = datum
    expect Some(own_input) = list.find(
      self.inputs,
      fn(input) { input.output_reference == own_ref },
    )
    expect Script(policy_id) = own_input.output.address.payment_credential
    let burned = assets.quantity_of(self.mint, policy_id, card)
    let locked = list.count(
      self.inputs,
      fn(input) { locks_card(input, policy_id, card) },
    )
    (burned == -locked)?
  }

  // #endregion spend-named
  else(_) {
    fail
  }
}

// #region locks-card
/// Whether an input is a UTxO at the script's address whose datum names this card.
fn locks_card(input: Input, policy_id: PolicyId, card: ByteArray) -> Bool {
  if input.output.address.payment_credential == Script(policy_id) {
    when input.output.datum is {
      InlineDatum(data) -> {
        expect CardDatum { card: named } = data
        named == card
      }
      _ -> False
    }
  } else {
    False
  }
}

// #endregion locks-card
// #endregion named

// #region named-tests

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

// Two cards, each with its own name.
const card_1: ByteArray = "card-1"

const card_2: ByteArray = "card-2"

// The UTxO locked behind each card.
const locked_1: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

const locked_2: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 1,
  }

// A UTxO at the script's address, holding the name of its card in the datum.
fn locked_for(ref: OutputReference, card: ByteArray, lovelace: Int) -> Input {
  let datum: Data = CardDatum { card }
  Input {
    output_reference: ref,
    output: Output {
      address: script_address,
      value: from_lovelace(lovelace),
      datum: InlineDatum(datum),
      reference_script: None,
    },
  }
}

test create_ok_when_the_shop_signs() {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [shop_key],
    mint: assets.from_asset(policy, card_1, 1)
      |> assets.merge(assets.from_asset(policy, card_2, 1)),
  }
  giftcard_shop.mint(shop_key, Create, policy, tx)
}

test create_fails_for_a_stranger() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    extra_signatories: [stranger],
    mint: assets.from_asset(policy, card_1, 1),
  }
  giftcard_shop.mint(shop_key, Create, policy, tx)
}

test redeem_ok_when_the_named_card_is_burned() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [locked_for(locked_1, card_1, 5_000_000)],
    mint: assets.from_asset(policy, card_1, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_1 }),
      Void,
      locked_1,
      tx,
    ),
  }
}

test redeem_fails_when_the_card_is_kept() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [locked_for(locked_1, card_1, 5_000_000)],
  }
  giftcard_shop.spend(
    shop_key,
    Some(CardDatum { card: card_1 }),
    Void,
    locked_1,
    tx,
  )
}

// The first door: one burned card, two locked UTxOs.
test one_card_takes_two_utxos() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [
      locked_for(locked_1, card_1, 5_000_000),
      locked_for(locked_2, card_2, 5_000_000),
    ],
    mint: assets.from_asset(policy, card_1, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_1 }),
      Void,
      locked_1,
      tx,
    ),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_2 }),
      Void,
      locked_2,
      tx,
    ),
  }
}

// The second door: card 1 was sold for 5 ADA, and the UTxO behind card 2 holds 50.
test a_card_takes_another_cards_utxo() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [locked_for(locked_2, card_2, 50_000_000)],
    mint: assets.from_asset(policy, card_1, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_2 }),
      Void,
      locked_2,
      tx,
    ),
  }
}

// The count still counts, per name: two cards with the same name, one burned.
test one_of_two_same_name_cards_takes_two_utxos() fail {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [
      locked_for(locked_1, card_1, 5_000_000),
      locked_for(locked_2, card_1, 5_000_000),
    ],
    mint: assets.from_asset(policy, card_1, -1),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_1 }),
      Void,
      locked_1,
      tx,
    ),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_1 }),
      Void,
      locked_2,
      tx,
    ),
  }
}

// The honest redeem of two cards at once.
test two_cards_take_their_two_utxos() {
  let tx = Transaction {
    ..transaction.placeholder,
    inputs: [
      locked_for(locked_1, card_1, 5_000_000),
      locked_for(locked_2, card_2, 50_000_000),
    ],
    mint: assets.from_asset(policy, card_1, -1)
      |> assets.merge(assets.from_asset(policy, card_2, -1)),
  }
  and {
    giftcard_shop.mint(shop_key, Burn, policy, tx),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_1 }),
      Void,
      locked_1,
      tx,
    ),
    giftcard_shop.spend(
      shop_key,
      Some(CardDatum { card: card_2 }),
      Void,
      locked_2,
      tx,
    ),
  }
}
// #endregion named-tests
