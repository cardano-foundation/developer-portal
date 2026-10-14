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
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { grantAddress, grantDatum } from "./blueprint.ts";
import type { Version } from "./blueprint.ts";
import { fromList, proofAt } from "./tree.ts";

// Public test-only mnemonic, never funded on any network. No submitter is used.
const WORDS = "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(" ");

export async function offlineChain(version: Version, count = 5, beneficiaryIndex = count - 1) {
  if (count < 1 || beneficiaryIndex < 0 || beneficiaryIndex >= count) throw new Error("invalid fixture size/index");
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
  const beneficiary = deserializeAddress(walletAddress).pubKeyHash;
  const funding = addUtxo(walletAddress, [{ unit: "lovelace", quantity: "10000000000" }]);
  const collateral = addUtxo(walletAddress, [{ unit: "lovelace", quantity: "5000000" }]);
  const members = Array.from({ length: count }, (_, n) => (n + 1).toString(16).padStart(56, "0"));
  members[beneficiaryIndex] = beneficiary;
  const tree = fromList(members)!;
  const proof = proofAt(tree, beneficiaryIndex);
  const datum = grantDatum(version, members, tree.hash);
  const grant = addUtxo(grantAddress(version), [{ unit: "lovelace", quantity: "100000000" }], datum);
  return {
    version, fetcher, wallet, walletAddress, beneficiary, funding, collateral,
    members, tree, proof, datum, grant, addUtxo,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
  };
}

export type Chain = Awaited<ReturnType<typeof offlineChain>>;
