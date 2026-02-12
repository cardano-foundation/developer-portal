---
id: submitting-governance-actions
slug: /governance/cardano-governance/submitting-governance-actions
title: Submitting Governance Actions on Cardano
sidebar_label: Submitting Governance Actions
sidebar_position: 3
description: This guide provides a step-by-step process for preparing, hosting metadata, and submitting governance actions on Cardano within the CIP-1694 on-chain governance framework.
---

# Submitting Governance Actions on Cardano

This guide provides a comprehensive, step-by-step process to help you successfully submit governance actions on Cardano. It covers everything from preparation and metadata creation to best practices and final submission.

---

## Introduction

Cardano's governance is decentralized and permissionless, any ada holder can propose changes. Governance actions are the mechanism for enacting these changes, and they are voted on by at least two of the three governance bodies: **Delegated Representatives** (DReps), the **Constitutional Committee** (CC), and **Stake Pool Operators** (SPOs). 'Enactment' refers to the point at which a governance action, having passed all necessary votes and checks, is implemented on the Cardano blockchain, and its proposed changes take effect. This guide will walk you through the steps necessary to successfully submit a governance action.

---

## Understanding Governance Actions

Governance actions are formal proposals submitted on-chain. They aim to modify aspects of the Cardano blockchain. Each governance action requires a refundable deposit of 100,000 ada (as of March 2025). The deposit is returned if your action is enacted or expires without being enacted.

There are seven types of governance actions:

1. **Motion of No-Confidence:** Initiates a vote of no confidence in the current Constitutional Committee. If enacted, the entire CC will be removed.
2. **New Constitutional Committee and/or Threshold and/or Terms:** Proposes changes to the Constitutional Committee's membership, term limits, or the threshold required for their decisions.
3. **Update to the Constitution or Guardrails Script:** Modifies the on-chain hash of the Cardano Constitution or Guardrails Script.
4. **Hard Fork Initiation:** Triggers a non-backwards compatible upgrade of the Cardano protocol (a "hard fork").
5. **Protocol Parameter Changes:** Modifies existing protocol parameters (e.g., transaction fees, block size).
6. **Treasury Withdrawals:** Requests funds from the Cardano treasury.
7. **Info:** An action that does not directly trigger any on-chain changes. It is used to gauge sentiment or approve budgets.

Of these, the first six have direct on-chain effects if approved. The "Info" action is used for signaling and does not directly change the chain's state. More details about all types can be found on the [Governance Action](/docs/governance/cardano-governance/governance-actions.md) page.

