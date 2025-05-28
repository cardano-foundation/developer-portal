--- 
sidebar_label: How to submit an entry to the registry
custom_edit_url: null
title: How to submit an entry to the registry
sidebar_position: 7
--- 
## Pre-Requisites

To submit a metadata entry for a native asset on Cardano, you must first follow the steps in [How to prepare an entry for the registry](How-to-prepare-an-entry-for-the-registry-NA-policy-script) and have a finalised metadata file ready for submission.

## Step 1: Fork and clone the registry repository

[Fork](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) your own copy of [cardano-foundation/cardano-token-registry](https://github.com/cardano-foundation/cardano-token-registry) to your account.

Then clone a local copy:
```console
$ git clone git@github.com:<your-github-username>/cardano-token-registry
$ cd cardano-token-registry
```
## Step 2: Add your metadata entry to the 'mappings' folder

```console
$ cp /path-to-my-file/baa83...d65.json mappings/
```

## Step 3: Create a commit for the submission

```console
$ git add mappings/baa83...d65.json
$ git commit -m "Your Token Name"
$ git push origin HEAD
```

## Step 4: Make a Pull Request

Create a [pull request from your fork](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request-from-a-fork).

If the pull request validations pass, your submission will be reviewed and merged to the main branch subject to the [Registry Terms of Use](https://github.com/cardano-foundation/cardano-token-registry/blob/master/Registry_Terms_of_Use.md).
It may take a few hours following a merge to the main branch before your entry is added to the database and available via the api query.
## Token Registry Information  
This page was generated automatically from: [https://github.com/cardano-foundation/cardano-token-registry/wiki](https://github.com/cardano-foundation/cardano-token-registry/wiki/How-to-submit-an-entry-to-the-registry).