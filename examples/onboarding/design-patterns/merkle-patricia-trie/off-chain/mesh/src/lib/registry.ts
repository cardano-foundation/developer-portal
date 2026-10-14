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
import { nameHex, targetHash } from "./trie.ts";
import { withMinimumAda } from "./value.ts";

/// What every registry transaction needs: who builds it, and which registry.
export type Registry<V extends Version = Version> = {
  wallet: IWallet;
  provider: IFetcher;
  version: V;
  /// The UTxO the registry's creation spent: a parameter of its script.
  seed: UTxO;
  networkId: number;
  evaluator?: IEvaluator;
  /// Pin a script transaction's funding input for reproducible measurements.
  /// It must cover fees and deposit top-ups, and be distinct from collateral.
  funding?: UTxO;
};

export type TrieRegistry = Registry<Exclude<Version, "naive">>;

function requireTrie(registry: Registry): asserts registry is TrieRegistry {
  if (registry.version === "naive") throw new Error("paying a name requires a trie registry; naive is not supported");
}

const unit = (registry: Registry, name: string) => registryPolicy(registry.version, registry.seed) + nameHex(name);

/// Create the registry: spend the seed, mint the registry token, and lock it
/// with the empty registry as its datum.
export async function buildGenesisTx(registry: Registry, empty: Data): Promise<string> {
  const script = registryScriptCbor(registry.version, registry.seed);
  const policy = registryPolicy(registry.version, registry.seed);
  const { seed } = registry;
  const address = registryAddress(registry.version, seed, registry.networkId);
  const amount = await fundedAmount(registry, address, [
    { unit: "lovelace", quantity: "5000000" },
    { unit: policy + REGISTRY_TOKEN, quantity: "1" },
  ], empty);
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .txIn(seed.input.txHash, seed.input.outputIndex, seed.output.amount, seed.output.address)
    .mintPlutusScriptV3()
    .mint("1", policy, REGISTRY_TOKEN)
    .mintingScript(script)
    .mintRedeemerValue(mConStr0([]))
    .txOut(address, amount)
    .txOutInlineDatumValue(empty);
  return await finish(txBuilder, registry);
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
  const amount = await fundedAmount(registry, current.output.address, current.output.amount, next);
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .spendingPlutusScriptV3()
    .txIn(current.input.txHash, current.input.outputIndex, current.output.amount, current.output.address)
    .txInScript(script)
    .txInInlineDatumPresent()
    .txInRedeemerValue(action)
    // Preserve the deposit and add ADA if the new datum needs more.
    .txOut(current.output.address, amount)
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
  return await finish(txBuilder, registry);
}
// #endregion change

/// Send `lovelace` to `name`: a plain payment to the contract that pays a
/// name, with the name as its datum. No script runs.
export async function buildPayNameTx(registry: TrieRegistry, name: string, lovelace: string): Promise<string> {
  requireTrie(registry);
  const policy = registryPolicy(registry.version, registry.seed);
  const address = namePaymentAddress(policy, registry.networkId);
  const datum = nameHex(name);
  const amount = await fundedAmount(registry, address, [{ unit: "lovelace", quantity: lovelace }], datum);
  const [collateral] = await registry.wallet.getCollateral();
  return await new MeshTxBuilder({ fetcher: registry.provider })
    .txOut(address, amount)
    .txOutInlineDatumValue(datum)
    .changeAddress(await registry.wallet.getChangeAddress())
    // Keep the wallet's collateral available for a later script transaction.
    .selectUtxosFrom((await registry.wallet.getUtxos()).filter((u) =>
      !collateral || u.input.txHash !== collateral.input.txHash || u.input.outputIndex !== collateral.input.outputIndex,
    ))
    .complete();
}

// #region release-payment
/// Release a payment sent to a name, to the key the name points to now. The
/// registry is read, not spent: it is a reference input.
export async function buildReleasePaymentTx(
  registry: TrieRegistry,
  payment: UTxO,
  registryUtxo: UTxO,
  resolution: { target: string; proof: Data },
): Promise<string> {
  requireTrie(registry);
  const policy = registryPolicy(registry.version, registry.seed);
  const paid = payment.output.amount.find((a) => a.unit === "lovelace")!.quantity;
  const target = targetHash(resolution.target);
  const address = serializeAddressObj(pubKeyAddress(target), registry.networkId);
  const tag = mOutputReference(payment.input.txHash, payment.input.outputIndex);
  const amount = await fundedAmount(registry, address, [{ unit: "lovelace", quantity: paid }], tag);
  const txBuilder = new MeshTxBuilder({ fetcher: registry.provider, evaluator: registry.evaluator })
    .spendingPlutusScriptV3()
    .txIn(payment.input.txHash, payment.input.outputIndex, payment.output.amount, payment.output.address)
    .txInScript(namePaymentScriptCbor(policy))
    .txInInlineDatumPresent()
    .txInRedeemerValue(mConStr0([target, resolution.proof]))
    .readOnlyTxInReference(registryUtxo.input.txHash, registryUtxo.input.outputIndex)
    .txOut(address, amount)
    // Tagged with the payment it releases, so it cannot count for another.
    .txOutInlineDatumValue(tag);
  return await finish(txBuilder, registry);
}
// #endregion release-payment

async function fundedAmount(registry: Registry, address: string, amount: Asset[], datum: Data): Promise<Asset[]> {
  const parameters = await registry.provider.fetchProtocolParameters(Number.NaN);
  return withMinimumAda(address, amount, datum, parameters.coinsPerUtxoSize);
}

/// The UTxO in `wallet` holding `name`'s token.
export async function holderOf(registry: Registry, name: string): Promise<UTxO | undefined> {
  const wanted = unit(registry, name);
  return (await registry.wallet.getUtxos()).find((u) => u.output.amount.some((a: Asset) => a.unit === wanted));
}

/// Add collateral, balance from `wallet`, and complete.
async function finish(txBuilder: MeshTxBuilder, registry: Registry): Promise<string> {
  const { wallet, funding } = registry;
  const collateral = (await wallet.getCollateral())[0];
  if (!collateral) {
    throw new Error(
      "no collateral: this wallet needs a UTxO holding at least 5 ADA and no tokens. " +
        "Send it some test ADA and try again.",
    );
  }
  if (funding) {
    if (funding.input.txHash === collateral.input.txHash && funding.input.outputIndex === collateral.input.outputIndex) {
      throw new Error("the funding input must be distinct from collateral");
    }
    txBuilder.txIn(funding.input.txHash, funding.input.outputIndex, funding.output.amount, funding.output.address);
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
      funding ? [] : (await wallet.getUtxos()).filter(
        ({ input }) =>
          input.txHash !== collateral.input.txHash || input.outputIndex !== collateral.input.outputIndex,
      ),
    )
    .complete();
}
