// #region types
export interface Party {
  address: string;
  asset: string;
  amount: string;
}

export interface SwapDraft {
  inputs: { address: string; asset: string; amount: string }[];
  outputs: { address: string; asset: string; amount: string }[];
}
// #endregion types


// #region build
export function buildAtomicSwapDraft(alice: Party, bob: Party): SwapDraft {
  if (alice.address === bob.address) {
    throw new Error("An atomic swap needs two distinct parties.");
  }

  return {
    inputs: [
      { address: alice.address, asset: alice.asset, amount: alice.amount },
      { address: bob.address, asset: bob.asset, amount: bob.amount },
    ],
    outputs: [
      { address: alice.address, asset: bob.asset, amount: bob.amount },
      { address: bob.address, asset: alice.asset, amount: alice.amount },
    ],
  };
}
// #endregion build
