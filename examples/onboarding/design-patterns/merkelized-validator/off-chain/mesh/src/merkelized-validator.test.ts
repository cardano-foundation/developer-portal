import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MeshTxBuilder, mConStr0, mOutputReference, resolveTxHash } from "@meshsdk/core";
import type { UTxO } from "@meshsdk/core";
import { csl, deserializeTx } from "@meshsdk/core-csl";
import { VERSIONS, deploy, quoteInput, quotedPrice, voucherDatum } from "./lib/blueprint.ts";
import type { Script, Source, Version } from "./lib/blueprint.ts";
import { measureAll, referenceFee } from "./lib/costs.ts";
import { offlineChain } from "./lib/offline.ts";
import type { Chain } from "./lib/offline.ts";
import { buildPublishTx, buildRegisterTx, buildTransaction, minimumReferenceAda, transactionPlan } from "./lib/transactions.ts";
import type { Action, Plan } from "./lib/transactions.ts";

const tags = (runs: { tag: string }[]) => runs.map((r) => r.tag).sort();
const body = (tx: string) => JSON.parse(deserializeTx(tx).to_json()).body;
const quoteWithdrawal = (plan: Plan, chain: Chain) => plan.withdrawals.find((w) => w.script.hash === chain.deployment.quote!.hash)!;
const codeWithdrawal = (plan: Plan, chain: Chain) => plan.withdrawals.find((w) => w.script.hash === chain.deployment.code!.hash)!;

test("reference fees use Conway tiers and one final floor", () => {
  assert.equal(referenceFee(0), 0);
  assert.equal(referenceFee(25_600), 384_000);
  assert.equal(referenceFee(25_601), 384_018);
  assert.equal(referenceFee(51_200), 844_800);
  assert.equal(referenceFee(51_201), 844_821); // floor(844_800 + 21.6)
  assert.equal(referenceFee(51_202), 844_843); // Floor the sum, not each byte's fee.
  assert.equal(referenceFee(76_800), 1_397_760);
  assert.equal(referenceFee(76_801), 1_397_785); // floor(1_397_760 + 25.92)
});

for (const version of VERSIONS) {
  for (const source of ["inline", "reference"] as const) {
    for (const action of ["purchase", "cancel"] as const) {
      test(`${version}/${source}: ${action} runs exactly the required handlers`, async () => {
        const chain = await offlineChain(version, 5);
        const tx = await buildTransaction(chain, transactionPlan(chain, action), source, chain.evaluator);
        const expected = Array(5).fill("SPEND");
        if (version !== "naive" && action === "purchase") expected.push("REWARD", "REWARD");
        assert.deepEqual(tags(await chain.evaluator.evaluateTx(tx, [], [])), expected.sort());
        if (source === "reference") {
          assert.equal(body(tx).reference_inputs.length, action === "cancel" || version === "naive" ? 1 : 3);
          assert.equal(deserializeTx(tx).witness_set().plutus_scripts()?.len() ?? 0, 0);
        }
        // References are read, never selected as funding inputs.
        for (const ref of chain.references.values()) {
          assert.ok(!body(tx).inputs.some((i: { transaction_id: string }) => i.transaction_id === ref.input.txHash));
        }
      });
    }
  }
}

async function forge(version: Version, action: Action, change: (plan: Plan, chain: Chain) => void, count = 1) {
  const chain = await offlineChain(version, count);
  const plan = transactionPlan(chain, action);
  await chain.evaluator.evaluateTx(await buildTransaction(chain, plan, "reference"), [], []);
  change(plan, chain);
  return chain.evaluator.evaluateTx(await buildTransaction(chain, plan, "reference"), [], []);
}

