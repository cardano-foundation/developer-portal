---
id: constitutional-committee-guide
slug: /governance/cardano-governance/constitutional-committee-guide
title: 'Constitutional Committee: A Guide for New Members'
sidebar_label: Constitutional Committee Guide
sidebar_position: 4
description: A comprehensive succession manual and onboarding guide for new and prospective members of the Cardano Constitutional Committee (CC), detailing their roles, responsibilities, and workflows.
---

This guide provides a comprehensive overview for new and prospective members of the Cardano Constitutional Committee (CC). Its purpose is to ensure smooth transitions, continuity, and a consistently high standard of constitutional assessment for on-chain governance actions.

---

## Understanding the Role

### Introduction to the Constitutional Committee

The [Constitutional Committee](overview.md#cc) is a core component of Cardano's governance framework. Its primary mandate is to ensure the integrity of the ecosystem by assessing whether on-chain governance actions are compliant with the [Cardano Constitution](https://github.com/IntersectMBO/cardano-constitution/blob/main/cardano-constitution-1/cardano-constitution-1.txt.md).

The CC does not judge the *merit* or *wisdom* of a proposal; it acts as a technical guardian, confirming that governance actions adhere to the established rules in parallel with the community-wide vote by ada holders.

### Core Responsibilities & Required Skills

The central function of a CC member is to review, vote on, and provide rationales for governance actions.

**Core Responsibilities:**

* **Monitor:** Actively track new [governance actions](governance-actions.md) submitted to the Cardano mainnet.  
* **Assess:** Methodically evaluate each action against the ratified Constitution.  
* **Vote:** Submit an on-chain vote (Yes, No, or Abstain) based on the assessment.  
* **Justify:** Publish a clear, public rationale explaining the reason for your decision.

**Required Skills:**  

A successful CC member or team should possess a blend of:

* **Constitutional Interpretation:** The ability to objectively apply the Constitution's text.  
* **Cardano Ecosystem Knowledge:** A deep understanding of Cardano's principles, architecture, and the Constitution itself.  
* **Analytical Rigor:** A detail-oriented and methodical approach.  
* **Clear Communication:** The ability to articulate complex assessments to a broad audience.  
* **Technical Proficiency:** The capability to use on-chain tools for registration and voting.  
* **Operational Security:** A strong understanding of security best practices, especially for securely storing and managing the cryptographic keys required for voting.

---

## Establishing Your Presence

### Structuring Your Committee (Individual, Consortium, etc.)

CC members can be individuals, groups, or formal organizations. On-chain, each CC member is represented by a credential. The structure you choose will define your operational model.

* **Individual:** A single person responsible for all aspects of the role. This model is direct, but it requires the individual to possess a broad skill set.  
* **Consortium:** A group of individuals or organizations that pool their expertise. This allows for diverse perspectives and is resilient, but requires clear internal coordination.  
* **Organization:** An established entity (e.g., a company or foundation) that dedicates resources to the CC role. This provides stability and professional support.

### Internal Governance Models & Best Practices

A transparent and documented internal decision-making process is crucial for legitimacy.

* **Example (Cardano Foundation):** The Foundation, in its capacity as an interim Constitutional Committee member, uses a formal, multi-stage process involving an internal working group for analysis, deliberation, and final sign-off. You can find details under "How we make governance decisions" on their [governance page](https://cardanofoundation.org/governance).  
* **Best Practice (Consortia):** A consortium should publish a charter outlining its decision-making mechanism (e.g., majority vote, multi-signature approval) and its members. These charters serve as public commitments to a transparent process.  
  * **Example 1: Eastern Cardano Council** \- Their [Governance Framework](https://github.com/Eastern-Cardano-Council/governance/blob/main/framework/ecc-goverance-framework-latest.pdf) outlines the council's structure, member responsibilities, and decision-making processes.  
  * **Example 2: Cardano Atlantic Council** \- Their [Charter](https://github.com/Cardano-Atlantic-Council/Charter) outlines their mission, scope of work, and governance model.

### Legal and Operational Considerations

While Cardano governance operates on-chain, CC members operate in the real world. Deciding on a legal structure for your participation is a critical step, especially for consortia or those treating the role as a professional commitment.

**Why Consider a Formal Legal Structure?**

* **Liability Protection:** Incorporating (e.g., as an LLC or other corporate form) can separate your personal assets from the actions of the CC entity, offering a layer of legal protection.  
* **Financial Management:** A formal entity can open a bank account, manage operational funds, receive grants, and pay contributors or employees. This is essential for any group planning to operate with a budget.  
* **Contractual Agreements:** For consortia, a legal entity provides a framework for creating binding agreements between members regarding responsibilities, compensation, and decision-making.  
* **Professionalism and Longevity:** A formal structure signals a long-term commitment and a professional approach to the role.

**Common Structures:**

The appropriate legal entity depends heavily on your jurisdiction and goals. Standard options include a Limited Liability Company (LLC), a non-profit organization, or a foundation.  

:::note

**Disclaimer:** This information is for educational purposes only and does not constitute legal or financial advice. The Cardano ecosystem does not mandate any specific legal structure. Please consult with qualified legal and tax professionals in your local jurisdiction to determine the best approach for your particular situation.

:::

---

## The Governance & Technical Workflow

### The Path to Membership: Election via Governance Action

Becoming a member of the Constitutional Committee is a formal on-chain governance process that requires election by the Cardano community. You cannot unilaterally become a member.

The process is as follows:

1. **Submit a Governance Action:** A proposal to modify the committee must be submitted to the blockchain. This is the ["Update committee/threshold"](governance-actions.md#detailed-technical-breakdown) governance action. Any ada holder can use this action to add or remove members, change their terms, or adjust the voting threshold required for the committee itself.  
2. **Community Ratification:** For the governance action to pass, it must be approved by both DReps and SPOs. The exact voting threshold required depends on the current state of the Constitutional Committee (normal vs. no-confidence). These thresholds are defined by updatable protocol parameters.

    | Category                   | Normal State | No-Confidence State |
    |----------------------------|--------------|---------------------|
    | DRep Approval Thresholds   | 67%          | 60%                 |
    | SPO Approval Thresholds    | 51%          | 51%                 |

1. **Activation:** Once ratified by both groups according to the required thresholds, the change to the committee is enacted on-chain. Only then are the new members officially part of the Constitutional Committee and able to vote.

This process ensures that the community, through its elected representatives, has the final say on who safeguards the Constitution.

* **Key Resource:** [Governance Actions Guide](governance-actions.md)

### Registering Your Approved Credential

The tools below are used to generate the credential hash that you include in the Update committee governance action. After a successful election, these tools are used to manage the keys associated with that credential to sign votes.

* **Credential Manager:** Intersect has developed a dedicated tool to streamline the creation and management of CC credentials using a secure smart contract.  
  * **Repository:** [IntersectMBO/credential-manager](https://github.com/IntersectMBO/credential-manager)  
  * **User Guide:** [Credential Manager Documentation](https://credential-manager.readthedocs.io/en/latest/)  
  * **Video Workshops:** [Credential Manager & CC Workshops Playlist from Mike Hornan](https://www.youtube.com/playlist?list=PLWYf5eQbRdbUPdt9UT-Vjhi6b840WSIWg)  
* **Alternative Method: Native CLI:** Users can generate keys and register credentials directly using the cardano-cli. This approach can also be used to create native multi-signature credentials.  
  * **Tutorial:** [CLI Guide for Constitutional Committee Actions](/docs/get-started/infrastructure/cardano-cli/governance/constitutional committee)

### Testing on SanchoNet

Before engaging in the mainnet governance process, it is advisable to test your entire technical workflow on a dedicated governance testnet, such as [SanchoNet](https://sancho.network/).

**Testing Checklist:**

1. Set up your chosen credential management tool to generate keys.  
2. Create your hot and cold keys.  
3. Practice creating voting rationales and vote transactions on SanchoNet.  
4. Use a block explorer to confirm your test transactions were successfully recorded.

* **Key Resources:** [SanchoNet Tutorials](https://github.com/Hornan7/SanchoNet-Tutorials), [SanchoNet Explorer](https://sancho.cardanoconnect.io/)

### How to Vote On-Chain

Once you are an active member of the CC, a vote is a transaction submitted to the blockchain that references a specific governance action. Your CC hot key must sign this transaction.

The cornerstone of transparent voting is publishing a clear rationale for your decision and linking it to your on-chain vote. The best practices for creating and publishing these rationales are detailed [below](#publishing-rationales--community-engagement).

**Examples of Voting Rationales:**

* [Cardano Foundation Governance Rationales](https://forum.cardano.org/search?q=%22CF-GA%22+%23governance:constitutional-committee)  
* [Eastern Cardano Council Governance](https://github.com/Eastern-Cardano-Council/icc-ga-rationales)  
* [Cardano Atlantic Council Rationales](https://github.com/Cardano-Atlantic-Council/rationale)

---

## Assessment & Communication

### The Assessment Workflow & Checklist

A structured governance action assessment process ensures consistency and thoroughness.

**Sample Workflow:**

1. **Intake & Tracking:** A new governance action is identified on-chain and visible on various [block explorers](https://explorer.cardano.org/governance-action/gov_action1vrkk4dpuss8l3z9g4uc2rmf8ks0f7j534zvz9v4k85dlc54wa3zsqq68rx0). To manage the assessment process effectively, especially for teams, it's recommended to use a workflow management tool. Kanban boards are particularly well-suited for this, allowing members to track the status of each action as it moves from "New," to "In Analysis," "In Discussion," and finally "Completed."  
   * **Recommended Free Tools:**  
     * [**GitHub Projects**](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects)**:** An excellent choice if you already host your rationales on GitHub. It integrates seamlessly with your repository.  
     * [**Trello**](https://trello.com/)**:** A simple, user-friendly, and popular option for visual Kanban boards.  
     * [**Jira**](https://www.atlassian.com/software/jira/features/kanban-boards)**:** Offers powerful features and a generous free tier, making it suitable for small teams.  
2. **Analysis:** The action is evaluated against the constitutional checklist.  
3. **Deliberation:** Your team or you discuss the findings.  
4. **Decision and Rationale Drafting:** A final decision is made, and the corresponding rationale is drafted following [CIP-0136](https://cips.cardano.org/cip/CIP-0136).  
5. **Execution:** The vote is submitted on-chain, with the rationale linked in the transaction metadata as described [below](#publishing-rationales--community-engagement).

**Constitutional Assessment Checklist:**

* [ ] **Direct Violation:** Does the governance action directly violate any provision of the Cardano Constitution?  
* [ ] **Integrity:** Does the action uphold the core principles and values of the Constitution?  
* [ ] **Clarity & Correctness:** Is the action's purpose clear, and is it technically well-formed?  
* [ ] **Negative Externalities:** Does the action pose an obvious, severe risk to the network that would violate the spirit of the Constitution?

### Publishing Rationales & Community Engagement

Transparency is the foundation of trust. The community standard for achieving this is to publish a detailed rationale for your vote and link it immutably from the voting transaction itself, as outlined in [CIP-0136](https://cips.cardano.org/cip/CIP-0136).

**Best Practice for Rationale Publication:**

1. **Draft Your Rationale:** Write a clear document detailing your assessment against the Constitution and the final reasoning for your vote. While a GitHub repository is an excellent place to collaborate on and display rationales, it is mutable.  
2. **Host Immutably:** For true permanence, host the final rationale file on an immutable storage solution, such as IPFS or Arweave. This ensures the rationale can never be changed or deleted. For detailed instructions, see the guide on [Immutable Metadata Hosting](submitting-governance-actions.md#immutable-metadata-hosting).  
3. **Link in Transaction:** Submit your rationale as metadata within the [same transaction](https://cardanoscan.io/vote/e219b18106bdbec17d747f8c00ab47725af1afdda9b76e55fb44abe1d3e13d7b) as your vote. This involves including the URL of your hosted rationale and its hash in the transaction metadata. This creates an unbreakable on-chain link between your vote and its justification.

**Community Engagement:**  

After voting, use platforms like [X (Twitter)](https://x.com) or the [Cardano Forum](https://forum.cardano.org/c/governance/constitutional-committee/213) to announce your decision and link to your published rationale (e.g., the GitHub version for easy readability). This helps inform the broader community and fosters discussion.

---

## Mentorship & Succession Planning

To ensure the long-term health and stability of the committee, a smooth transition between outgoing and incoming members is essential. A key part of this is active mentorship from the outgoing member.

**Recommendations for Outgoing Members:**

* **Establish a Mentorship Handoff:** Proactively connect with your successors to ensure a seamless transition. As an outgoing member, you hold invaluable operational knowledge. Plan to dedicate time to mentoring the new member during their first few weeks.  
  * **Conduct Onboarding Sessions:** Walk them through your technical setup, assessment workflow, and communication practices.  
  * **Perform Mock Assessments:** Review a past governance action together, explaining your rationale and thought process.  
  * **Schedule Check-ins:** Offer to be available for questions and hold regular check-ins during their first month.  
* **Provide Thorough Documentation:** Keep your internal processes, charters, and rationale templates well-documented and share them with your successor to ensure continuity. A well-documented history is crucial for continuity.  
* **Facilitate a Smooth Handover:** Conduct a handover session to walk the new member through any active assessments and the tools you use.  

---

## New Member Quick-Start Checklist

* [ ] **Define Your Structure:** Individual, consortium, or organization?  
* [ ] **Define Your Legal & Governance Structure:** Conduct research, if needed, consult legal counsel, and create a public charter if you are a group.  
* [ ] **Set Up Communication Channels:** Create a GitHub repository for your rationales.  
* [ ] **Complete SanchoNet Testing:**  
  * [ ] Generate your credentials and keys.  
  * [ ] Practice submitting test governance actions and votes.  
* [ ] **Formalize Your Assessment Workflow:** Adopt and customize your preferred assessment workflow,  
* [ ] **Coordinate with Outgoing Member:** Engage actively in the handover and mentorship process.  
* [ ] **Get Elected via Governance Action:** Successfully submit and have the community ratify an Update committee governance action on mainnet.
