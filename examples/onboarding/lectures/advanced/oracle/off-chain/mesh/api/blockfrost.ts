/// The Blockfrost proxy on Vercel. The page's provider calls
/// `/api/blockfrost/<path>`, and the rewrite in `vercel.json` sends every one
/// of those calls here, with `<path>` in the `path` query parameter. The key is
/// read here, on the server, and never reaches the browser.
///
/// This file imports nothing from the rest of the project on purpose: Vercel
/// runs it on its own, and the Cloudflare version holds the same `forward`.
// #region vercel
type Env = { BLOCKFROST_API_KEY?: string; VITE_NETWORK?: string };

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.searchParams.get("path") ?? "";
    url.searchParams.delete("path");
    return forward(request, path, url.search, process.env);
  },
};
// #endregion vercel

// #region forward
const NETWORKS = ["preview", "preprod", "mainnet"];

/// Send one request on to Blockfrost, with the key added.
async function forward(request: Request, path: string, search: string, env: Env): Promise<Response> {
  const network = env.VITE_NETWORK ?? "";
  const key = env.BLOCKFROST_API_KEY ?? "";
  // A Blockfrost key starts with the name of its network.
  if (!NETWORKS.includes(network) || !key.startsWith(network)) {
    return new Response("BLOCKFROST_API_KEY does not belong to VITE_NETWORK", { status: 500 });
  }
  // The page only reads (GET) and submits or evaluates (POST).
  if (request.method !== "GET" && request.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  const response = await fetch(`https://cardano-${network}.blockfrost.io/api/v0/${path}${search}`, {
    method: request.method,
    headers: {
      project_id: key,
      "content-type": request.headers.get("content-type") ?? "application/json",
    },
    body: request.method === "POST" ? await request.arrayBuffer() : undefined,
  });
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
// #endregion forward
