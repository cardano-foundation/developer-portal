[![Netlify Status](https://api.netlify.com/api/v1/badges/8d3fae14-1136-4a30-8224-f5602a5a2360/deploy-status)](https://app.netlify.com/sites/staging-dev-portal/deploys)

# Cardano Developer Portal

We wanted to build a developer portal as open and inclusive as Cardano. A portal that is in the hands of the Cardano community and can be constantly evolved by it.

For this to be successful, the portal relies on your contributions, and the fact that you are reading this text probably means that you have something to contribute, even if you are not a Developer.

Please find a detailed installation guide on [developers.cardano.org/docs/portal-contribute/](https://developers.cardano.org/docs/portal-contribute#installation). 


## Requirements:  

[Node.js](https://nodejs.org/en/download/) version >= 18.0
[Yarn](https://yarnpkg.com/en/) version >= 1.20
On macOS you also need Xcode and Command Line Tools.


## Clone the repo

```console
git clone https://github.com/cardano-foundation/developer-portal.git
```

## Navigate into the folder

```console
cd developer-portal
```

## Install all dependencies

```console
yarn install
```

## Production build 

Create at least once a production build (as this pulls missing files)

```console
yarn build
```

## Local development

```console
yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Project structure 

Please find the project structure and more detailed information on [developers.cardano.org/docs/portal-contribute/](https://developers.cardano.org/docs/portal-contribute/#project-structure).
