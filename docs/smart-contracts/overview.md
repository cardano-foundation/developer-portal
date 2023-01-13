---
id: overview
slug: /smart-contracts/
title: Smart Contracts
sidebar_label: Overview
description: Learn how to create smart contracts on Cardano.
image: ../img/og/og-developer-portal.png
--- 

![Smart Contracts](../../static/img/card-smart-contracts-title.svg)

## What are smart contracts?
Smart contracts are pre-programmed, automatic digital agreements. They are self-executing, unalterable, and incorruptible. They don't necessitate any acts or the presence of others.

## Two worlds of smart contracts
We can break smart contracts and financial transactions down into two worlds: 

In one world, you wish to communicate a sense of worth from one actor (or group of actors) to another (or a group of actors). There must be a representation of that value, as well as the rules and circumstances that govern it, as well as a trigger event. A financial contract is what we call it, and it's best done with a domain-specific language. This world has nothing to do with replacing a big company or this common notion that we might have with dapps.

In another world, you'd like to build programs, possibly even replace a major corporation, or address a smaller problem. A triangle is formed by these applications:

- The client is the portion of the program that runs on your computer.
- A server is a computer that operates on someone else's computer (or multiple servers).
- The smart contract is a piece of code that allows a decentralized system to operate.

## Conceptual overview

