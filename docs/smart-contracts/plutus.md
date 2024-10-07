---
id: plutus
title: Plutus
sidebar_label: Plutus
description: Plutus
image: /img/og/og-developer-portal.png
---

## Get started with Plutus
Plutus is the smart contract platform of the Cardano blockchain. It allows you to write applications that interact with the Cardano blockchain.

Take a look at the [Plutus Tutorial](https://plutus.readthedocs.io/en/latest/tutorials/) if you want to learn Plutus from the beginning or see [Plutus resources](https://docs.cardano.org/developer-resources/smart-contracts/plutus/#plutus-developer-resources), where you can find references to all Plutus-related repositories, documentation, and training materials. If you don't know Haskell yet, consider [starting with Haskell](#get-started-with-haskell).

[Follow Chris Moreton's content updates](https://plutus-pioneer-program.readthedocs.io/en/latest/plutus_pioneer_program.html). With a high effort he transcribes the lectures of the Plutus Pioneer Program.

Talk to others about [Plutus on the Cardano Forum](https://forum.cardano.org/c/developers/cardano-plutus/148) or if you prefer Discord
head to the the [IOG Technical Discord](https://discord.com/invite/w6TwW9bGA6).

## The Plutus platform
In this Video Michael Peyton-Jones starts by walking us through working with Plutus. Plutus allows all programming to be done from a single Haskell library. This lets users build secure applications, forge new assets, and create smart contracts in a predictable, deterministic environment with the highest level of assurance. Furthermore, developers don’t have to run a full Cardano node to test their work.

Jann Müller then takes us through the Plutus Application Platform, where assets can be built and launched. He also demonstrates how tokens can be transferred using a smart contract. With Plutus you can:

- Forge new tokens in a lightweight environment
- Build smart contracts
- Support basic multi-sig scripts

<iframe width="100%" height="325" src="https://www.youtube.com/embed/usMPt8KpBeI" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture fullscreen"></iframe>

## Further Tutorials
- [Writing a basic Plutus app](https://plutus-apps.readthedocs.io/en/latest/plutus/tutorials/basic-apps.html)
- [Using Plutus Tx](https://plutus.readthedocs.io/en/latest/tutorials/plutus-tx.html)
- [Writing basic validator scripts](https://plutus.readthedocs.io/en/latest/tutorials/basic-validators.html)
- [Writing basic minting policies](https://plutus.readthedocs.io/en/latest/tutorials/basic-minting-policies.html)
- [Property-based testing of Plutus contracts](https://plutus-apps.readthedocs.io/en/latest/plutus/tutorials/contract-testing.html)

## How-to guides
- [How to export scripts, datums and redeemers](https://plutus.readthedocs.io/en/latest/howtos/exporting-a-script.html)
- [How to write a scalable Plutus app](https://plutus-apps.readthedocs.io/en/latest/plutus/howtos/writing-a-scalable-app.html)
- [How to handle blockchain events](https://plutus-apps.readthedocs.io/en/latest/plutus/howtos/handling-blockchain-events.html)
- [How to analyse the cost and size of Plutus scripts](https://plutus-apps.readthedocs.io/en/latest/plutus/howtos/analysing-scripts.html)

## Get started with Haskell
Haskell is the programming language for Plutus contracts. If you are looking for the best guide to Haskell and unsure where to start, we recommend you check out the book or website [Learn You a Haskell for Great Good](http://learnyouahaskell.com/introduction) by Miran Lipovača.

Learning Haskell is made easy with this illustrated guide, one of the most engaging ways to learn this fascinating programming language.

Another great learning resource is the online course [Haskell and Crypto Mongolia 2020](https://www.youtube.com/watch?v=ctfZ6DwFiPg&list=PLJ3w5xyG4JWmBVIigNBytJhvSSfZZzfTm&index=4) lectured by [Andres Löh](https://kosmikus.org/), co-founder of the Well-Typed consultancy and [Dr. Lars Brünjes](https://iohk.io/en/team/lars-brunjes), Education Director at IOHK. The course is the suggested *starting point* for Plutus Pioneers at the beginning of the [Plutus Pioneer Program](#get-started-with-the-plutus-pioneer-program). It's a 10-week, 40 hours/week deep dive into Haskell and Cryptocurrencies.

If you are coming from a Python background, there is an informative project [py2hs](https://github.com/cffls/py2hs) that explains essential Haskell concepts using Python.

## Get started with the Plutus pioneer program

The [Plutus Pioneer Program](https://github.com/input-output-hk/plutus-pioneer-program) was created in order to recruit and train developers in Plutus for the Cardano ecosystem. You can complete this program at your own pace or sign up for an active iteration of the program. By entering the program, you will become part of a group that communicates on Discord and holds live weekly QA sessions. The course teaches you the core principles of how to code in both Haskell and Plutus. It is highly interactive, with weekly videos, exercises, and Q&A sessions and exclusive access to the creators and key experts in the language.

Beside the videos you can also read the book based on the Plutus Pioneer Program. The book is written once an iteration of the Pioneer Program comes to an end. It exists from the 3rd iteration on and can be found in the *book/* folder of the Pioneer program github repository.

**This course is not for coding beginners.** You do not need to be an expert in formal methods, but programming experience and a general aptitude for logical and mathematical thinking are highly advisable. We recommend to [get started with Haskell](#get-started-with-haskell) before taking the course. The IOG education team that created the Pioneer program also offers a [Haskell course](https://github.com/input-output-hk/haskell-course) that you can at you own pace.

Prior knowledge of Haskell or functional programming is also recommended, as Plutus is heavily based on Haskell and includes advanced features like Template Haskell, type-level programming, and effect systems.
- [Apply for the Plutus Pioneer Program](https://input-output.typeform.com/to/au0XDcBP)

## Plutus Project-Based Learning (PPBL)

[Plutus Project-Based Learning](https://plutuspbl.io/) is a free course from [Gimbalabs](https://www.gimbalabs.com/) that provides a hands-on approach to learning Cardano development. The goal of PPBL is to onboard contributors to real projects.

PPBL is built to complement the [Plutus Pioneer Program](#get-started-with-the-plutus-pioneer-program). Students can complete both courses in any order they choose. Students can prepare for the Plutus Pioneer Program by working through the PPBL course, or they can apply what they have learned in PPP by joining the PPBL course.

PPBL takes a big-picture view of Cardano development so that students can learn to contextualize the role of smart contracts in full-stack Cardano applications. Course embedded projects give students the chance to investigate new design patterns, and to learn about questions at the frontiers of Cardano development.

At weekly [Live Coding sessions](https://plutuspbl.io/calendar), students gather to share questions and to build projects together.

The PPBL 2024 Course is currently going live in English, French, Indonesian, Japanese, Spanish, and Vietnamese.

- [Get started with the free PPBL 2024 course](https://www.andamio.io/course/ppbl2024)

## Demeter

Demeter is a web-based development platform providing a full suite of tools for building Cardano dApps end-to-end. It features starter-kits for a range of different project types including Plutus: [Plutus Starter Kit](https://github.com/txpipe/plutus-starter-kit).

[Demeter.run](https://demeter.run) provides a free tier of their service where you can get started experimenting with Plutus.
