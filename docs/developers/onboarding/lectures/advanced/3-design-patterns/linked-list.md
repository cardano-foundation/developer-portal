---
id: linked-list
title: "Linked list"
sidebar_label: "Linked list"
description: "Split a growing registry across authenticated UTxOs, change only its neighbors, and prove membership or absence with one reference input. Compare the costs with keeping every entry in one datum."
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from "@theme/CodeBlock";
import extractRegion from "@site/src/utils/extractRegion";
import costFigure, { costSaving, costLimit } from "@site/src/utils/costFigure";
import RegistryAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/lib/registry.ak";
import ManualAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/lib/manual.ak";
import NaiveAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/validators/naive.ak";
import ByHandAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/validators/by_hand.ak";
import LibraryAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/validators/with_library.ak";
import ProofsAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/validators/proofs.ak";
import VariantsAiken from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/on-chain/aiken/lib/variants.ak";
import BlueprintMesh from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/off-chain/mesh/src/lib/blueprint.ts";
import RegistryMesh from "!!raw-loader!@site/examples/onboarding/design-patterns/linked-list/off-chain/mesh/src/lib/registry.ts";
import Costs from "@site/examples/onboarding/design-patterns/linked-list/off-chain/mesh/costs.json";

A growing collection eventually stops fitting comfortably in one datum. Every change has to replace that whole datum, every lookup has to search it, and every writer competes for the same UTxO. A **linked list** stores each entry in its own authenticated UTxO, with a pointer to the next entry. A change touches its neighbors rather than the whole collection.

This page builds a participant registry in three versions: one array datum, a linked list written by hand, and the same list with [`aiken-design-patterns` v1.9.0](https://github.com/Anastasia-Labs/aiken-design-patterns/tree/v1.9.0). It also covers the library's unordered operations, advanced list, and nested list. We asume you went over the [onboarding course](../../../lectures/introduction.md) or that you have built Cardano protocols in the past.

## The protocol

An **operator** maintains a directory of participants. Each participant has a 28-byte key and a label of at most 32 bytes. Only the operator can add, remove, or relabel entries. Other contracts can ask whether a key is present or absent without spending the directory. The registry attests what the operator registered; it does not prove who controls a key.

The obvious representation is one UTxO with every entry in its datum:

```mermaid
flowchart LR
    subgraph IN["INPUTS: UTxOs spent"]
        F["`**operator's funds**
        pays the fee`"]
        R["`**registry**
        - one root NFT
        - datum: A, C, E, ...`"]
    end
    TX{{"`**add B**
    operator signs
    rewrite the whole collection`"}}
    subgraph OUT["OUTPUTS: UTxOs created"]
        R2["`**continued registry**
        - same root NFT
        - datum: A, C, E, ..., B`"]
        C["change to the operator"]
    end
    F --> TX
    R --> TX
    TX --> R2
    TX --> C
    style F stroke-dasharray:4 3
    style R stroke-dasharray:4 3
```

The baseline and the list share the application types. The list uses the library's `Element` data shape even in the hand-written version: `data` is either `Root` or `Node`, and `link` is `Some(next_key)` or `None`. Its checks are written out below.

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "imports")}
</CodeBlock>

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "types")}
</CodeBlock>

The **root NFT** has an empty asset name. A **node NFT** has the name `NODE ++ key`, exactly 32 bytes here. These namespaces cannot overlap. The datum stores only the successor's key, not its transaction hash: spending a node changes its output reference, but the NFT's name remains its identity.

The redeemers cover the lifecycle:

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "actions")}
</CodeBlock>

The common checks enforce the label/key sizes, the operator's signature, and exact mint quantities. Each registry is one multi-purpose script, so its minting policy ID and spending credential are the same hash. The seed fixes the one-time initialization, as in [the oracle](../../../lectures/intermediate/12-modifying-state.md).

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "application")}
</CodeBlock>

An output's address cannot authenticate its datum. Anyone can send a fabricated entry to the registry address. The NFT from the pinned policy is what makes an entry genuine. These readers also require an inline typed datum, exactly one non-ada asset of quantity one, and no reference script:

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "authenticate")}
</CodeBlock>

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## The naive contract

