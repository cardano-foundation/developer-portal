/**
 * Seller: an API that charges per request via x402 on Cardano preprod.
 *
 * The paymentMiddleware answers unpaid requests with HTTP 402 and payment
 * requirements; paid retries are verified and settled through the
 * facilitator at FACILITATOR_URL. This process never touches the chain.
 */
import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactCardanoScheme } from "@x402/cardano/exact/server";

config();

const payTo = process.env.SELLER_ADDRESS;
const facilitatorUrl = process.env.FACILITATOR_URL;
if (!payTo || !facilitatorUrl) {
  console.error("Set SELLER_ADDRESS and FACILITATOR_URL in .env (see .env.example)");
  process.exit(1);
}

const NETWORK = "cardano:preprod" as const;
const PRICE_LOVELACE = "2000000"; // 2 tADA — comfortably above min-UTxO

const resourceServer = new x402ResourceServer(new HTTPFacilitatorClient({ url: facilitatorUrl }));
resourceServer.register(NETWORK, new ExactCardanoScheme());

const app = express();

app.use(
  paymentMiddleware(
    {
      "GET /api/message": {
        accepts: [
          {
            scheme: "exact",
            network: NETWORK,
            price: { amount: PRICE_LOVELACE, asset: "lovelace" },
            payTo,
          },
        ],
        description: "A message that costs 2 tADA",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.get("/api/message", (_req, res) => {
  res.json({ message: "You paid for this with x402 on Cardano.", paidAt: new Date().toISOString() });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.SELLER_PORT ?? 4021);
app.listen(port, () => {
  console.log(`Seller listening on http://localhost:${port}`);
  console.log(`Paid route: GET /api/message (${Number(PRICE_LOVELACE) / 1_000_000} tADA on ${NETWORK})`);
  console.log(`Facilitator: ${facilitatorUrl}`);
});
