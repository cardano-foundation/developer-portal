# Security Policy

This repository contains the source of [developers.cardano.org](https://developers.cardano.org/): a static documentation site. It holds no user data and runs no backend, but its build pipeline, dependencies, and the deployed site's security headers are still security-relevant.

## Reporting a vulnerability

Please do not report security issues through public GitHub issues, discussions, or pull requests.

Report them privately by email to [info@cardanofoundation.org](mailto:info@cardanofoundation.org). Include a description of the issue, steps to reproduce, and the affected area (site, build pipeline, or a dependency). You will receive a response as soon as possible, and we ask that you give us reasonable time to address the issue before any public disclosure.

## Scope

In scope: the deployed site (XSS, header/CSP weaknesses), the build and CI pipeline, and vulnerable dependencies with a demonstrated impact on either.

Out of scope: vulnerabilities in the Cardano protocol or node software (report those to the maintainers of the affected [IntersectMBO](https://github.com/IntersectMBO) or [cardano-foundation](https://github.com/cardano-foundation) repository), and issues in third-party tools that the portal merely links to.