The baseline mints the root NFT once, at its own address, with an empty array. An add checks the key is not already present, then appends the entry. A removal filters it out. Relabeling replaces that entry's payload. Every mutation reproduces the root NFT at the exact same address with the entire new array and at least its previous ada deposit. Closing requires the array to be empty and burns the root.

<CodeBlock language="aiken" title="validators/naive.ak">
  {extractRegion(NaiveAiken, "validator")}
</CodeBlock>

It works well for a small directory. But adding one entry costs {costFigure(Costs, "versions.naive.scenarios.insert.1.mem")} memory units with one existing participant, and {costFigure(Costs, "versions.naive.scenarios.insert.100.mem")} with 100. The transaction must serialize the entire continued datum too. Two otherwise unrelated relabels both spend the same registry UTxO, so only one can succeed against that version of the state.

## The pattern

Split the directory into a root and one UTxO per participant. Every element holds ada, its unique NFT, and the datum containing its payload and successor link. In this example the nodes are sorted by key:

```mermaid
flowchart LR
    R["root NFT<br/>Root(version = 0)<br/>link = A"] --> A["NODE + A<br/>Node(label)<br/>link = C"]
    A --> C["NODE + C<br/>Node(label)<br/>link = E"]
    C --> E["NODE + E<br/>Node(label)<br/>link = None"]
```

These arrows are **datum links**, not transactions. Following one means finding the UTxO with that node NFT in an off-chain index. A script never needs to walk this whole chain to insert, remove, or read one entry.

### Insertion

To add B between A and C, spend A, mint B's NFT, and produce A pointing to B and B pointing to C. A is the **anchor**. C is neither spent nor needed as a reference input; A's authenticated link already names it.

```mermaid
flowchart LR
    subgraph IN["INPUTS: UTxOs spent"]
        F["operator's funds"]
        A["`**anchor A**
        - NFT: NODE + A
        - link: C`"]
    end
    TX{{"`**insert B**
    operator signs
    mint +1 NODE + B
    require A < B < C`"}}
    subgraph OUT["OUTPUTS: UTxOs created"]
        A2["`**continued A**
        - same NFT and payload
        - link: B`"]
        B["`**new B**
        - NFT: NODE + B
        - link: C`"]
        Change["change to the operator"]
    end
    F --> TX
    A --> TX
    TX --> A2
    TX --> B
    TX --> Change
    style F stroke-dasharray:4 3
    style A stroke-dasharray:4 3
```

The root can anchor an insertion before the first node. A terminal node can anchor one after the last. Strict comparisons prevent duplicate keys: the new key must be strictly between its neighbors, with a missing neighbor representing the boundary.

### Removal and data updates

To remove B, spend **both A and B**, burn B's NFT, and reproduce A with B's old link. The policy proves A actually pointed to B, so an unrelated node cannot be removed using A as the anchor.

```mermaid
flowchart LR
    subgraph IN["INPUTS: UTxOs spent"]
        F["operator's funds"]
        A["A: link = B"]
        B["B: link = C"]
    end
    TX{{"`**remove B**
    operator signs
    burn -1 NODE + B`"}}
    subgraph OUT["OUTPUTS: UTxOs created"]
        A2["A: same NFT and payload<br/>link = C"]
        Change["change, including B's released deposit"]
    end
    F --> TX
    A --> TX
    B --> TX
    TX --> A2
    TX --> Change
    style F stroke-dasharray:4 3
    style A stroke-dasharray:4 3
    style B stroke-dasharray:4 3
```

