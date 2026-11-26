//// Test-only values: the registry, its policy, holders and transactions that
//// change it. Only tests use them.

use aiken/crypto.{ScriptHash, VerificationKeyHash}
use cardano/address.{Address, Script, VerificationKey}
use cardano/assets.{Assets}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use names.{registry_token}

/// Stands in for the registry's script hash, which the tests cannot compute.
pub const policy: ScriptHash =
  #"000000000000000000000000000000000000000000000000000000ff"

/// The registry's address.
pub const registry_address: Address =
  Address { payment_credential: Script(policy), stake_credential: None }

/// The output the registry is created by spending.
pub const seed: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
    output_index: 0,
  }

/// Two keys names can point at.
pub const alice: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

pub const bob: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

pub fn ref(n: Int) -> OutputReference {
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: n,
  }
}

/// The registry UTxO, holding `datum`.
pub fn registry(datum: Data) -> Output {
  Output {
    address: registry_address,
    value: assets.from_lovelace(5_000_000)
      |> assets.add(policy, registry_token, 1),
    datum: InlineDatum(datum),
    reference_script: None,
  }
}

/// A UTxO of `owner`'s holding the token for `name`.
pub fn holding(owner: VerificationKeyHash, name: ByteArray) -> Input {
  Input {
    output_reference: ref(1),
    output: Output {
      address: Address {
        payment_credential: VerificationKey(owner),
        stake_credential: None,
      },
      value: assets.from_lovelace(2_000_000) |> assets.add(policy, name, 1),
      datum: NoDatum,
      reference_script: None,
    },
  }
}

/// A transaction that spends the registry holding `old`, recreates it holding
/// `new`, mints `mint`, and spends `others` too.
pub fn change(
  old: Data,
  new: Data,
  mint: Assets,
  others: List<Input>,
) -> Transaction {
  Transaction {
    ..transaction.placeholder,
    inputs: [
      Input { output_reference: ref(0), output: registry(old) },
      ..others
    ],
    outputs: [registry(new)],
    mint,
  }
}

/// Mint (or burn, when negative) `quantity` of `name`.
pub fn mint_name(name: ByteArray, quantity: Int) -> Assets {
  assets.from_asset(policy, name, quantity)
}