As Cardano uses the [eUTXO](/docs/get-started/technical-concepts/#unspent-transaction-output-utxo) model, executing a contract is done by 
submitting transactions for for each step of the contract. This means that you need to split up the idea of a contract in to two components:

- The off-chain component is an application or script you create for generating transactions to be submitted. These can be created using almost any programming language.

- The on-chain component is a validator-script you create which is used to verify that a transaction conforms to the rules you have described. These scripts require specialised tools/languages to create and the logic is compiled to a binary format executable by the Cardano nodes. 

Validator-scripts will run automatically when a transaction is attempting to move an utxo from the address owned by the script. The address is derived from the hash of the script. 

Creating an instance of the contract is accomplished by sending an utxo to the script address.
This transaction can contain any custom data you need to be used by the validator script.

When the utxo resides at the script-address, it can only ever move again if the
transaction moving it is successfully validated by your validator script.

### Basic contract workflows

*Note that this is only an example! The validator does not need to rely on hashsums - you can have any logic you want here.*

- You create a validator-script that compares the hash-sum of the datum in the utxo being moved from the contracts address to the datum being used in the transaction moving it. This is your on-chain component.

- You create a script using your language of choice, that creates a transaction moving some amount of ADA or other assets to the address of the validator-script. 
When generating the transaction you specify the datum to be ```Hash("secret")``` making sure that only the hashsum of the word "secret" gets stored on-chain.
This is your off-chain component.

- You sign and submit the transaction to a Cardano node either directly or via one of many available API's such as Blockfrost or Dandelion.
Now the ADA you sent to the contract is locked by your validator.

- The only way for anyone to move this locked ADA now is to generate a transaction with the word "secret" as a datum, as the utxo is locked in the script
which will enforce this rule you created where the hashsum of the datum must match ```Hash("secret")```.
Normally, your datum would need to be more complicated than this, and the person running the contract might not know how it is supposed to work at all,
and so they would use your off-chain component to create the transaction - often this is something you would provide an API for.

While the above steps are very simplified, it is the basis of how all smart contracts work on Cardano.

### Basic multi-step contract workflows

Expanding on the basic workflow, imagine that you want to create a contract that required multiple steps.
Such a contract might be one that requires 3 different people to agree on who should be able to claim the value locked in a contract instance.

- Your on-chain component, the validator script would have to encode logic for allowing two different types of actions: moving the contract forward (step), or moving the utxo and hence it's value to any other address (unlock).

- Your off-chain component will need to be able to look at the locked uTXO and decode it's datum to see which state the contract is currently in, so that
it can correctly generate a transaction for either unlocking the utxo, or driving the contract forward unlocking the utxo.

### Example contract

We will use psuedo-code for both the on-chain (validator script) and off-chain component to make it easier to explain the logic. These may contain invalid logic and serve only to give you an idea of what they can be used for.

The main idea of the contract used in this example is as follows:

- Three different people will be party to the contract.
- The person starting the contract (instance) should include some amount of ADA or other assets (lets call this the "loot")
  and specify the addresses of the three contract parties.
- Each party will now be able to either set an address that they want to be able to claim the "loot" (thereby also resetting all votes), or accept the current address. We will store this address in a property called "decision".
- When a decision is set and all parties have ok'ed it - that party can claim the loot for themselves.

**On-Chain component** for validating transactions

```typescript

    // The type we want to use to represent the state of our contract instance
    type my_datum {
        party_one : address = addr1_bech32_address_of_party_one
        party_two : address = addr1_bech32_address_of_party_two
        party_three : address = addr1_bech32_address_of_party_three
        ok_by_one = Bool
        ok_by_two = Bool
        ok_by_three = Bool
        decision = Maybe address
    }

    function validate(datum_of_the_utox_being_validated:object,transaction:tx) {

        // how encoding and decoding datums work is outside the scope of this example
        let datum = decode(datum_of_the_utox_being_validated)
        
        // Allow the tx if all three parties have already signed off on the decision 
        // and the tx moves the utxo to the address that was jointly agreed upon.       
        datum.ok_by_one == true && datum.ok_by_two == true
        && datum.ok_by_three == true && datum.decision == tx.output_address

        // Otherwise we only allow updating the state, keeping the utxo locked.
        || validate_state_transition(datum,transaction)

    }

    function validate_state_transition(old_state:my_datum,transaction:tx) {
        
        // how encoding and decoding datums work is outside the scope of this example
        let new_state = decode(transaction.datum)

        transaction.output.target_address == my_own_script_address && (

            // Allow the tx if it is just signing off only on ones own choice
            transaction.signed_by(party_one) && new_state == {old_state with ok_by_one = True}
            || transaction.signed_by(party_two) && new_state == {old_state with ok_by_two = True}
            || transaction.signed_by(party_three) && new_state == {old_state with ok_by_three = True}
            
            // Allow the tx if it changes the decision, but enforce that all signatures are also cleared.
            // (note: you could change this logic to set ok_by_x to true for the party who did the change in order
            // to avoid them having to submit that in a separate tx)
            || transaction.signed_by_any(party_one,party_two,party_three) && new_state == {
                old_state with 
                    decision = new_state.decision
                    ok_by_one = False
                    ok_by_two = False
                    ok_by_three = False
            }
            
        )
    }
    

```

**Off-chain component** for interacting with the contract

In this case, we have an example of code designed to be run in the browser of each user party to the contract.

```typescript

    const contract_address = "addr1_addr_of_the_validator_script" 

    function create_new_contract_instance(amount,party1,party2,party3) {
        let tx = cardano.create_tx_to_send_value_in_ada_to_address(10,contract_address);
        tx.datum = helper_create_datum(party1,party2,party3,party1)
        cardano.sign_and_submit(tx)
    }

    function set_decision(contract_id,addr) {
        let instance = helper_get_contract_instance_by_id(contract_id)
        let datum = helper_parse_datum(instance)
        // update to a new decision
        datum.decision = addr
        // we must clear the decisions because the validator-script enforces that rule:
        datum.ok_by_party_one = false
        datum.ok_by_party_two = false
        datum.ok_by_party_three = false
        // create a transaction which moves the utxo representing the contract instance
        // from the contract address to the contract address, with a specific datum.
        let tx = cardano.create_tx_moving_utxo_to_addr(instance.utxo,contract_address,datum)
        cardano.sign_and_submit(tx)
    }

    function accept_decision(contract_id) {
        let instance = helper_get_contract_instance_by_id(contract_id)
        let datum = helper_parse_datum(instance)

        let my_addr = cardano.get_my_own_address();

        let datum =
            my_addr == datum.party_one 
            ? {..datum, ok_by_party_one = true }
            : my_addr == datum.party_two 
            ? {..datum, ok_by_party_two = true }
            my_addr == datum.party_three 
            ? {..datum, ok_by_party_three = true }
            : throw "you are not party to this contract."

        // create a transaction which moves the utxo representing the contract instance
        // from the contract address to the contract address, with a specific datum.
        let tx = cardano.create_tx_moving_utxo_to_addr(instance.utxo,contract_address,datum)
        cardano.sign_and_submit(tx)
    }

    function claim_the_price(contract_id) {
        let instance = helper_get_contract_instance_by_id(contract_id)
        let datum = helper_parse_datum(instance)
        let my_addr = cardano.get_my_own_address();     
        if(datum.ok_by_party_one === false || datum.ok_by_party_two === false || datum.ok_by_party_three === false ) {
            throw "not all parties have agreed to a decision yet"
        }
        if(datum.decision != my_addr) {
            throw "unfortunately, the decision is not in your favor"
        }
        
        // because all parties have agreed, the validator script should accept this transaction
        // as long as we send to utxo to the address set in the decision, in this case thats our own address!
        let tx = cardano.create_tx_moving_utxo_to_addr(instance.utxo,my_addr)
        cardano.sign_and_submit(tx)
    }

    function helper_get_contract_instance_by_id(contract_id) {
        // how to locate this utxo is not part of this explainer.
        // you could decide to keep a nft in the utxo as a token to find
        // it, or otherwise keep track of your different instances - up to you.
        cardano.api.get_utxo_of_my_script_instance(contract_id)
    }

    function helper_create_datum(party1,party2,party3,decision) {
        my_datum {
            party_one = party1,
            party_two  = party2,
            party_three = party3,
            ok_by_one = false
            ok_by_two = false
            ok_by_three = false
            decision = party1
        }
    }

    function helper_parse_datum(contract_instance_utxo) {
        // how this data is encoded is up to you but cborhex is a common format
        let instance_datum : my_datum = decode(contract_instance_utxo.datum)
    }

```

### Contract instances

When you have contracts designed to run in multiple steps as in the previous example, the utxo that represents
the current state of a specific instance/invokation of that script is something you need to be able to keep track of.

There is no standard for how to do this as of now, but one commonly used way is to keep an NFT as a thread-token which your validator enforces to be moved with each transition, so that you can find the utxo representing the latest state of your contract instance by searching for the utxo containing the NFT.


### Real-world use

The best known example of real-world use of this type of smart contracts on the Cardano blockchain is [Marlowe](marlowe).

For the datum used in transactions validated by the Marlowe validator-script, a custom domain specific language (DSL) was
designed to make it easy for end-users to create their own financial contracts. The off-chain component takes care of 
creating transactions that include the contract DSL in the transaction together with the current state, while the 
validator makes sure that all state-transitions are valid according to the custom Marlowe logic.

### Programming languages

*Note that writing well-designed smart-contracts require you to have a solid understanding how how Cardano works in general, so make sure
that everything on this page makes sense to you. Many topics are described in detail on the [Technical Concepts](/docs/get-started/technical-concepts) as well.*

**[Marlowe](marlowe)**: A domain-specific language, it covers the world of financial contracts.
Uses a domain specific language to make it easy to create financial-contracts for anyone. Has a graphical interface that can be used to design contracts.

**[Plutus](plutus)**: A platform to write full applications that interact with the Cardano blockchain. 
A functional language that relies heavily on Haskell tooling and syntax. Plutus allows you to create both the on-chain and off-chain component of your contract in a single solution.

**[Aiken](aiken)**: A smart contract language and toolchain
Aiken takes inspiration from many modern languages such as Gleam, Rust, and Elm which are known for friendly error messages and an overall excellent developer experience. It is used exclusively for writing validator-scripts and aims to be more user-friendly than Plutus.

