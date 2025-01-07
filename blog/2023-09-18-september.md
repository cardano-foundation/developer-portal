---
slug: 2023-09-18-august
title: "Adastat.net"
authors: [denicio]
tags: [explorer]
description: "Meet AdaStat, a cutting-edge Cardano (ADA) Blockchain Explorer, crafted by active members of the Russian-speaking Cardano community. It's your independent alternative to standard network-developed explorers. With AdaStat, you can effortlessly explore blocks, transactions, pools, addresses, accounts, epochs, and slots, including active epochs, created blocks, staking rewards, and more.
Some of AdaStat's unique features include a versatile Chart Maker for custom graphics and a robust pool filter for refining pool searches based on parameters like pledge, delegators, and stake size. For deeper insights into this fascinating explorer, we highly recommend reading through interview with the project's co-founder and Lead Developer, Dmitry Stashenko."
image: https://developers.cardano.org/img/og/og-blog-adastat.png
---

import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';

 [<ThemedImage
style={{width: '300px'}}
alt="Adastat.net"
sources={{
    light: useBaseUrl('/img/devblog/adastat-light.svg'),
    dark: useBaseUrl('/img/devblog/adastat-dark.svg'),
  }}
/>](https://adastat.net/)

Meet AdaStat, a cutting-edge Cardano (ADA) Blockchain Explorer, crafted by active members of the Russian-speaking Cardano community. It's your independent alternative to standard network-developed explorers. With AdaStat, you can effortlessly explore blocks, transactions, pools, addresses, accounts, epochs, and slots, including active epochs, created blocks, staking rewards, and more.

Some of AdaStat's unique features include a versatile Chart Maker for custom graphics and a robust pool filter for refining pool searches based on parameters like pledge, delegators, and stake size. For deeper insights into this fascinating explorer, we highly recommend reading through interview with the project's co-founder and Lead Developer, Dmitry Stashenko. 


<!-- truncate -->
<br />

**_Could you kindly introduce yourselves?_**

Hi! First of all I would like to thank you for the invitation, it’s an honor for me! My name is **Dmitry Stashenko**, and I'm lead developer as well as cofounder of AdaStat.net - Cardano Blockchain Explorer.


<br />

**_Hello, Dmitry!_**

**_Happy to connect today and learn more about Adastat explorer. Can you tell us more about the project and the problem you were addressing?_**

Well, AdaStat was launched at the beginning of Shelley Incentivized Testnet, when the Cardano community was testing the transition from the Byron era to Shelley. There were a couple of well-known explorers at that time, but none of them supported the newest Cardano Shelley features like pools, rewards, etc. The new tools that were being developed by other community members at that time were mainly aimed at supporting pools and pool operators, and to a much lesser extent - at the support of ordinary ADA holders. I wanted to create a tool primarily for ordinary ADA holders. I wanted to give them the opportunity to conveniently choose pools, get information about rewards, and so on. So the idea to create an AdaStat.net website as well as Telegram bot https://t.me/AdaStatBot arose in my mind. 


<br />

**_What are the most important things about Adastat?_**

The most important things about Adastat are its robustness, security and usability. On the back-end AdaStat has a multi-server environment with an automatic load balancing and smart network requests caching. This allows AdaStat to respond to concurrent requests from many users quickly and without any delays. On the front-end AdaStat has multiple language and localization support, multi-currency support. It is flexible and can adapt to different screen sizes, including mobile phones. All these features are implemented without any user activity trackers.


<br />

**_Why did you choose to launch your project on Cardano?_**

It's a very interesting question. The irony is that this happened due to the postponement of the Shelley era to a later date. I first heard about Cardano in 2017, when I was studying various crypto projects with the investing purpose. I watched a few videos by Charlie Hoskinson, and found them fascinating. I felt an interest to learn more about Cardano. So I read the white paper, got acquainted with the roadmap, and studied the research papers. 

The project seemed quite reliable to me, and I decided to invest some of my savings in it. At that time of course there was no idea about AdaStat.net creating. I didn't think about anything like that at all. And if Shelley had been deployed in 2018, as originally planned, I'm pretty sure AdaStat.net would never have appeared. However, Shelley's deployment was delayed, and in fact this gave me enough time to study the technical part of the Cardano project thoroughly. Thus, by the time Shelley Testnet was launched in 2019, 

I was already the Cardano Ambassador, I was engaged in translating articles about the Cardano and I became a moderator in a few Telegram Cardano channels. In addition, I took an active part in testing the public testnet, and was a member of several closed groups for early testing in private testnets. All this predetermined the launch of AdaStat.net specifically on Cardano.


<br />

**_How does Adastat contribute to encouraging community engagement?_**

Our team always strives to be on the cutting edge, and implement the latest Cardano features as soon as they appear on the Cardano network, to give the opportunity for ADA holders to start using them as soon as possible. An example of this could be the recent SPOs voting, when it was necessary to implement voting support among stake pool operators quickly and in a fairly short time. 

Moreover, in fact it had to be done right during the voting process so that as soon as the operators finished their voting, ADA holders could see the results and have enough time to move their stake before the end of the voting process. Only 2 explorers have done this, and AdaStat was one of them. In this particular example, we can undoubtedly consider the work carried out as the contribution to the involvement of pool operators and delegators in the voting process. But here It would be worth remembering that AdaStat is not only a visual explorer. 

AdaStat also has an absolutely free public API that allows developers to get all the information they need. Moreover, our team has also developed a couple of open source postgresql plugins to support cryptography, which Cardano uses under the hood. This, in turn, is aimed at increasing the number of developers and their involvement. We should also not forget that an explorer is a point of failure, so the ability for users to check data in different sources is very important. Therefore, in a trustless system, which actually a blockchain is, it is very important to have as many different explorers as possible. Moreover, the increase in the number of products and opportunities in the Cardano ecosystem even by itself affects and increases community engagement.


<br />

**_Now, what are your accomplishments so far, and what are you most proud of?_**

Perhaps our most important accomplishment so far is the release of AdaStat version 2 in September 2022. Thanks to our early users and their feedback in 2022 AdaStat has been rewritten from scratch, and has got the view it has at this moment. It has become much more convenient. It has received support for all the latest Cardano features, and this has significantly affected the number of people using AdaStat. This number has grown more than 100 times compared to version 1, and we are very proud that we managed to create a product that is used by so many people.


<br />

**_What sets Adastat apart from other explorers in the Cardano ecosystem and makes it a compelling choice for users?_**

When developing AdaStat, we were primarily focused on usability. Sometimes it is difficult to show a large amount of data because the screen size is limited. This is especially true for mobile devices. 

According to the reviews of our users, AdaStat copes with this perfectly. The second thing that was fundamental for us during development was the inadmissibility of using users' personal data, and the complete absence of advertising. AdaStat has never had and will not have any third-party advertising, as well as any user trackers. Including even such harmless at first glance Google Analytics. AdaStat does not even use cookies at all. 

In addition, AdaStat has several unique features that are not available on other explorers. For example, our unique Chart Maker, with which everyone can make the chart they need. Our powerful pool filter can be another example. It allows users to filter the pools by all possible parameters - pledge, the number of delegators, the stake size, etc. All this makes AdaStat Cardano Explorer a good choice for users.


<br />

**_What can we expect in the future for Adastat? Are there new developments on the horizon that will impact both the explorer and user experience?_**

Oh, yes, we have a lot planned ahead. This applies both to updating existing features and adding new ones. Firstly, we plan to add support to AdaStat for both Preprod and Preview testnets. Secondly, we are going to make the AdaStat open source, so everyone can run their own copy of the Cardano explorer. Thirdly, as you know the Cardano network is currently preparing for the transition to the Voltaire era. 

Our team is also going to implement support for CIP-1694 on AdaStat. We are planning to implement support for Governance actions, DREPs, Votes and everything else that will appear in the Voltaire era. The plans are grandiose, and we hope that they all will be implemented without delay and smoothly.


<br />

**_Which partnerships have you engaged so far, and which ones are the most impactful?_**

AdaStat has been working closely with many projects in the Cardano ecosystem. Thus, AdaStat has been added as an explorer to many wallets, such as, for example, Yoroi, Eternl, Medusa. The famous cryptocurrency data aggregator Coingecko also has added AdaStat as one of the Cardano explorers on the Cardano page. And many other community projects and users use the AdStat API to display charts and other data.


<br />

**_Tell us about your team. Who are the people behind Adastat?_**

- **Ruslan Soluyanov**: (Product Manager, Cofounder of AdaStat)

- **Dmitry Stashenko**: (Lead Developer, Cofounder of AdaStat)

- **Tetiana Stashenko**: (Project Manager, UI/UX Designer)

- **Olha Domornikova**: (QA Engineer)