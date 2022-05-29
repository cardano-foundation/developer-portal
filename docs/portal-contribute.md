---
id: portal-contribute
title: How to contribute to the developer portal
sidebar_label: How to contribute
description: How to contribute to the Cardano developer portal.
image: ../img/og-developer-portal.png
---

We wanted to build a developer portal as open and inclusive as Cardano. A portal that is in the hands of the Cardano community and can be constantly evolved by it.

For this to be successful, the portal relies on your contributions, and the fact that you are reading this text probably means that you have something to contribute, **even if you are not a Developer**.

If you want to install the portal on your local machine, you can [jump directly to the installation instructions.](#installation)


## I got the spirit. What can I do to contribute?

### Spread the word
Often underestimated: spread the word. For example: if someone asks you for Cardano wallets, link to the [wallet showcase](https://developers.cardano.org/showcase?tags=wallet) if they want to know about Cardano block explorers, link to the [block explorer showcase](https://developers.cardano.org/showcase?tags=explorer).

### Create issues
Creating an issue is the first step to improving the portal. You don't even have to do the improvement yourself. You can think of it as creating a topic in a forum. 

An "issue" can be anything from a simple suggestion to a fully elaborated plan with many sub-items and tasks to check off. You can also open an issue to discuss things. Like a public task manager, people can assign tasks to themselves. [Create an issue now](https://github.com/cardano-foundation/developer-portal/issues)

If creating an issue in GitHub is too much for you please consider opening a topic [on the Cardano Forum](https://forum.cardano.org/c/developers/general-developer-talk/152) with a title like "Developer Portal Suggestion: your suggestion".

### Improve texts
Fix typos and improve texts, especially if you are a native speaker and have strong writing skills.

### Create graphics
If you are a talented graphic designer, you can improve various charts and diagrams. We should always use graphics that work well in both light mode and dark mode for the portal. You can also make one graphic for each.

### Participate in the discussions
If you think something is wrong or something fundamental should change, discussions are the appropriate start to find consensus. There are always [ongoing discussions](https://github.com/cardano-foundation/developer-portal/discussions/243) on how to handle or improve something. Please take part in them. Even if you are not a developer, your views are valuable:
* [Developer Portal Discord](https://discord.gg/Exe6XmqKDx) 
* [Issues in the GitHub Repo](https://github.com/cardano-foundation/developer-portal/issues) 
* [Discussions in the GitHub Repo](https://github.com/cardano-foundation/developer-portal/discussions)

### Add projects to showcase or builder tools
Help to add good projects or builder tools. Please note the different guidelines for [adding showcases](https://github.com/cardano-foundation/developer-portal/edit/staging/src/data/showcases.js) or [builder tools](https://github.com/cardano-foundation/developer-portal/edit/staging/src/data/builder-tools.js).

Mainly the project showcase should be a place where someone new to the ecosystem can come to see what can be done. For example we agreed that projects have to have a running product today on Cardano mainnet, no promises, no pre-sales, no coming soon pages. We also don't [aim to map out a future ecosystem.](https://developers.cardano.org/showcase?tags=ecosystem)

Adding projects or builder tools will require [creating a pull request.](#create-pull-requests)

### Create/improve documentation
Documentation can constantly be improved, and there are gaps in the developer portal. In particular, the stake pool operator section needs a lot of work. [To create and improve documentation, you should install the portal on your local machine.](#installation)

### Create/improve tutorials
Apart from documentation, tutorials are an excellent way to explain things. If you already have a website with tutorials, consider moving them to the Developer Portal. [To create and improve documentation, you should install the portal on your local machine.](#installation)

### Create pull requests
A pull request is a proposal to change something on the developer portal. It can be a small change like fixing a typo or a complete category with hundreds of new files. [Pull requests must be reviewed.](#how-are-pull-requests-reviewed)

### Review pull requests
If you have an excellent technical understanding and mistakes catch your eye, you can review pull requests. You should have made contributions before [please read here for more details](#how-to-become-a-reviewer).


## Frequently Asked Questions

### How are pull requests reviewed?
Pull requests must be approved by three reviewers to be merged. They are always merged into the staging branch. [https://staging-dev-portal.netlify.app](https://staging-dev-portal.netlify.app) reflects the state of the current staging branch. 

Later, the changes are pushed from staging to the main branch. This requires another pull request. (For this reason, there is always a small delay between staging and production).

### How to become a reviewer?
You should have an excellent technical understanding, great ethics and have already contributed to the developer portal. Your GitHub account should have some reputation. [If you are unsure, just participate in the discussions.](#participate-in-the-discussions)

### How to get added to the contributor list?
We don't currently have a specific metric that determines who gets included on the [contributor list](/docs/portal-contributors/). You should at least have made a strong mark on a category or have contributed consistently over a long period. [Participate in the discussions to determine this.](#participate-in-the-discussions)

### How to connect with the developer community?
Cardano developers and stake pool operators spread across many different platforms. [We aim to provide a complete overview.](/docs/get-started/cardano-developer-community) 

If you are interested in connecting with people from the Developer Portal, either visit [the Discord](https://discord.gg/Exe6XmqKDx) or [open a thread in the forum](https://forum.cardano.org/c/developers/29). 


## Installation

To contribute to the Cardano developer portal, you must first install it locally. We have chosen [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator, as the underlying software.

### Requirements

- [Node.js](https://nodejs.org/en/download/) version >= 14.0 (which can be checked by running `node -v`). You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions on a single machine installed.
- [Yarn](https://yarnpkg.com/en/) version >= 1.5 (which can be checked by running `yarn --version`). Yarn is a performant package manager for JavaScript and replaces the `npm` client. It is not strictly necessary but highly encouraged.
- On macOS you also need Xcode and Command Line Tools.

### Local development

To get a local development environment, clone the repository, navigate into the `developer-portal` folder, install dependencies, and start the development server. Most changes are reflected live without having to restart the server. By default, a browser window will open at `http://localhost:3000`.

```sh
git clone https://github.com/cardano-foundation/developer-portal.git
cd developer-portal
yarn install
yarn start
```

:::info Limitations of the development build
The development mode will have minor features not working. For example, only blurry images in the responsive images on showcase and tools, search limitations, and some data has fake values because of performance reasons.

**Create at least once a production build** (see below) as this pulls missing files.
:::

### Production build 

```sh
yarn build
```

Use this command instead of `yarn start` to generate static content into the build directory that can be served using any static content hosting service.

## Project structure

The portal is structured as follows. (See the [Project structure rundown](#project-structure-rundown) below for details)

```sh
developer-portal
├── blog
│   ├── 2021-01-07-january.md
│   ├── 2021-02-03-february.md
│   └── *.md
├── docs
│   ├── fund-your-project
│   ├── get-started
│   ├── integrate-cardano
│   ├── native-tokens
│   ├── operate-a-stake-pool
│   ├── stake-pool-course
│   ├── transaction-metadata
│   └── *.md
├── examples
│   ├── cli
│   |   ├── dotnet
│   │   │   └── *.cs
│   |   ├── js
│   │   │   └── *.js
|   |   └── python
│   │       └── *.py
|   └── wallets
│       ├── dotnet
│       ├── js
|       └── python
├── src
│   ├── css
│   │   └── custom.css
│   ├── data
│   │   ├── builder-tools
│   │   │   └── *.png
│   │   ├── showcase
│   │   │   └── *.png
│   │   ├── builder-tools.js
│   │   └── showcases.js
│   └── pages
│       ├── styles.module.css
│       └── index.js
├── static
│   └── img
├── docusaurus.config.js
├── package.json
├── README.md
├── sidebars.js
└── yarn.lock
```

### Project structure rundown

- `/blog/` - Contains the blog Markdown files for the developer spotlight.
- `/docs/` - Contains the Markdown files for the docs. Customize the order of the docs sidebar in `sidebars.js`.
- `/examples/` - Contains example projects for the Markdown files in the docs. *The structure is not final and will likely change in the future*
- `/src/` - Non-documentation files like pages or custom React components. You don't have to strictly put your non-documentation files in here, but putting them under a centralized directory makes it easier to specify in case you need to do some sort of linting/processing.
  - `/src/data/builder-tools` - Screenshots for the builder tools section.
  - `/src/data/builder-tools.js` - Definition file for the builder tools section.
  - `/src/data/showcase` - Screenshots for the showcase section.
  - `/src/data/showcase.js` - Definition file for the showcase section.
  - `/src/pages` - Any files within this directory will be converted into a website page.
- `/static/` - Static directory. Any contents inside here will be copied into the root of the final `build` directory.
- `/docusaurus.config.js` - A config file containing the site configuration.
- `/package.json` - A Docusaurus website is a React app. You can install and use any npm packages you like in them.
- `/sidebar.js` - Used by the documentation to specify the order of documents in the sidebar.
