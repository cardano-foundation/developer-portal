---
id: testnet-faucet
title: Testnet Faucet
sidebar_label: Testnet Faucet
description: Request some test ada (tAda) from the Cardano Testnet Faucet.
image: /img/og/og-developer-portal.png
--- 

Since Cardano testnets are independent networks, separate from the Cardano mainnet, they require their own tokens.

The testnet faucet is a web-based service that provides test ada to users of the Cardano testnets. While these tokens have no real-world value, they enable users to experiment with Cardano testnet features without spending real ada on the mainnet. You can use test ada to [mint native tokens](/docs/build/native-tokens/minting), practice with [cardano-cli](/docs/get-started/infrastructure/cardano-cli/basic-operations/get-started) or [cardano-wallet](/docs/get-started/infrastructure/cardano-wallet/using-cardano-wallet), or to [learn how to operate a stake pool](../../../operate-a-stake-pool/).

## How to get test ada

To request tokens using the faucet:

1. **Select your environment** - Choose either `preview` or `preprod` testnet.
2. **Select your action**:
   - **Receive test ada** - Get test tokens sent to your wallet address
   - **Receive pool delegation** - If you're an SPO testing stake pool operations (learn [more](https://developers.cardano.org/docs/operate-a-stake-pool/))
3. **Enter the address** - Provide the account address where you want to receive funds.
4. **API Key (optional)** - If you have been issued with an API key, enter this to access any additional funds you may have been allocated.
5. **Complete the captcha** - Confirm the "I'm not a robot" box and solve the captcha if needed.
6. **Request funds** - Click the button and the funds will be in your testnet account within a few seconds.

You can track your transactions using any [Cardano PreProd Testnet Explorer](https://explorer.cardano.org/preprod) or [Cardano Preview Testnet Explorer](https://explorer.cardano.org/preview).

<div id="faucetcontainer">
<iframe name="iframe" height="900" width="100%" src="https://docs.cardano.org/cardano-testnets/tools/faucet" className="faucet" frameBorder="0"></iframe>
</div>

<div className="faucet-mobile-link">

:::info Access the faucet
On mobile devices, please visit the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet) directly.
:::

</div>