for (const version of VERSIONS) {
  for (const paymentKind of ["key", "script"] as const) {
    for (const stakeKind of ["key", "script", "none"] as const) {
      test(`${version}: preserves the merchant's ${paymentKind}/${stakeKind} credentials`, async () => {
        // Identical hash bytes with different credential types must stay distinct.
        const credential = (kind: "key" | "script", hash: string) => kind === "key"
          ? csl.Credential.from_keyhash(csl.Ed25519KeyHash.from_hex(hash))
          : csl.Credential.from_scripthash(csl.ScriptHash.from_hex(hash));
        const payment = credential(paymentKind, "ab".repeat(28));
        const stake = stakeKind === "none" ? undefined : credential(stakeKind, "cd".repeat(28));
        const address = (pay: typeof payment, staking = stake) => (staking
          ? csl.BaseAddress.new(0, pay, staking)
          : csl.EnterpriseAddress.new(0, pay)).to_address().to_bech32();
        const c = await offlineChain(version);
        c.merchantAddress = address(payment);
        c.deployment = deploy(version, c.merchantAddress, c.policy);
        c.vouchers = [c.addUtxo(c.deployment.root.address, c.vouchers[0]!.output.amount, voucherDatum(c.voucher))];
        for (const script of [c.deployment.root, c.deployment.quote, c.deployment.code]) {
          if (script) c.publishFixture(script);
        }
        const plan = transactionPlan(c, "purchase");
        const evaluate = async () => c.evaluator.evaluateTx(await buildTransaction(c, plan, "reference"), [], []);
        assert.deepEqual(tags(await evaluate()), version === "naive" ? ["SPEND"] : ["REWARD", "REWARD", "SPEND"]);

        const wrongAddresses = [address(credential(paymentKind === "key" ? "script" : "key", "ab".repeat(28)))];
        if (stakeKind === "none") {
          wrongAddresses.push(address(payment, credential("key", "cd".repeat(28))));
        } else {
          wrongAddresses.push(csl.EnterpriseAddress.new(0, payment).to_address().to_bech32());
          wrongAddresses.push(address(payment, credential(stakeKind === "key" ? "script" : "key", "cd".repeat(28))));
        }
        for (const wrongAddress of wrongAddresses) {
          plan.payments[0]!.address = wrongAddress;
          await assert.rejects(evaluate(), /"tag":"spend"/);
        }
      });
    }
  }
  test(`${version}: refuses unsupported merchant address forms`, async () => {
    const c = await offlineChain(version);
    const pointer = csl.PointerAddress.new(
      0, csl.Credential.from_keyhash(csl.Ed25519KeyHash.from_hex(c.owner)), csl.Pointer.new(1, 2, 3),
    ).to_address().to_bech32();
    for (const merchant of [c.deployment.root.rewardAddress, pointer]) {
      assert.throws(() => deploy(version, merchant, c.policy), /base or enterprise payment address/);
    }
  });
  for (const action of ["purchase", "cancel"] as const) {
    test(`${version}: only the owner may ${action}`, async () => {
      await assert.rejects(forge(version, action, (p) => { p.signed = false; }), /"tag":"spend"/);
    });
    test(`${version}: malformed owner hashes cannot authorize ${action}`, async () => {
      for (const length of [0, 27, 29]) {
        await assert.rejects(forge(version, action, (p, c) => {
          // Keep the real 28-byte signer; vary only the owner in the untrusted datum.
          const owner = (c.owner + "00").slice(0, length * 2);
          const utxo = c.addUtxo(
            c.deployment.root.address, c.vouchers[0]!.output.amount,
            voucherDatum({ ...c.voucher, owner }),
          );
          p.inputs[0]!.utxo = utxo;
          // Preserve the payment binding so an incorrect tag cannot cause the refusal.
          if (action === "purchase") {
            p.payments[0]!.datum = mOutputReference(utxo.input.txHash, utxo.input.outputIndex);
          }
        }), /"tag":"spend"/);
      }
    });
  }
  test(`${version}: verified price must be paid`, async () => {
    await assert.rejects(forge(version, "purchase", (p) => { p.payments[0]!.lovelace--; }), /"tag":"spend"/);
  });
  test(`${version}: payment cannot be redirected`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => { p.payments[0]!.address = c.ownerAddress; }), /"tag":"spend"/);
  });
  test(`${version}: payment must carry the voucher's reference`, async () => {
    await assert.rejects(forge(version, "purchase", (p) => { p.payments[0]!.datum = mOutputReference("ff".repeat(32), 0); }), /"tag":"spend"/);
  });
  test(`${version}: two vouchers cannot share a single payment`, async () => {
    await assert.rejects(forge(version, "purchase", (p) => {
      const fields = (p.inputs[1]!.redeemer as { fields: unknown[] }).fields;
      p.inputs[1]!.redeemer = mConStr0([fields[0] as number, fields[1] as number, 0]);
    }, 2), /"tag":"spend"/);
  });
}

