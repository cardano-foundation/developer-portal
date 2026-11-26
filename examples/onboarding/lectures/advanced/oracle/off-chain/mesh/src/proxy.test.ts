import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import vercel from "../api/blockfrost.ts";
import { onRequest } from "../functions/api/blockfrost/[[path]].ts";

// The two hosting proxies, run against a stubbed `fetch`: no network, no
// account. Each one must add the key, keep the path and the query, pass a
// submitted transaction through, and refuse a key for the wrong network.

const env = { BLOCKFROST_API_KEY: "preprodTestKey", VITE_NETWORK: "preprod" };

type Sent = { url: string; method: string; key: string | null; body: Uint8Array | null };

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubBlockfrost(): Sent[] {
  const sent: Sent[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    sent.push({
      url: String(input),
      method: init?.method ?? "GET",
      key: headers.get("project_id"),
      body: init?.body ? new Uint8Array(init.body as ArrayBuffer) : null,
    });
    return new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return sent;
}

function withEnv<T>(values: Record<string, string>, run: () => Promise<T>): Promise<T> {
  const saved = { ...process.env };
  Object.assign(process.env, values);
  return run().finally(() => {
    process.env = saved;
  });
}

test("Vercel: a read keeps its path and query, and carries the key", async () => {
  const sent = stubBlockfrost();
  // What the rewrite in vercel.json hands the function.
  const request = new Request("https://app.example/api/blockfrost?path=addresses/addr_test1/utxos&page=2");
  const response = await withEnv(env, () => vercel.fetch(request));
  assert.equal(response.status, 200);
  assert.equal(sent[0].url, "https://cardano-preprod.blockfrost.io/api/v0/addresses/addr_test1/utxos?page=2");
  assert.equal(sent[0].key, "preprodTestKey");
});

test("Cloudflare: the path arrives as a list, and the key is added", async () => {
  const sent = stubBlockfrost();
  const request = new Request("https://app.example/api/blockfrost/epochs/latest/parameters");
  const response = await onRequest({ request, env, params: { path: ["epochs", "latest", "parameters"] } });
  assert.equal(response.status, 200);
  assert.equal(sent[0].url, "https://cardano-preprod.blockfrost.io/api/v0/epochs/latest/parameters");
  assert.equal(sent[0].key, "preprodTestKey");
});

test("a submitted transaction is passed through unchanged", async () => {
  const sent = stubBlockfrost();
  const cbor = new Uint8Array([0x84, 0xa4, 0x00]);
  const request = new Request("https://app.example/api/blockfrost/tx/submit", {
    method: "POST",
    headers: { "content-type": "application/cbor" },
    body: cbor,
  });
  await onRequest({ request, env, params: { path: ["tx", "submit"] } });
  assert.equal(sent[0].method, "POST");
  assert.deepEqual(sent[0].body, cbor);
});

test("a key for another network is refused before anything is sent", async () => {
  const sent = stubBlockfrost();
  const request = new Request("https://app.example/api/blockfrost/epochs/latest");
  const response = await onRequest({
    request,
    env: { BLOCKFROST_API_KEY: "previewTestKey", VITE_NETWORK: "preprod" },
    params: { path: ["epochs", "latest"] },
  });
  assert.equal(response.status, 500);
  assert.equal(sent.length, 0);
});