Relabeling spends and reproduces **only that node**, without minting anything. Its address, NFT, and link stay the same. Two relabels of distinct nodes can use disjoint inputs. Two insertions into the same gap, or a relabel and removal of the same node, still compete. A linked list reduces the scope of [UTxO contention](../../../../curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion.md#utxo-contention); it does not eliminate it.

### Membership and absence

An ascending list supports two proofs, each using **one authenticated reference input**:

- **Membership of B:** read the node with key B.
- **Absence of B:** read the anchor A whose key and successor straddle B: `A < B < C`.

The root proves a gap before the first node. A terminal node proves a gap after the last. An empty root proves every key absent. The strict comparisons are essential: A cannot prove A or C absent. An unordered list cannot prove absence this way.

The reader trusts these local proofs because every initialization and mutation preserved the global sorted-chain invariant. One arbitrary NFT or one sorted-looking datum would not be enough.

## Design

The four questions from Intermediate:

1. **Requirements.** One live entry per key, authenticated by the registry's policy. Only the operator mutates it. A reader can prove membership or absence without taking a write lock on the registry. Every continuing element keeps its deposit.
2. **Actions.** Initialize an empty root; insert a node; remove a node; update a node's label; destroy an empty root. A separate reader contract asks membership or absence questions.
3. **What must be true.** Initialization consumes the seed and places one root NFT at the registry. Insertion consumes exactly one authentic element, preserves its payload, wires both links, and mints only the new node NFT in strict order. Removal consumes exactly the linked pair, skips the removed node, and burns only its NFT. A data update changes no structure and mints no registry asset. Destruction burns an empty root. Every mutation needs the operator's signature.
4. **What must be remembered.** Root configuration, node labels, and successor keys live in datums. The NFT name carries the element's identity. The seed and operator key are script parameters. Readers pin the applied registry policy ID.

The spend and mint handlers cooperate as in [transaction-level validation](./transaction-level-validation.md). During a structural operation, each spend only requires a mint or burn under the list policy. That invokes the policy **once**; the policy proves the complete transition. During a label update, there is no minting policy invocation, so the spend must check its own continuation fully.

## Write it by hand

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

The ordering and query helpers distinguish a root boundary from an actual node key. The same strict gap check is used by insertion and absence proofs:

<CodeBlock language="aiken" title="lib/registry.ak">
  {extractRegion(RegistryAiken, "ordering")}
</CodeBlock>

The minting helper reads the real transaction outputs at the hinted indices and scans the **complete** input list for policy-bearing elements. Insertion requires exactly one; removal requires exactly two. An extra authentic input cannot pass through the cheap structural spend gate unnoticed.

<CodeBlock language="aiken" title="lib/manual.ak">
  {extractRegion(ManualAiken, "transitions")}
</CodeBlock>

The validator supplies authorization and the one-time seed check, delegates structural transitions to that helper, and handles label updates locally:

<CodeBlock language="aiken" title="validators/by_hand.ak">
  {extractRegion(ByHandAiken, "validator")}
</CodeBlock>

An index is a hint, not authorization. The spend checks that the input at its index is the one being spent. Mint output hints select actual outputs, which are then authenticated and checked. Both address rules matter: the **continued anchor** stays at the exact old address, including its stake credential; a **new node** must share its payment credential, but may use a different stake credential.

The demonstration reader spends a separate probe UTxO. Only this reader script executes; the registry is attached as a reference input:

<CodeBlock language="aiken" title="validators/proofs.ak">
  {extractRegion(ProofsAiken, "manual-proof")}
</CodeBlock>

The probe exists to exercise the proof with the real ledger context. It is not an application vault: anyone can spend it after supplying a valid query. An application derives the queried key from its own rules and uses the result to authorize its own action.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## The same with the library

<Tabs groupId="onchain">
<TabItem value="aiken" label="Aiken" default>

The default [`linked_list` module](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/v1.9.0/lib/aiken-design-patterns/linked-list.ak) checks the same structural transitions. The callbacks provide the registry's rules: typed and bounded node data, no reduction in anchor ada, and an authenticated root at the intended payment credential.

<CodeBlock language="aiken" title="validators/with_library.ak">
  {extractRegion(LibraryAiken, "validator")}
</CodeBlock>

Helpers return a function awaiting the list's constants. `run_element_with` supplies the policy ID, root name, node prefix, and prefix length. Root-only operations use `run_root_with`; node-only readers use `run_node_with`. These runners configure the checks; they do not discover a policy on their own.

The library's `get_element_info` authenticates the reference and supplies its key and link to the same query check:

<CodeBlock language="aiken" title="validators/proofs.ak">
  {extractRegion(ProofsAiken, "library-proof")}
</CodeBlock>

**What remains the caller's responsibility:** the one-time nonce, operator authorization, NFT namespaces, key and payload rules, deposit changes, and the script wiring. Pass complete transaction inputs in ledger order, and select every supplied output from the real transaction outputs. `spend_for_adding_or_removing_an_element` only checks that the policy is invoked; it cannot make an arbitrary minting branch a valid list transition.

The hand-written reader fully decodes the typed payload. The library's structural helpers use generic `Data`, preserve it where needed, and decode application payloads in callbacks. That difference helps the library use fewer execution units here; it is still a larger compiled script. Measure your own application checks rather than assuming either implementation is always cheaper.

### Other default operations

The library also supports these operations, exercised by the helper-level tests in `lib/variants.ak`:

| Operation | Helper |
|---|---|
| Descending ordered insertion | `insert_descending` |
| Add after the terminal element without ordering | `append_unordered` |
| Add immediately after the root without ordering | `prepend_unordered` |
| Remove the first node and change root data using its payload | `fold_from_root` |
| Read only a root or only a node | `get_root_element_info`, `get_node_element_info` |

Descending insertion reverses both comparisons. Numeric keys need a **fixed-width byte encoding** if their numerical order matters: `00ff < 0100`, whereas `ff > 0100` as bytearrays. Participant keys here already have a fixed width.

Unordered appends and prepends still check NFT authentication and pointer wiring, but they do **not** prove key uniqueness or absence. The caller must supply a separate uniqueness rule, such as keys derived from unique consumed nonces. Do not switch this registry to unordered insertion while retaining its absence reader.

`fold_from_root` spends the root and its first node, burns that node's NFT, adopts its link, and lets the callback update root data. The test increments the root version. Ordinary `remove` preserves the anchor payload instead. Data-update helpers preserve the link and constructor, so they cannot stand in for a structural operation.

### Advanced lists

[`linked_list/advanced`](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/v1.9.0/lib/aiken-design-patterns/linked-list/advanced.ak) keeps the same element type but allows **reference scripts** on elements and **caller-validated anchor payload changes** during insertion/removal. Structural continuations preserve the anchor's reference script. Data-update callbacks see both the old and new reference-script hashes and decide which changes are acceptable.

It also allows additional mints and burns under the same policy **outside the reserved root and node namespaces**. The callbacks receive those changes as `NonStructuralListAssets`, and same-policy inputs at other payment credentials as `NonStructuralListInputs`. These are separate classifications; allowing an extra asset does not allow an extra list node to be consumed.

This tested helper allows a new node carrying a specific reference script and exactly one unrelated `RECEIPT` mint. It rejects collected external same-policy inputs, preserves the anchor data, and keeps the deposit:

<CodeBlock language="aiken" title="lib/variants.ak">
  {extractRegion(VariantsAiken, "advanced")}
</CodeBlock>

The tests pair that accepted shape with an extra root mint and an extra node mint, both refused. Root initialization remains strict: only the singleton root mint is allowed. Every policy branch must respect that reserved asset, including application-specific branches. The advanced helpers still use the default structural spend gate.

### Nested lists

[`linked_list/nested`](https://github.com/Anastasia-Labs/aiken-design-patterns/blob/v1.9.0/lib/aiken-design-patterns/linked-list/nested.ak) adds an **InnerRoot**: a directory in the outer list, and an anchor for its own child list. Its normal `link` points to the next directory; its extra `child_link` points to its first participant.

```mermaid
flowchart LR
    R["Root"] --> D1["InnerRoot: directory A"] --> D2["InnerRoot: directory B"]
    D1 -->|child_link| A1["Node: participant A1"] --> A2["Node: participant A2"]
    D2 -->|child_link| B1["Node: participant B1"]
```

The outer and child chains can have different ordering modes. `InnerRoot` and `Node` still share **one NFT namespace**, so keys must be unique across both roles, not merely within each directory. Ordered nested insertion checks only the affected chains; it cannot detect a key already used in another directory.

This variant uses generated element IDs. The helper requires a **consumed nonce UTxO** and derives each 28-byte key as `blake2b_224(CBOR(nonce_output_reference, role))`, with distinct `Directory` and `Participant` roles. The nonce can be the spent anchor itself. A nonce cannot be consumed twice, and this insertion creates exactly one element per role, so keys are globally unique under the hash's collision-resistance assumption. Every nested minting branch must enforce the same derivation and role assignments; a branch creating multiple children would also need a distinct index in each child's hash input.

The helper creates a directory with one child using `insert_inner_list_ascending`. The preparation callback checks the derived directory key, the per-node callback checks the derived child key and counts children, and the final callback requires exactly one child and validates the anchor change:

<CodeBlock language="aiken" title="lib/variants.ak">
  {extractRegion(VariantsAiken, "nested")}
</CodeBlock>

The tests accept a first and second directory with fresh keys. They reject a reference-only nonce, a child key reused from another directory, keys reused across directory/child roles, and a child pointer that does not name the supplied child. `insert_inner_list_descending` changes the outer ordering; `insert_into_inner_list` inserts a child beneath an existing inner root or child anchor, with `Ascending`, `Descending`, or `Unordered` ordering. Those operations also need application-level global key uniqueness. Whole-list insertion supplies the child outputs in pointer order and must end at `None`.

The nested module also supplies initialization/destruction, data updates, and element/root/inner-root/node readers. Updates preserve both the ordinary link and an inner root's child link. Nested removal requires custom logic; the base module's `remove` does not understand two links. As with the advanced list, callbacks handle reference scripts and permitted non-structural assets and inputs.

These advanced and nested snippets are **helper-level examples**, tested by `aiken check`. The deployed registry and Mesh benchmark use the default ascending list, whose full validator is above.

</TabItem>
<TabItem value="scalus" label="Scalus">

A [Scalus](https://scalus.org/) version is coming soon. The idea is identical, only the language differs.

</TabItem>
</Tabs>

## Build the transaction

<Tabs groupId="offchain">
<TabItem value="mesh" label="Mesh" default>

The Mesh example uses three versions and the same datum layouts as Aiken:

<CodeBlock language="ts" title="src/lib/blueprint.ts">
  {extractRegion(BlueprintMesh, "types")}
</CodeBlock>

<CodeBlock language="ts" title="src/lib/blueprint.ts">
  {extractRegion(BlueprintMesh, "data")}
</CodeBlock>

The offline chain applies the seed and operator parameters before hashing each registry, then applies that policy ID to its reader script. It supplies fixed UTxOs, protocol parameters, a test-only wallet, and `OfflineEvaluator`. `Chain` is the return type of `offlineChain` in `src/lib/offline.ts`; it contains those fixtures and the selected version's scripts. Nothing is submitted.

A plan records the inputs, outputs, mint, and references before construction:

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "types")}
</CodeBlock>

The examples mutate the tail to keep the benchmark comparable: add after the last participant, remove the last, or relabel the last. The validator supports any valid anchor. A production builder finds the affected node and its predecessor from its off-chain index, using their NFTs rather than trusting the address.

Input indices are calculated **after including the chosen wallet input**, against ledger order:

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "ledger-order")}
</CodeBlock>

