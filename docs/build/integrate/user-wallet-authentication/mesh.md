---
id: mesh
title: Wallet authentication using Mesh SDK
sidebar_label: Mesh
description: Implement wallet-based authentication using Mesh SDK with simple, high-level APIs.
image: /img/og/og-developer-portal.png
---

This guide shows how to implement wallet-based authentication using [Mesh SDK](https://meshjs.dev), which provides high-level abstractions for message signing and signature verification.

:::note
This implementation requires both a frontend (React) and a backend (Node.js) component. The frontend handles wallet interaction, while the backend generates nonces and verifies signatures.
:::

## Prerequisites

Install the required Mesh packages:

```bash
npm install @meshsdk/core @meshsdk/react
```

It's cryptographically easy to prove the ownership of an account by signing a piece of data using a private key. Since a user's public address can be used as their identifier, we can build an authentication mechanism that is based on message signing. This mechanism is made possible because we are able to cryptographically prove the ownership of an account by signing a specific piece of data using the corresponding private key. If the data is correctly signed, then the backend will recognize it as coming from the owner of the public address.

JSON Web Token (JWT) claims can typically be used to pass identity of authenticated users between an identity provider and a service provider. A server (service provider) could generate a token and provide that to a client (identity provider). For example, a client could then use that token to prove ownership of a wallet, as these tokens can be signed by one party's private key (in this case, the client's).

Some example uses of data signing to cryptographically prove ownership:

* **Authenticate user sign in using JSON Web Token (JWT)**: A cryptographically-secure login to prove the ownership of an account by signing a piece of data using a private key.
* **Authenticate user's action**: If the backend wants to confirm a user's authorization on an off-chain action, for example, engaging in in-game trading.
* **Off chain account flow**: If you need to display certain data that is off-chain or on a website only to a particular user identified by their wallet, you could use message signing as a means of doing so.

## How does it work?

By signing a message, you are affirming that you are in control of the wallet address linked to the Blockchain, and thus can prove ownership of it.

There are 4 ingredients to signing a message:

* user wallet address
* private key
* public key
* message to sign

![Wallet authentication workflow](/img/integrate-cardano/wallet-authentication-flow.png)

To check if a user owns a certain address on a Web3 site, one needs to provide a message and have the user "sign" it. This "signature" is generated using the message, the user's private key, the public key, and a cryptographic algorithm.

To ensure the signature is valid, the same cryptographic algorithm is applied to the message and the public key is obtained. You may be wondering how this can be secure? The answer is that without the private key, the validation of the message and the public key cannot be cryptographically matched, thereby confirming ownership.

## Client: Connect Wallet and Get Staking Address

The User model stored in the database of the backend server must have two compulsory fields: public address and nonce. Furthermore, this address has to be unique. Other details about the user, such as username, Twitter ID, and name fields can be added, but are not essential for this process.

On Cardano, to obtain a user's public address as an identifier, we can use their wallet's staking address. This will be stored in the server side database, so that authorized wallets can be linked. The user never has to worry about manually entering their address, since it can be retrieved using **wallet.getUsedAddresses()**.

With the user's wallet connected, the first step is to get the user's staking address and send it to our backend server.

```tsx
const { wallet, connected } = useWallet();

async function frontendStartLoginProcess() {
  if (connected) {
    const userAddress = (await wallet.getUsedAddresses())[0];

     // do: send request with 'userAddress' to the backend
  }
}
```

## Server: Generate Nonce and Store in Database

In the backend, we first need to generate a new nonce, which is initialized as a random string. The purpose of this is to create a unique message that can be used for authentication of the user's wallet. This nonce will be the payload for the user to prove ownership of the wallet. With Mesh, you can generate a new nonce with **generateNonce()**, and set the message as **I agree to the term and conditions of the Mesh: nonce**.

By utilizing the **userAddress**, we can look up the database to determine whether the user is new or already exists.

If the user is new, we can create a new user entry, storing their staking address, nonce, and set their status as "not verified". Once the user has successfully verified, we can update their status to "verified" in our database.

For existing users, we just have to store the newly generated nonce in the database.

```tsx
import { generateNonce } from '@meshsdk/core';

async function backendGetNonce(userAddress) {
  // do: if new user, create new user model in the database

  const nonce = generateNonce('I agree to the term and conditions of the Mesh: ');

  // do: store 'nonce' in user model in the database

  // do: return 'nonce'
}
```

Lastly, we will return the **nonce** for the user to sign using their private key.

