import { deserializeAddress, mConStr0, mConStr1, mPubKeyAddress } from "@meshsdk/core";
import type { Data } from "@meshsdk/core";

// #region types
/// One asset the maker wants in return, with the exact quantity.
/// `policyId` and `assetName` are hex, `assetName` is the token name hex-encoded.
export type PricedAsset = {
  policyId: string;
  assetName: string;
  quantity: string;
};

/// An offer: who to pay, and what they want. Mirrors the on-chain
/// `SwapDatum { owner, price }`.
export type SwapOffer = {
  owner: string; // the owner's full wallet address (bech32)
  price: PricedAsset[];
};
// #endregion types

// #region datum
/// Encode the offer as the inline datum attached to the locked UTxO, the
/// exact shape the Aiken `SwapDatum` expects (a constructor of `owner` and a
/// list of `PricedAsset` constructors).
export function offerDatum(offer: SwapOffer): Data {
  const price = offer.price.map((asset) =>
    mConStr0([asset.policyId, asset.assetName, BigInt(asset.quantity)]),
  );
  const { pubKeyHash, stakeCredentialHash } = deserializeAddress(offer.owner);
  if (!stakeCredentialHash) {
    throw new Error("owner address has no stake key — use a normal wallet address");
  }
  // Store the owner's whole address (payment key + stake key) so the swap pays
  // them where their wallet can see it, not at a bare payment-key address.
  return mConStr0([mPubKeyAddress(pubKeyHash, stakeCredentialHash), price]);
}

/// Redeemers, matching the on-chain `SwapAction { Swap, Cancel }`.
export const swapRedeemer = mConStr0([]);
export const cancelRedeemer = mConStr1([]);
// #endregion datum
