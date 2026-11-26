import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";

import proxy from "../api/blockfrost.ts";

// The Vercel proxy, run against a stubbed `fetch`: no network and no account.

type Sent = { url: string; method?: string; headers: Headers; body: unknown };

const realFetch = globalThis.fetch;
const realKey = process.env.BLOCKFROST_API_KEY;
let sent: Sent[] = [];

beforeEach(() => {
  sent = [];
  process.env.BLOCKFROST_API_KEY = "previewTestKey";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({
      url: String(input),
      method: init?.method,
      headers: new Headers(init?.headers),
      body: init?.body,
    });
    // Node's `fetch` has already unzipped the body, and still reports the header.
    return new Response('{"ok":true}', {
      status: 200,
      headers: { "content-type": "application/json", "content-encoding": "gzip" },
    });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  if (realKey === undefined) delete process.env.BLOCKFROST_API_KEY;
  else process.env.BLOCKFROST_API_KEY = realKey;
});

test("a read keeps its path and query, and carries the key", async () => {
  // What the rewrite in vercel.json hands the function.
  const response = await proxy.fetch(
    new Request("https://app.example/api/blockfrost?path=addresses/addr_test1/utxos&page=2"),
  );
  assert.equal(response.status, 200);
  assert.equal(sent[0].url, "https://cardano-preview.blockfrost.io/api/v0/addresses/addr_test1/utxos?page=2");
  assert.equal(sent[0].headers.get("project_id"), "previewTestKey");
  assert.equal(sent[0].body, undefined);
});

test("a submitted transaction keeps its bytes and its content type", async () => {
  // 0x84 and 0xa4 are not valid UTF-8, so reading the body as text loses them.
  const cbor = new Uint8Array([0x84, 0xa4, 0x00]);
  await proxy.fetch(
    new Request("https://app.example/api/blockfrost?path=tx/submit", {
      method: "POST",
      headers: { "content-type": "application/cbor" },
      body: cbor,
    }),
  );
  assert.equal(sent[0].url, "https://cardano-preview.blockfrost.io/api/v0/tx/submit");
  assert.equal(sent[0].method, "POST");
  assert.equal(sent[0].headers.get("content-type"), "application/cbor");
  const bytes = new Uint8Array(await new Response(sent[0].body as BodyInit).arrayBuffer());
  assert.deepEqual(bytes, cbor);
});

test("the answer is not marked as compressed after fetch has decompressed it", async () => {
  const response = await proxy.fetch(new Request("https://app.example/api/blockfrost?path=blocks/latest"));
  assert.equal(response.headers.get("content-encoding"), null);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.equal(await response.text(), '{"ok":true}');
});
