---
id: withdraw-zero
title: Withdraw Zero Trick
sidebar_label: Withdraw Zero Trick
description: Transaction level validation- 
---

Often in a plutus validator you want to check "a particular Plutus script checked this transaction", but it's annoying (and wasteful) to have to
lock an output in a script and then check if that output is consumed, or mint a token, to trigger script validation.

Perhaps the most pervasive use-case of this is to allow logic that is shared across multiple validators which otherwise would be redundently executed many times to be executed only once.

This is commonly referred to as the forwarding validator design pattern. In this design pattern, the validator (typically a spending validator) defers its logic to another validator by checking that a state token is present in one of the transaction inputs:

```rust
forwardNFTValidator :: AssetClass -> BuiltinData -> BuiltinData -> ScriptContext -> () 
forwardNFTValidator stateToken _ _ ctx = assetClassValueOf stateToken (valueSpent (txInfo ctx)) == 1
```

The above validator is *forwarding* its validation logic to the spending validator where the state token is locked that contains the shared / global validation logic. By enforcing that one of the transaction inputs contains the state token,
we guarantee that the spending validator with the state token successfully executes in the transaction.  

This pattern is a core component of the batcher architecture. Some protocols improve on this pattern by including the index of the input with the state token in the redeemer:

```rust
forwardNFTValidator :: AssetClass -> BuiltinData -> Integer -> ScriptContext -> () 
forwardNFTValidator stateToken _ tkIdx ctx =  assetClassValueOf stateToken (txInInfoResolved (elemAt tkIdx (txInfoInputs (txInfo ctx)))) == 1 
```

With this pattern DApps are able to process roughly 8-15 forwardNFTValidator UTxO's  per transaction without exceeding script budget limitations.
The time complexity of unlocking each UTxO spent from the forwardNFTValidator is `O(n)` where n is the number of inputs in the transaction. Since this logic is executed once per input that is spent from the forwardNFTValidator, the total time complexity of this design pattern is `O(n^2)`.

The redundant execution of identical validation logic across spending validator executions is a huge throughput bottleneck for DApps. Using the stake validator trick the shared logic is moved into a staking script which is only executed once per transaction (as opposed to once for each UTxO from spending validator). In the case of the forwarding validator design pattern, with this trick we can improve the time complexity of the forwarding logic to `O(1)`, and thus the overall time complexity is improved from `O(n^2)` to `O(n)`.

For the stake validator trick, the forwardValidator logic becomes:

```rust
forwardWithStakeTrick:: StakingCredential -> BuiltinData -> BuiltinData -> ScriptContext -> ()
forwardWithStakeTrick obsScriptCred tkIdx ctx = fst (head stakeCertPairs) == obsScriptCred 
  where 
    info = scriptContextTxInfo ctx 
    stakeCertPairs = AssocMap.toList (txInfoWdrl info)

stakeValidatorWithSharedLogic :: AssetClass -> BuiltinData -> ScriptContext -> () 
stakeValidatorWithSharedLogic stateToken _rdmr ctx = 
  let !(Rewarding x) = scriptContextTxInfo ctx
   in assetClassValueOf stateToken (valueSpent (txInfo ctx)) == 1
```

For the stake validator trick, we are simply checking that the StakingCredential of the the staking validator containing the shared validation logic is in the first pair in `txInfoWdrl`. If the StakingCredential is present in `txInfoWdrl`, that means the staking validator (with our shared validation logic) successfully executed in the transaction. This script is `O(1)` in the case where you limit it to one shared logic validator (staking validator), or if you don't want to break composability with other staking validator,
then it becomes `O(obs_N)` where `obs_N` is the number of Observe validators that are executed in the transaction as you have to verify that the StakingCredential is present in `txInfoWdrl`.

## Important Considerations

We must enforce that the script purpose is rewarding to prevent delegation which complicates the offchain code since we could no-longer simply withdraw zero; if rewards have been accumulated we would have to withdraw the accumulated amount of rewards. Likewise, by enforcing that the script purpose is rewarding, we prevent the staking credential associated with the script from being deregistered, this is important because the withdraw zero trick required the staking credential associated with the script to be registered.

The script must be successfully executed in the transaction to deregister the credential, so you can prevent unwanted deregistration via the script logic. However, currently, registration of a script staking credential does not require the script to be executed, this means anyone can register stake scripts as validation logic cannot prevent them from doing so. In the next era this will no longer be the case, and script execution will be required for registration as-well so you might want to design your validators accordingly (ie. ensure that the validator supports both the Rewarding and Registration script purposes).
