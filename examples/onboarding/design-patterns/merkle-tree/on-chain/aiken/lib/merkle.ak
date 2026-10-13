use aiken/crypto.{sha2_256}
use aiken/primitive/bytearray
use allowlist.{Left, Proof, Right}

// #region verify
/// Reconstruct a root from a fixed-width member and leaf-to-root siblings.
pub fn is_member(root: ByteArray, member: ByteArray, proof: Proof) -> Bool {
  bytearray.length(root) == 32 && bytearray.length(member) == 28 && walk(
    root,
    sha2_256(allowlist.serialise_member(member)),
    proof,
    allowlist.max_depth,
  )
}

fn walk(
  root: ByteArray,
  current: ByteArray,
  proof: Proof,
  remaining: Int,
) -> Bool {
  when proof is {
    [] -> current == root
    [step, ..tail] -> {
      expect remaining > 0
      let sibling = when step is {
        Left { hash } | Right { hash } -> hash
      }
      expect bytearray.length(sibling) == 32
      let parent = when step is {
        Left { .. } -> bytearray.concat(sibling, current)
        Right { .. } -> bytearray.concat(current, sibling)
      }
      walk(root, sha2_256(parent), tail, remaining - 1)
    }
  }
}
// #endregion verify
