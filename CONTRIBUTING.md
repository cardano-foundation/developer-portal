# Contributing to the Developer Portal

👍🎉First of all, thank you for taking the time to contribute!🎉👍

The following is a set of guidelines for contributing to the Developer Portal, which are hosted in the [Cardano Foundation](https://www.github.com/cardano-foundation) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

@TODO link

## I don't want to read all of this, I just have question!

Please check out our [Discussions section](https://github.com/cardano-foundation/developer-portal/discussions). Maybe you find a thread that answers your questions. If not, feel free to [open a new thread](https://github.com/cardano-foundation/developer-portal/discussions/new) and explain what you are wondering about. 

Discussions are also the place to talk about your ideas on how to improve the portal and engage with the developers.

## Project structure

Make yourself familiar with the [Project Structure](https://developers.cardano.org/docs/portal-contribute/#project-structure). 

We try to keep everything as simple as possible, but not simpler. If you see something that could be improved, you are encouraged to raise an issue wherein you propose your changes and explain the rationale.

## Project Showcase

The project showcase should be a place where someone new to the ecosystem can come to see what can be done - it should not be seen as a database where every project is promoted.

### Adding your own project

Read the **requirements** and follow the **instructions** in the header of the [src/data/showcases.js](https://github.com/cardano-foundation/developer-portal/edit/staging/src/data/showcases.js) file

#### A word about project descriptions

Descriptions help users find a project they are interested in and decide whether to visit the links you provided. Use relevant keywords and describe what your project is all about or what it does. Don't include claims in your description like *the **best** wallet*, *the **first** ABC* or *the **only** XYZ*. We will ask you to change the description in your pull request before merging. @TODO rationale?

## Builder Tools 

This section features tools that help developers build on Cardano.

### Adding your own tool

Read the **requirements** and follow the **instructions** in the header of the [src/data/builder-tools.js](https://github.com/cardano-foundation/developer-portal/edit/staging/src/data/builder-tools.js) file.

## Pull Requests

To maintain the quality of content on the developer portal, we use pull requests to integrate changes from contributors. 

Please follow these steps to have your contribution considered by the maintainers:

1. Follow all instructions in [the template](PULL_REQUEST_TEMPLATE.md)
2. Follow the [styleguides](https://developers.cardano.org/docs/portal-style-guide/)
3. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track and resolve that problem.</details>

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.
