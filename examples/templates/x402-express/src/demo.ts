/**
 * One-command demo: starts the seller, waits for it, runs the buyer against
 * it, then shuts the seller down. Requires a funded wallet and a reachable
 * facilitator (see README).
 */
import { spawn } from "node:child_process";
import { config } from "dotenv";

config();

const port = Number(process.env.SELLER_PORT ?? 4021);

async function waitForSeller(timeoutMs = 15_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise(r => setTimeout(r, 300));
  }
  throw new Error("Seller did not start in time");
}

const seller = spawn("npx", ["tsx", "src/seller.ts"], { stdio: ["ignore", "inherit", "inherit"] });

try {
  await waitForSeller();
  const buyer = spawn("npx", ["tsx", "src/buyer.ts"], { stdio: ["ignore", "inherit", "inherit"] });
  const code: number = await new Promise(resolve => buyer.on("close", resolve));
  process.exitCode = code ?? 1;
} finally {
  seller.kill("SIGTERM");
}
