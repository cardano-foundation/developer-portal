import {
  DEFAULT_PROTOCOL_PARAMETERS, DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST, DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher, deserializeAddress, serializeData,
} from "@meshsdk/core";
import type { Asset, Data, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { PREFIX, arrayDatum, elementDatum, keyOf, scripts } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";

// Public test-only mnemonic, never funded on a network. No submitter is used.
const WORDS = "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(" ");

export async function offlineChain(version: Version, count = 1, withState = true) {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  fetcher.fetchCostModels = async () => [DEFAULT_V1_COST_MODEL_LIST, DEFAULT_V2_COST_MODEL_LIST, DEFAULT_V3_COST_MODEL_LIST];
  let counter = 0;
  function addUtxo(address: string, amount: Asset[], datum?: Data): UTxO {
    const utxo = {
      input: { txHash: (++counter).toString(16).padStart(64, "0"), outputIndex: 0 },
      output: { address, amount, ...(datum ? { plutusData: serializeData(datum) } : {}) },
    };
    fetcher.addUTxOs([utxo]);
    return utxo;
  }
  const wallet = new MeshWallet({ networkId: 0, fetcher, key: { type: "mnemonic", words: WORDS } });
  await wallet.init();
  const walletAddress = await wallet.getChangeAddress();
  const operator = deserializeAddress(walletAddress).pubKeyHash;
  const funding = addUtxo(walletAddress, [{ unit: "lovelace", quantity: "10000000000" }]);
  const collateral = addUtxo(walletAddress, [{ unit: "lovelace", quantity: "5000000" }]);
  const seed = funding;
  const deployed = scripts(version, seed.input, operator);
  const entries = Array.from({ length: count }, (_, n) => ({ key: keyOf(2 * (n + 1)), label: "participant" }));
  const amount = (name: string) => [{ unit: "lovelace", quantity: "100000000" }, { unit: deployed.policy + name, quantity: "1" }];
  // These stand in for state reached through valid prior transitions. The
  // lifecycle test separately mints and applies each transition to the UTxO set.
  const array = withState && version === "naive" ? addUtxo(deployed.address, amount(""), arrayDatum(entries)) : undefined;
  const root = withState && version !== "naive" ? addUtxo(deployed.address, amount(""), elementDatum(undefined, entries[0]?.key)) : undefined;
  const nodes = withState && version !== "naive" ? entries.map((entry, n) => addUtxo(deployed.address, amount(PREFIX + entry.key), elementDatum(entry, entries[n + 1]?.key))) : [];
  const probe = addUtxo(deployed.proofAddress, [{ unit: "lovelace", quantity: "5000000" }], { alternative: 0, fields: [] });
  return { fetcher, wallet, walletAddress, operator, funding, collateral, seed, deployed, entries, array, root, nodes, probe, addUtxo, evaluator: new OfflineEvaluator(fetcher, "preview") };
}

export type Chain = Awaited<ReturnType<typeof offlineChain>>;
