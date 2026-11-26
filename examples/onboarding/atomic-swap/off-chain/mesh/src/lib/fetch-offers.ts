import { deserializeDatum, serializeAddressObj } from "@meshsdk/core";
import type { IFetcher, UTxO } from "@meshsdk/core";

import { swapAddress } from "./blueprint.ts";
import type { PricedAsset } from "./datum.ts";

// #region fetch
/// An open offer read from the contract: the UTxO holding the locked asset,
/// plus the decoded terms.
export type Offer = {
  utxo: UTxO;
  owner: string; // the owner's full wallet address (bech32)
  price: PricedAsset[];
};

/// Read every open offer locked at the swap contract address, decoding each
/// locked UTxO's inline datum into an offer.
export async function fetchOffers(
  provider: IFetcher,
  networkId: number,
): Promise<Offer[]> {
  const utxos = await provider.fetchAddressUTxOs(swapAddress(networkId));
  const offers: Offer[] = [];
  for (const utxo of utxos) {
    const cbor = utxo.output.plutusData;
    if (!cbor) continue;
    const datum: any = deserializeDatum(cbor);
    offers.push({
      utxo,
      owner: serializeAddressObj(datum.fields[0], networkId),
      price: datum.fields[1].list.map((asset: any) => ({
        policyId: asset.fields[0].bytes,
        assetName: asset.fields[1].bytes,
        quantity: String(asset.fields[2].int),
      })),
    });
  }
  return offers;
}
// #endregion fetch
