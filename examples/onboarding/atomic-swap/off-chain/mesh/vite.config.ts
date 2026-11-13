import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// Mesh uses Node built-ins (Buffer, crypto, stream) in the browser, so we
// polyfill them, the Vite equivalent of the Webpack polyfill a Next.js app needs.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({ globals: { Buffer: true, global: true, process: true } }),
  ],
  // Allow any host so the dev server works behind a tunnel (e.g. ngrok) when you
  // want to open the app on a phone or share it. Dev-only; not used for builds.
  server: { allowedHosts: true },
  build: { target: "esnext" },
});
