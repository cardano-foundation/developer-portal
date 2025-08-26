---
id: common-utilities
title: Common Utilities
sidebar_label: Common Utility Functions
description: Streamlining common functions from utility libraries
---

## Common Utilities/Helpers

:::tip Reusable Patterns
These functions create reusable validation logic for common operations. These utility functions eliminate repetitive code and provide safe, tested implementations for common validator operations:
:::

To discover a list of utility libraries providing functions to streamline common operations, visit [Aiken Package Registry](https://packages.aiken-lang.org/).

### Input/Output Filtering

```rust title="Input/Output Filtering Utilities"
// Filter inputs by address
fn inputs_at(inputs: List<Input>, address: Address) -> List<Input> {
  list.filter(inputs, fn(input) { input.output.address == address })
}

// Filter outputs by address  
fn outputs_at(outputs: List<Output>, address: Address) -> List<Output> {
  list.filter(outputs, fn(output) { output.address == address })
}

// Filter inputs by specific token
fn inputs_with(
  inputs: List<Input>, 
  policy: PolicyId, 
  name: ByteArray
) -> List<Input> {
  list.filter(inputs, fn(input) { 
    assets.quantity_of(input.output.value, policy, name) == 1 
  })
}

// Filter outputs by specific token
fn outputs_with(
  outputs: List<Output>, 
  policy: PolicyId, 
  name: ByteArray
) -> List<Output> {
  list.filter(outputs, fn(output) { 
    assets.quantity_of(output.value, policy, name) == 1 
  })
}

// Example Validator
validator my_validator {
  spend(datum: Option<MyDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    let contract_inputs = inputs_at(self.inputs, contract_address)
    let nft_outputs = outputs_with(self.outputs, nft_policy, "STATE_TOKEN")
    
    validate_state_transition(contract_inputs, nft_outputs)
  }
}
```

### Extract Datum

```rust title="Datum Extraction Helpers"
// Safely extract inline datum from input
fn input_inline_datum(input: Input) -> Data {
  expect InlineDatum(raw_datum) = input.output.datum
  raw_datum
}

// Safely extract inline datum from output
fn output_inline_datum(output: Output) -> Data {
  expect InlineDatum(raw_datum) = output.datum
  raw_datum
}

// Find input with specific token and extract its datum
fn only_input_datum_with(
  inputs: List<Input>,
  policy: PolicyId,
  name: ByteArray
) -> Data {
  expect Some(input) = list.find(inputs, fn(input) { 
    assets.quantity_of(input.output.value, policy, name) == 1 
  })
  input_inline_datum(input)
}

// Example Validator
validator state_machine {
  spend(datum: Option<StateDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    // Extract state from the input with the state token
    expect state_datum: StateDatum = 
      only_input_datum_with(self.inputs, state_policy, "STATE")
    
    // Extract new state from output
    expect Some(continuing_output) = outputs_with(self.outputs, state_policy, "STATE") |> list.head()
    expect new_state_datum: StateDatum = output_inline_datum(continuing_output)
    
    validate_state_evolution(state_datum, new_state_datum)
  }
}
```

### Value Operations

```rust title="Value Operation Helpers"
// Check if first value contains at least the second value
fn value_geq(greater: Value, smaller: Value) -> Bool {
  list.all(assets.flatten(smaller), fn(token) { 
    assets.quantity_of(greater, token.1st, token.2nd) >= token.3rd 
  })
}

// Sum all value going to a specific address
fn get_all_value_to(outputs: List<Output>, address: Address) -> Value {
  list.foldr(outputs, assets.zero, fn(output, acc_value) {
    if output.address == address {
      assets.merge(acc_value, output.value)
    } else {
      acc_value
    }
  })
}

// Sum all value coming from a specific address  
fn get_all_value_from(inputs: List<Input>, address: Address) -> Value {
  list.foldr(inputs, assets.zero, fn(input, acc_value) {
    if input.output.address == address {
      assets.merge(acc_value, input.output.value)
    } else {
      acc_value
    }
  })
}

// Example Validator
validator payment_validator {
  spend(datum: Option<PaymentDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    
    // Verify sufficient payment to beneficiary
    let payment_value = get_all_value_to(self.outputs, datum.beneficiary_address)
    let required_payment = assets.from_lovelace(datum.amount)
    
    value_geq(payment_value, required_payment)
  }
}
```

### Address Utilities

```rust title="Address Validaton Helpers"
// Extract public key hash from address (if it's a pubkey address)
fn address_pub_key(address: Address) -> Option<VerificationKeyHash> {
  when address.payment_credential is {
    VerificationKey(key_hash) -> Some(key_hash)
    _ -> None
  }
}

// Extract script hash from address (if it's a script address)  
fn address_script_hash(address: Address) -> Option<ScriptHash> {
  when address.payment_credential is {
    Script(script_hash) -> Some(script_hash)
    _ -> None
  }
}

// Example Validator
validator payment_splitter {
  spend(datum: Option<SplitterDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    
    // Validate payments go to pubkey addresses only
    let all_payments_to_pubkeys = list.all(datum.recipients, fn(recipient) {
      when address_pub_key(recipient.address) is {
        Some(_) -> True
        None -> False
      }
    })
    
    all_payments_to_pubkeys
  }
}

// Address validation utilities
fn validate_payment_to_pubkey(output: Output, expected_pubkey_hash: ByteArray) -> Bool {
  when output.address.payment_credential is {
    VerificationKey(hash) -> hash == expected_pubkey_hash
    _ -> False
  }
}

fn validate_payment_to_script(output: Output, expected_script_hash: ByteArray) -> Bool {
  when output.address.payment_credential is {
    Script(hash) -> hash == expected_script_hash  
    _ -> False
  }
}
```

### Minting Validation

```rust title="Minting Validation Helpers"
// Validate exactly one specific token was minted
fn only_minted_token(
  mint: Value,
  policy: PolicyId,
  name: ByteArray,
  quantity: Int
) -> Bool {
  when assets.flatten(mint) is {
    [(minted_policy, minted_name, minted_quantity)] ->
      minted_policy == policy && minted_name == name && minted_quantity == quantity
    _ -> False
  }
}

// Check if specific token was minted with exact quantity
fn token_minted(
  mint: Value,
  policy: PolicyId,
  name: ByteArray,
  quantity: Int
) -> Bool {
  assets.flatten(mint)
  |> list.any(fn(token) { 
       token.1st == policy && token.2nd == name && token.3rd == quantity 
     })
}

// Validate policy only burns tokens (no minting)
fn check_policy_only_burn(mint: Value, policy: PolicyId) -> Bool {
  list.all(assets.flatten(mint), fn(token) {
    if token.1st == policy {
      token.3rd < 0  // Negative quantity = burn
    } else {
      True
    }
  })
}

// Example Validators
validator nft_minting_policy {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // Ensure exactly one NFT is minted
    only_minted_token(self.mint, policy_id, "UNIQUE_NFT", 1)
  }
}

validator token_burner {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // Ensure this policy only burns, never mints
    check_policy_only_burn(self.mint, policy_id)
  }
}
```

### Value Validation

```rust title="Value Validation Helpers"
// Value validation utilities
fn validate_minimum_ada(value: Value, minimum: Int) -> Bool {
  assets.lovelace_of(value) >= minimum
}

fn validate_exact_payment(value: Value, expected_amount: Int) -> Bool {
  assets.lovelace_of(value) == expected_amount
}

// Time validation utilities  
fn validate_after_time(valid_range: ValidityRange, min_time: Int) -> Bool {
  when valid_range.lower_bound.bound_type is {
    Finite(time) -> time >= min_time
    _ -> False
  }
}

// Combine utilities in validators
validator payment_validator {
  spend(datum: Option<PaymentDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    expect Some(payment_output) = list.at(self.outputs, datum.payment_output_index)
    
    and {
      validate_payment_to_pubkey(payment_output, datum.beneficiary),
      validate_exact_payment(payment_output.value, datum.amount),
      validate_after_time(self.validity_range, datum.unlock_time)
    }
  }
}
```
