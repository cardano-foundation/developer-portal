import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { USDM_PREPROD_ASSET } from "@x402/cardano";
import { server, payTo, NETWORK } from "@/lib/x402/server";

export const runtime = "nodejs";

const handler = async (_req: NextRequest) => {
  return NextResponse.json({
    message: "The same message, paid in a stablecoin.",
    paidAt: new Date().toISOString(),
  });
};

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      network: NETWORK,
      // Cent-level pricing uses the stablecoin: 0.10 tUSDM (6 decimals).
      // Lovelace cannot go this low because of the min-UTxO floor.
      price: { amount: "100000", asset: USDM_PREPROD_ASSET },
      payTo,
    },
    description: "A message that costs 0.10 tUSDM",
  },
  server,
);
