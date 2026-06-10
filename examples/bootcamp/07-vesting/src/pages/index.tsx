import {
  applyParamsToScript,
  Asset,
  BlockfrostProvider,
  BuiltinByteString,
  ConStr0,
  deserializeAddress,
  deserializeDatum,
  Integer,
  mConStr0,
  MeshTxBuilder,
  MeshWallet,
  serializePlutusScript,
  SLOT_CONFIG_NETWORK,
  unixTimeToEnclosingSlot,
  UTxO,
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import blueprint from "../aiken-workspace/plutus.json";

const networkId = 0;

// Set up the blockchain provider with your key
const provider = new BlockfrostProvider("YOUR_KEY_HERE");

// wallet address: addr_test1wzjs5csqkl8nxqe55tps75e9vn2rzwh00ap4xpdapgcl0wg825l4y https://preprod.cardanoscan.io/address/addr_test1wzjs5csqkl8nxqe55tps75e9vn2rzwh00ap4xpdapgcl0wg825l4y
const appWallet = [
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

type VestingDatum = ConStr0<[Integer, BuiltinByteString, BuiltinByteString]>;

export default function Home() {
  const { wallet, connected } = useWallet();

  function getScript() {
    const scriptCbor = applyParamsToScript(
      blueprint.validators[0]!.compiledCode,
      []
    );

    const { address } = serializePlutusScript({
      code: scriptCbor,
      version: "V3",
    });
    return { cbor: scriptCbor, address: address };
  }

  async function depositTx(
    amount: Asset[],
    lockUntilTimeStampMs: number,
    beneficiaryAddress: string
  ) {
    const script = getScript();

    // app wallet
    const wallet = new MeshWallet({
      networkId: 0,
      key: {
        type: "mnemonic",
        words: appWallet,
      },
      fetcher: provider,
      submitter: provider,
    });

    const utxos = await wallet.getUtxos();
    const changeAddress = await wallet.getChangeAddress();

    const { pubKeyHash: ownerPubKeyHash } = deserializeAddress(changeAddress);
    const { pubKeyHash: beneficiaryPubKeyHash } =
      deserializeAddress(beneficiaryAddress);

    // create transaction
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      verbose: true,
    });

    const unsignedTx = await txBuilder
      .txOut(script.address, amount)
      .txOutInlineDatumValue(
        mConStr0([lockUntilTimeStampMs, ownerPubKeyHash, beneficiaryPubKeyHash])
      )
      .changeAddress(changeAddress)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);
    return txHash;
  }

  async function deposit() {
    if (connected) {
      const beneficiaryAddress = await wallet.getChangeAddress();
      const lovelaceAmount = "10000000";

      const assets: Asset[] = [
        {
          unit: "lovelace",
          quantity: lovelaceAmount,
        },
      ];

      const lockUntilTimeStamp = new Date();
      lockUntilTimeStamp.setMinutes(lockUntilTimeStamp.getMinutes() + 1);

      const txHash = await depositTx(
        assets,
        lockUntilTimeStamp.getTime(),
        beneficiaryAddress
      );

      console.log("Transaction hash:", txHash);
    }
  }

  async function getUtxoByTxHash(
    txHash: string,
    scriptCbor?: string
  ): Promise<UTxO | undefined> {
    const utxos = await provider.fetchUTxOs(txHash);
    let scriptUtxo = utxos[0];

    if (scriptCbor) {
      const script = getScript();
      scriptUtxo =
        utxos.filter((utxo) => utxo.output.address === script.address)[0] ||
        utxos[0];
    }

    return scriptUtxo;
  }

  async function withdrawTx(
    inputUtxos: UTxO[],
    collateral: UTxO,
    walletAddress: string,
    vestingUtxo: UTxO
  ) {
    const script = getScript();
    const { input: collateralInput, output: collateralOutput } = collateral;
    const { pubKeyHash } = deserializeAddress(walletAddress);

    const datum = deserializeDatum<VestingDatum>(
      vestingUtxo.output.plutusData!
    );

    const invalidBefore =
      unixTimeToEnclosingSlot(
        Math.min(Number(datum.fields[0].int), Date.now() - 15000),
        networkId === 0
          ? SLOT_CONFIG_NETWORK.preprod
          : SLOT_CONFIG_NETWORK.mainnet
      ) + 1;

    // create transaction
    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      verbose: true,
    });

    const unsignedTx = await txBuilder
      .spendingPlutusScript("V3")
      .txIn(
        vestingUtxo.input.txHash,
        vestingUtxo.input.outputIndex,
        vestingUtxo.output.amount,
        script.address
      )
      .spendingReferenceTxInInlineDatumPresent()
      .spendingReferenceTxInRedeemerValue("")
      .txInScript(script.cbor)
      .txOut(walletAddress, [])
      .txInCollateral(
        collateralInput.txHash,
        collateralInput.outputIndex,
        collateralOutput.amount,
        collateralOutput.address
      )
      .invalidBefore(invalidBefore)
      .requiredSignerHash(pubKeyHash)
      .changeAddress(walletAddress)
      .selectUtxosFrom(inputUtxos)
      .complete();

    return unsignedTx;
  }

  async function withdraw(depositTxHash: string) {
    if (connected) {
      const inputs = await wallet.getUtxos();
      const changeAddress = await wallet.getChangeAddress();
      const collateral = await wallet.getCollateral();

      if (collateral.length === 0) {
        console.log("No collateral available");
        return;
      }

      const vestingUtxo = await getUtxoByTxHash(depositTxHash);

      const txHex = await withdrawTx(
        inputs,
        collateral[0],
        changeAddress,
        vestingUtxo!
      );

      const signedTx = await wallet.signTx(txHex);
      const txHash = await wallet.submitTx(signedTx);
      console.log("Transaction hash:", txHash);
    }
  }

  return (
    <div>
      <CardanoWallet isDark={true} />
      <button onClick={() => deposit()}>Deposit</button> |{" "}
      <button
        onClick={() =>
          withdraw(
            "556f2bfcd447e146509996343178c046b1b9ad4ac091a7a32f85ae206345e925" // replace with your deposit tx hash
          )
        }
      >
        Withdraw
      </button>
    </div>
  );
}
