---
id: cheap-spam
title: Cheap Spam
sidebar_label: Cheap Spam
---

> From [MLabs Common Plutus Vulnerabilities](https://www.mlabs.city/blog/common-plutus-security-vulnerabilities)

**Identifier:** `cheap-spam`

**Property statement:**
All intended actions can be performed in a timely manner under the assumption that nobody is willing to spend more resources than the potential gain by denying service of the protocol.

**Test:**
A denial of service status is achieved by introducing many actions that interfere with the intended use of the protocol, making it impossible to consume the target UTxO in a timely manner.

**Impact:**

- Protocol stalling
- Protocol halting

**Further explanation:**
Stalling is problematic when the cost to stall is lower than the loss of opportunity cost it causes (i.e., by spending N Ada you cause the protocol to loose M Ada, where M > N). Usually this snowballs, especially in financially incentivised protocols because people lose trust and then it all amplifies.

For instance, if the solvency of a lending protocol depends on liquidations of debt to be performed in a timely manner, it is important to make sure that there are no actions such as creating many small and undercollateralised debt positions that would delay liquidation of a big debt position.

Note that the combination of this vulnerabilty with utxo-contention increases its severity, as it would be easier to deny service to a single UTxO.
