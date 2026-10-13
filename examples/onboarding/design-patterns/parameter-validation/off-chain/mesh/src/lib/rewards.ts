import { MeshTxBuilder, mConStr0 } from "@meshsdk/core";
import type { Data, IEvaluator, IFetcher, IWallet, UTxO } from "@meshsdk/core";
import {
  REWARD_NAME_HEX,
  lockupAddress,
  lockupHash,
  lockupKind,
  lockupScriptCbor,
  policyId,
  policyScriptCbor,
  termsData,
} from "./blueprint.ts";
import type { Member, Policy } from "./blueprint.ts";

/// A lock-up checks nothing about its datum, but Mesh will not spend a script
/// input without one, so every reward output carries this empty constructor.
export const LOCKUP_DATUM = mConStr0([]);

/// What a reward mint needs: the admin's wallet, the program, and who gets
/// how many tokens.
export type Mint = {
  wallet: IWallet;
  provider: IFetcher;
  policy: Policy;
  /// The admin's key hash, a parameter of the policy.
  admin: string;
  /// When the program's lock-ups open.
  unlockAt: number;
  /// Each member, and the reward tokens their lock-up receives.
  rewards: { member: Member; quantity: number }[];
  /// The lock-ups the naive policy was deployed with. The others ignore it.
  listed?: string[];
  networkId: number;
  evaluator?: IEvaluator;
};

// #region redeemer
/// The policy's redeemer: the owner of each output that receives rewards, in
/// order. The naive policy reads nothing from it.
function mintRedeemer(policy: Policy, members: Member[]): Data {
  switch (lockupKind(policy)) {
    case "lockup":
      return policy === "naive" ? mConStr0([]) : members.map((m) => m.owner);
    case "terms":
    case "raw":
      return members.map(termsData);
  }
}
// #endregion redeemer

// #region mint
/// Mint reward tokens straight into each member's lock-up.
export async function buildMintRewardsTx(mint: Mint): Promise<string> {
  const policyCbor = policyScriptCbor(mint.policy, mint.admin, mint.unlockAt, mint.listed);
  const total = mint.rewards.reduce((sum, r) => sum + r.quantity, 0);
  const txBuilder = new MeshTxBuilder({ fetcher: mint.provider, evaluator: mint.evaluator })
    .mintPlutusScriptV3()
    .mint(total.toString(), policyId(policyCbor), REWARD_NAME_HEX)
    .mintingScript(policyCbor)
    .mintRedeemerValue(mintRedeemer(mint.policy, mint.rewards.map((r) => r.member)));
  // Outputs keep the order they are added in, so they line up with the
  // redeemer's list of members.
  for (const { member, quantity } of mint.rewards) {
    txBuilder
      .txOut(lockupAddress(mint.policy, member, mint.networkId), [
        { unit: "lovelace", quantity: "2000000" },
        { unit: policyId(policyCbor) + REWARD_NAME_HEX, quantity: quantity.toString() },
      ])
      .txOutInlineDatumValue(LOCKUP_DATUM);
  }
  txBuilder.requiredSignerHash(mint.admin);
  return await finish(txBuilder, mint.wallet);
}
// #endregion mint

/// The lock-up hashes for `members`, as the naive policy lists them.
export function listedLockups(policy: Policy, members: Member[]): string[] {
  return members.map((member) => lockupHash(policy, member));
}

// #region withdraw
/// The member takes everything their lock-up holds, after it opens. `from` is
/// the slot the transaction's window starts at.
export async function buildWithdrawTx(
  wallet: IWallet,
  provider: IFetcher,
  policy: Policy,
  member: Member,
  lockup: UTxO,
  from: number,
  evaluator?: IEvaluator,
): Promise<string> {
  // A `lockup_terms` spend states its terms, for the wrapper to check.
  const redeemer = lockupKind(policy) === "terms" ? mConStr0([termsData(member)]) : mConStr0([]);
  const txBuilder = new MeshTxBuilder({ fetcher: provider, evaluator })
    .spendingPlutusScriptV3()
    .txIn(lockup.input.txHash, lockup.input.outputIndex, lockup.output.amount, lockup.output.address)
    .txInScript(lockupScriptCbor(policy, member))
    .txInInlineDatumPresent()
    .txInRedeemerValue(redeemer)
    .invalidBefore(from)
    .requiredSignerHash(member.owner);
  return await finish(txBuilder, wallet);
}
// #endregion withdraw

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
