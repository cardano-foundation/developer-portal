# Cardano Developer Portal

we wanted to build an open and inclusive, easy to use developer portal that offers guidance and allows community contribution. To achieve this we have chosen [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.  


## Requirements:  
[Node.js](https://nodejs.org/en/download/) version >= 12.13.0 or above  
[Yarn](https://yarnpkg.com/en/) version >= 1.5  
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

## Local development

```console
yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

## Build

```console
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.