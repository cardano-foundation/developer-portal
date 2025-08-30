---
id: merkelized-validators
title: Merkelized Validators
sidebar_label: Merkelized Validators
description: Circumvent validator script size limitations.
---

There are very tight execution budget constraints imposed on Plutus script evaluation; this, in combination with the fact that a higher execution budget
equates to higher transaction fees for end-users makes it such that ex-unit optimization is an extremely important component of smart contract development on Cardano.

Often the most impactful optimization techniques involve trade-offs between ex-units and script size. This results in a tight balancing act where you want to minimize the
ex-units while keeping the script below the ~16kb limit (script size that you can store as a reference script is limited by transaction size limit). Powerful ExUnit
optimizations such as unrolling recursion, inlining functions and preferring constants over variables all can drastically reduce ExUnit consumption at the cost of increasing
script size.

We can take advantage of reference scripts and the withdraw-zero trick to separate the logic (and code) of our validator across a number of stake scripts (which we provide as reference inputs). Then our main validator simply checks for the presence of the associated staking script in the `txInfoRedeemers` (and verify that the redeemer to the scripts are as expected) where necessary to execute the branch of logic.

You can use the withdraw zero trick to prove arbitrary computation was done in a separate script execution (to effectively create merkleized smart contracts):
Redeemer of stake validator:

```rust
data MerkelizedFunctionRedeemer = MerkelizedFunctionRedeemer {inputState :: [BuiltinData], outputState :: [BuiltinData]}
```

Arbitrary computation to prove:

```rust
f :: [BuiltinData] -> [BuiltinData]
f inputState = ... -- perform computation on x
```

Stake Validator Logic:

```rust
-- PlutusTx Implementation
stakeValidator :: MerkelizedFunctionRedeemer -> ScriptContext -> () 
stakeValidator MerkelizedFunctionRedeemer{inputState, outputState} ctx =
  if (f inputState == outputState) then () else ( error () )
```

```rust
-- Plutarch implementation
stakeValidator redeemer ctx = P.do
  redF <- pletFields @'["inputState", "outputState"] redeemer
  pif (f # redF.inputState #== redF.outputState) (popaque $ pconstant ()) error
```

Then in the actual validator where we would like to outsource the computation to the stake validator:

```rust
-- PlutusTx implementation
merkelizedValidator:: StakingCredential -> BuiltinData -> BuiltinData -> ScriptContext -> ()
merkelizedValidator outsourcedFunctionCred _dat _redeemer ctx = 
  ...
  -- verify that the computation was outsourced to the stake validator
  -- arg1, arg2, arg3 are any arbitrary values from this validator that we want 
  -- to perform the computation on.
  let ourInputState = [arg1, arg2, arg3] 
      (Just functionRdmr') = AssocMap.lookup (Rewarding outsourcedFunctionCred) redeemers)
      functionRdmr = unsafeFromBuiltinData @MerkelizedFunctionRedeemer (getRedeemer functionRedeemer)
  if (ourInputState == (inputState functionRdmr)) 
    then 
      let functionResult = outputState functionRdmr  
      -- from here on out we know that `functionResult` contains the application of the arbitrary function `f` to our inputs `[arg1, arg2, arg3]` 
      -- so we now have access to the result of `f ([arg1, arg2, arg3])` without actually executing `f` in this validator.
    else ( error () )
          
   
  where 
    info = txInfo ctx 
    redeemers = txInfoRedeemers info 
```

```rust
--- Plutarch implementation
merkelizedValidator stakeCred ... = P.do
 ...
 -- verify that the computation was outsourced to the stake validator
 -- arg1, arg2, arg3 are any arbitrary variables from this validator that we want 
 -- to perform the computation on.
 let ourInputState = [arg1, arg2, arg3] 
     stakeRed = 
       pmustFind 
         # plam (\red -> 
             pmatch (pfstBuiltin # red) $ \case 
               PRewarding ((pfield @"_0" #) -> scred) -> 
                 pand' # (scred #== stakeCred)
                       # pfield @"inputState" # (punsafeCoerce @StakeRedeemer (psndBuiltin # red)) #== ourInputState 
               _ -> pconstant False
           )
         # pto (pfield @"redeemers" # (pfield @"txInfo" # ctx))

 -- from here on out we know that (psndBuiltin # stakeRed).outputState contains the application of the arbitrary function `f` to our inputs `[arg1, arg2, arg3]` 
 -- so we have proved that f # (psndBuiltin # stakeRed) #== (psndBuiltin # stakeRed).outputState without actually running f in this validator
```

This is useful because with reference scripts this essentially gives us the ability to create scripts with near infinite size which means optimization strategies that involve increasing script size to reduce mem / CPU (ie loop unrolling) now are available to us at nearly zero cost.

Consider a batching architecture, with a very large `processOrders` function. Normally it would not be feasible to perform recursion unrolling / inlining optimizations with such a function since it would quickly exceed the max script size limit; however, with this design pattern we simply move `processOrders` into its own validator script which we can fill with 16kb of loop unrolling and other powerful optimizations which increase script size in order to reduce ExUnits. We provide this new script as a reference script when executing our main validator. Then in our main validator we verify that the `processOrders` validator was executed with the expected redeemer (`inputState` must match the arguments we want to pass to `processOrders`) after which have access to the result of the optimized `processOrders` function applied to our inputs.

:::note
You can find a sample implementation of a merkelized validator written in Aiken in this[repository](https://github.com/keyan-m/aiken-delegation-sample/blob/main/validators/main-contract.ak).
:::
