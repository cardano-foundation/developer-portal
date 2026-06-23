import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
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
})
