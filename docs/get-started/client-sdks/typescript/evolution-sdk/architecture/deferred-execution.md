---
title: Deferred Execution
description: Why builders store programs instead of executing immediately
---

## Abstract

Transaction builders store **program descriptions** (Effect values) rather than executing operations immediately. When you call `.payToAddress()` or `.collectFrom()`, the builder appends a ProgramStep to an immutable array. Execution happens later when `build()` is called, creating fresh state for each invocation. This separation between program description and execution enables safe builder reuse, compositional transaction patterns, and predictable state management.

## Design Philosophy

Traditional builders execute immediately: calling `.payToAddress()` mutates internal state right then. This creates a critical flaw—calling `build()` twice uses the same accumulated state. The second execution includes mutations from the first, making builder reuse unsafe.

The architecture resolves this by storing ProgramSteps (Effect programs describing work) in an immutable array. Nothing executes until `build()` is called. Each `build()` creates fresh state, executes all stored programs sequentially, and returns an independent transaction. The builder itself never mutates—it's an immutable value holding program descriptions.

## Program Storage and Execution

The builder maintains an immutable array of ProgramSteps. Each builder method appends a new program without executing it.

**Builder Instance**: Immutable collection of ProgramSteps (Effect values). Never changes except by appending new programs.

**First build() Call**: Creates fresh `Ref<TxBuilderState>`, executes all programs sequentially, returns independent transaction.

**Second build() Call**: Creates new fresh `Ref<TxBuilderState>`, re-executes all programs, returns independent transaction. No state shared with first execution.

## Execution Sequence

Programs execute sequentially in append order. Each program can observe effects of previous programs within the same build cycle.

**Fresh State Creation**: `Ref.make(initialTxBuilderState)` creates mutable reference with empty arrays: `outputs: [], inputs: [], scripts: []`.

**Sequential Execution**: Programs execute in order appended. Later programs see state mutations from earlier programs (within this build only).

**Transaction Assembly**: Final state is read, transaction body constructed, witnesses prepared.

## Integration Points

**Transaction Builder Methods**: All builder methods (`payToAddress`, `collectFrom`, `attachScript`, `readFrom`) create ProgramSteps and append to array. Methods return `this` for chaining. No execution occurs.

**Effect-TS Runtime**: ProgramSteps are `Effect.Effect<void, TransactionBuilderError, TxContext>` values. The `build()` method provides `TxContext` (containing `Ref<TxBuilderState>`) and executes all effects sequentially using `Effect.all(programs, { concurrency: "unbounded" })`.

**State Management**: Fresh state is provided via Effect context layers:
- `TxContext`: `Ref<TxBuilderState>` for mutable transaction state
- `PhaseContextTag`: `Ref<PhaseContext>` for build phase state machine
- `ProtocolParametersTag`, `ChangeAddressTag`, `AvailableUtxosTag`: Immutable configuration

## Related Topics

- [Transaction Flow](./transaction-flow) - How build, sign, submit phases enforce ordering
- [Provider Layer](./provider-layer) - UTxO queries during program execution
- [Wallet Layer](./wallet-layer) - Change address resolution and signing