The plan writes each continuation at a known output index. Insertion writes the anchor at zero and the new node at one. Removal includes both spend redeemers and one burn redeemer. The root's initialization and destruction use the same lifecycle helpers:

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "mutation")}
</CodeBlock>

A query attaches the authenticated node, or the baseline's whole array, as a reference input:

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "proof")}
</CodeBlock>

`enoughAda` computes the ledger minimum for the actual address, assets, and inline datum with `csl.min_ada_for_output`, adding ada when necessary. The benchmark deliberately supplies a large fixed deposit so the baseline's growing datum remains funded while measuring the size limit. That deposit is a fixture, not a recommended per-node amount.

<details>
<summary>The minimum-ada calculation</summary>

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "minimum-ada")}
</CodeBlock>

</details>

The transaction builder consumes exactly the chosen inputs. There is no late coin selection to shift the indices, and change comes last. Honest measurements pass the evaluator so execution fees reflect the actual scripts:

<CodeBlock language="ts" title="src/lib/registry.ts">
  {extractRegion(RegistryMesh, "build")}
</CodeBlock>

</TabItem>
<TabItem value="evolution" label="Evolution">

An [Evolution](https://github.com/IntersectMBO/evolution-sdk) version is coming soon. The idea is identical, only the library calls differ.

</TabItem>
</Tabs>

## The numbers

`npm run bench` builds each transaction on an in-memory chain, evaluates the compiled scripts, signs offline to count the wallet witness in transaction size, and writes `costs.json`. Every figure here comes from that file. `npm test` measures again and rejects stale figures. Limits and fee parameters are Mesh's defaults, so a live deployment should measure with its network's current parameters.

The independent variable is **participants already in the registry**, not inputs in a batch. The transaction changes or queries one participant. Membership selects the last entry and absence selects a key after it, so the naive reader searches the whole array.

**Memory units for adding one participant**, summed over all spend and mint handlers:

| Existing participants | One datum | By hand | With the library |
|---|--:|--:|--:|
| 1 | {costFigure(Costs, "versions.naive.scenarios.insert.1.mem")} | {costFigure(Costs, "versions.byHand.scenarios.insert.1.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.1.mem")} |
| 5 | {costFigure(Costs, "versions.naive.scenarios.insert.5.mem")} | {costFigure(Costs, "versions.byHand.scenarios.insert.5.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.5.mem")} |
| 10 | {costFigure(Costs, "versions.naive.scenarios.insert.10.mem")} | {costFigure(Costs, "versions.byHand.scenarios.insert.10.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.10.mem")} |
| 20 | {costFigure(Costs, "versions.naive.scenarios.insert.20.mem")} | {costFigure(Costs, "versions.byHand.scenarios.insert.20.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.20.mem")} |
| 100 | {costFigure(Costs, "versions.naive.scenarios.insert.100.mem")} | {costFigure(Costs, "versions.byHand.scenarios.insert.100.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.100.mem")} |

**Fee for adding one participant**, in ada:

| Existing participants | One datum | By hand | With the library |
|---|--:|--:|--:|
| 1 | {costFigure(Costs, "versions.naive.scenarios.insert.1.fee", "ada")} | {costFigure(Costs, "versions.byHand.scenarios.insert.1.fee", "ada")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.1.fee", "ada")} |
| 5 | {costFigure(Costs, "versions.naive.scenarios.insert.5.fee", "ada")} | {costFigure(Costs, "versions.byHand.scenarios.insert.5.fee", "ada")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.5.fee", "ada")} |
| 10 | {costFigure(Costs, "versions.naive.scenarios.insert.10.fee", "ada")} | {costFigure(Costs, "versions.byHand.scenarios.insert.10.fee", "ada")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.10.fee", "ada")} |
| 20 | {costFigure(Costs, "versions.naive.scenarios.insert.20.fee", "ada")} | {costFigure(Costs, "versions.byHand.scenarios.insert.20.fee", "ada")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.20.fee", "ada")} |
| 100 | {costFigure(Costs, "versions.naive.scenarios.insert.100.fee", "ada")} | {costFigure(Costs, "versions.byHand.scenarios.insert.100.fee", "ada")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.100.fee", "ada")} |

**Memory units for membership**, one reference input in every version:

| Participants | One datum | By hand | With the library |
|---|--:|--:|--:|
| 1 | {costFigure(Costs, "versions.naive.scenarios.member.1.mem")} | {costFigure(Costs, "versions.byHand.scenarios.member.1.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.member.1.mem")} |
| 5 | {costFigure(Costs, "versions.naive.scenarios.member.5.mem")} | {costFigure(Costs, "versions.byHand.scenarios.member.5.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.member.5.mem")} |
| 10 | {costFigure(Costs, "versions.naive.scenarios.member.10.mem")} | {costFigure(Costs, "versions.byHand.scenarios.member.10.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.member.10.mem")} |
| 20 | {costFigure(Costs, "versions.naive.scenarios.member.20.mem")} | {costFigure(Costs, "versions.byHand.scenarios.member.20.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.member.20.mem")} |
| 100 | {costFigure(Costs, "versions.naive.scenarios.member.100.mem")} | {costFigure(Costs, "versions.byHand.scenarios.member.100.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.member.100.mem")} |

**Other operations at 100 participants**, memory units:

| Operation | One datum | By hand | With the library |
|---|--:|--:|--:|
| Remove | {costFigure(Costs, "versions.naive.scenarios.remove.100.mem")} | {costFigure(Costs, "versions.byHand.scenarios.remove.100.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.remove.100.mem")} |
| Relabel | {costFigure(Costs, "versions.naive.scenarios.update.100.mem")} | {costFigure(Costs, "versions.byHand.scenarios.update.100.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.update.100.mem")} |
| Prove absent | {costFigure(Costs, "versions.naive.scenarios.absent.100.mem")} | {costFigure(Costs, "versions.byHand.scenarios.absent.100.mem")} | {costFigure(Costs, "versions.withLibrary.scenarios.absent.100.mem")} |

**Script and transaction sizes**, bytes. Each registry script is included in the transaction, shared between its handlers:

| Size | One datum | By hand | With the library |
|---|--:|--:|--:|
| Applied registry script | {costFigure(Costs, "versions.naive.scriptSize")} | {costFigure(Costs, "versions.byHand.scriptSize")} | {costFigure(Costs, "versions.withLibrary.scriptSize")} |
| Insert with 100 existing participants, signed | {costFigure(Costs, "versions.naive.scenarios.insert.100.size")} | {costFigure(Costs, "versions.byHand.scenarios.insert.100.size")} | {costFigure(Costs, "versions.withLibrary.scenarios.insert.100.size")} |

What these measurements say:

- **For a tiny directory, one datum is cheaper to mutate.** It needs no node NFT mint and has a smaller script. Splitting the state adds fixed work.
- **The list's local cost does not depend on the whole registry size.** At 100 participants, hand-written insertion uses {costSaving(Costs, "versions.naive.scenarios.insert.100.mem", "versions.byHand.scenarios.insert.100.mem")} less memory than the baseline. Insertion into a registry with {costFigure(Costs, "largeList.size")} participants still uses {costFigure(Costs, "largeList.byHand.mem")} by hand and {costFigure(Costs, "largeList.withLibrary.mem")} with the library. This is constant in total collection size, not in the number of other inputs or outputs you put in a transaction.
- **The library needs fewer execution units but a higher insertion fee than the hand-written version.** Its larger included script outweighs that execution saving here. [Reference scripts](../../../lectures/intermediate/13-reference-inputs-and-scripts.md) change that trade-off; these measurements include the scripts directly.
- **The single-datum insertion limit is finite.** This fixture can add one participant with at most {costFigure(Costs, "arrayLimit.largestExisting")} already present. The last fitting signed transaction is {costFigure(Costs, "arrayLimit.last.size")} bytes against a {costFigure(Costs, "limits.size")}-byte limit, and the first limit reached is {costLimit(Costs, "arrayLimit.limitedBy")}. Beyond it, Mesh refuses construction. Different labels, witnesses, script deployment, or datum layouts change that threshold. This is an insertion limit for this builder, not a universal maximum for every action.
- **Reference inputs avoid copying the datum into the body, not reading it on-chain.** The naive membership transaction's size stays flat, but its execution cost grows as it scans the referenced array. The linked reader authenticates only one fixed-size element.

There is no corresponding total-entry limit to find by enlarging this linked-list transaction: it still touches the same local elements. The chain must nevertheless store every node, and every one requires its own minimum ada. Reading the entire directory or folding every node into a root is not constant-cost work.

## When to use it, and when not

Use a linked list when a **mutable collection** must outgrow one datum, changes can be local, and other scripts need authenticated membership or absence proofs. A sorted list is particularly useful for live registries and sets with a uniqueness rule.

Keep one datum for a small, bounded collection whose writers rarely compete. A linked list introduces NFTs, a mint/spend protocol, an off-chain index, and an ada deposit per element. For a mostly static set where only membership matters, a [Merkle tree](./merkle-tree.md) commits the set to one root instead; the reader supplies a hash proof rather than references to stored nodes.

Avoid a global counter updated on every insertion if the goal is independent writes: storing it in the root makes every insertion spend that root again. The registry's root configuration is fixed, so insertion into an existing gap does not require the root. The single operator key is an authorization choice, not a requirement of the list structure.

**Live uniqueness is not historical uniqueness.** Removal destroys the node, so the same key may be inserted later. To use insertion as a proof that an asset has never been minted before, retain its key permanently, prohibit its removal, and require every relevant mint to perform that insertion.

### Security

The Aiken and Mesh tests establish these boundaries:

- **One initialized root.** Initialization needs the pinned nonce and puts the root at the registry credential. Extra root minting during insertion is refused. Destruction of a nonempty registry is refused.
- **Authenticated proofs.** A fabricated datum at the right address without the policy NFT is refused. A missing key cannot prove membership, and an existing key cannot prove absence. Boundary tests cover the root, terminal node, and empty list.
- **No broken pointers.** Insertion must retain the old successor on the new node. Removal must bypass the removed node. Relabeling cannot change a link. Duplicate insertion is refused.
- **No extra structural inputs.** An insertion with an additional authentic input is refused by the minting policy. A structural spend without policy minting is refused by the spend script.
- **Checked hints.** A spend index naming the wallet input, an output index beyond the outputs, and a reference index beyond the references all fail.
- **Authorized, funded continuations.** Unsigned mutations, redirected continuations, missing continuation NFTs, shortened deposits, and labels beyond the size bound fail.
- **Library variant boundaries.** The default library refuses a reference script on a new node. The advanced helper accepts its permitted reference script and receipt but refuses extra root/node mints. The nested helper refuses a reference-only nonce, reused keys across directories or roles, and a broken child link.
- **A complete lifecycle.** Each version creates, inserts, relabels, removes, and closes using the actual outputs of the preceding transactions. Honest transactions assert every expected `MINT` and `SPEND` run; forged transactions are constructed without an evaluator and checked for refusal by the intended handler.

The list does not establish that an operator's registration is truthful. Readers must pin the **applied** policy ID, and application authorization must constrain the query they ask. A referenced UTxO must still exist when the reading transaction is processed; an update that spends it can require the reader to rebuild. The offline evaluator checks scripts, while network submission additionally enforces the ledger's phase-1 rules.

## Run it

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/design-patterns/linked-list linked-list
cd linked-list/on-chain/aiken
aiken check
aiken build
cp plutus.json ../../off-chain/mesh/blueprints/linked-list.plutus.json
cd ../../off-chain/mesh
npm install
npm run typecheck
npm test
npm run bench
```

The blueprint and measured figures ship with the example, so the Mesh tests can run without compiling Aiken first. After changing a validator, rebuild, copy the blueprint, and regenerate the figures before running the stale-cost check.

## Go deeper

- [Modifying state](../../../lectures/intermediate/12-modifying-state.md): continuing outputs and beacon authentication.
- [Missing UTxO authentication](../../../../curriculum/smart-contracts/security/vulnerabilities/missing-utxo-authentication.md): why the NFT, not the address, establishes state identity.
- [Resource exhaustion](../../../../curriculum/smart-contracts/security/vulnerabilities/resource-exhaustion.md): growing datums and UTxO contention.
- [Merkle Patricia trie](./merkle-patricia-trie.md) and [Merkle tree](./merkle-tree.md): other ways to organize or commit to large collections.
- [`linked_list` API](https://anastasia-labs.github.io/aiken-design-patterns/aiken_design_patterns/linked_list.html), [`advanced` API](https://anastasia-labs.github.io/aiken-design-patterns/aiken_design_patterns/linked_list/advanced.html), and [`nested` API](https://anastasia-labs.github.io/aiken-design-patterns/aiken_design_patterns/linked_list/nested.html): the library's contracts for callers.
- [Plutonomicon associative data structures](https://github.com/Plutonomicon/plutonomicon/blob/main/assoc.md#overview): the structure behind these local transitions.