for (const version of ["byHand", "withLibrary"] as const) {
  test(`${version}: a valid computation with a fabricated result is refused by the worker`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      const fabricated = quotedPrice(c.policy, c.voucher) + 1;
      quoteWithdrawal(p, c).redeemer = mConStr0([quoteInput(c.voucher), fabricated]);
      p.payments[0]!.lovelace = fabricated;
    }), /"tag":"reward"/);
  });
  test(`${version}: another service's correct price cannot be substituted`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      const different = { ...c.voucher, serviceId: c.policy.catalogue[0]!.serviceId };
      const price = quotedPrice(c.policy, different);
      quoteWithdrawal(p, c).redeemer = mConStr0([quoteInput(different), price]);
      p.payments[0]!.lovelace = price;
    }), /"tag":"spend"/);
  });
  test(`${version}: another quantity's correct price cannot be substituted`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      const different = { ...c.voucher, units: 1 };
      const price = quotedPrice(c.policy, different);
      quoteWithdrawal(p, c).redeemer = mConStr0([quoteInput(different), price]);
      p.payments[0]!.lovelace = price;
    }), /"tag":"spend"/);
  });
  test(`${version}: another valid redemption code cannot be substituted`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      codeWithdrawal(p, c).redeemer = mConStr0([c.policy.codes[0]!]);
    }), /"tag":"spend"/);
  });
  for (const which of ["quote", "code"] as const) {
    test(`${version}: missing ${which} invocation fails`, async () => {
      await assert.rejects(forge(version, "purchase", (p, c) => {
        p.withdrawals = p.withdrawals.filter((w) => w.script.hash !== c.deployment[which]!.hash);
      }), /"tag":"spend"/);
    });
  }
  for (const kind of ["spend", "same", "swapped", "pastEnd"] as const) {
    test(`${version}: ${kind} redeemer hints are refused`, async () => {
      await assert.rejects(forge(version, "purchase", (p) => {
        const [q, c] = (p.inputs[0]!.redeemer as { fields: number[] }).fields;
        const indices = kind === "spend" ? [0, c!] : kind === "same" ? [q!, q!] : kind === "swapped" ? [c!, q!] : [99, c!];
        p.inputs[0]!.redeemer = mConStr0([...indices, 0]);
      }), /"tag":"spend"/);
    });
  }
  test(`${version}: a different correctly executing worker cannot replace the pinned one`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      const policy = { ...c.policy, catalogue: [{ serviceId: c.voucher.serviceId, unitPrice: 2_000_000 }] };
      const alternative = deploy(version, c.merchantAddress, policy).quote!;
      assert.notEqual(alternative.hash, c.deployment.quote!.hash);
      c.deployment.quote = alternative; // The old gate's code and hash stay fixed.
      c.publishFixture(alternative);
      const fresh = transactionPlan(c, "purchase");
      const price = quotedPrice(policy, c.voucher);
      quoteWithdrawal(fresh, c).redeemer = mConStr0([quoteInput(c.voucher), price]);
      fresh.payments[0]!.lovelace = price;
      Object.assign(p, fresh);
    }), /"tag":"spend"/);
  });
  test(`${version}: referencing code alone does not execute a worker`, async () => {
    await assert.rejects(forge(version, "purchase", (p, c) => {
      p.withdrawals = [];
      p.extraReferences = [c.deployment.quote!, c.deployment.code!].map((script) => ({ script, utxo: c.references.get(script.hash)! }));
    }), /"tag":"spend"/);
  });
  test(`${version}: unused reference code is still charged and does not run`, async () => {
    const c = await offlineChain(version);
    const honest = transactionPlan(c, "cancel");
    const tx = await buildTransaction(c, honest, "reference", c.evaluator);
    const script = c.deployment.quote!;
    honest.extraReferences.push({ script, utxo: c.references.get(script.hash)! });
    const withUnused = await buildTransaction(c, honest, "reference", c.evaluator);
    assert.deepEqual(tags(await c.evaluator.evaluateTx(withUnused, [], [])), ["SPEND"]);
    assert.equal(body(withUnused).reference_inputs.length, 2);
    assert.ok(Number(body(withUnused).fee) - Number(body(tx).fee) >= referenceFee(script.size));
  });
  test(`${version}: a published copy at another address works by code hash`, async () => {
    const c = await offlineChain(version);
    for (const script of [c.deployment.root, c.deployment.quote!, c.deployment.code!]) {
      const ref = c.addUtxo(c.merchantAddress, [{ unit: "lovelace", quantity: "100000000" }], undefined, script);
      c.references.set(script.hash, ref);
    }
    assert.deepEqual(tags(await c.evaluator.evaluateTx(await buildTransaction(c, transactionPlan(c, "purchase"), "reference"), [], [])), ["REWARD", "REWARD", "SPEND"]);
  });
  test(`${version}: worker deregistration is refused`, async () => {
    const c = await offlineChain(version);
    const worker = c.deployment.quote!;
    const f = c.funding;
    const col = c.collateral;
    const tx = await new MeshTxBuilder({ fetcher: c.fetcher })
      .txIn(f.input.txHash, f.input.outputIndex, f.output.amount, f.output.address)
      .deregisterStakeCertificate(worker.rewardAddress).certificateScript(worker.cbor, "V3").certificateRedeemerValue(mConStr0([]))
      .txInCollateral(col.input.txHash, col.input.outputIndex, col.output.amount, col.output.address)
      .changeAddress(c.ownerAddress).complete();
    await assert.rejects(c.evaluator.evaluateTx(tx, [], []), /"tag":"cert"/);
  });
}

