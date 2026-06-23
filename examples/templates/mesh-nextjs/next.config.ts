import type { NextConfig } from "next";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // eslint-config-next has a peer gap with eslint 9; lint with `npm run lint`, don't block the build.
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Mesh uses Node built-ins (Buffer, crypto, stream); polyfill them for the browser bundle.
      config.plugins.push(new NodePolyfillPlugin());
      // Strip the `node:` scheme so the polyfills above are used (node:buffer -> buffer).
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
    }
    // Let ESM dependencies import without fully specified extensions.
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
