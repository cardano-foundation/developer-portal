---
id: gov-queries
sidebar_label: Governance queries 
title: Governance related queries.
sidebar_position: 6
description: Query the node to obtain information about the governance state
keywords: [Governance, queries, CIP1694]
---

There are various queries you can do to yoour local node to find relevant information about different aspects of teh governance state. 

### Query the gov-state

We are showing only the top level keys of the governance state, the dump is to large to show on this tutorial. 
```
cardano-cli conway query gov-state

{
    "committee": {},
    "constitution": {},
    "currentPParams": {},
    "futurePParams": {},
    "nextRatifyState": {
        "enactedGovActions": [],
        "expiredGovActions": [],
        "nextEnactState": {},
        "ratificationDelayed": false
    },
    "previousPParams": {},
    "proposals": []
}
```
### Query the constitution:

```shell
cardano-cli conway query constitution
{
    "anchor": {
        "dataHash": "ca41a91f399259bcefe57f9858e91f6d00e1a38d6d9c63d4052914ea7bd70cb2",
        "url": "ipfs://bafkreifnwj6zpu3ixa4siz2lndqybyc5wnnt3jkwyutci4e2tmbnj3xrdm"
    },
    "script": "fa24fb305126805cf2164c161d852a0e7330cf988f1fe558cf7d4a64"
}
```
### Query the DRep state for all DReps:

```shell
cardano-cli conway query drep-state --all-dreps
[
    [
        {
            "scriptHash": "186e32faa80a26810392fda6d559c7ed4721a65ce1c9d4ef3e1c87b4"
        },
        {
            "anchor": null,
            "deposit": 500000000,
            "expiry": 666
        }
    ],
    [
        {
            "keyHash": "68a5f1348300ada6dcec67f9421bdac62ba621006408ece8c8e551d6"
        },
        {
            "anchor": null,
            "deposit": 500000000,
            "expiry": 667
        }
    ],
    [
        {
            "keyHash": "739701e411d342e6a385dcbec1f78edc31434ad1ad166d20954912d7"
        },
        {
            "anchor": null,
            "deposit": 500000000,
            "expiry": 666
        }
    ],
    [
        {
            "keyHash": "8f4fefcf28017a57b41517a67d56ef4c0dc04181a11d35178dd53f4c"
        },
        {
            "anchor": null,
            "deposit": 500000000,
            "expiry": 667
        }
    ]
]
```

### Query the DRep state for an individual DRep:

```shell
cardano-cli conway query drep-state --drep-key-hash 8f4fefcf28017a57b41517a67d56ef4c0dc04181a11d35178dd53f4c
[
    [
        {
            "keyHash": "8f4fefcf28017a57b41517a67d56ef4c0dc04181a11d35178dd53f4c"
        },
        {
            "anchor": null,
            "deposit": 500000000,
            "expiry": 667
        }
    ]
]
```
### Query the DRep stake distribution (voting power):

```shell
cardano-cli conway query drep-stake-distribution --all-dreps
[
    [
        "drep-keyHash-13797df5308dfebf2348fa58b312a177cf97939f5f7d21168e1a54db",
        500000000000
    ],
    [
        "drep-keyHash-9853551d8b99884f51608822e012bbf0d444eb7bea2807ee664f1241",
        495790521257
    ],
    [
        "drep-keyHash-cf09b59e134fa14e48da39b552c02299a054d7c8b895b3d827453672",
        500000000000
    ]
]
```

### Query the committee state:

```shell
cardano-cli conway query committee-state
{
    "committee": {
        "scriptHash-27999ed757d6dac217471ae61d69b1b067b8b240d9e3ff36eb66b5d0": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "contents": {
                    "scriptHash": "49fa008218cd619afe6aa8a1a93303f242440722b314f36bda2c2e23"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        },
        "scriptHash-6095e643ea6f1cccb6e463ec34349026b3a48621aac5d512655ab1bf": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "contents": {
                    "scriptHash": "65d497b875c56ab213586a4006d4f6658970573ea8e2398893857472"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        },
        "scriptHash-7ceede7d6a89e006408e6b7c6acb3dd094b3f6817e43b4a36d01535b": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "contents": {
                    "scriptHash": "f8f56120e1ec00feb088ece39ef14f07339afeb37b4e949ff12b89ff"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        },
        "scriptHash-87f867a31c0f81360d4d7dcddb6b025ba8383db9bf77a2af7797799d": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "tag": "MemberNotAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        },
        "scriptHash-a19a7ba1caede8f3ab3e5e2a928b3798d7d011af18fbd577f7aeb0ec": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "tag": "MemberNotAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        }
    },
    "epoch": 413,
    "threshold": 0.67
}
```

### Query the state of an individual committee key hash:

```shell
cardano-cli conway query committee-state --cold-script-hash 7ceede7d6a89e006408e6b7c6acb3dd094b3f6817e43b4a36d01535b
{
    "committee": {
        "scriptHash-7ceede7d6a89e006408e6b7c6acb3dd094b3f6817e43b4a36d01535b": {
            "expiration": 500,
            "hotCredsAuthStatus": {
                "contents": {
                    "scriptHash": "f8f56120e1ec00feb088ece39ef14f07339afeb37b4e949ff12b89ff"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": {
                "tag": "NoChangeExpected"
            },
            "status": "Active"
        }
    },
    "epoch": 413,
    "threshold": 0.67
}
```
### Query expired committee members

```shell
cardano-cli conway query committee-state --expired
{
    "committee": {
        "keyHash-059349cd1e77dc3e500d3ffc498adb7307001ecc022c8b083faaa48b": {
            "expiration": 161,
            "hotCredsAuthStatus": {
                "contents": {
                    "keyHash": "23e05ad2b71317a6348ce4b68dae37aa1c0e545cdea740b23c21742e"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": "NoChangeExpected",
            "status": "Expired"
        }
    },
    "epoch": 169,
    "quorum": 0.6
}
```
### Query active committee members

```shell
cardano-cli conway query committee-state --active 
{
    "committee": {
        "keyHash-059349cd1e77dc3e500d3ffc498adb7307001ecc022c8b083faaa48b": {
            "expiration": 161,
            "hotCredsAuthStatus": {
                "contents": {
                    "keyHash": "23e05ad2b71317a6348ce4b68dae37aa1c0e545cdea740b23c21742e"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": "NoChangeExpected",
            "status": "Active"
        },
        "keyHash-337e0a7fd01c7a7c27e8bac17e40db182bc2a774467795af1e3fe8a9": {
            "expiration": 201,
            "hotCredsAuthStatus": {
                "contents": {
                    "keyHash": "540bedcd4bdcbf523e899c3ef43f2b96ecec4f6303af58d15a413ed1"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": "NoChangeExpected",
            "status": "Active"
        },
        "keyHash-9c2aabae5d9187a76ed6b04b40e91ecb4ce3171611c3fd4ec6c6a607": {
            "expiration": 181,
            "hotCredsAuthStatus": {
                "contents": {
                    "keyHash": "6c1d098a366f2274651943a7f778b3b5459c129f0407a0db2902253a"
                },
                "tag": "MemberAuthorized"
            },
            "nextEpochChange": "NoChangeExpected",
            "status": "Active"
        }
    },
    "epoch": 105,
    "quorum": 0.6
}
```
### Query unrecognized committee keys

```shell
cardano-cli conway query committee-state --unrecognized
{
    "committee": {},
    "epoch": 106,
    "quorum": 0.6
}
```