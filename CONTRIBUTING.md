# Contributing to the Developer Portal

👍🎉First of all, thank you for taking the time to contribute!🎉👍

The following is a set of guidelines for contributing to the Developer Portal, which are hosted in the [Cardano Foundation](https://www.github.com/cardano-foundation) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

@TODO link

## I don't want to read all of this, I just have question!

Please check out our Discussions section. Maybe you find a thread that answers your questions. If not, feel free to open a new thread and explain what you are wondering about. 

Discussions are also the place to talk about your ideas on how to improve the portal and engage with the developers.

## Project structure

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
├── src
│   ├── css
│   │   └── custom.css
│   └── data
│       └── builder-tools
│           └── *.png
│       └── showcase
│           └── *.png
│       ├── builder-tools.js
│       └── showcases.js
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
- `/src/` - Non-documentation files like pages or custom React components. You don't have to strictly put your non-documentation files in here but putting them under a centralized directory makes it easier to specify in case you need to do some sort of linting/processing.
    - `/src/data/builder-tools` - Screenshots for the builder tools section.
    - `/src/data/builder-tools.js` - Definition file for the builder tools section.
    - `/src/data/showcase` - Screenshots for the showcase section.
    - `/src/data/showcase.js` - Definition file for the showcase section.
    - `/src/pages` - Any files within this directory will be converted into a website page. 
- `/static/` - Static directory. Any contents inside here will be copied into the root of the final `build` directory.
- `/docusaurus.config.js` - A config file containing the site configuration. 
- `/package.json` - A Docusaurus website is a React app. You can install and use any npm packages you like in them.
- `/sidebar.js` - Used by the documentation to specify the order of documents in the sidebar.

## Showcase

The project showcase should be a place where someone new to the ecosystem can come to see what can be done - it should not be seen as a database where every project is promoted.

### Requirements for adding your project

* It must be built on Cardano and have a real use case. For example, a forum where people can talk about Cardano is great, but nothing for this showcase section.
* It has to run on Cardano mainnet.
* It has to have a running product. (no presale, no protected pages, no coming soon messages)
* It has to have enough community reputation. @TODO how to measure this?
* It has to provide a unique value from existing showcase items. (we can't list thousands of NFT or native tokens with the current UI)
* It has to have a stable domain name. (a random Netlify/Vercel domain is not allowed, no URL shortener, no app store links, or similar)
* The GitHub account that adds the project must not be new. 
* The GitHub account must have a history/or already be known in the Cardano community.

### Instructions to add your project

1. Add your project in the JSON array in the [src/data/showcases.js](https://github.com/cardano-foundation/developer-portal/edit/staging/src/data/showcases.js)
2. Add a description for your project that **describes what your project does**. Read more about descriptions [below](#a-word-about-project-descriptions]
3. Add a local image preview. (decent screenshot or logo of your project)
4. The image must be added to the GitHub repository and use `require("image")`. 
5. [Create a pull request](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) for the `staging` branch.

#### A word about project descriptions

Descriptions help users find a project they are interested in and decide whether to visit the links you provided. Use relevant keywords and describe what your project is all about or that it does. Don't include claims in your description like *the **best** wallet*, *the **first** ABC* or *the **only** XYZ*. We will ask you to change the description in your pull request before merging. @TODO rationale?
