---
slug: nft-minting-standard
title: "How we minted the NFTAs, and why we went for this standard"
author: Cardano Foundation
author_title: Developer Spotlight
author_url: https://github.com/cardano-foundation
author_image_url: https://avatars.githubusercontent.com/u/37078161?s=200&v=4
tags: [developer-portal, nft, nfta]
description: "How we minted the NFTAs, and why we went for this standard."
image: https://developers.cardano.org/img/og-developer-portal.png
---

![title image](/img/devblog/nfta.jpg)

**Dear Cardano community,**

To celebrate the [Cardano Developer Portal launch](../), The Cardano Foundation minted the world’s first Non-Fungible Tokens of Appreciation (NFTAs). NFTAs are NFTs showing appreciation to the ten developers that provided feedback and helped build the developer portal. Think of them as “certificates of participation” when you attend a seminar or an event that they give out to attendees. Only they are digital! 

<!-- truncate -->

In addition, to show our appreciation, we rewarded the community members with Bronze Tokens of Appreciation. Bronze Tokens are a way to give the NFTAs extra utility over their collectability. Tokens can be redeemed once to highlight a topic or project on the Cardano Developer Portal. For example, it can spotlight a project they are working on or inform the Cardano community of a specific topic. The spotlight articles can be found at the [Cardano Developer Portal Blog](../blog/). 


**The minting strategy**

The Cardano Foundation’s goal was to remain neutral when it came down to deciding the standard to mint the NFTAs. We are in the same ‘playground’ and learn with the community about what standards work to what end. The NFT Standard we chose was [CIP 721](https://github.com/cardano-foundation/CIPs/blob/8b1f2f0900d81d6233e9805442c2b42aa1779d2d/CIP-NFTMetadataStandard.md). We chose this because it was the most complete minting proposal at the time of the campaign launch. But we don’t necessarily endorse it as the standard. We encourage new proposals to be submitted using the Cardano Improvement Proposal framework, and we will continue to learn and build with you, the community.

The [CIP 721](https://github.com/cardano-foundation/CIPs/blob/8b1f2f0900d81d6233e9805442c2b42aa1779d2d/CIP-NFTMetadataStandard.md) Metadata Standard authors are [Alessandro Konrad](https://twitter.com/berry_ales), the creator of [Spacebudz](https://spacebudz.io), and [Smaug](https://twitter.com/SmaugPool), the creator of [Pool.pm](https://pool.pm/). They propose to create a framework to attach metadata to a token. Metadata is important because it describes and gives information about the token. Since tokens on Cardano are native, the link from the token to the metadata needed to be established differently from Ethereum, which creates the link using smart contracts. For Cardano to make the link unique, CIP 721 suggests that the metadata should be attached to the transaction where the token was created.  

To read more about CIP 721 and the NFT Metadata Standard, click [here](https://github.com/cardano-foundation/CIPs/blob/8b1f2f0900d81d6233e9805442c2b42aa1779d2d/CIP-NFTMetadataStandard.md). To view all Cardano Improvement Proposals (CIPs), click [here](https://github.com/cardano-foundation/CIPs).

**How we minted the NFTAs**

Tokens that are built on Cardano are native. Unlike Ethereum’s ERC-20 tokens, Cardano doesn’t require a smart contract. Instead, the tokens are treated like Cardano’s native token, ADA. Using native tokens, you can create a variety of digital assets like Non-Fungible-Tokens representing art or appreciation. Learn more about this [here](../docs/native-tokens/).

To make sure the NFTAs came from the Cardano Foundation, a **policyId** identifies them. You can check out more information about the NFTAs and the **policyId** at the [Cardano Foundation NFTA Official Page](https://cardanofoundation.org/nfta). In addition, they are attached with [metadata](https://pool.pm/2783ee3048c5158646674def386e8610ce2c8824e515451baa4769a6.CFNFTA01) that describes the details of the transaction and ownership address.

To mint the NFT’s, we first used a Cardano Foundation wallet to create a transaction to mint the tokens containing the metadata. Second, the ten developers sent us a receiving wallet address to receive the token. Third, another transaction to send the token to their wallet. Finally, to verify the work, each NFTA has a QR code that will navigate to the [Cardano Blockchain Explorer](https://explorer.cardano.org/en/address.html?address=addr1v8jad20nlga6ca7vjtqs2pr8cu0tcq3rq8s6svm546rvyjggl5yh7) for anyone to view and verify the transactions, including the Bronze Developer Portal Token issuance. Thus, no matter how much time goes by, the blockchain will have an immutable record to show that the community members received the first Non-Fungible Token of Appreciation.

![title image](/img/devblog/how-to-mint.png)

At the time of writing this article, two NFTs have not been minted. We are waiting on two developers to provide their wallet addresses. Also, the Cardano Explorer is not showing the transactions correctly when you try to scan the QR code on the NFTAs. If you are interested in learning more or mint native assets or NFTs, visit the [Cardano Developer Portal](../docs/native-tokens/). 
