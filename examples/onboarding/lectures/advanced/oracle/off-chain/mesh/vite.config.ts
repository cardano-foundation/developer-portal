import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import { assertKeyMatches, networkFrom } from "./src/lib/network.ts";

// Mesh uses Node built-ins (Buffer, crypto, stream) in the browser, so we polyfill them.
//
// The proxy below is the only part of the app that reads the Blockfrost key. It
// runs in Node, so the key never reaches the browser. Before it starts, it checks
// that the key belongs to the network `VITE_NETWORK` names, so a Preview key
// cannot quietly serve a Preprod app.
//
// One page: index.html -> src/app.tsx, driving `src/lib`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, "");
  const key = env.BLOCKFROST_API_KEY ?? "";
  const network = networkFrom(env.VITE_NETWORK);
  assertKeyMatches(key, network);

  const proxy = {
    "/api/blockfrost": {
      target: `https://cardano-${network.name}.blockfrost.io/api/v0`,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/blockfrost/, ""),
      headers: { project_id: key },
    },
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
    ],
    server: { allowedHosts: true, proxy },
    preview: { proxy },
    build: { target: "esnext" },
  };
});
