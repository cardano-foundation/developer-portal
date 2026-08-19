import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { blockfrostProxy } from "./server/blockfrost.ts";

// Mesh uses Node built-ins (Buffer, crypto, stream) in the browser, so we polyfill them.
// `blockfrostProxy` is the backend: it serves /api/blockfrost, and it is the only
// thing here that reads the key.
//
// Two pages, both driving the same `src/lib`:
//   index.html -> src/main.tsx  the styled vault, with the minting button
//   vault.html -> src/app.tsx   the page the reader builds in lecture 9
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    blockfrostProxy(),
  ],
  server: { allowedHosts: true },
  build: {
    target: "esnext",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        vault: resolve(import.meta.dirname, "vault.html"),
      },
    },
  },
});
