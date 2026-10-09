// Production server: serves the built app from dist/ and the payment API.
// Build with `npm run build`, then run with `npm start`.
import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"
import { fileURLToPath } from "node:url"

import { createPaymentApi } from "./payments.ts"

try {
  process.loadEnvFile()
} catch {
  // No .env file: use the environment as it is.
}

const handleApi = createPaymentApi({
  network: process.env.VITE_NETWORK,
  blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID
})

const distDir = fileURLToPath(new URL("../dist/", import.meta.url))
const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".wasm": "application/wasm"
}

async function serveStatic(pathname: string) {
  // normalize() plus the prefix check keeps requests inside dist/.
  const file = normalize(join(distDir, pathname === "/" ? "index.html" : pathname))
  if (!file.startsWith(distDir)) return undefined
  try {
    return { body: await readFile(file), type: contentTypes[extname(file)] ?? "application/octet-stream" }
  } catch {
    return undefined
  }
}

const port = Number(process.env.PORT ?? 3000)

createServer(async (req, res) => {
  if (await handleApi(req, res)) return
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname
  // Unknown paths get index.html, so client-side routes still load.
  const asset = (await serveStatic(pathname)) ?? (await serveStatic("/"))
  if (!asset) {
    res.writeHead(404).end("Run `npm run build` first.")
    return
  }
  res.writeHead(200, { "Content-Type": asset.type }).end(asset.body)
}).listen(port, () => console.log(`http://localhost:${port}`))
