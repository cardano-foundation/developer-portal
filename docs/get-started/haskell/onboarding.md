---
id: onboarding
title: Onboarding Guide for Haskell Learners
sidebar_label: Onboarding Guide
description: Onboarding Guide for Haskell Learners
--- 

## Getting Started with Haskell for Cardano Development

Haskell is a statically-typed, purely functional programming language known for its strong type system and reliability. It’s the foundation of Cardano’s smart contract platform **Plutus**, which is implemented as a Haskell library. Because of Haskell’s emphasis on correctness and deterministic behavior, Cardano’s core components (and Plutus smart contracts) are written in or based on Haskell [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/). In short, learning Haskell is the first step to writing secure, high-assurance Cardano applications.

### Onboarding Journey: From Haskell Novice to Smart Contract Developer

1. **Learn Haskell Basics:** Start with the core language concepts – syntax, types, functions, and basic I/O. Beginner resources like _Learn You a Haskell for Great Good_ [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/) or _Haskell Programming from First Principles_ (Allen & Moronuki) [github.com](https://github.com/sassela/haskell-learning) can teach you functional programming ideas in an engaging way. IOHK’s free interactive Haskell course (on GitHub) is also designed to take you “from zero to productive” with hands-on Jupyter notebooks [github.com](https://github.com/input-output-hk/haskell-course). Focus on small programs and exercises (Project Euler, code katas) to build intuition.
2. **Deepen Functional Skills:** Once you’re comfortable with basics (lists, pattern matching, recursion, typeclasses), explore advanced concepts: monads (IO, `Maybe`, etc.), applicatives, concurrent programming, and type-level features. Good intermediate resources include _Real World Haskell_, _Thinking with Types_, and _Parallel and Concurrent Programming in Haskell_ [github.com](https://github.com/sassela/haskell-learning). Practice by writing real Haskell code or solving challenges on sites like Exercism or HackerRank.
3. **Begin Cardano/Plutus Fundamentals:** Study Cardano’s extended UTXO (EUTXO) model and how smart contracts fit in. Dive into Plutus by following the official tutorials – e.g. the **Plutus Tutorial** on the Cardano Developer Portal – and read introductory blog posts. Crucially, join the **Plutus Pioneer Program** (IOHK’s training course) or review its materials. The Pioneer Program is an in-depth, cohort-based course taught by IOHK educators to train developers in Plutus (the native smart contract language) [github.com](https://github.com/input-output-hk/plutus-pioneer-program)[developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/). As the Cardano docs advise, _“If you don’t know Haskell yet, consider starting with Haskell”_ before tackling Plutus [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/).
4. **Build & Deploy Smart Contracts:** Apply your knowledge by writing simple on-chain validators and off-chain code. Use tools like the Plutus Playground or Plutus Application Backend (PAB) to test contracts on Cardano testnets. Study example projects (NFT minting, vesting contracts, decentralized apps) and follow hands-on guides. As you grow, learn about on-chain efficiency (script size/cost) and best practices. Throughout, participate in community channels (Cardano forums, Discord) for support.

## Learning Resources

### Books

* **Beginner:**
  * _Learn You a Haskell for Great Good_ (Miran Lipovača) – a free online tutorial with colorful illustrations [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/).
  * _Haskell Programming from First Principles_ (Allen & Moronuki) – a comprehensive beginner’s textbook [github.com](https://github.com/sassela/haskell-learning).
  * _Get Programming with Haskell_ (Will Kurt) – an interactive beginner’s guide (Manning LiveBook) [github.com](https://github.com/sassela/haskell-learning).
  * _CIS 194: Introduction to Haskell_ (UPenn course notes) – free lecture notes/slides for new learners [github.com](https://github.com/sassela/haskell-learning).
  * _A Type of Programming_ (Renzo Carbonara) – a free book emphasizing a functional mindset [github.com](https://github.com/sassela/haskell-learning).
* **Intermediate:**
  * _Real World Haskell_ (O’Sullivan, Stewart, Goerzen) – practical examples of Haskell programming [github.com](https://github.com/sassela/haskell-learning).
  * _Thinking with Types_ (Sandy Maguire) – deep dive into Haskell’s type system [github.com](https://github.com/sassela/haskell-learning).
  * _Typeclasses_ (Chris Martin & Julie Moronuki) – explores Haskell’s polymorphism [github.com](https://github.com/sassela/haskell-learning).
  * _Parallel and Concurrent Programming in Haskell_ (Simon Marlow) – concurrency models and libraries [github.com](https://github.com/sassela/haskell-learning).
  * _Category Theory for Programmers_ (Bartosz Milewski) – advanced functional abstractions (applies to Haskell) [github.com](https://github.com/sassela/haskell-learning).
* **Advanced:**
  * _Haskell in Depth_ (Vitaly Bragilevsky) – an advanced book covering GHC extensions and libraries [github.com](https://github.com/sassela/haskell-learning).
  * _Introductions to Advanced Topics in Haskell_ (Gabriel Gonzalez, ed.) – essays on type-level programming, lens, etc.
  * Functional programming research papers and blogs for highly technical detail.

### Online Tutorials & Guides

* **Haskell.org Tutorials:** The official site hosts _A Gentle Introduction to Haskell_ (Hudak et al.) and “Learn Haskell in 10 Minutes” guides [wiki.haskell.org](https://wiki.haskell.org/index.php?title=Tutorials). These tutorials assume some programming background and focus on core concepts.
* **Haskell Wiki:** The Haskell Wiki _Tutorials_ page lists many community-written guides (e.g. “What I Wish I Knew When Learning Haskell” by Stephen Diehl [wiki.haskell.org](https://wiki.haskell.org/index.php?title=Tutorials)) and links to university course materials. It’s a great index of blogs, code snippets, and advice.
* **University Courses:** Penn’s CIS 194 and similar Haskell courses often have free video lectures and notes (use search or Haskell Wiki).
* **Blog Posts:** Look for beginner-friendly blog posts (e.g. “How I Learned Haskell” stories) and community Q\&A. StackOverflow also has “Getting Started” threads for Haskell.

### Video Courses

* **Haskell & Crypto Mongolia 2020:** A popular free YouTube course by Andres Löh and Lars Brünjes, used as a starting point for Plutus Pioneers [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plinth/). It’s a 10-week deep dive into Haskell and blockchain concepts.
* **IOG Academy Haskell Course:** Input Output (IOHK) offers a self-paced Haskell course (available on GitHub and YouTube). It is designed for beginners to learn Haskell fundamentals via interactive notebooks [github.com](https://github.com/input-output-hk/haskell-course).
* **Plutus Pioneer Program Lectures:** All past Plutus Pioneer lectures are online (Lars Brünjes’s YouTube playlist). These weekly videos cover Haskell and Plutus for Cardano development [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plinth/).
* **Other YouTube Series:** Many Haskell enthusiasts and Cardano developers post tutorials (for example, “Plutus Playground” demos, Cardano 101 talks). Check Cardano community channels for curated playlists.

### Interactive Platforms

* **Haskell MOOC (University of Helsinki):** A free online course with exercises and auto-grading. It teaches functional programming using Haskell (no prior experience required) [haskell.mooc.fi](https://haskell.mooc.fi).
* **Try Haskell:** An in-browser interactive REPL/tutorial by Chris Done – great for quick experiments [tryhaskell.org](https://tryhaskell.org).
* **Exercism (Haskell Track):** Offers 100+ guided coding exercises with mentor feedback, ideal for practice.
* **Replit / CoCalc:** Online coding environments where you can run Haskell code without local setup.
* **FP Complete’s School of Haskell:** An online IDE with lessons on Haskell (some content is free, some paid).
* **Cardano Playgrounds:** For Cardano-specific practice, tools like the Plutus Playground and Marlowe Playground let you write and simulate contracts graphically (no code editor needed).

## Cardano-Specific Haskell: Plutus and Training

**Plutus (Haskell on Cardano):** Plutus is the native smart contract language for Cardano – essentially a Haskell library for on-chain scripts. The Cardano docs explain that _“Plutus allows all programming to be done from a single Haskell library”_, enabling secure, deterministic smart contracts [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plinth). In practice, you write Haskell code (often called Plinth) that compiles to Plutus Core, the Cardano on-chain VM language. Learning Plutus means learning how to express transaction validators, minting policies, and off-chain infrastructure in Haskell.

**Plutus Pioneer Program:** IOHK’s Plutus Pioneer Program is the flagship training course for Cardano smart contract development. It is an open, intensive curriculum (with weekly videos and exercises) that _“recruits and trains software developers in Plutus, the native smart contract language for the Cardano ecosystem”_ [github.com](https://github.com/input-output-hk/plutus-pioneer-program). Completed at your own pace or in cohort cohorts, the Pioneer Program teaches both Haskell and Plutus best practices. (Past lecture videos and course materials are freely available online.)

**IOG Academy Courses:** The Input Output Group (IOHK) also provides foundational courses. In addition to the Plutus Pioneer, the IOG Education Team created a **Haskell course** for beginners, as well as follow-up tutorials on Plinth and DApp building [developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plinth/) or [github.com](https://github.com/input-output-hk/haskell-course). The Haskell course (featuring Jupyter notebooks and video) is specifically designed for programmers new to Haskell. Once ready for Plutus, the Developer Portal and IOHK blog offer guides like “Writing a basic Plutus application” and example projects.

**Other Cardano Resources:** Don’t forget general Cardano dev docs and communities. For example, the Cardano Developer Portal has step-by-step guides (“Plutus resources”, smart contract tutorials) and the Marlowe playground for financial contracts. EMURGO and Community sites (e.g. Essential Cardano) also publish Haskell/Plutus tutorials and newsletters. Engaging with the Cardano Forum and Discord can point you to meetups, hackathons, and mentoring.

### Suggested Learning Path

| **Stage & Focus**                                                             | **Recommended Resources**                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Haskell Fundamentals** (Beginner) – Learn syntax, types, basic FP concepts. | Books: _Learn You a Haskell for Great Good_[developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/), _Haskell Programming from First Principles_[github.com](https://github.com/sassela/haskell-learning). Courses: IOHK’s Haskell Course[github.com](https://github.com/input-output-hk/haskell-course), Haskell MOOC[haskell.mooc.fi](https://haskell.mooc.fi). Practice: Try Haskell[tryhaskell.org](https://tryhaskell.org), simple exercises (Project Euler). |
| **Advanced Haskell & FP** – Master typeclasses, monads, concurrency.          | Books: _Real World Haskell_, _Thinking with Types_[github.com](https://github.com/sassela/haskell-learning). Interactive: Exercism (Haskell track). Tutorials: "What I Wish I Knew..."[wiki.haskell.org](https://wiki.haskell.org/index.php?title=Tutorials), and HaskellWiki guides.                                                                                                                                                                                                           |
| **Plutus & Cardano Basics** – Learn UTXO/EUTXO and smart contract patterns.   | Cardano Dev Portal: Plutus tutorials[developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/#get-started-with-the-plutus-pioneer-program). Video: _Haskell & Crypto Mongolia 2020_[developers.cardano.org](https://developers.cardano.org/docs/smart-contracts/plutus/). Course: Plutus Pioneer Program materials[github.com](https://github.com/input-output-hk/plutus-pioneer-program). Build: Plutus Playground examples.                                        |
| **Advanced Cardano Dev** – Build, test, and deploy real DApps.                | Engage with community tutorials, IOG Academy advanced content, and code review. Tools: Plutus Application Backend (PAB), Cardano CLI, on-chain performance tuning.                                                                                                                                                                                                                                                                                                                              |

This structured path – from Haskell basics up through Plutus smart contracts – will guide you step by step. Along the way, use the many books, courses, and interactive platforms listed above to reinforce your learning. With patience and practice, you’ll progress into building powerful, production-ready applications on the Cardano blockchain.
