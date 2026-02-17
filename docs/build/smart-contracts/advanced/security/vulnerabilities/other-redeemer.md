---
id: other-redeemer
title: Other Redeemer
sidebar_label: Other Redeemer
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

## 1. Other redeemer

**Identifier:** `other-redeemer`

**Property statement:**
Logic under one script redeemer that relies on the logic enforced by another redeemer (either from the same script or from another one) explicitly requires the presence of the redeemer under which the intended logic exists.

**Test:**
A transaction can successfully avoid some checks by spending a UTxO or minting a token using a different redeemer than the one expected by the script.

**Impact:**
By-passing checks

**Further explanation:**
Let us say that we have a simple staking protocol that allows users to lock a certain amount of token X and later on receive an ADA reward, which increases based on the amount of time tokens have been locked. This protocol consists of two validators, `globalValidator` and `positionsValidator`. The `globalValidator`'s mission is to lock an NFT that carries as datum the global state of the pool (e.g. how much token X has been staked in aggregate by all participants) as well as the rewards pool (ADA to be distributed to stakers) and the `positionsValidator`'s mission is to lock one UTxO per each participant, holding the user's bag of token X and carrying as datum a timestamp stating when was the last time that the position was updated.

To interact with the protocol, users can either open a position or update their position.

To reflect that, the validators have the following logic:

- `globalValidator` has one redeemer, `UpdateState`, which checks that a user's position is opened or updated correctly and that rewards are distributed correctly based on the user's stake size and timestamp, updating the global state accordingly.
- `positionsValidator` has one redeemer, `UpdatePosition`, which just checks that the NFT locked in `globalValidator` has been consumed, therefore deferring all the checking to the `globalValidator`.

Some time after, a new redeemer is added to `globalValidator` to allow anyone to add ADA to the rewards pool. This new redeemer, `AddRewards`, only verifies that the consumed UTxO is locked back in the same validator keeping the same datum, but with an increased amount of ADA.

By adding this new redeemer, a vulnerability has been introduced. This is because by consuming the UTxO locked in the `globalValidator` with the `AddRewards` redeemer, nothing is checked regarding the correct update of the user's position. Therefore, in the same transaction a user could freely update their position, for instance changing the timestamp to some time far away in the past. This would allow the user to, in a second transaction, fool the `globalValidator` to unlock a big chunk of the rewards pool.

In order to prevent this problem, the expected redeemers should be explicitly mentioned in the scripts wherever possible.
