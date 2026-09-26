"use client";

/**
 * The Cardano paywall: list CIP-30 wallets, connect, pay, show the
 * unlocked response. This component is the template's stand-in for the
 * stock x402 paywall package, which does not cover Cardano yet.
 */
import { useEffect, useRef, useState } from "react";
import { createCip30Signer } from "@/lib/x402/cip30";
import {
  checkPayment,
  runPaymentFlow,
  type FlowOutcome,
  type FlowStep,
  type PreparedPayment,
} from "@/lib/x402/payFlow";

interface WalletInfo {
  key: string;
  name: string;
  icon?: string;
  enable: () => Promise<unknown>;
}

declare global {
  interface Window {
    cardano?: Record<string, { name?: string; icon?: string; enable?: () => Promise<unknown> }>;
  }
}

/* A real signing wallet exposes enable(); that alone distinguishes it from
   unrelated globals some extensions drop onto window.cardano. */
function listWallets(): WalletInfo[] {
  const injected = typeof window !== "undefined" ? window.cardano : undefined;
  if (!injected) return [];
  return Object.entries(injected)
    .filter(([, api]) => typeof api?.enable === "function")
    .map(([key, api]) => ({ key, name: api.name ?? key, icon: api.icon, enable: api.enable! }));
}

export default function Paywall({
  url,
  priceLabel,
  asset,
  maxAmount,
}: {
  url: string;
  priceLabel: string;
  /** Asset unit the buyer allows; defaults to lovelace. */
  asset?: string;
  /** Spend-control ceiling; a route priced above it is rejected client-side. */
  maxAmount?: string;
}) {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [busy, setBusy] = useState(false);
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [error, setError] = useState<string>();
  const [unlocked, setUnlocked] = useState<unknown>();
  const [elapsed, setElapsed] = useState(0);
  const [settled, setSettled] = useState<{ seconds: number; transaction?: string }>();
  // A signed payment whose result is not final yet. While it is set, the only
  // action offered is to check it again; paying again could charge twice.
  const [openPayment, setOpenPayment] = useState<PreparedPayment>();
  const sentAt = useRef<number>(undefined);

  useEffect(() => {
    setWallets(listWallets());
  }, []);

  // The counter measures the on-chain wait only, so it starts when the
  // signed payment is sent, not while the wallet popup is open: time spent
  // reviewing and typing a password is the user's, not the chain's.
  const sending = busy && steps.some(step => step.id === "pay");
  useEffect(() => {
    if (!sending) return;
    sentAt.current = Date.now();
    setElapsed(0);
    const timer = setInterval(
      () => setElapsed(Math.round((Date.now() - (sentAt.current ?? Date.now())) / 1000)),
      1000,
    );
    return () => clearInterval(timer);
  }, [sending]);

  const onStep = (step: FlowStep) => setSteps(s => [...s, step]);

  function finish(outcome: FlowOutcome) {
    if (outcome.status === "settled") {
      setOpenPayment(undefined);
      setSettled({
        seconds: sentAt.current ? Math.round((Date.now() - sentAt.current) / 1000) : 0,
        transaction: (outcome.receipt as { transaction?: string } | undefined)?.transaction,
      });
      setUnlocked(outcome.body);
    } else if (outcome.status === "failed") {
      setOpenPayment(undefined);
      setError(outcome.message);
    } else {
      setOpenPayment(outcome.payment);
      const where = outcome.transaction ? ` Transaction ${outcome.transaction} on preprod.cardanoscan.io.` : "";
      setError(`${outcome.message}${where} Check this payment again rather than paying again.`);
    }
  }

  async function run(task: () => Promise<FlowOutcome>) {
    setBusy(true);
    setError(undefined);
    setSteps([]);
    setSettled(undefined);
    sentAt.current = undefined;
    try {
      finish(await task());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  const pay = (wallet: WalletInfo) =>
    run(async () => {
      const api = await wallet.enable();
      const signer = await createCip30Signer(api, { baseUrl: `${window.location.origin}/api/blockfrost` });
      return runPaymentFlow(url, signer, onStep, { asset, maxAmount });
    });

  const checkAgain = (payment: PreparedPayment) => run(() => checkPayment(payment, onStep));

  if (unlocked) {
    return (
      <div className="card unlocked">
        <h3>Unlocked</h3>
        <pre>{JSON.stringify(unlocked, null, 2)}</pre>
        {settled && (
          <p className="muted settledLine">
            Paid and settled on preprod in {settled.seconds}s.{" "}
            {settled.transaction && (
              <a
                href={`https://preprod.cardanoscan.io/transaction/${settled.transaction}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View the transaction
              </a>
            )}
          </p>
        )}
      </div>
    );
  }


  return (
    <div className="card">
      <h3>{priceLabel}</h3>
      <p className="muted">
        Pay with a CIP-30 wallet on Cardano preprod. The wallet signs; the facilitator submits.
      </p>
      {wallets.length === 0 ? (
        <p className="muted">
          No CIP-30 wallet found. Install Eternl or Lace, switch it to preprod, and reload.
        </p>
      ) : (
        <div className="wallets">
          {wallets.map(wallet => (
            <button key={wallet.key} onClick={() => pay(wallet)} disabled={busy || !!openPayment}>
              {wallet.icon ? <img src={wallet.icon} alt="" width={18} height={18} /> : null}
              Pay with {wallet.name}
            </button>
          ))}
        </div>
      )}
      {steps.length > 0 && (
        <ol className="steps">
          {steps.map((step, i) => (
            <li key={i}>{step.title}</li>
          ))}
        </ol>
      )}
      {busy && (
        <p className="live">
          <span className="pulse" />
          {sending
            ? `The facilitator is submitting the transaction to Cardano and waiting for a block confirmation, usually 20 to 60 seconds. ${elapsed}s`
            : "Preparing the transaction, your wallet will ask you to sign."}
        </p>
      )}
      {openPayment && !busy && (
        <button onClick={() => checkAgain(openPayment)}>Check this payment again</button>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
