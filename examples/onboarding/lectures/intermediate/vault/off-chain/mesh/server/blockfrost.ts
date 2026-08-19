// #region file
/// The backend half of the app, and the only place the Blockfrost key exists.
///
/// The browser cannot keep a secret: everything Vite ships is readable by
/// whoever opens the page. So the browser never gets the key. It asks this
/// handler instead, and this handler, running on a machine you control, adds
/// the key and forwards the question to Blockfrost.
///
/// It is a relay, nothing more. It does not build transactions and does not
/// sign anything; the browser still does both.
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

// #region handler
// Read `.env` into process.env. The same line the Node scripts use, this file
// is a Node script too, it just happens to be one that answers HTTP.
try {
  process.loadEnvFile();
} catch {
  // No .env yet. The check below gives a better message than a crash on boot.
}

const KEY = process.env.BLOCKFROST_API_KEY ?? "";

// A Blockfrost key names its own network: `preview...`, `preprod...`, `mainnet...`.
// Mesh reads the prefix the same way, so one variable configures both halves.
const NETWORK = KEY.slice(0, 7);
const BLOCKFROST = `https://cardano-${NETWORK}.blockfrost.io/api/v0`;

/// Forward one request to Blockfrost with the key attached, and hand the answer
/// back untouched. `req.url` is whatever followed `/api/blockfrost`, so
/// `/addresses/addr_test1.../utxos` arrives here exactly as Mesh asked for it.
export async function handleBlockfrost(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (!KEY) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "BLOCKFROST_API_KEY is not set in .env" }));
    return;
  }

  // Buffer the body rather than parse it: the evaluate endpoint sends JSON and
  // the submit endpoint sends raw CBOR, and a Buffer carries both unharmed.
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  const contentType = req.headers["content-type"];

  try {
    // #region forward
    const upstream = await fetch(`${BLOCKFROST}${req.url ?? "/"}`, {
      method: req.method,
      headers: {
        project_id: KEY,
        ...(contentType ? { "content-type": contentType } : {}),
      },
      body,
    });
    // #endregion forward

    res.statusCode = upstream.status;
    res.setHeader("content-type", upstream.headers.get("content-type") ?? "application/json");
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: `could not reach Blockfrost: ${(error as Error).message}` }));
  }
}
// #endregion handler

// #region plugin
/// Mount the handler at `/api/blockfrost` on Vite's server, so `npm run dev`
/// starts the front and the back together.
///
/// In production you run `handleBlockfrost` in a server of your own, it is a
/// plain Node request handler and knows nothing about Vite.
export function blockfrostProxy(): Plugin {
  return {
    name: "blockfrost-proxy",
    configureServer(server) {
      server.middlewares.use("/api/blockfrost", handleBlockfrost);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/blockfrost", handleBlockfrost);
    },
  };
}
// #endregion plugin
// #endregion file
