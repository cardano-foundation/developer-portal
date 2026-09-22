/**
 * Shared x402 resource server for the API routes. The facilitator verifies
 * and settles payments; this process never touches the chain.
 */
import { x402ResourceServer } from "@x402/core/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactCardanoScheme } from "@x402/cardano/exact/server";

const facilitatorUrl = process.env.FACILITATOR_URL ?? "http://localhost:4022";

export const NETWORK = "cardano:preprod" as const;

export const payTo = process.env.SELLER_ADDRESS ?? "";

export const server = new x402ResourceServer(
  new HTTPFacilitatorClient({ url: facilitatorUrl }),
).register(NETWORK, new ExactCardanoScheme());
