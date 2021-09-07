---
id: portal-contribute
title: How to contribute to the developer portal
sidebar_label: How to contribute
description: How to contribute to the Cardano developer portal.
image: ./img/og-developer-portal.png
---

We wanted to build an open and inclusive, easy to use developer portal that offers guidance and allows community contribution. To achieve this we have chosen [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

## Installation

To contribute to the Cardano developer portal, you must first install it locally.

### Requirements

- [Node.js](https://nodejs.org/en/download/) version >= 12.13.0 or above (which can be checked by running `node -v`). You can use [nvm](https://github.com/nvm-sh/nvm) for managing multiple Node versions on a single machine installed.
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
