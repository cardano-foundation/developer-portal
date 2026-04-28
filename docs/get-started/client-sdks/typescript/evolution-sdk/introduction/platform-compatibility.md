---
title: Platform Compatibility
description: Supported platforms and runtimes
sidebar_position: 7
---

# Platform Compatibility

Evolution SDK supports a wide range of platforms and runtimes. Here's what's supported:

## JavaScript Runtimes

| Runtime | Version | Status |
|---------|---------|--------|
| **Node.js** | 18+ | Fully Supported |
| **Deno** | 1.40+ | Fully Supported |
| **Bun** | 1.0+ | Fully Supported |
| **Browser** | ES2020+ | Fully Supported |

## Operating Systems

| OS | Status |
|---|--------|
| **Linux** | Fully Supported |
| **macOS** | Fully Supported |
| **Windows** | Fully Supported |
| **iOS** (via React Native) | Supported |
| **Android** (via React Native) | Supported |

## Browser Compatibility

Evolution SDK works with all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

For older browser support, use a transpiler like Babel.

## Cardano Networks

Evolution SDK can interact with:
- **Mainnet** - Production network
- **Preprod** - Pre-production testnet
- **Preview** - Preview testnet
- **Custom Networks** - Private networks with custom configurations

## Frameworks & Libraries

The SDK integrates seamlessly with:
- React, Vue, Svelte, Angular
- Next.js, Nuxt, SvelteKit
- Express, Fastify, Hono
- Electron, Tauri, React Native

## Type Safety

Evolution SDK is **fully typed** with:
- TypeScript 5.0+ support
- Full type inference
- No `any` types by default
- Effect-TS integration for advanced patterns

## Minimum Resource Requirements

- **Memory**: 64 MB (Node.js), varies by browser
- **Storage**: ~5 MB for SDK and dependencies
- **Network**: Standard internet connection

## Questions?

If your specific platform isn't listed or you have compatibility concerns, check [Advanced](../advanced) or open an issue on GitHub.
