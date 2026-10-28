/// The Blockfrost proxy on Cloudflare Pages. The file name `[[path]]` makes
/// this one function answer every call under `/api/blockfrost/`, and hands the
/// rest of the path to it as a list in `params.path`. The key is read here, on
/// the server, and never reaches the browser.
///
/// This file imports nothing from the rest of the project on purpose: it holds
/// the same `forward` as the Vercel version, so either one can be read alone.
// #region cloudflare
type Env = { BLOCKFROST_API_KEY?: string; VITE_NETWORK?: string };

type Context = { request: Request; env: Env; params: { path?: string | string[] } };

export async function onRequest(context: Context): Promise<Response> {
  const segments = context.params.path ?? [];
  const path = Array.isArray(segments) ? segments.join("/") : segments;
  return forward(context.request, path, new URL(context.request.url).search, context.env);
}
// #endregion cloudflare

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