/// Materialize one output from a real transaction. Publications contain only
/// ada and code, while change contains only ada in this fixture.
function outputOf(tx: string, index: number): UTxO {
  const output = deserializeTx(tx).body().outputs().get(index);
  const json = JSON.parse(output.to_json());
  const ref = output.script_ref();
  return {
    input: { txHash: resolveTxHash(tx), outputIndex: index },
    output: {
      address: json.address, amount: [{ unit: "lovelace", quantity: json.amount.coin }],
      ...(ref ? { scriptRef: Buffer.from(ref.to_unwrapped_bytes()).toString("hex"), scriptHash: ref.plutus_script()!.hash().to_hex() } : {}),
    },
  };
}

for (const version of VERSIONS) {
  test(`${version}: published modules and actual change are used in the later spend`, async () => {
    const c = await offlineChain(version);
    if (version !== "naive") {
      const register = await buildRegisterTx(c);
      assert.equal(body(register).certs.length, 2);
      c.funding = outputOf(register, deserializeTx(register).body().outputs().len() - 1);
      c.fetcher.addUTxOs([c.funding]);
    }
    for (const script of [c.deployment.root, c.deployment.quote, c.deployment.code]) {
      if (!script) continue;
      const tx = await buildPublishTx(c, script);
      const ref = outputOf(tx, 0);
      assert.equal(ref.output.scriptHash, script.hash);
      assert.ok(BigInt(ref.output.amount[0]!.quantity) >= await minimumReferenceAda(c, script));
      c.references.set(script.hash, ref);
      c.funding = outputOf(tx, deserializeTx(tx).body().outputs().len() - 1);
      c.fetcher.addUTxOs([ref, c.funding]);
    }
    const tx = await buildTransaction(c, transactionPlan(c, "purchase"), "reference", c.evaluator);
    assert.deepEqual(tags(await c.evaluator.evaluateTx(tx, [], [])), version === "naive" ? ["SPEND"] : ["REWARD", "REWARD", "SPEND"]);
  });
}

test("costs.json matches the current scripts, models, fees, and boundaries", async () => {
  assert.deepEqual(await measureAll(), JSON.parse(readFileSync(new URL("../costs.json", import.meta.url), "utf8")));
});
