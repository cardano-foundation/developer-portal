import {
  MeshTxBuilder,
  mConStr0,
  mOutputReference,
  pubKeyAddress,
  serializeAddressObj,
} from "@meshsdk/core";
import type { Asset, Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import {
  REGISTRY_TOKEN,
  namePaymentAddress,
  namePaymentScriptCbor,
  registryAddress,
  registryPolicy,
  registryScriptCbor,
} from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { nameHex } from "./trie.ts";

/// What every registry transaction needs: who builds it, and which registry.
export type Registry = {
  wallet: IWallet;
  provider: IFetcher;
  version: Version;
  /// The UTxO the registry's creation spent: a parameter of its script.
  seed: UTxO;
  networkId: number;
  evaluator?: IEvaluator;
};

const unit = (registry: Registry, name: string) => registryPolicy(registry.version, registry.seed) + nameHex(name);

/// Create the registry: spend the seed, mint the registry token, and lock it
/// with the empty registry as its datum.
export async function buildGenesisTx(registry: Registry, empty: Data): Promise<string> {
  const script = registryScriptCbor(registry.version, registry.seed);
  const policy = registryPolicy(registry.version, registry.seed);
  const { seed } = registry;
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .txIn(seed.input.txHash, seed.input.outputIndex, seed.output.amount, seed.output.address)
    .mintPlutusScriptV3()
    .mint("1", policy, REGISTRY_TOKEN)
    .mintingScript(script)
    .mintRedeemerValue(mConStr0([]))
    .txOut(registryAddress(registry.version, seed, registry.networkId), [
      { unit: "lovelace", quantity: "5000000" },
      { unit: policy + REGISTRY_TOKEN, quantity: "1" },
    ])
    .txOutInlineDatumValue(empty);
  return await finish(txBuilder, registry.wallet);
}

// #region change
/// Spend the registry with `action`, and recreate it holding `next`. `mint`
/// is the name token minted (1) or burned (-1), if any. `holder` is a UTxO
/// holding the name's token, spent to show the transaction's builder holds the
/// name.
export async function buildChangeTx(
  registry: Registry,
  current: UTxO,
  action: Data,
  next: Data,
  mint?: { name: string; quantity: number },
  holder?: UTxO,
): Promise<string> {
  const script = registryScriptCbor(registry.version, registry.seed);
  const policy = registryPolicy(registry.version, registry.seed);
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .spendingPlutusScriptV3()
    .txIn(current.input.txHash, current.input.outputIndex, current.output.amount, current.output.address)
    .txInScript(script)
    .txInInlineDatumPresent()
    .txInRedeemerValue(action)
    // The registry again, with the same ADA and token, and the new names.
    .txOut(current.output.address, current.output.amount)
    .txOutInlineDatumValue(next);
  if (mint) {
    txBuilder
      .mintPlutusScriptV3()
      .mint(mint.quantity.toString(), policy, nameHex(mint.name))
      .mintingScript(script)
      .mintRedeemerValue(mConStr0([]));
  }
  if (holder) {
    txBuilder.txIn(holder.input.txHash, holder.input.outputIndex, holder.output.amount, holder.output.address);
  }
  return await finish(txBuilder, registry.wallet);
}
// #endregion change

/// Send `lovelace` to `name`: a plain payment to the contract that pays a
/// name, with the name as its datum. No script runs.
export async function buildPayNameTx(registry: Registry, name: string, lovelace: string): Promise<string> {
  const policy = registryPolicy(registry.version, registry.seed);
  return await new MeshTxBuilder({ fetcher: registry.provider })
    .txOut(namePaymentAddress(policy, registry.networkId), [{ unit: "lovelace", quantity: lovelace }])
    .txOutInlineDatumValue(nameHex(name))
    .changeAddress(await registry.wallet.getChangeAddress())
    .selectUtxosFrom(await registry.wallet.getUtxos())
    .complete();
}

// #region release-payment
/// Release a payment sent to a name, to the key the name points to now. The
/// registry is read, not spent: it is a reference input.
export async function buildReleasePaymentTx(
  registry: Registry,
  payment: UTxO,
  registryUtxo: UTxO,
  resolution: { target: string; proof: Data },
): Promise<string> {
  const policy = registryPolicy(registry.version, registry.seed);
  const paid = payment.output.amount.find((a) => a.unit === "lovelace")!.quantity;
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .spendingPlutusScriptV3()
    .txIn(payment.input.txHash, payment.input.outputIndex, payment.output.amount, payment.output.address)
    .txInScript(namePaymentScriptCbor(policy))
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr0([resolution.target, resolution.proof]))
    .readOnlyTxInReference(registryUtxo.input.txHash, registryUtxo.input.outputIndex)
    .txOut(serializeAddressObj(pubKeyAddress(resolution.target), registry.networkId), [
      { unit: "lovelace", quantity: paid },
    ])
    // Tagged with the payment it releases, so it cannot count for another.
    .txOutInlineDatumValue(mOutputReference(payment.input.txHash, payment.input.outputIndex));
  return await finish(txBuilder, registry.wallet);
}
// #endregion release-payment

/// The UTxO in `wallet` holding `name`'s token.
export async function holderOf(registry: Registry, name: string): Promise<UTxO | undefined> {
  const wanted = unit(registry, name);
  return (await registry.wallet.getUtxos()).find((u) => u.output.amount.some((a: Asset) => a.unit === wanted));
}

/// Add collateral, balance from `wallet`, and complete.
async function finish(txBuilder: MeshTxBuilder, wallet: IWallet): Promise<string> {
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  return await txBuilder
    .txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address,
    )
    .changeAddress(await wallet.getChangeAddress())
    .selectUtxosFrom(
      (await wallet.getUtxos()).filter(
        ({ input }) =>
          input.txHash !== collateral.input.txHash || input.outputIndex !== collateral.input.outputIndex,
      ),
    )
    .complete();
}

