---
id: rest-apis
title: REST APIs
sidebar_label: REST APIs
description: An architectural style for designing networked applications - the foundation for how the workshops talk to Koios, Blockfrost, Maestro, and other Cardano data providers.
---

**REST** (Representational State Transfer) is an architectural style for networked applications, especially web services. It defines a set of constraints and principles for building scalable, stateless, and interoperable APIs that use standard HTTP methods to interact with resources identified by URIs.

Every Cardano data provider used in this section - [Koios](https://api.koios.rest/), [Blockfrost](https://blockfrost.io/), [Maestro](https://www.gomaestro.org/) - is a REST API. Understanding the basics makes the workshops easier to follow.

## Brief history

REST was introduced by Roy Thomas Fielding in his 2000 doctoral dissertation at UC Irvine, where he co-authored the HTTP specification. Fielding distilled the architectural principles that made the World Wide Web successful into a formal style. REST emerged as a way to standardise web service design, in contrast to more complex approaches like SOAP. It became the dominant style for web APIs through the 2000s and 2010s, powering everything from social media to cloud computing.

## Key principles

- **Stateless** - each request contains everything the server needs; no server-side session state.
- **Client-server architecture** - clean separation between client and server concerns.
- **Cacheable** - responses can be cached to improve performance.
- **Uniform interface** - consistent use of HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and resource URIs.
- **Layered system** - the architecture can be composed of hierarchical layers (proxies, gateways, etc.).
- **Code on demand (optional)** - servers can extend client functionality by sending executable code.
- **Resource-based** - every "thing" is a resource with a unique URI.

## How it shows up in this section

- `GET https://preprod.koios.rest/api/v1/tip` - chain tip endpoint, used in [Workshop 01: API Setup](/docs/developers/curriculum/dapps/iot/the-basics/03-api-setup).
- `POST /account_info` - wallet balance lookup, used in [Workshop 02: Fetch Wallet Balance](/docs/developers/curriculum/dapps/iot/read-and-output/01-fetch-wallet-balance).
- `POST /address_utxos` - UTxO listing, used in [Workshop 05: Building the Backend](/docs/developers/curriculum/dapps/iot/qr-code-payments/05-building-the-backend).

All return JSON. The microcontroller parses the JSON with [ArduinoJson](https://arduinojson.org/) and reacts.

## Resources

- [RESTful API Tutorial](https://restfulapi.net/)
- [REST API Design Guide](https://restfulapi.net/rest-api-design-tutorial-with-example/)
- [HTTP Status Codes reference](https://restfulapi.net/http-status-codes/)
- [OpenAPI Specification](https://swagger.io/specification/) - the de-facto standard for documenting REST APIs.

---

*Adapted from the [CardanoThings](https://cardanothings.io/introductions/rest-apis) project, originally produced under [Project Catalyst Fund 11](https://projectcatalyst.io/funds/11). Source: [github.com/CardanoThings](https://github.com/CardanoThings).*
