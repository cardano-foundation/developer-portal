import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // @x402/cardano and the Evolution SDK stay server-external so route
  // handlers use their native Node builds instead of a rebundled copy.
  serverExternalPackages: ["@x402/cardano", "@x402/core", "@evolution-sdk/evolution"],
  // The template lives inside the portal monorepo; pin the root so Next
  // does not adopt the portal's yarn.lock.
  turbopack: { root: here },
  agentRules: false,
};

export default nextConfig;
