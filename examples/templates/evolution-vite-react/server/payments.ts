// The payment API. The browser sends addresses and an amount; this builds the
// transaction with the Blockfrost key, which never leaves the server. The
// browser only signs, then sends the signed transaction back for submission.
import type { IncomingMessage, ServerResponse } from "node:http"

import { Address, Assets, Client, Transaction, TransactionHash } from "@evolution-sdk/evolution"

import { CHAINS, networkIdOf, parseNetwork } from "../src/network.ts"

export type PaymentEnv = { network: string | undefined; blockfrostProjectId: string | undefined }

const MAX_BODY_BYTES = 64 * 1024

export function createPaymentApi(env: PaymentEnv) {
  const network = parseNetwork(env.network)
  const blockfrostProjectId = env.blockfrostProjectId
  const provider = blockfrostProjectId?.startsWith(network)
    ? Client.make(CHAINS[network]).withBlockfrost({
        baseUrl: `https://cardano-${network}.blockfrost.io/api/v0`,
        projectId: blockfrostProjectId
      })
    : undefined

  function parseAddress(bech32: unknown, field: string) {
    const address = typeof bech32 === "string" ? tryParse(bech32) : undefined
    if (!address || address.networkId !== networkIdOf(network)) {
      throw new BadRequest(`${field} must be a ${network} address.`)
    }
    return address
  }

  async function buildPayment(body: Record<string, unknown>) {
    parseAddress(body.from, "from")
    const to = parseAddress(body.to, "to")
    if (typeof body.lovelace !== "string" || !/^[1-9]\d*$/.test(body.lovelace)) {
      throw new BadRequest("lovelace must be a positive whole number, as a string.")
    }
    const built = await provider!
      .withAddress(body.from as string)
      .newTx()
      .payToAddress({ address: to, assets: Assets.fromLovelace(BigInt(body.lovelace)) })
      .build()
    return { txCbor: Transaction.toCBORHex(await built.toTransaction()) }
  }

  async function submitTx(body: Record<string, unknown>) {
    if (typeof body.signedTxCbor !== "string") throw new BadRequest("signedTxCbor is required.")
    const hash = await provider!.submitTx(Transaction.fromCBORHex(body.signedTxCbor))
    return { txHash: TransactionHash.toHex(hash) }
  }

  const routes: Record<string, (body: Record<string, unknown>) => Promise<object>> = {
    "/api/build-payment": buildPayment,
    "/api/submit-tx": submitTx
  }

  // Returns false for requests outside the API, so the caller can serve them.
  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const route = routes[req.url ?? ""]
    if (!route) return false
    if (req.method !== "POST") return (send(res, 405, { error: "Method not allowed" }), true)
    if (!provider) {
      return (send(res, 500, { error: `Set BLOCKFROST_PROJECT_ID to a ${network} project ID.` }), true)
    }
    try {
      send(res, 200, await route(await readJson(req)))
    } catch (err) {
      const status = err instanceof BadRequest ? 400 : 502
      send(res, status, { error: err instanceof Error ? err.message : "Request failed." })
    }
    return true
  }
}

class BadRequest extends Error {}

function tryParse(bech32: string) {
  try {
    return Address.fromBech32(bech32)
  } catch {
    return undefined
  }
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  let body = ""
  for await (const chunk of req) {
    body += chunk
    if (body.length > MAX_BODY_BYTES) throw new BadRequest("Request body too large.")
  }
  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    throw new BadRequest("Request body must be JSON.")
  }
}

function send(res: ServerResponse, status: number, data: object) {
  res.writeHead(status, { "Content-Type": "application/json" })
  res.end(JSON.stringify(data))
}
