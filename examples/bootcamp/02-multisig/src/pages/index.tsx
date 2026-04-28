import {
  BlockfrostProvider,
  deserializeAddress,
  ForgeScript,
  MeshTxBuilder,
  MeshWallet,
  NativeScript,
  resolveScriptHash,
  stringToHex,
  UTxO,
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";

// Set up the blockchain provider with your key
const provider = new BlockfrostProvider("YOUR_KEY_HERE");

const demoAssetMetadata = {
  name: "Mesh Token",
  image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
  mediaType: "image/jpg",
  description: "This NFT was minted by Mesh (https://meshjs.dev/).",
};

const mintingWallet = [
  "access",
  "spawn",
  "taxi",
  "prefer",
  "fortune",
  "sword",
  "nerve",
  "price",
  "valid",
  "panther",
  "sure",
  "hello",
  "layer",
  "try",
  "grace",
  "seven",
  "fossil",
  "voice",
  "tobacco",
  "circle",
  "measure",
  "solar",
  "pride",
  "together",
];

export default function Home() {
  const { wallet, connected } = useWallet();

  async function buildMintTx(inputs: UTxO[], changeAddress: string) {
    // minting wallet
    const wallet = new MeshWallet({
      networkId: 0,
      key: {
        type: "mnemonic",
        words: mintingWallet,
      },
    });

    const { pubKeyHash: keyHash } = deserializeAddress(
      await wallet.getChangeAddress()
    );

    // create minting script
    const nativeScript: NativeScript = {
      type: "all",
      scripts: [
        {
          type: "before",
          slot: "99999999",
        },
        {
          type: "sig",
          keyHash: keyHash,
        },
      ],
    };
    const forgingScript = ForgeScript.fromNativeScript(nativeScript);

    // create metadata
    const policyId = resolveScriptHash(forgingScript);
    const tokenName = "MeshToken";
    const tokenNameHex = stringToHex(tokenName);
    const metadata = { [policyId]: { [tokenName]: { ...demoAssetMetadata } } };

    // create transaction
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      verbose: true,
    });

    const unsignedTx = await txBuilder
      .mint("1", policyId, tokenNameHex)
      .mintingScript(forgingScript)
      .metadataValue(721, metadata)
      .changeAddress(changeAddress)
      .invalidHereafter(99999999)
      .selectUtxosFrom(inputs)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    return signedTx;
  }

  async function mint() {
    if (connected) {
      const inputs = await wallet.getUtxos();
      const changeAddress = await wallet.getChangeAddress();

      const tx = await buildMintTx(inputs, changeAddress);
      const signedTx = await wallet.signTx(tx);

      const txHash = await wallet.submitTx(signedTx);
      console.log("Transaction hash:", txHash);
    }
  }

  return (
    <div>
      <CardanoWallet isDark={true} />
      <button onClick={() => mint()}>Mint Token</button>
    </div>
  );
}
