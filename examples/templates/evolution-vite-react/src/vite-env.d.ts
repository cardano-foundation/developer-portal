/// <reference types="vite/client" />

import type { WalletApi } from "@evolution-sdk/evolution"

declare global {
  interface ImportMetaEnv {
    readonly VITE_NETWORK: "preprod" | "preview" | "mainnet"
    readonly VITE_BLOCKFROST_PROJECT_ID: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface CardanoWalletApi {
    enable: () => Promise<WalletApi>
    isEnabled: () => Promise<boolean>
    apiVersion: string
    name: string
    icon: string
  }

  interface Window {
    cardano?: {
      [key: string]: CardanoWalletApi
    }
  }
}

export {}
