/**
 * Buyer: an agent that pays for an API call via x402 on Cardano preprod.
 *
 * Flow: request → 402 with payment requirements → build and sign a Cardano
 * transaction (this wallet pays the amount and the network fee) → retry with
 * the PAYMENT-SIGNATURE header → seller/facilitator verify, settle, and
 * release the resource with a PAYMENT-RESPONSE receipt.
 */
import { config } from "dotenv";
import { x402Client, wrapFetchWithPayment, x402HTTPClient } from "@x402/fetch";
import { toClientCardanoSigner } from "@x402/cardano";
import { ExactCardanoScheme } from "@x402/cardano/exact/client";

config();

if (!process.env.MNEMONIC || !process.env.BLOCKFROST_PROJECT_ID) {
  console.error("Set MNEMONIC and BLOCKFROST_PROJECT_ID in .env (run `npm run wallet` first)");
  process.exit(1);
}
const mnemonic: string = process.env.MNEMONIC;
const projectId: string = process.env.BLOCKFROST_PROJECT_ID;

const NETWORK = "cardano:preprod" as const;
const blockfrostBaseUrl =
  process.env.BLOCKFROST_BASE_URL ?? "https://cardano-preprod.blockfrost.io/api/v0";
const url = `${process.env.SELLER_URL ?? "http://localhost:4021"}/api/message`;

async function main() {
  // lovelace is not USD-pegged, so the default spend controls would reject
  // it — allow it explicitly for this network.
  const client = new x402Client().setSpendControls({
    allowedAssets: [{ network: "cardano:*", asset: "lovelace" }],
  });

  const signer = toClientCardanoSigner({
    mnemonic,
    network: NETWORK,
    provider: { blockfrost: { baseUrl: blockfrostBaseUrl, projectId } },
  });
  client.register("cardano:*", new ExactCardanoScheme(signer));
  console.log(`Buyer wallet: ${signer.getAddress()}`);

  const fetchWithPayment = wrapFetchWithPayment(fetch, client);

  console.log(`Requesting ${url} ...`);
  console.log("(on 402 this builds, signs and settles a real preprod payment — expect 20–60s)");
  const started = Date.now();
  const response = await fetchWithPayment(url, { method: "GET" });
  console.log(`\nHTTP ${response.status} after ${((Date.now() - started) / 1000).toFixed(1)}s`);

  if (!response.ok) {
    // 402 here means the payment was attempted and rejected — the reason is
    // in the facilitator's log. See TROUBLESHOOTING in the README.
    console.error(`Payment failed: HTTP ${response.status}`);
    process.exit(1);
  }

  const body = await response.json();
  console.log("Body:", body);

  const receipt = new x402HTTPClient(client).getPaymentSettleResponse(name =>
    response.headers.get(name),
  );
  console.log("\nPayment receipt:", JSON.stringify(receipt, null, 2));
  if (receipt?.transaction) {
    console.log(`\nExplorer: https://preprod.cardanoscan.io/transaction/${receipt.transaction}`);
  }
}

main().catch(error => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
