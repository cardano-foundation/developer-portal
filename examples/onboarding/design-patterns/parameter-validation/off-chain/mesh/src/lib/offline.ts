import {
  DEFAULT_PROTOCOL_PARAMETERS,
  DEFAULT_V1_COST_MODEL_LIST,
  DEFAULT_V2_COST_MODEL_LIST,
  DEFAULT_V3_COST_MODEL_LIST,
  OfflineFetcher,
  SLOT_CONFIG_NETWORK,
  deserializeAddress,
  serializeData,
  slotToBeginUnixTime,
} from "@meshsdk/core";
import type { Asset, UTxO } from "@meshsdk/core";
import { OfflineEvaluator } from "@meshsdk/core-csl";
import { MeshWallet } from "@meshsdk/wallet";
import { REWARD_NAME_HEX, lockupAddress, policyId, policyScriptCbor } from "./blueprint.ts";
import type { Member, Policy } from "./blueprint.ts";
import { LOCKUP_DATUM } from "./rewards.ts";

// An in-memory chain with two funded wallets. No node and no waiting: the
// tests and the benchmark build real transactions and run the real compiled
// validators on them. Everything here is fixed, so the same code always
// measures the same numbers.

export const NETWORK = 0;

/// The slot the program's lock-ups open at. Any slot works offline.
export const UNLOCK_SLOT = 100_000_000;

/// When a slot starts, in POSIX milliseconds.
export function slotTime(slot: number): number {
  return slotToBeginUnixTime(slot, SLOT_CONFIG_NETWORK.preview);
}

/// Who runs the rewards program.
const ADMIN =
  "system envelope wine dune joy cage senior predict lift lunch foam bring shoe permit boss balcony inherit fold cat again stone topic truly all".split(
    " ",
  );

/// A member who withdraws from their lock-up in the tests.
const MEMBER =
  "menu wave fan siege muffin injury flight own swarm girl lawsuit rely drift render spray peasant snack response sorry scorpion illegal nation erupt enough".split(
    " ",
  );

/// A fresh chain: an empty UTxO set, and two funded wallets.
export async function offlineChain() {
  const fetcher = new OfflineFetcher("preview");
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

  const adminWallet = await makeWallet(fetcher, ADMIN);
  const memberWallet = await makeWallet(fetcher, MEMBER);
  for (const wallet of [adminWallet, memberWallet]) {
    const address = await wallet.getChangeAddress();
    // A big ADA UTxO for fees and change, plus a 5 ADA one for collateral.
    addUtxo(address, [{ unit: "lovelace", quantity: "1000000000" }]);
    addUtxo(address, [{ unit: "lovelace", quantity: "5000000" }]);
  }
  const adminAddress = await adminWallet.getChangeAddress();
  const admin = deserializeAddress(adminAddress).pubKeyHash;
  const unlockAt = slotTime(UNLOCK_SLOT);

  /// The member with a wallet, under the program's date.
  const member: Member = {
    owner: deserializeAddress(await memberWallet.getChangeAddress()).pubKeyHash,
    unlockAt,
  };

  /// `count` members: the one with a wallet, then members who only need a key
  /// hash, because nothing here signs for them.
  function members(count: number): Member[] {
    return Array.from({ length: count }, (_, i) =>
      i === 0 ? member : { owner: (i + 1).toString(16).padStart(56, "0"), unlockAt },
    );
  }

  /// A lock-up for `who` under `policy`, already holding `quantity` reward
  /// tokens, as a mint would leave it.
  function rewarded(policy: Policy, who: Member, quantity: number): UTxO {
    const id = policyId(policyScriptCbor(policy, admin, unlockAt));
    return addUtxo(
      lockupAddress(policy, who, NETWORK),
      [
        { unit: "lovelace", quantity: "2000000" },
        { unit: id + REWARD_NAME_HEX, quantity: quantity.toString() },
      ],
      serializeData(LOCKUP_DATUM),
    );
  }

  return {
    fetcher,
    adminWallet,
    memberWallet,
    admin,
    adminAddress,
    unlockAt,
    member,
    members,
    evaluator: new OfflineEvaluator(fetcher, "preview"),
    addUtxo,
    rewarded,
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
