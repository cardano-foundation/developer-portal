---
id: user-wallet-authentication
title: Authenticating users with their Cardano wallet
sidebar_label: User wallet authentication
description: Full example on authenticating users on the web with their Cardano wallet.
image: /img/og/og-developer-portal.png
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Overview

This guide is a walkthrough on how to implement the *message signing* described in [CIP-08](https://cips.cardano.org/cip/CIP-0008) in order to authenticate users on the web with just their [CIP-30](https://cips.cardano.org/cip/CIP-0030)-compatible wallet app.

:::note

There are 2 components used in this guide &mdash; the front-end and the back-end. In order to implement this example, a [nodejs](https://nodejs.org) server is needed to run the back-end component that will receive and process the signed message submitted by the user.

:::

## Use cases

The following are a just some examples of where this implementation can be used:

1. Authenticating holders of a specific native token in order to grant access to exclusive content or service
1. Authenticating wallet or stake address owners for registration to some whitelist
1. Authenticating wallet or stake address owners when claiming native token rewards

## Time to code

As mentioned above, there are 2 components in this example - the front-end and the back-end. Our front-end code will handle our interaction with the user, to prompt them to sign some message with their wallet. The signed message will then be submitted to our back-end component which will parse the message and verify the user's signature.

In this example, we will be asking the user to sign a simple text message containing the string `account: `, followed by their wallet's bech32 stake address. For example:

`account: stake1uynpv0vlulhufm8txwry0da9qq6tn9wn42mxltq65pw403qvdcveh`

Our purpose in this case is for the user to prove their ownership of the given stake address.

Also for simplicity, we will be interacting with [Typhon Wallet](https://typhonwallet.io) only, in this example. But the concepts shown here should work with any other [CIP-30](https://cips.cardano.org/cip/CIP-0030)-compliant wallet app.

### Front-end

For brevity, our front-end component will just be an HTML page containing a single button which will start the process, when clicked by the user.

```html title="index.html"
<html>
    <head>
        <title>Authenticating users with their Cardano wallet</title>
        <script src="userWalletAuth.js"></script>
    </head>
    <body>
        <button id="login-btn">Login</button>        
    </body>
</html>
```

The logic to handle the click event on the above button will be in a separate Javascript file. This is what we will really be working on for the front-end component. Let's start with the following:

```js title="userWalletAuth.js"
window.addEventListener("load", () => {
    const loginBtn = document.querySelector("#login-btn");
    loginBtn.addEventListener("click", authenticate);
})

async function authenticate(){
    //
}
```

For now, we just attached an event listener to our button, which will call the function `authenticate` when clicked.

Before we go on to add functionality to `authenticate` and anything else, we have to first import a couple of dependencies. Let's add the following to the top of `userWalletAuth.js`:

```js title="userWalletAuth.js"
import { Buffer } from "buffer";
let csl, wallet;

async function loadCsl(){
    csl = await import("@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib");
};
loadCsl();

...
```

With the above lines, we just made available to the rest of our script, the [Buffer](https://www.npmjs.com/package/buffer) package and the [Cardano Serialization Library](/docs/get-started/cardano-serialization-lib/overview). Also, we just declared the top-level variable `wallet` there for convenience later. We will set its value in the following steps.

Now, let's make the `authenticate` function actually do some things:

```js title="userWalletAuth.js"
...

async function authenticate(){
    if (!csl) await loadCsl(); // make sure CSL is loaded before doing anything else.

    wallet = await window.cardano.typhoncip30.enable();

    const [stakeAddrHex, stakeAddrBech32] = await getStakeAddress();
    const messageUtf = `account: ${stakeAddrBech32}`;
    const messageHex = Buffer.from(messageUtf).toString("hex");    
    const sigData = await wallet.signData(stakeAddrHex, messageHex);
    const result = await submitToBackend(sigData);
    alert(result.message);
}
```

Our `authenticate` function now gets the user's stake address both in hex and bech32 format. It then puts together the message that we'll ask the user to sign. After converting the message into a hex string, we call the `signData` method on the user's wallet to prompt the user to sign. When we get the signed message, we send it to our backend component to be processed and verified.

You'll notice that we called two more functions from the `authenticate` function. We have to add them to our code also:

```js title="userWalletAuth.js"
...

async function getStakeAddress(){
    const networkId = await wallet.getNetworkId();
    const changeAddrHex = await wallet.getChangeAddress();
    
    // derive the stake address from the change address to be sure we are getting
    // the stake address of the currently active account.
    const changeAddress = csl.Address.from_bytes( Buffer.from(changeAddrHex, 'hex') );
    const stakeCredential = csl.BaseAddress.from_address(changeAddress).stake_cred();
    const stakeAddress = csl.RewardAddress.new(networkId, stakeCredential).to_address();

    return [stakeAddress.to_hex(), stakeAddress.to_bech32()];
}

async function submitToBackend(sigData){
    const result = await fetch(`http://localhost:8081/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(sigData),
    });
    return result.json();
}
```

That completes our front-end code. It can be viewed in full [here](https://github.com/inimrod/cardano-message-signing-demo/blob/main/frontend/js/userWalletAuth.js).


### Back-end

For our back-end, let's create a file named `server.js` and first, we will import the dependencies we need:

```js title="server.js"
const { Buffer } = require("buffer");
const { COSESign1, COSEKey, BigNum, Label, Int } = require("@emurgo/cardano-message-signing-nodejs");
const { Ed25519Signature, RewardAddress, PublicKey, Address } = require("@emurgo/cardano-serialization-lib-nodejs");
const express = require("express");
const cors = require("cors");
```

Here, we will be creating just a simple [Express JS](https://expressjs.com) server that can receive our `POST` request from our front-end. Along with the others, we imported a few required classes from the `cardano-message-signing` and `cardano-serialization-lib` packages.

Now let's add a sample list of "registered users" of our app, identified by their stake addresses:

```js title="server.js"
...

const registeredUsers = [
    "stake1uyzu7upg082rqajwasmwgam09fe7yj2cm3fkdfecqgptg8cwuze7s",
    "stake1u8k7mwu8gdqyvgved89996cy6g8d9vw36w7j05qy2etanxgmgl5s7",
    "stake1uynpv0vlulhufm8txwry0da9qq6tn9wn42mxltq65pw403qvdcveh",
    "stake1uxa2x4andawqtcqxw9gy4mamdx6extq5g5grqq6pf7zpxxge4aa7l",
    "stake1ux8yttnhy6qm9lkehvnmlhufnx38ef2q8vl6xyu8gyk0zwc83nvxh",
    "stake1uykkptznwz0jd3flwa442a0cdmfrpwhg8pa9ypytf4cwacqw2085c"
]
```

Next, we create our `express` server with one endpoint to receive the request from our front-end:

```js title="server.js"
...

const app = express();
app.use(express.json());
app.options("*", cors());
app.use(cors({
    origin: "*"
}));

app.post("/login", authenticate);
app.listen(8081, () =>
  console.log("Backend component listening on port 8081!"),
);
```

The above code adds the `/login` endpoint which fires up the `authenticate` handler function. Now let's add that function:

```js title="server.js"
...

async function authenticate(req, res) {
    const sigData = req.body;
    const decoded = COSESign1.from_bytes( Buffer.from(sigData.signature, "hex") );
    const headermap = decoded.headers().protected().deserialized_headers();
    const addressHex = Buffer.from( headermap.header( Label.new_text("address") ).to_bytes() )
        .toString("hex")
        .substring(4);
    const address = Address.from_bytes( Buffer.from(addressHex, "hex") );

    const key = COSEKey.from_bytes( Buffer.from(sigData.key, "hex") );
    const pubKeyBytes = key.header( Label.new_int( Int.new_negative(BigNum.from_str("2")) ) ).as_bytes();
    const publicKey = PublicKey.from_bytes(pubKeyBytes);

    const payload = decoded.payload();
    const signature = Ed25519Signature.from_bytes(decoded.signature());
    const receivedData = decoded.signed_data().to_bytes();

    const signerStakeAddrBech32 = RewardAddress.from_address(address).to_address().to_bech32();
    const utf8Payload = Buffer.from(payload).toString("utf8");
    const expectedPayload = `account: ${signerStakeAddrBech32}`; // reconstructed message

    // verify:
    const isVerified = publicKey.verify(receivedData, signature);
    const payloadAsExpected = utf8Payload == expectedPayload;
    const signerIsRegistered = registeredUsers.includes(signerStakeAddrBech32);

    const isAuthSuccess = isVerified && payloadAsExpected && signerIsRegistered;

    res.send({
        success: isAuthSuccess,
        message: isAuthSuccess ? "✅ Authentication success!" : "❌ Authentication failed."
    })
}
```

Let's unpack what happened there.

First, we decoded the serialized signature that was submitted by the user. From the headers of this decoded data, we got the address of the signer. We later convert it back to its bech32 format to reconstruct our expected message string.

We then created a `PublicKey` instance of the `key` that came together with the signature sent by the user. We later use this to verify the submitted signature.

We also parsed the `payload` from the decoded signature data. After reconstructing our expected message string, we compare it with the `payload` we actually received.

Since we already have the signer's stake address, we also checked it against our `registeredUsers` list.

Lastly, we send a response back to the user with a success message if all three checks where passed and a failure message if otherwise.

That completes our backend component. The full code can be viewed [here](https://github.com/inimrod/cardano-message-signing-demo/blob/main/backend/server.js).


### Demo project repository

For quick and convenient testing of the above code, a demo project is available [here](https://github.com/inimrod/cardano-message-signing-demo) that can be cloned and quickly run.
