import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import { server, payTo, NETWORK } from "@/lib/x402/server";

export const runtime = "nodejs";

const handler = async (_req: NextRequest) => {
  return NextResponse.json({
    message: "You paid for this with x402 on Cardano.",
    paidAt: new Date().toISOString(),
  });
};

export const GET = withX402(
  handler,
  {
    accepts: {
      scheme: "exact",
      network: NETWORK,
      price: { amount: "1000000", asset: "lovelace" }, // 1 tADA
      payTo,
    },
    description: "A message that costs 1 tADA",
  },
  server,
);
