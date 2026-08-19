// #region file
import { MeshTxBuilder, deserializeAddress, mConStr0, stringToHex } from "@meshsdk/core";
import type { IFetcher, IWallet } from "@meshsdk/core";

import { vaultAddress, vaultPolicyId, vaultScriptCbor } from "./blueprint.ts";
import { vaultDatum } from "./datum.ts";

/// The token name the vault's `mint` handler allows, as the contract spells it.
export const VAULT_TOKEN_NAME = "VAULT";

/// Build a transaction that **mints one vault token and locks it**, together with
/// `lovelace`, at the vault's address.
///
/// One script does both jobs here, because its hash is both the address funds go
/// to and the policy id the token is created under. The `mint` handler runs to
/// approve the new token; the `spend` handler stays asleep, since locking is
/// still an ordinary payment.
export async function buildMintAndLockTx(
  wallet: IWallet,
  provider: IFetcher,
  networkId: number,
  lovelace: string,
): Promise<string> {
  // Where the wallet wants anything left over sent back to.
  const changeAddress = await wallet.getChangeAddress();
  // The key hash inside that address. This is what makes you the owner.
  const owner = deserializeAddress(changeAddress).pubKeyHash;
  // Minting runs a script, so this transaction needs a deposit, unlike the
  // plain lock, where no contract runs at all.
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
      "Send it some test ADA and try again.",
    );
  }

  // The contract's hash, read as a policy id. Same value as its address.
  const policyId = vaultPolicyId();
  // Token names travel as hex on the chain, so convert it once here.
  const tokenNameHex = stringToHex(VAULT_TOKEN_NAME);

  const txBuilder = new MeshTxBuilder({ fetcher: provider });
  return await txBuilder
// #region mint-calls
    // Everything that follows describes one Plutus V3 script minting.
    .mintPlutusScriptV3()
    // Create exactly one token, which is precisely what the handler allows.
    .mint("1", policyId, tokenNameHex)
    // Carry the compiled contract, so the network can run the mint handler.
    .mintingScript(vaultScriptCbor)
    // The mint handler ignores its redeemer, so an empty one is enough.
    .mintRedeemerValue(mConStr0([]))
    // #endregion mint-calls
    // One output at the vault, holding both the ADA and the new token.
    .txOut(vaultAddress(networkId), [
      { unit: "lovelace", quantity: lovelace },
      { unit: policyId + tokenNameHex, quantity: "1" },
    ])
    // The same datum as a plain lock: the token changes nothing about ownership.
    .txOutInlineDatumValue(vaultDatum(owner))
    // Offer the deposit found above.
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    // Send the remainder back to you.
    .changeAddress(changeAddress)
    // Offer your UTxOs, so the builder can pick enough to cover this.
    .selectUtxosFrom(await wallet.getUtxos())
    // Balance it, price the fee, and hand back the unsigned transaction.
    .complete();
}
// #endregion file
