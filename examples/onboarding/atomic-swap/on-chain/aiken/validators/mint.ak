use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use mocktail.{complete, mocktail_tx, required_signer_hash}
use mocktail/virgin_key_hash.{mock_policy_id, mock_pub_key_hash}

// #region mint
// A minting policy for the demo tokens (GOLD, SILVER).
//
// Parameterized by an owner key: only the owner can mint or burn under this
// policy. Because the policy is parameterized, Alice and Bob each get their own
// distinct policy id by applying their own key, so GOLD and SILVER are different assets.
validator token(owner: VerificationKeyHash) {
  mint(_redeemer: Data, _policy_id: PolicyId, self: Transaction) {
    list.has(self.extra_signatories, owner)
  }

  else(_) {
    fail
  }
}

// #endregion mint

// Tests (not imported into the docs).

test mint_ok_when_signed_by_owner() {
  let owner = mock_pub_key_hash(1)
  let tx = mocktail_tx() |> required_signer_hash(True, owner) |> complete()
  token.mint(owner, 0, mock_policy_id(0), tx)
}

test mint_fails_when_not_signed() fail {
  let owner = mock_pub_key_hash(1)
  let tx = mocktail_tx() |> complete()
  token.mint(owner, 0, mock_policy_id(0), tx)
}
