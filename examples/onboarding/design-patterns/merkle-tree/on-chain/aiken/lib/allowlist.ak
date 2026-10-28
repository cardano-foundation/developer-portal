// #region imports
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/primitive/bytearray
use cardano/transaction.{Transaction}

// #endregion imports

// #region types
/// The baseline carries the full allowlist in each grant's datum.
pub type ListedGrant {
  members: List<VerificationKeyHash>,
}

/// The pattern carries only a SHA-256 commitment to that same ordered list.
pub type CommittedGrant {
  root: ByteArray,
}

pub type Claim<proof> {
  beneficiary: VerificationKeyHash,
  proof: proof,
}

/// Left/Right describe the sibling's position, not the claimant's position.
/// Proof steps are supplied from the leaf towards the root.
pub type Step {
  Left { hash: ByteArray }
  Right { hash: ByteArray }
}

pub type Proof =
  List<Step>

/// Bound untrusted redeemer work. This supports balanced paths up to 32 levels.
pub const max_depth = 32

// #endregion types

// #region application
/// Fixed leaf bytes: 00 || a 28-byte payment verification-key hash.
/// A leaf's 29-byte preimage cannot be a branch's 64-byte preimage.
pub fn serialise_member(member: VerificationKeyHash) -> ByteArray {
  bytearray.concat(#"00", member)
}

/// A public membership proof does not establish control of the included key.
pub fn authorized(beneficiary: VerificationKeyHash, tx: Transaction) -> Bool {
  bytearray.length(beneficiary) == 28 && list.has(
    tx.extra_signatories,
    beneficiary,
  )
}
// #endregion application
