---
title: Slots
description: Cardano slot numbers and time conversion
---

# Slots

Cardano measures time in slots. Each slot has a fixed duration determined by the network's configuration. The transaction builder converts between Unix timestamps and slots using the slot config.

## Slot Configuration

| Network     | Slot Length                     | Start Time        |
| ----------- | ------------------------------- | ----------------- |
| **Mainnet** | 1000ms (1 second)               | Shelley era start |
| **Preprod** | 1000ms (1 second)               | Network genesis   |
| **Preview** | 1000ms (1 second)               | Network genesis   |
| **Devnet**  | Configurable (20-100ms typical) | Cluster creation  |

## How Conversion Works

The slot config defines three values:

- **zeroTime** — Unix timestamp of the network's start
- **zeroSlot** — First slot number (Shelley era)
- **slotLength** — Milliseconds per slot

The builder uses these to convert: `slot = zeroSlot + (unixTime - zeroTime) / slotLength`

## Custom Slot Config

For devnet or custom networks, you can override the slot config in build options:

```typescript
import { Address, Assets, preprod, Client } from "@evolution-sdk/evolution"

const client = Client.make(preprod)
  .withBlockfrost({
    baseUrl: "https://cardano-preprod.blockfrost.io/api/v0",
    projectId: process.env.BLOCKFROST_API_KEY!
  })
  .withSeed({ mnemonic: process.env.WALLET_MNEMONIC!, accountIndex: 0 })

const tx = await client
  .newTx()
  .payToAddress({
    address: Address.fromBech32("addr_test1vrm9x2dgvdau8vckj4duc89m638t8djmluqw5pdrFollw8qd9k63"),
    assets: Assets.fromLovelace(2_000_000n)
  })
  .build({
    slotConfig: {
      zeroTime: 1666656000000n,
      zeroSlot: 0n,
      slotLength: 1000
    }
  })
```

## Manual Slot Conversion

```typescript
import { Time, SlotConfig } from "@evolution-sdk/evolution"

const preprodConfig = SlotConfig.SLOT_CONFIG_NETWORK.Preprod
const mainnetConfig = SlotConfig.SLOT_CONFIG_NETWORK.Mainnet

// Unix time → slot
const now = BigInt(Date.now())
const currentSlot = Time.unixTimeToSlot(now, preprodConfig)
console.log("Current slot:", currentSlot)

// Slot → Unix time
const targetSlot = 50000000n
const targetTime = Time.slotToUnixTime(targetSlot, preprodConfig)
console.log("Slot 50M is at:", new Date(Number(targetTime)))
```

### Available Network Configs

| Network | `SlotConfig.SLOT_CONFIG_NETWORK.X` | Zero Time | Zero Slot | Slot Length |
| --- | --- | --- | --- | --- |
| Mainnet | `.Mainnet` | 1596059091000 (Shelley start) | 4492800 | 1000ms |
| Preprod | `.Preprod` | 1655769600000 | 0 | 1000ms |
| Preview | `.Preview` | 1666656000000 | 0 | 1000ms |

## Next Steps

- [POSIX Time](./posix) — Unix timestamp utilities
- [Validity Ranges](./validity-ranges) — Setting time constraints
