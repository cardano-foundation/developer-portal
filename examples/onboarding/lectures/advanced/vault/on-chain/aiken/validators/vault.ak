// #region vault-imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}

// #endregion vault-imports

// A vault that belongs to one owner, whose key hash is the datum. The owner may
// take everything. Anybody else may donate: spend the vault and put it back
// with more ADA in it. The vault is the UTxO at this script's address that
// holds the beacon NFT.
//
// This is the closed version. A donation puts the vault back at exactly the
// address it came from, stake part included. vault_open.ak is the contract as
// first written, and the Advanced lecture "Detecting vulnerabilities" walks
// from one to the other.
// #region vault
pub type AssetClass {
  policy_id: PolicyId,
  name: ByteArray,
}

pub type VaultAction {
  Consume
  Donate
}

validator vault(beacon: AssetClass) {
  spend(
    datum: Option<VerificationKeyHash>,
    redeemer: VaultAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(owner) = datum
    when redeemer is {
      Consume -> list.has(self.extra_signatories, owner)?
      Donate -> {
        expect Some(own_input) = transaction.find_input(self.inputs, own_ref)
        let locked = own_input.output
        // Only the UTxO holding the beacon is the vault.
        expect assets.has_nft(locked.value, beacon.policy_id, beacon.name)
        // #region find-closed
        // The vault goes back to the same address, both parts of it.
        expect Some(new_vault) = list.find(
          self.outputs,
          fn(o) { o.address == locked.address },
        )
        // #endregion find-closed
        and {
          // The beacon goes with it.
          assets.has_nft(new_vault.value, beacon.policy_id, beacon.name)?,
          // The owner does not change.
          (new_vault.datum == InlineDatum(owner))?,
          // Every token stays exactly as it was, and the ADA may only grow.
          assets.match(new_vault.value, locked.value, >=)?,
        }
      }
    }
  }

  else(_) {
    fail
  }
}

// #endregion vault

// Tests.
// #region vault-tests

// The beacon that marks the vault.
const beacon: AssetClass =
  AssetClass {
    policy_id: #"000000000000000000000000000000000000000000000000000000bb",
    name: "VAULT",
  }

// The script's own hash, the payment part of its address.
const script_hash: ByteArray =
  #"000000000000000000000000000000000000000000000000000000ff"

// The script's own address. No stake part: nobody collects rewards on it.
const vault_address: Address =
  Address { payment_credential: Script(script_hash), stake_credential: None }

const owner: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000001"

// Somebody who is not the owner.
const stranger: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000002"

const vault_ref: OutputReference =
  OutputReference {
    transaction_id: #"0000000000000000000000000000000000000000000000000000000000000000",
    output_index: 0,
  }

// The vault at `address`, holding the beacon and `lovelace`.
fn vault_at(address: Address, lovelace: Int) -> Output {
  Output {
    address,
    value: assets.from_lovelace(lovelace)
      |> assets.add(beacon.policy_id, beacon.name, 1),
    datum: InlineDatum(owner),
    reference_script: None,
  }
}

// A transaction that spends the vault, holding 100 ADA, into `outputs`.
fn spend_vault(outputs: List<Output>, signers: List<VerificationKeyHash>) {
  Transaction {
    ..transaction.placeholder,
    inputs: [
      Input {
        output_reference: vault_ref,
        output: vault_at(vault_address, 100_000_000),
      },
    ],
    outputs,
    extra_signatories: signers,
  }
}

test consume_ok_when_the_owner_signs() {
  let tx = spend_vault([], [owner])
  vault.spend(beacon, Some(owner), Consume, vault_ref, tx)
}

test consume_fails_for_a_stranger() fail {
  let tx = spend_vault([], [stranger])
  vault.spend(beacon, Some(owner), Consume, vault_ref, tx)
}

test donate_ok_when_the_vault_grows() {
  let tx = spend_vault([vault_at(vault_address, 110_000_000)], [stranger])
  vault.spend(beacon, Some(owner), Donate, vault_ref, tx)
}

test donate_fails_when_the_vault_shrinks() fail {
  let tx = spend_vault([vault_at(vault_address, 90_000_000)], [stranger])
  vault.spend(beacon, Some(owner), Donate, vault_ref, tx)
}

test donate_fails_when_the_owner_changes() fail {
  let taken = Output {
    ..vault_at(vault_address, 100_000_000),
    datum: InlineDatum(stranger),
  }
  let tx = spend_vault([taken], [stranger])
  vault.spend(beacon, Some(owner), Donate, vault_ref, tx)
}

// #endregion vault-tests

// The same attack. The franken address is not the vault's address, so no output
// is found, the test fails, and that is what `fail` asks for.
// #region attack-stake-closed
const attacker: VerificationKeyHash =
  #"00000000000000000000000000000000000000000000000000000003"

// A franken address: the script's payment part, the attacker's stake part.
const franken_address: Address =
  Address {
    payment_credential: Script(script_hash),
    stake_credential: Some(address.Inline(address.VerificationKey(attacker))),
  }

test donate_moves_the_stake_part() fail {
  let tx = spend_vault([vault_at(franken_address, 100_000_000)], [attacker])
  vault.spend(beacon, Some(owner), Donate, vault_ref, tx)
}
// #endregion attack-stake-closed