## Client: Verify ownership by signing the nonce

We are ready to use the private key associated with the wallet to sign the nonce with **await wallet.signData(nonce, userAddress)**, which enables the app to request the user to sign a payload according to [CIP-8](https://cips.cardano.org/cip/CIP-8).

We request the user's authorization and show them the message that is to be signed: **I agree to the term and conditions of the Mesh: nonce**. Once accepted, the signature will be generated and the app will process the signature to authenticate the user.

```tsx
async function frontendSignMessage(nonce) {
  try {
    const userAddress = (await wallet.getUsedAddresses())[0];
    const signature = await wallet.signData(nonce, userAddress);

    // do: send request with 'signature' and 'userAddress' to the backend
  } catch (error) {
    // catch error if user refuse to sign
  }
}
```

## Server: Verify Signature

When the backend receives the request, it retrieves the user associated with the specified address from the database. It then obtains the associated nonce from the database, which is a random value that is only known to the user.

With the nonce, staking address, and signature, the backend can cryptographically check that the nonce has been correctly signed by the user. This allows the backend to verify that the user is the owner of the public address, as only the owner of the address would know the nonce value and be able to sign it with the associated private key.

If the signature is verified, the user has successfully authenticated and the frontend will then receive a JSON Web Token (JWT) or session identifier to allow the user to access further resources. This is an example is for login process, but you can change it to use in approving a specific action, for example.

We also ensure that the nonce is not re-used (as this would make it possible for an attacker to gain access to the user's account). This is done by generating a random nonce for the user and saving it to the database. By constantly generating a unique nonce each time the user logs in, we can guarantee the user's signature is secure and keep their account safe.

```tsx
import { checkSignature } from '@meshsdk/core';

async function backendVerifySignature(userAddress, signature) {
  // do: get 'nonce' from user (database) using 'userAddress'

  const result = checkSignature(nonce, signature, userAddress);

  // do: update 'nonce' in the database with another random string

  // do: do whatever you need to do, once the user has proven ownership
  // it could be creating a valid JSON Web Token (JWT) or session
  // it could be doing something offchain
  // it could just be updating something in the database
}
```

## Putting It All Together

OK, let's put it all together! Your frontend code should now contain two functions **frontendStartLoginProcess()** and **frontendSignMessage(nonce)**.

For signing in with a wallet, you can use the **CardanoWallet** React UI component to connect and sign in with the user's wallet:

```tsx
<CardanoWallet
  label="Sign In with Cardano"
  onConnected={() => frontendStartLoginProcess()}
/>
```

Putting the frontend code together might look like this:

```tsx
import { CardanoWallet, useWallet } from '@meshsdk/react';

export default function Page() {
  const { wallet, connected } = useWallet();

  async function frontendStartLoginProcess() {
    if (connected) {
      const userAddress = (await wallet.getUsedAddresses())[0];
      const nonce = await backendGetNonce(userAddress);
      await frontendSignMessage(nonce);
    }
  }

  async function frontendSignMessage(nonce) {
    try {
      const userAddress = (await wallet.getUsedAddresses())[0];
      const signature = await wallet.signData(nonce, userAddress);
      await backendVerifySignature(userAddress, signature);
    } catch (error) {
      setState(0);
    }
  }

  return (
    <>
      <CardanoWallet
        label="Sign In with Cardano"
        onConnected={() => frontendStartLoginProcess()}
      />
    </>
  );
}
```

And the server side code should have 2 REST endpoints, **backendGetNonce(userAddress)** and **backendVerifySignature(userAddress, signature)**. The code might look like this:

```tsx
import { checkSignature, generateNonce } from '@meshsdk/core';

async function backendGetNonce(userAddress) {
  const nonce = generateNonce('I agree to the term and conditions of the Mesh: ');
  return nonce;
}

async function backendVerifySignature(userAddress, signature) {
  // do: get 'nonce' from database

  const result = checkSignature(nonce, signature, userAddress);
  if(result){
    // create JWT or approve certain process
  }
  else{
    // prompt user that signature is not correct
  }
}
```

There you go! Although this guide shows you how somebody can sign in with wallet, the same technique can be used to authenticate any of a user's actions.

## Learn More

* [Mesh SDK Documentation](https://meshjs.dev)
* [CIP-8: Message Signing](https://cips.cardano.org/cip/CIP-8)
* [CIP-30: Wallet Connector](https://cips.cardano.org/cip/CIP-30)
* [Mesh Wallet Connection](https://meshjs.dev/react/wallet-hooks)
