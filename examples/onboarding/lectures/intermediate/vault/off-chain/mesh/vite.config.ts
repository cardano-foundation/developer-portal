import { resolve } from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Mesh uses Node built-ins (Buffer, crypto, stream) in the browser, so we polyfill them.
//
// The proxy below is the only thing here that reads the Blockfrost key. It runs in
// Node, so the key never reaches the browser: the page calls /api/blockfrost/... on
// its own origin, and this rule forwards each call with the key attached.
//
// Two pages, both driving the same `src/lib`:
//   index.html -> src/main.tsx  the styled vault, with the minting button
//   vault.html -> src/app.tsx   the page the reader builds in lecture 9
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const key = env.BLOCKFROST_API_KEY ?? "";

  // #region proxy
  const proxy = {
    "/api/blockfrost": {
      target: `https://cardano-${key.slice(0, 7)}.blockfrost.io/api/v0`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/blockfrost/, ""),
      headers: { project_id: key },
    },
  };
  // #endregion proxy

  return {
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    ],
    server: { allowedHosts: true, proxy },
    preview: { proxy },
    build: {
      target: "esnext",
      rollupOptions: {
        input: {
          main: resolve(import.meta.dirname, "index.html"),
          vault: resolve(import.meta.dirname, "vault.html"),
        },
      },
    },
  };
});
