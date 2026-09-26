/**
 * The browser payment loop: request, receive 402, build and sign, retry
 * with the payment header, settle. x402 owns the payloads and headers.
 *
 * Adapted from the x402-cardano-demo frontend (cardano-foundation/x402-cardano-demo,
 * frontend/src/x402/flow.ts), generalized to one URL. The safety rules
 * survive intact: after signing, a transport failure never authorizes a
 * second payment (the same signed payment is checked again), and a receipt
 * is only trusted when it matches the transaction that was signed.
 */
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { decodePaymentRequiredHeader, decodePaymentResponseHeader } from "@x402/core/http";
import type { PaymentPayload } from "@x402/core/types";
import { ExactCardanoScheme } from "@x402/cardano/exact/client";
import { decodeCardanoTransaction, type ClientCardanoSigner } from "@x402/cardano";

export type FlowStep =
  | { id: "request"; title: string }
  | { id: "offer"; title: string; detail: unknown }
  | { id: "signed"; title: string; detail: { nonce: string } }
  | { id: "pay"; title: string }
  | { id: "settled"; title: string; detail: unknown };

export interface PreparedPayment {
  url: string;
  headers: Record<string, string>;
  payload: PaymentPayload;
}

export type FlowOutcome =
  | { status: "settled"; body: unknown; receipt: unknown }
  | { status: "failed"; message: string }
  | { status: "pending"; message: string; transaction: string; payment?: PreparedPayment }
  | { status: "unknown"; message: string; transaction?: string; payment?: PreparedPayment };

export interface FlowOptions {
  asset?: string;
  maxAmount?: string;
  automaticChecks?: number;
  retryDelayMs?: number;
}

export async function runPaymentFlow(
  url: string,
  signer: ClientCardanoSigner,
  onStep: (step: FlowStep) => void,
  options: FlowOptions = {},
): Promise<FlowOutcome> {
  const asset = options.asset ?? "lovelace";
  const first = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  onStep({ id: "request", title: `Requested the resource (HTTP ${first.status})` });
  if (first.status !== 402) throw new Error(`Expected a payment offer, received HTTP ${first.status}.`);

  const http = new x402HTTPClient(
    x402Client.fromConfig({
      schemes: [{ network: "cardano:preprod", client: new ExactCardanoScheme(signer) }],
      spendControls: {
        allowedAssets: [
          {
            network: "cardano:preprod",
            asset,
            maxAmountPerPayment: options.maxAmount ?? "5000000",
          },
        ],
      },
    }),
  );

  const required = http.getPaymentRequiredResponse(name => first.headers.get(name));
  onStep({ id: "offer", title: "Read the payment offer", detail: required });
  const payload = await http.createPaymentPayload(required);
  onStep({ id: "signed", title: "Wallet signed the transaction", detail: { nonce: String(payload.payload.nonce) } });

  const payment: PreparedPayment = {
    url,
    payload,
    headers: http.encodePaymentSignatureHeader(payload),
  };

  return confirm(payment, onStep, options, false);
}

/**
 * Check an open payment again. While a payment is pending or unknown, call
 * this instead of runPaymentFlow: a new transaction could charge twice.
 */
export function checkPayment(
  payment: PreparedPayment,
  onStep: (step: FlowStep) => void,
  options: FlowOptions = {},
): Promise<FlowOutcome> {
  return confirm(payment, onStep, options, true);
}

async function confirm(
  payment: PreparedPayment,
  onStep: (step: FlowStep) => void,
  options: FlowOptions,
  resuming: boolean,
): Promise<FlowOutcome> {
  const limit = Math.min(5, Math.max(0, Math.trunc(options.automaticChecks ?? 3)));
  let outcome = await sendPayment(payment, onStep, resuming);
  let checks = 0;
  while ((outcome.status === "pending" || outcome.status === "unknown") && checks < limit) {
    await new Promise(resolve => setTimeout(resolve, options.retryDelayMs ?? 5_000));
    checks++;
    outcome = await sendPayment(payment, onStep, true);
  }
  // Still open: hand the signed payment back so the caller can check it
  // again rather than build a new one.
  if (outcome.status === "pending" || outcome.status === "unknown") return { ...outcome, payment };
  return outcome;
}

async function sendPayment(
  payment: PreparedPayment,
  onStep: (step: FlowStep) => void,
  resuming: boolean,
): Promise<FlowOutcome> {
  onStep({ id: "pay", title: resuming ? "Checking the same payment" : "Sending the signed payment" });
  const transaction = decodeCardanoTransaction(String(payment.payload.payload.transaction)).txHash;
  const unknown = (message: string): FlowOutcome => ({ status: "unknown", transaction, message });

  let response: Response;
  try {
    response = await fetch(payment.url, { headers: payment.headers, signal: AbortSignal.timeout(240_000) });
  } catch {
    return unknown("The connection was interrupted. The payment may have been submitted; it will be checked again rather than paid twice.");
  }

  const receiptHeader = response.headers.get("PAYMENT-RESPONSE");
  let receipt;
  try {
    receipt = receiptHeader ? decodePaymentResponseHeader(receiptHeader) : undefined;
  } catch {
    return unknown("The server returned an unreadable receipt.");
  }
  // A receipt is only meaningful if it is well formed and describes the
  // transaction this browser signed. Anything else is kept as unknown.
  if (receiptHeader && typeof receipt?.success !== "boolean") {
    return unknown("The server returned an invalid receipt.");
  }
  if (receipt && (receipt.transaction !== transaction || receipt.network !== payment.payload.accepted.network)) {
    return unknown("The receipt does not match this payment.");
  }

  if (receipt?.errorReason === "settlement_pending") {
    return {
      status: "pending",
      transaction,
      message: "The transaction is waiting for its on-chain confirmation.",
    };
  }
  if (receipt?.success) {
    if (!response.ok) return unknown(`Payment settled but the resource returned HTTP ${response.status}.`);
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return unknown("Payment settled but the resource response was interrupted.");
    }
    onStep({ id: "settled", title: "Payment accepted", detail: receipt });
    return { status: "settled", body, receipt };
  }
  if (
    receipt?.errorReason === "exact_cardano_settlement_definitively_rejected" ||
    (receipt?.errorReason === "exact_cardano_settlement_failed" && receipt.extra?.status === "expired")
  ) {
    return { status: "failed", message: `Payment did not settle (${receipt.errorReason}). You can start a new payment.` };
  }
  if (response.status === 402 && !resuming) {
    const requiredHeader = response.headers.get("PAYMENT-REQUIRED");
    let reason = "Payment was rejected before submission.";
    if (requiredHeader) {
      try {
        reason = decodePaymentRequiredHeader(requiredHeader).error || reason;
      } catch {
        /* keep the readable fallback */
      }
    }
    return { status: "failed", message: `Payment rejected: ${reason}` };
  }
  return unknown(`Payment status is not confirmed yet (HTTP ${response.status}).`);
}
