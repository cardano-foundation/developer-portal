---
title: Testing
description: Test your Cardano applications
---

import DocCardList from '@theme/DocCardList';

# Testing

Evolution SDK supports multiple testing strategies — from unit tests that validate schemas and encoding to full integration tests running against a local devnet. The SDK uses `@effect/vitest` as its testing framework.

<DocCardList />

## Testing Strategies

| Strategy | Speed | Complexity | Use Case |
|----------|-------|-----------|----------|
| **Unit tests** | Fast | Low | Schema validation, encoding, address parsing |
| **Integration tests** | Slow | High | Transaction building, submission, smart contracts |
| **Emulator (devnet)** | Medium | Medium | End-to-end workflows without external dependencies |

## Next Steps

- [Unit Tests](./unit-tests.md) — Test schemas, encoding, and address utilities
- [Integration Tests](./integration-tests.md) — Test with devnet for full transaction lifecycle
- [Emulator](./emulator.md) — Use devnet as a local blockchain emulator
