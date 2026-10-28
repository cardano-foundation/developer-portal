import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  deserializeAddress,
  serializeData,
} from "@meshsdk/core";
import type { Asset, Data, UTxO } from "@meshsdk/core";
import { OfflineEvaluator, deserializeTx, getTransactionOutputs } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { REGISTRY_TOKEN, namePaymentAddress, registryAddress, registryPolicy } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { nameHex } from "./trie.ts";
import type { Registry } from "./registry.ts";
import { withMinimumAda } from "./value.ts";

// An in-memory chain with two funded wallets. No node and no waiting: the
// tests and the benchmark build real transactions and run the real compiled
// validators on them. Everything here is fixed, so the same code always
// measures the same numbers.

export const NETWORK = 0;

/// Who registers names in the tests.
const ALICE =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

/// Somebody else.
const BOB =
  "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(
    " ",
  );

/// A fresh chain: two funded wallets, and the UTxO a registry is created by
/// spending, always the same one so the registry's hash is too.
export async function offlineChain() {
  const fetcher = new OfflineFetcher("preview");
  const spent = new Set<string>();
  const key = (input: UTxO["input"]) => `${input.txHash}#${input.outputIndex}`;
  const fetchAddressUTxOs = fetcher.fetchAddressUTxOs.bind(fetcher);
  const fetchUTxOs = fetcher.fetchUTxOs.bind(fetcher);
  fetcher.fetchAddressUTxOs = async (...args) => (await fetchAddressUTxOs(...args)).filter((u) => !spent.has(key(u.input)));
  fetcher.fetchUTxOs = async (...args) => (await fetchUTxOs(...args)).filter((u) => !spent.has(key(u.input)));
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  // The offline fetcher has no cost models of its own, so hand it Mesh's
  // defaults, the ones the builder would fall back to anyway.
  fetcher.fetchCostModels = async () => [
    DEFAULT_V1_COST_MODEL_LIST,
    DEFAULT_V2_COST_MODEL_LIST,
    DEFAULT_V3_COST_MODEL_LIST,
  ];
  let txCounter = 0;

  function addUtxo(address: string, assets: Asset[], plutusData?: string): UTxO {
    txCounter += 1;
    const utxo = {
      input: { txHash: txCounter.toString(16).padStart(64, "0"), outputIndex: 0 },
      output: { address, amount: assets, ...(plutusData ? { plutusData } : {}) },
    };
    fetcher.addUTxOs([utxo]);
    return utxo;
  }

  const aliceWallet = await makeWallet(fetcher, ALICE);
  const bobWallet = await makeWallet(fetcher, BOB);
  const aliceAddress = await aliceWallet.getChangeAddress();
  const bobAddress = await bobWallet.getChangeAddress();
  // The seed first, so it is always the same UTxO.
  const seed = addUtxo(aliceAddress, [{ unit: "lovelace", quantity: "10000000" }]);
  let funding!: UTxO;
  for (const address of [aliceAddress, bobAddress]) {
    // A big ADA UTxO for fees and change, plus a 5 ADA one for collateral.
    const funded = addUtxo(address, [{ unit: "lovelace", quantity: "1000000000" }]);
    if (address === aliceAddress) funding = funded;
    addUtxo(address, [{ unit: "lovelace", quantity: "5000000" }]);
  }

  /// The registry for `version`, built by `wallet`.
  function registry<V extends Version>(version: V, wallet = aliceWallet): Registry<V> {
    return { wallet, provider: fetcher, version, seed, networkId: NETWORK, evaluator: new OfflineEvaluator(fetcher, "preview") };
  }

  /// The registry UTxO for `version`, holding `datum`, as a run of earlier
  /// transactions would have left it.
  function registryAt(version: Version, datum: Data): UTxO {
    const policy = registryPolicy(version, seed);
    const address = registryAddress(version, seed, NETWORK);
    return addUtxo(
      address,
      withMinimumAda(address, [
        { unit: "lovelace", quantity: "5000000" },
        { unit: policy + REGISTRY_TOKEN, quantity: "1" },
      ], datum, DEFAULT_PROTOCOL_PARAMETERS.coinsPerUtxoSize),
      serializeData(datum),
    );
  }

  /// A UTxO of `address`'s holding `name`'s token under `version`'s registry.
  function holding(version: Version, address: string, name: string): UTxO {
    return addUtxo(address, [
      { unit: "lovelace", quantity: "2000000" },
      { unit: registryPolicy(version, seed) + nameHex(name), quantity: "1" },
    ]);
  }

  /// `lovelace` sent to `name`, as `buildPayNameTx` would leave it.
  function paidToName(version: Version, name: string, lovelace: string): UTxO {
    return addUtxo(
      namePaymentAddress(registryPolicy(version, seed), NETWORK),
      [{ unit: "lovelace", quantity: lovelace }],
      serializeData(nameHex(name)),
    );
  }

  /// Advance the test UTxO set using actual outputs after successful checks.
  /// This is fixture bookkeeping, not a full ledger emulator.
  function applyTx(tx: string): UTxO[] {
    const inputs = deserializeTx(tx).body().inputs();
    for (let i = 0; i < inputs.len(); i++) {
      const input = inputs.get(i);
      spent.add(key({ txHash: input.transaction_id().to_hex(), outputIndex: input.index() }));
    }
    // CSL emits null optional fields; Mesh wallets expect absent fields.
    const outputs = getTransactionOutputs(tx).map(({ input, output }) => ({
      input,
      output: Object.fromEntries(Object.entries(output).filter(([, value]) => value != null)) as UTxO["output"],
    }));
    fetcher.addUTxOs(outputs);
    return outputs;
  }

  return {
    fetcher,
    aliceWallet,
    bobWallet,
    aliceAddress,
    bobAddress,
    alice: deserializeAddress(aliceAddress).pubKeyHash,
    bob: deserializeAddress(bobAddress).pubKeyHash,
    seed,
    funding,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
    addUtxo,
    registry,
    registryAt,
    holding,
    paidToName,
    applyTx,
  };
}

async function makeWallet(fetcher: OfflineFetcher, mnemonic: string[]): Promise<MeshWallet> {
  // No submitter: nothing here is ever submitted anywhere.
  const wallet = new MeshWallet({
    networkId: NETWORK,
    fetcher,
    key: { type: "mnemonic", words: mnemonic },
  });
  await wallet.init();
  return wallet;
}
