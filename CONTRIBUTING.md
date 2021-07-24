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

Submit a pull request.

### A word about project descriptions

Here is your time to shine. Write what your project is about and what it does.

Don't include claims like *the **best** wallet* or *the **first** ABC on XYZ*.