Governance actions require approval from at least two of three governance bodies and, in some cases, from all three, the specific details can be reviewed in [CIP-1694](https://github.com/cardano-foundation/CIPs/tree/master/CIP-1694#requirements).

---

## Prerequisites

Before submitting a governance action, you *should* complete the following:

1. **Prepare Metadata:** Create a metadata file and host it at a content-addressable storage solution (e.g., using [IPFS](https://ipfs.tech/)). This file provides context and rationale for your proposal. See [Creating the Metadata File](#creating-the-metadata-file) below.
2. **Obtain Sufficient ada:** Ensure you have the required governance action deposit of 100,000 ada (as of March 2025).
3. **Choose a Submission Method:** You can submit governance actions using:
    - **cardano-cli:** The command-line interface for interacting with the Cardano blockchain. [How to propose a governance actions Via Cardano-cli](/docs/get-started/infrastructure/cardano-cli/governance/create-governance-actions)
    - **GovTool:** A dedicated governance tool. [How to propose a governance actions Via GovTools](https://docs.gov.tools/cardano-govtool/using-govtool/governance-actions/propose-a-governance-action)

Optionally, authors can consider socialising their idea for a governance action before submission, giving stakeholders time to provide feedback
---

## Creating the Metadata File

The metadata file is critical for informing voters about the context of your proposal. It should:

- **Follow the Standardized Format (CIP-100 and CIP-108):**
  - [CIP-100 (Governance Metadata - Standard)](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0100)
  - [CIP-108 (Governance Metadata - Governance Action - Standard)](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0108)
- **Provide Sufficient Rationale:** Clearly explain *why* the change is proposed and *how* it will benefit the Cardano ecosystem. Include:
  - **Title:** A concise title for the governance action.
  - **Abstract:** A brief summary of the proposal.
  - **Motivation:** A concise statement of the problem or opportunity that the governance action addresses.
  - **Rationale:** A logical argument explaining why the proposed solution is the best approach to address the stated motivation.
  - **References:** Links to any relevant documents, research, or discussions, ideally all references should also be hosted on a content-addressable storage solution like [IPFS](https://ipfs.tech/).
- **Be hosted on Immutable Storage:** Use a content-addressable storage solution like [IPFS](https://ipfs.tech/). This ensures the content cannot be altered after submission. See [Hosting Your Metadata on Immutable Storage](#immutable-metadata-hosting) below.

:::important
For practical examples of governance action metadata, see the [**Governance Action Metadata Examples**](#governance-action-metadata-examples) section below.
:::

---

## Immutable Metadata Hosting

To ensure transparency and permanence, your metadata file and references should remain immutable. Here’s how to do this, starting with your metadata hosted in a GitHub repository:

### 1. Host Your Metadata File in a GitHub Repository

- **Set Up a GitHub Repository:**  
  Create a new repository using GitHub’s guide: [Create a New Repository on GitHub](https://docs.github.com/en/get-started/quickstart/create-a-repo)
- **Upload and Commit Your Metadata File:**  
  Add your metadata file (e.g., JSON or JSON-LD) to your repository and commit it. Each commit generates a unique hash that permanently identifies that version of your file. [Git Commit Guide](https://github.com/git-guides/git-commit)

### 2. Obtain a Permanent GitHub Link

- **Generate an Immutable Link:**  
  Navigate to your metadata file in your repository and click the **"Raw"** button. Copy the URL from your browser’s address bar, then replace the branch name with the commit hash. Detailed instructions can be found here: [Getting Permanent Links to Files on GitHub](https://docs.github.com/en/github/managing-files-in-a-repository/getting-permanent-links-to-files)

### 3. Pin Your Metadata to IPFS or Filecoin

Pinning your metadata to IPFS or Filecoin ensures that it is stored on a decentralized network and remains available permanently:

- **Using the NMKR API:**  
  Follow the NMKR API instructions for pinning files to IPFS. [NMKR API Tutorial for Pinning Files to IPFS](https://docs.nmkr.io/nmkr-studio-api/api-features#ipfs)
- **Using the Blockfrost Tutorial:**  
  Use Blockfrost’s guide to pin your metadata via their API.
  - [Blockfrost Tutorial for Pinning Files to IPFS](https://blockfrost.dev/start-building/ipfs/)
  - [Blockfrost Tutorial for Pinning Files to Filecoin](https://blockfrost.dev/start-building/ipfs/#filecoin)
- **Using IPFS:**  
  Follow the official IPFS guide to pin your files manually. [IPFS Pinning Guide](https://docs.ipfs.io/how-to/pin-files/)

To ensure fast and reliable access, it is recommended to use multiple different pinning services.

By following these steps, you ensure your metadata is permanently accessible and immutable, which builds trust in your governance actions by allowing all stakeholders to verify the original content using a permanent link or CID.

---

## General Recommendations

For all governance actions, follow these best practices:

- **Immutability:** Host all metadata and referenced documents on a content-addressable storage (e.g., IPFS).
- **Adherence to Cardano Constitution:** Ensure your proposal aligns with the [Cardano Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md) in its entirety.
- **Socialization:** Discuss your proposal prior to submission on community forums (e.g., [Cardano Forum](https://forum.cardano.org/c/governance/140), [GovTool](https://gov.tools/)) to gather feedback.
- **Testing:** Always test your submission on a Cardano testnet (e.g., the preview network) before submitting on Mainnet. This is especially crucial because governance actions cannot be modified after submission.
- **Transparency:** Keep your proposal clear, provide thorough context, and be responsive to community feedback.
- **Follow CIP Standards:** Ensure compliance with [CIP-100](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0100) and [CIP-108](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0108).

---

## Action Type – Specific Recommendations

These recommendations provide additional guidance for each specific type of governance action.

### Motion of no-confidence

- **Clearly state the reasons** for the motion in the *motivation* and *rationale* section of the metadata, providing specific evidence of why the Constitutional Committee is no longer trusted.
- **Consider the implications** carefully. A successful motion of no confidence halts most other governance actions until a new Constitutional Committee is established.

### Update committee and/or threshold and/or terms

- **Justify any proposed changes** to the Constitutional Committee's structure, term limits, or decision-making threshold in the *motivation* and *rationale* section of the metadata. Explain how these changes will improve governance.
- **Ensure compliance** with `UPDATE-CC-01a`, `CMTL-01a/02a/03a/04a/05a`, and `CMS-01/02/03` from the guardrails.
- **Propose a clear transition plan** if changing the committee's membership.

### New Constitution or Guardrails Script

- **Provide a detailed comparison** between the existing and proposed versions, highlighting the specific changes and their rationale.
- **Explain the impact** of these changes on the Cardano ecosystem.
- **Ensure consistency** between the new Constitution and the Guardrails Script, as defined in guardrail `NEW-CONSTITUTION-02`.
- **If introducing new parameters via a Hard Fork, define Guardrails for them**, as required by `NEW-CONSTITUTION-01a`.

### Hard Fork Initiation

- **Provide comprehensive documentation** outlining the changes introduced by the hard fork.
- **Conduct a thorough technical review** that makes sure the governance action does not endanger the security, functionality, performance, or long-term sustainability of the Cardano Blockchain, as required by [Article III, Section 5 of the Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#section-5).
- **Ensure sufficient stake pool operator support**, at least 85% upgraded to a compatible node version - `HARDFORK-04a`.
- **Follow versioning rules**, as defined in guardrails `HARDFORK-01/02a/03`.
- **Document new/deprecated parameters in the Guardrails**, as mandated by `HARDFORK-05/06/07`.
- **Provide a cost model if a new Plutus version was introduced**, as per `HARDFORK-08`.
- **Clearly communicate the timeline** and any required actions for users and stakeholders.

### Protocol Parameter Changes

- **Thoroughly research the impact** of any proposed parameter changes. Use data and evidence to support your proposal.
- **Conduct a thorough technical review** that makes sure the governance action does not endanger the security, functionality, performance, or long-term sustainability of the Cardano Blockchain, as required by [Article III, Section 5 of the Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#section-5).
- **Follow the protocol parameter changes specific guardrails** `PARAM-01/02a/03a/04a/05a/06a`.
- **Adhere to the specific Guardrails** for each parameter group. These Guardrails cover allowed ranges, change frequency, and other restrictions. The Guardrails are extensive and categorized:
  - **Critical Protocol Parameters** ([Section 2.1](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#21-critical-protocol-parameters))
  - **Economic Parameters** ([Section 2.2](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#22-economic-parameters))
  - **Network Parameters** ([Section 2.3](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#23-network-parameters))
  - **Technical/Security Parameters** ([Section 2.4](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#24-technicalsecurity-parameters))
  - **Governance Parameters** ([Section 2.5](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#25-governance-parameters))
- **Develop a reversion/recovery plan** in case of negative consequences ([Section 2.6](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#26-monitoring-and-reversion-of-parameter-changes)).
- **Monitor network performance** after changes to network parameters ([Section 2.6](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#26-monitoring-and-reversion-of-parameter-changes)).
- **Utilize and be aware of the guardrails script**, an extra layer of automated security checks.

### Treasury Withdrawals

- **Clearly define the purpose** of the withdrawal and how the funds will be used.
- **Provide a detailed cost breakdown** outlining all expenses.
- **Ensure the withdrawal does not exceed the net change limit**, as required by `TREASURY-01a/02a`.
- **Denominate the withdrawal in ada**, as per `TREASURY-03a`.
- **Include an allocation for audits and oversight** ([Article IV, Section 4 of the Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#section-4-2)).
- **Ensure funds are held in auditable accounts**, as long as an administrator holds funds before paying vendors ([Article IV, Section 5 of the Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#section-5-1)).
- **Funds held by administrators must be delegated to the "auto abstain" voting option and shall not be delegated to SPOs** ([Article IV, Section 5 of the Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md#section-5-1)).
- **Before approving treasury withdrawals, the DReps must approve a net change limit and budget through info actions**, `TREASURY-01a/02a/04a`.

### Info

- **Clearly state the question or information** being presented.
- **Explain the purpose of the Info action** and how the votes will be counted (if any ratification criteria is desired) and how the results will be used.

---

## Governance Action Submission Checklist

Before submitting your governance action, verify you have completed all the following:

- [ ] **Conceptualization:**
  - [ ] Identified a clear need for a governance action.
  - [ ] Researched existing solutions and potential impacts.
  - [ ] Drafted a preliminary proposal outline.
- [ ] **Community Engagement:**
  - [ ] Shared the proposal idea on community forums (e.g., Cardano Forum or GovTool).
  - [ ] Gathered feedback and incorporated suggestions.
  - [ ] Built consensus (where possible) around the proposal.
- [ ] **Metadata Preparation:**
  - [ ] Created a detailed metadata file following CIP-100 and CIP-108.
  - [ ] Included all required information (title, abstract, motivation, rationale, references).
  - [ ] Hosted the metadata file and references on an immutable storage solution (e.g., IPFS).
  - [ ] Obtained the immutable link of the hosted metadata file.
- [ ] **Technical Preparation:**
  - [ ] Secured the required 100,000 ada deposit.
  - [ ] Chosen a submission method (cardano-cli or GovTool).
  - [ ] Familiarized yourself with the chosen submission method's documentation.
  - [ ] Tested the submission process on a Cardano testnet (e.g., the preview network).
- [ ] **Submission:**
  - [ ] Submitted the governance action on Cardano mainnet.
- [ ] **Post-Submission:**
  - [ ] Monitored the progress of the governance action.
  - [ ] Responded to any questions or feedback from the community and governance bodies that vote on the governance action.
  - [ ] If applicable, monitored network performance after a parameter change.

---

## Consolidated Resources

### General Documentation

- [**Governance Action Overview**](./governance-actions.md)
- [**Cardano Constitution**](https://constitution.gov.tools/en)

### Governance Action Relevant Cardano Improvment Proposals

- [**CIP-100 (Governance Metadata Standard)**](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0100)
- [**CIP-108 (Governance Action Metadata Standard)**](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0108)

### Governance Action Metadata Examples

- [**Treasury Withdrawal Example (CIP-108)**](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0108/examples/treasury-withdrawal.jsonld)
- [**CIP-108 Test Vectors (Various Examples)**](https://github.com/cardano-foundation/CIPs/blob/4640b74025c4d7f233c47ebc8319e634d2de39de/CIP-0108/test-vector.md)
- [**Anchor metadata for Governance Actions submitted by Intersect**](https://github.com/IntersectMBO/governance-actions)
- [**Metadata of New Constitution governance action: "Cardano Constitution to Replace the Interim Constitution"**](https://ipfs.io/ipfs/bafkreiehcekhhsq34ccezwn46brg3euj6tbs4g4yjkav34ukqvbnzaya2a)

### Tools and Tutorials

- [**Governance Action cardano-cli Submission Guide**](/docs/get-started/infrastructure/cardano-cli/governance/create-governance-actions)
- [**Governance Action GovTool Submission Guide**](https://docs.gov.tools/cardano-govtool/using-govtool/governance-actions/propose-a-governance-action)
- [**Blockfrost IPFS Tutorial**](https://blockfrost.dev/start-building/ipfs/)

### Other Governance Resources

- [**Governance Apps on Cardano**](https://cardano.org/apps/?tags=governance)
- [**Cardano Forum Governance Category**](https://forum.cardano.org/c/governance/140)
- [**GovTool**](https://gov.tools/)

---

## Key Takeaways

- **Layered Process:** Follow a clear, sequential process from concept to submission.
- **Standardization:** Adhere to CIP standards for metadata to ensure consistency and integrity.
- **Community Focus:** Engage with the community early and incorporate feedback to refine your proposal.
- **Testing is Crucial:** Always validate your governance action on a testnet before submitting on Mainnet.
- **Transparency and Immutability:** Ensure that all documents and metadata are securely hosted and easily verifiable.
