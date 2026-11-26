use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}

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

// Key hashes and policy ids are 28 bytes, so any 28 bytes stand in for one.
const owner = #"00000000000000000000000000000000000000000000000000000001"

const policy_id = #"00000000000000000000000000000000000000000000000000000000"

test mint_ok_when_signed_by_owner() {
  let tx = Transaction { ..transaction.placeholder, extra_signatories: [owner] }
  token.mint(owner, 0, policy_id, tx)
}

test mint_fails_when_not_signed() fail {
  token.mint(owner, 0, policy_id, transaction.placeholder)
}
