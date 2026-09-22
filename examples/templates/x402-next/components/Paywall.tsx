"use client";

/**
 * The Cardano paywall: list CIP-30 wallets, connect, pay, show the
 * unlocked response. This component is the template's stand-in for the
 * stock x402 paywall package, which does not cover Cardano yet.
 */
import { useEffect, useRef, useState } from "react";
import { createCip30Signer } from "@/lib/x402/cip30";
import { runPaymentFlow, type FlowStep } from "@/lib/x402/payFlow";

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

const BLOCKFROST = {
  baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
  projectId: process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID ?? "",
};

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

  async function pay(wallet: WalletInfo) {
    setBusy(true);
    setError(undefined);
    setSteps([]);
    setSettled(undefined);
    sentAt.current = undefined;
    try {
      const api = await wallet.enable();
      const signer = await createCip30Signer(api, BLOCKFROST);
      const outcome = await runPaymentFlow(url, signer, step => setSteps(s => [...s, step]), {
        asset,
        maxAmount,
      });
      if (outcome.status === "settled") {
        setSettled({
          seconds: sentAt.current ? Math.round((Date.now() - sentAt.current) / 1000) : 0,
          transaction: (outcome.receipt as { transaction?: string } | undefined)?.transaction,
        });
        setUnlocked(outcome.body);
      } else if ("transaction" in outcome && outcome.transaction)
        setError(`${outcome.message} Transaction ${outcome.transaction} on preprod.cardanoscan.io.`);
      else setError(outcome.message);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

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
            <button key={wallet.key} onClick={() => pay(wallet)} disabled={busy}>
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
      {error && <p className="error">{error}</p>}
    </div>
  );
}
