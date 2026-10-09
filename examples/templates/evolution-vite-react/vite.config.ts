import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"

import type * as Payments from "./server/payments.ts"

// Serves the payment API from the dev server, so `npm run dev` runs the whole app.
// In production, server/index.ts serves the same API.
function paymentApi(mode: string): Plugin {
  return {
    name: "payment-api",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "")
      // Loaded through Vite, so the SDK resolves the same way it does in the app.
      const handler = server.ssrLoadModule("/server/payments.ts").then((mod) =>
        (mod as typeof Payments).createPaymentApi({
          network: env.VITE_NETWORK,
          blockfrostProjectId: env.BLOCKFROST_PROJECT_ID
        })
      )
      server.middlewares.use((req, res, next) => {
        handler.then((handle) => handle(req, res)).then((handled) => handled || next(), next)
      })
    }
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), paymentApi(mode)],
  optimizeDeps: {
    exclude: ["@evolution-sdk/evolution"],
    // @scure/bip39 (a transitive Evolution dep) ships sourceMappingURL comments without the .map
    // files; pre-bundling just this package strips them and silences Vite's "Failed to load source
    // map" dev warning. Cosmetic only. See README "Build configuration".
    include: ["@scure/bip39", "@scure/bip39/wordlists/english.js"]
  },
  build: {
    target: "esnext"
  }
}))
