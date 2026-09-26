// Server-side Blockfrost proxy. The browser calls /api/blockfrost/<path>; this
// route adds the project ID, which stays on the server.
import type { NextApiRequest, NextApiResponse } from "next";
import { network } from "@/config";

// Only the calls the app makes. Anything else is refused, so the route cannot
// be used to spend your Blockfrost quota on arbitrary queries.
const ALLOWED_PATHS = new Set(["epochs/latest/parameters"]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join("/") : "";
  if (!ALLOWED_PATHS.has(path)) {
    return res.status(404).json({ error: "Not found" });
  }

  const projectId = process.env.BLOCKFROST_PROJECT_ID;
  if (!projectId?.startsWith(network)) {
    return res.status(500).json({ error: `Set BLOCKFROST_PROJECT_ID to a ${network} project ID.` });
  }

  try {
    const upstream = await fetch(`https://cardano-${network}.blockfrost.io/api/v0/${path}`, {
      headers: { project_id: projectId },
    });
    if (upstream.ok) {
      // Protocol parameters change once per epoch.
      res.setHeader("Cache-Control", "public, s-maxage=300");
    }
    res.setHeader("Content-Type", "application/json");
    return res.status(upstream.status).send(await upstream.text());
  } catch {
    return res.status(502).json({ error: "Blockfrost is unreachable." });
  }
}
