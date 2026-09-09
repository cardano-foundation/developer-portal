/**
 * A minimal local facilitator for development, built on @x402/cardano's own
 * facilitator scheme (verification rules, built-in phase-1 checks, in-memory
 * settlement store all come from the package). It holds no keys and no funds
 * — it verifies payer-signed transactions and broadcasts them.
 *
 * At the hackathon, point FACILITATOR_URL at the hosted facilitator instead;
 * this file is the offline/dev fallback.
 */
import { config } from "dotenv";
import express from "express";
import { x402Facilitator } from "@x402/core/facilitator";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import { toFacilitatorCardanoSigner } from "@x402/cardano";
import { ExactCardanoScheme } from "@x402/cardano/exact/facilitator";

config();

const projectId = process.env.BLOCKFROST_PROJECT_ID;
if (!projectId) {
  console.error("Set BLOCKFROST_PROJECT_ID in .env");
  process.exit(1);
}

const NETWORK = "cardano:preprod" as const;
const blockfrostBaseUrl =
  process.env.BLOCKFROST_BASE_URL ?? "https://cardano-preprod.blockfrost.io/api/v0";

const signer = toFacilitatorCardanoSigner({
  network: NETWORK,
  provider: { blockfrost: { baseUrl: blockfrostBaseUrl, projectId } },
  awaitConfirmation: false,
});

const facilitator = new x402Facilitator();
facilitator.register(NETWORK, new ExactCardanoScheme(signer, {}));

const app = express();
app.use(express.json({ limit: "2mb" }));

app.post("/verify", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body as {
      paymentPayload: PaymentPayload;
      paymentRequirements: PaymentRequirements;
    };
    if (!paymentPayload || !paymentRequirements) {
      return res.status(400).json({ error: "Missing paymentPayload or paymentRequirements" });
    }
    const response = await facilitator.verify(paymentPayload, paymentRequirements);
    if (!response.isValid) {
      console.warn(`[verify] rejected — ${response.invalidReason}: ${response.invalidMessage ?? ""}`);
    }
    res.json(response);
  } catch (error) {
    console.error("[verify] error:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.post("/settle", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body as {
      paymentPayload: PaymentPayload;
      paymentRequirements: PaymentRequirements;
    };
    if (!paymentPayload || !paymentRequirements) {
      return res.status(400).json({ error: "Missing paymentPayload or paymentRequirements" });
    }
    const response = await facilitator.settle(paymentPayload, paymentRequirements);
    console.log(`[settle] success=${response.success} tx=${response.transaction ?? ""}`);
    res.json(response);
  } catch (error) {
    console.error("[settle] error:", error);
    if (error instanceof Error && error.message.includes("Settlement aborted:")) {
      return res.json({
        success: false,
        errorReason: error.message.replace("Settlement aborted: ", ""),
        network: req.body?.paymentPayload?.network ?? "unknown",
      });
    }
    res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
  }
});

app.get("/supported", (_req, res) => {
  res.json(facilitator.getSupported());
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, network: NETWORK });
});

const port = Number(process.env.FACILITATOR_PORT ?? 4022);
app.listen(port, () => {
  console.log(`Facilitator listening on http://localhost:${port} (${NETWORK})`);
});
