---
id: metadata-registry
title: Cardano Metadata Registry
sidebar_label: Metadata Registry
---

## What is the Metadata Registry?

The metadata server needs some way to add and modify metadata entries. The method for doing so is largely up to the implementor, but in most cases, a registry will provide an interface that allows users to register metadata mappings that can subsequently be queried via the metadata server’s API.

The registry should provide some form of authentication to control who can modify entries. This can be implemented through cryptographic signatures, but having registered user accounts or other access control mechanisms are also possibilities.

## Who should register metadata?

Registration of metadata mappings is optional and is independent of any on-chain activities.
Users may choose to register metadata mappings with a server so that applications using the server can query and display additional human readable data relevant to the on-chain identifier.

## What is Cardano Token Registry

The [Cardano Token Registry](../native-tokens/submit-entry-to-cardano-token-registry) exposes the functionality of a key-value store and enables querying by users and applications of metadata associated with on-chain identifiers from a database through a RESTful API.
