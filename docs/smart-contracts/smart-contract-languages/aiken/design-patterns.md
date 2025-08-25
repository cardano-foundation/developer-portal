---
id: design-patterns
title: Design Patterns
sidebar_label: Design Patterns
description: Implementation of complex smart contract design patterns on Cardano using Aiken
---

## Patterns You'll Encounter

### One-Shot Minting (NFT Creation)

For creating unique tokens that can only be minted once, use a unique `OutputReference`:

```rust title="One-Shot Minting (NFT Creation)"
validator one_shot(utxo_ref: OutputReference) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // Ensure exactly one token is minted (NFT requirement)
    // This prevents bulk minting and ensures uniqueness
    expect [Pair(_asset_name, quantity)] = 
      mint |> assets.tokens(policy_id) |> dict.to_pairs()

    // Here's the clever bit: UTxOs can only be spent once, ever
    // So if we require burning a specific UTxO, this policy can only run once
    let is_output_consumed = 
      list.any(inputs, fn(input) { input.output_reference == utxo_ref })
    
    // Both conditions must be true for valid NFT minting
    exactly_one && utxo_spent_once
  }
}
```

### State Management Fundamentals

Smart contracts often need to keep track of state across multiple transactions. The basic pattern is state threading when you just create outputs back to the same contract address:

```rust title="State Threading Counter"
type CountDatum { count: Int }

validator counter {
  spend(datum: Option<CountDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    let Transaction { inputs, outputs, .. } = self
    
    // Find the input being spent (the UTxO containing current state)
    expect Some(own_input) = 
      list.find(inputs, fn(input) { input.output_reference == own_ref })
    
    // Find the output going back to the same contract address (the new state)
    // This ensures state "threads" through the transaction
    expect Some(own_output) = 
      list.find(outputs, fn(output) { output.address == own_input.output.address })
    
    // Extract the new state from the output datum
    expect InlineDatum(raw_datum) = own_output.datum
    expect new_datum: CountDatum = raw_datum
    let new_count = new_datum.count
    
    // Validate the state transition follows our rules
    // In this case: count must increment by exactly 1
    new_count == datum.count + 1
  }
}
```

#### The Security Problem

:::warning State Security Issue
Here's the thing that might catch you off guard: **anyone can send a UTXO with whatever datum they want to your contract address**. Your spending validator only runs (validates the contract logic) when UTXOs get spent, not when they are received.
:::

Check this out:

```rust title="⚠️ Security Problem"
// Someone could send this to your contract address
let arbitrary_datum = CountDatum { count: 9999999 }

// Your spending validator never checks if this initial state is valid!
```

So the question becomes: how do you tell the difference between legitimate state (that your protocol created) and arbitrary state (that some random person sent)?

**The fix**: Use authorizing tokens (usually NFTs) that prove a UTXO's state was actually created through proper validation. This is commonly called the **state-thread token pattern**.

#### The Authorizing Token Pattern

1. Minting policy is responsible to validate that new state is created correctly and mints an NFT
2. Spending validator requires the NFT to be present and passed along to new state  
3. Presence of the NFT in the transaction proves the state was created through proper validation

This is how you get your minting policy and spending validator to work together without trusting random people:

```rust title="Authenticated State Pattern"
// Minting policy ensures only valid initial state gets an NFT
validator create_authenticated_state {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // Validate initial state is correct
    // Mint exactly one NFT per valid state
    // NFT "authorizes" this state as legitimate
  }
}

// Spending validator requires NFT to prove state authenticity  
validator spend_authenticated_state {
  spend(datum: Option<MyDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    // Verify input has authorizing NFT
    // Verify output preserves authorizing NFT  
    // Validate state transition rules
  }
}
```

#### Recovering in the middle

Sometimes things go wrong and you need an escape hatch. Here's how to build STT contracts that can handle a cancellation gracefully:

```rust title="Recoverable Contract with Cancellation"
type MyRedeemer {
  Continue { 
    next_state: MyState,
    output_index: Int 
  }
  Cancel { 
    refund_output_index: Int 
  }
}

validator recoverable_contract {
  spend(datum: Option<MyDatum>, redeemer: MyRedeemer, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    let Transaction { inputs, outputs, extra_signatories, .. } = self
    
    expect Some(own_input) = 
      list.find(inputs, fn(a_input) { a_input.output_reference == own_ref })

    when redeemer is {
      Continue { next_state, output_index } -> {
        // Normal progression logic
        expect Some(continuing_output) = list.at(outputs, output_index)
        
        let new_datum = MyDatum { 
          ..datum, 
          state: next_state,
          step: datum.step + 1 
        }
        
        and {
          validate_state_transition(datum.state, next_state),
          validate_continuing_output(continuing_output, new_datum),
          list.has(extra_signatories, datum.authorized_user)
        }
      }
      
      Cancel { refund_output_index } -> {
        // Graceful exit with asset recovery
        expect Some(refund_output) = list.at(outputs, refund_output_index)
        
        and {
          // Refund goes to original depositor
          validate_refund_address(refund_output.address, datum.depositor),
          // Return locked assets minus processing fee
          validate_refund_amount(refund_output.value, own_input.output.value),
          // Must be signed by authorized party
          list.has(extra_signatories, datum.authorized_user)
        }
      }
    }
  }
}
```

### Use Reference Inputs

Reference inputs let you read blockchain state without consuming it. Great for oracle data, protocol state, or anything multiple people need to access:

```rust title="Using Reference Inputs for Oracle Data"
validator price_dependent_validator {
  spend(datum: Option<MyDatum>, _redeemer: Data, own_ref: OutputReference, self: Transaction) {
    expect Some(datum) = datum
    
    // Query oracle price without consuming the oracle UTXO
    expect Some(oracle_input) = list.at(self.reference_inputs, datum.oracle_index)
    expect InlineDatum(raw_price) = oracle_input.output.datum
    expect price_data: PriceData = raw_price
    
    // Use price in validation without affecting the oracle
    let min_payment = datum.base_amount * price_data.exchange_rate
    validate_sufficient_payment(self.outputs, min_payment)
  }
}
```

