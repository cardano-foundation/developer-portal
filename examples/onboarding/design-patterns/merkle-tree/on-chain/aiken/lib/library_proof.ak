use aiken_merkle_tree/mt
use allowlist.{Left, Proof, Right}

// #region convert
/// Convert the public redeemer into the library's opaque proof. This does not
/// establish membership: it only checks widths and caps the path length.
pub fn from_public(proof: Proof) -> mt.Proof<ByteArray> {
  convert(proof, allowlist.max_depth)
}

fn convert(proof: Proof, remaining: Int) -> mt.Proof<ByteArray> {
  when proof is {
    [] -> []
    [step, ..tail] -> {
      expect remaining > 0
      let item = when step is {
        Left { hash } -> mt.left_sibling(hash)
        Right { hash } -> mt.right_sibling(hash)
      }
      [item, ..convert(tail, remaining - 1)]
    }
  }
}
// #endregion convert
