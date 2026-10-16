import {
  MeshTxBuilder,
  deserializeAddress,
  resolveNativeScriptHash,
  resolveSlotNo,
  serializeNativeScript,
} from "@meshsdk/core";
import type { BrowserWallet, NativeScript } from "@meshsdk/core";

// #region native-script
/// A native script's `sig` rule names a signer by their **key hash**: a short
/// public fingerprint of a key. You derive it from a wallet address, never from
/// the secret, so each participant can share theirs safely.
export function keyHashFromAddress(address: string): string {
  return deserializeAddress(address).pubKeyHash;
}

/// The "time-locked shared wallet" rule from above, built in code: spendable only
/// *before* a deadline, and only if at least 2 of the 3 keys sign. A native script
/// is just data, so you assemble it like any object, no smart-contract language.
/// Hashing it gives the script hash: the very value that becomes a minting policy
/// id or a script address.
export function sharedWalletScript(
  keyHashes: [string, string, string],
  deadlineSlot: string,
): { script: NativeScript; hash: string } {
  const script: NativeScript = {
    type: "all", // every listed rule must hold
    scripts: [
      { type: "before", slot: deadlineSlot }, // no spending after this slot
      {
        type: "atLeast", // a minimum number of the keys must sign
        required: 2,
        scripts: keyHashes.map((keyHash): NativeScript => ({ type: "sig", keyHash })),
      },
    ],
  };

  return { script, hash: resolveNativeScriptHash(script) };
}
// #endregion native-script

// #region multisig-sign
/// One signer's step in the off-chain flow. `signTx(tx, true)` adds this wallet's
/// signature, the `true` means *partial*, so the transaction doesn't have to be
/// finished yet. A real 2-of-3 first collects the other signatures the same way,
/// off-chain, and only submits once it has enough. Nothing is submitted "to run
/// later": the network checks the rule the moment the transaction arrives.
export async function signAndSubmit(
  unsignedTx: string,
  wallet: BrowserWallet,
): Promise<string> {
  const signedTx = await wallet.signTx(unsignedTx, true); // add my signature (partial)
  return wallet.submitTx(signedTx);
}
// #endregion multisig-sign

const LOCK_LOVELACE = "5000000"; // 5 ADA
const LOCK_SECONDS = 300; // reclaimable only after ~5 minutes

export type Vault = {
  lockTxHash: string;
  scriptCbor: string;
  scriptAddress: string;
  unlockSlot: number;
};

// #region vault-lock
/// Lock 5 ADA under a native script only *you* can reclaim, and only after ~5
/// minutes: `all` of [ after this slot, signed by your key ]. Locking is just a
/// normal payment, you send the ADA to the script's address. Nothing runs
/// on-chain yet; the rule is checked later, when you try to spend it back.
export async function lockToVault(wallet: BrowserWallet): Promise<Vault> {
  const address = await wallet.getChangeAddress();
  const { pubKeyHash } = deserializeAddress(address);
  const unlockSlot = Number(
    resolveSlotNo("preview", Date.now() + LOCK_SECONDS * 1000),
  );

  const script: NativeScript = {
    type: "all",
    scripts: [
      { type: "after", slot: String(unlockSlot) }, // not spendable before this slot
      { type: "sig", keyHash: pubKeyHash }, // and only with your signature
    ],
  };
  const { address: scriptAddress, scriptCbor } = serializeNativeScript(
    script,
    undefined,
    0, // networkId 0 = testnet (Preview)
  );
  if (!scriptCbor) throw new Error("could not serialize the native script");

  const unsignedTx = await new MeshTxBuilder()
    .txOut(scriptAddress, [{ unit: "lovelace", quantity: LOCK_LOVELACE }]) // pay 5 ADA to the script
    .changeAddress(address)
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  const signedTx = await wallet.signTx(unsignedTx);
  const lockTxHash = await wallet.submitTx(signedTx);
  return { lockTxHash, scriptCbor, scriptAddress, unlockSlot };
}
// #endregion vault-lock

// #region vault-unlock
/// Reclaim the 5 ADA once the 5 minutes have passed. To spend the locked UTxO, the
/// transaction must satisfy the script: its validity window starts *after* the
/// unlock slot (`invalidBefore`), and it carries your signature. We attach the
/// script itself and point at the locked output, which we already know from the
/// lock step, so no provider is needed.
export async function unlockFromVault(
  wallet: BrowserWallet,
  vault: Vault,
): Promise<string> {
  const address = await wallet.getChangeAddress();
  const { pubKeyHash } = deserializeAddress(address);

  const unsignedTx = await new MeshTxBuilder()
    .txIn(
      vault.lockTxHash,
      0, // the locked 5 ADA is the first output of the lock tx
      [{ unit: "lovelace", quantity: LOCK_LOVELACE }],
      vault.scriptAddress,
    )
    .txInScript(vault.scriptCbor) // the native script guarding this UTxO
    .invalidBefore(vault.unlockSlot) // proves we're past the "after" deadline
    .requiredSignerHash(pubKeyHash) // the script needs your signature
    .changeAddress(address) // the 5 ADA (minus fee) comes back to you
    .selectUtxosFrom(await wallet.getUtxos())
    .complete();

  const signedTx = await wallet.signTx(unsignedTx, true); // partial: sign the script input
  return wallet.submitTx(signedTx);
}
// #endregion vault-unlock
