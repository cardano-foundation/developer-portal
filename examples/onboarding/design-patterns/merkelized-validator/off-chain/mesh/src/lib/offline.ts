import {
  DEFAULT_PROTOCOL_PARAMETERS, DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST, DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher, deserializeAddress, serializeData,
} from "@meshsdk/core";
import type { Asset, Data, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { deploy, policyOf, voucherDatum } from "./blueprint.ts";
import type { Script, Version, Voucher } from "./blueprint.ts";

// Public test-only mnemonics. These wallets are funded only by the offline fixture.
const OWNER = "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(" ");
const MERCHANT = "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(" ");

export async function offlineChain(version: Version, count = 1, policySize = 96) {
  const fetcher = new OfflineFetcher("preview");
  fetcher.addProtocolParameters(DEFAULT_PROTOCOL_PARAMETERS);
  fetcher.fetchCostModels = async () => [DEFAULT_V1_COST_MODEL_LIST, DEFAULT_V2_COST_MODEL_LIST, DEFAULT_V3_COST_MODEL_LIST];
  // Registration is a phase-1 rule outside OfflineEvaluator. Fixture accounts
  // stand in for credentials registered by buildRegisterTx, with zero rewards.
  fetcher.fetchAccountInfo = async () => ({ active: true, balance: "0", rewards: "0", withdrawals: "0" });
  let counter = 0;
  function addUtxo(address: string, amount: Asset[], datum?: Data, script?: Script): UTxO {
    const utxo: UTxO = {
      input: { txHash: (++counter).toString(16).padStart(64, "0"), outputIndex: 0 },
      output: {
        address, amount,
        ...(datum ? { plutusData: serializeData(datum) } : {}),
        ...(script ? { scriptRef: script.scriptRef, scriptHash: script.hash } : {}),
      },
    };
    fetcher.addUTxOs([utxo]);
    return utxo;
  }
  async function makeWallet(words: string[]) {
    const wallet = new MeshWallet({ networkId: 0, fetcher, key: { type: "mnemonic", words } });
    await wallet.init();
    return wallet;
  }
  const wallet = await makeWallet(OWNER);
  const merchantWallet = await makeWallet(MERCHANT);
  const ownerAddress = await wallet.getChangeAddress();
  const merchantAddress = await merchantWallet.getChangeAddress();
  const owner = deserializeAddress(ownerAddress).pubKeyHash;
  const funding = addUtxo(ownerAddress, [{ unit: "lovelace", quantity: "10000000000" }]);
  const collateral = addUtxo(ownerAddress, [{ unit: "lovelace", quantity: "5000000" }]);
  const policy = policyOf(policySize);
  const deployment = deploy(version, merchantAddress, policy);
  const voucher: Voucher = { owner, serviceId: policy.catalogue.at(-1)!.serviceId, units: 2, redemptionCode: policy.codes.at(-1)! };
  const vouchers = Array.from({ length: count }, () => addUtxo(deployment.root.address, [{ unit: "lovelace", quantity: "10000000" }], voucherDatum(voucher)));
  // Large deposits are fixtures, not the minimum required to publish code.
  const references = new Map<string, UTxO>();
  function publishFixture(script: Script): UTxO {
    const utxo = addUtxo(ownerAddress, [{ unit: "lovelace", quantity: "100000000" }], undefined, script);
    references.set(script.hash, utxo);
    return utxo;
  }
  for (const script of [deployment.root, deployment.quote, deployment.code]) if (script) publishFixture(script);
  return {
    fetcher, wallet, owner, ownerAddress, merchantAddress, funding, collateral,
    policy, deployment, voucher, vouchers, references, addUtxo, publishFixture,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
  };
}

export type Chain = Awaited<ReturnType<typeof offlineChain>>;
