import {
  applyCborEncoding,
  applyParamsToScript,
  BlockfrostProvider,
  ConStr0,
  Data,
  deserializeAddress,
  Integer,
  mConStr0,
  mOutputReference,
  mPubKeyAddress,
  MeshTxBuilder,
  MeshWallet,
  parseDatumCbor,
  PubKeyAddress,
  resolveScriptHash,
  serializeAddressObj,
  serializePlutusScript,
  stringToHex,
  UTxO,
  conStr0,
  integer,
} from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import blueprint from "../aiken-workspace/plutus.json";

// Set up the blockchain provider with your key
const provider = new BlockfrostProvider("YOUR_KEY_HERE");

// Lovelace price for minting an NFT
const lovelacePrice = 10_000_000;

// Collection name for the NFTs
const collectionName = "MyNFTCollection";

type OracleDatum = ConStr0<[Integer, Integer, PubKeyAddress]>;

export default function Home() {
  const { wallet, connected } = useWallet();

  // ============================================================
  // Helper: get the oracle NFT minting policy (parameterized)
  // ============================================================
  function getOracleNftScript(paramUtxo: UTxO) {
    const param: Data = mOutputReference(
      paramUtxo.input.txHash,
      paramUtxo.input.outputIndex
    );
    const paramScript = applyParamsToScript(
      blueprint.validators[2]!.compiledCode,
      [param]
    );
    const policyId = resolveScriptHash(paramScript, "V3");
    return { cbor: paramScript, policyId };
  }

  // ============================================================
  // Helper: get the oracle validator address
  // ============================================================
  function getOracleAddress() {
    const oracleCbor = applyCborEncoding(
      blueprint.validators[0]!.compiledCode
    );
    const { address } = serializePlutusScript(
      { code: oracleCbor, version: "V3" },
      "",
      "preprod"
    );
    return { cbor: oracleCbor, address };
  }

  // ============================================================
  // Helper: fetch UTxOs at address containing a specific token
  // ============================================================
  async function getAddressUtxosWithToken(
    walletAddress: string,
    assetHex: string
  ) {
    const utxos = await provider.fetchAddressUTxOs(walletAddress);
    return utxos.filter((u) => {
      const assetAmount = u.output.amount.find(
        (a: { unit: string; quantity: string }) => a.unit === assetHex
      )?.quantity;
      return Number(assetAmount) >= 1;
    });
  }

  // ============================================================
  // Helper: fetch the current oracle state
  // ============================================================
  async function getOracleData(oracleNftPolicyId: string) {
    const { address: oracleAddress, cbor: oracleCbor } = getOracleAddress();

    const oracleUtxo = (
      await getAddressUtxosWithToken(oracleAddress, oracleNftPolicyId)
    )[0]!;

    const oracleDatum: OracleDatum = parseDatumCbor(
      oracleUtxo!.output.plutusData!
    );

    const nftIndex = oracleDatum.fields[0].int;
    const lovelacePriceFromDatum = oracleDatum.fields[1].int;
    const feeCollectorAddressObj = oracleDatum.fields[2];
    const feeCollectorAddress = serializeAddressObj(
      feeCollectorAddressObj,
      "preprod"
    );

    return {
      nftIndex,
      lovelacePrice: lovelacePriceFromDatum,
      oracleUtxo,
      oracleNftPolicyId,
      oracleAddress,
      oracleCbor,
      feeCollectorAddress,
      feeCollectorAddressObj,
    };
  }

  // ============================================================
  // Setup Oracle: mint oracle NFT and lock in oracle validator
  // ============================================================
  async function setupOracle() {
    if (!connected) return;

    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0]!;
    const walletAddress = await wallet.getChangeAddress();

    const paramUtxo = utxos[0]!;
    const { cbor: oracleNftCbor, policyId } = getOracleNftScript(paramUtxo);
    const tokenName = "";

    const { address: oracleAddress } = getOracleAddress();
    const { pubKeyHash, stakeCredentialHash } =
      deserializeAddress(walletAddress);

    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      verbose: true,
    });

    const txHex = await txBuilder
      .txIn(
        paramUtxo.input.txHash,
        paramUtxo.input.outputIndex,
        paramUtxo.output.amount,
        paramUtxo.output.address
      )
      .mintPlutusScriptV3()
      .mint("1", policyId, tokenName)
      .mintingScript(oracleNftCbor)
      .mintRedeemerValue(mConStr0([]))
      .txOut(oracleAddress, [{ unit: policyId, quantity: "1" }])
      .txOutInlineDatumValue(
        mConStr0([
          0,
          lovelacePrice,
          mPubKeyAddress(pubKeyHash, stakeCredentialHash),
        ])
      )
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(txHex);
    const txHash = await wallet.submitTx(signedTx);
    console.log("Setup Oracle tx hash:", txHash);
    console.log(
      "Save this paramUtxo for later use:",
      paramUtxo.input.txHash,
      paramUtxo.input.outputIndex
    );
  }

  // ============================================================
  // Mint Plutus NFT
  // ============================================================
  async function mintPlutusNFT(
    paramUtxoTxHash: string,
    paramUtxoOutputIndex: number
  ) {
    if (!connected) return;

    const utxos = await wallet.getUtxos();
    const collateral = (await wallet.getCollateral())[0]!;
    const walletAddress = await wallet.getChangeAddress();

    // Reconstruct oracle NFT policy from param
    const param: Data = mOutputReference(paramUtxoTxHash, paramUtxoOutputIndex);
    const oracleNftCbor = applyParamsToScript(
      blueprint.validators[2]!.compiledCode,
      [param]
    );
    const oracleNftPolicyId = resolveScriptHash(oracleNftCbor, "V3");

    // Get oracle state
    const {
      nftIndex,
      lovelacePrice: price,
      oracleUtxo,
      oracleAddress,
      oracleCbor,
      feeCollectorAddress,
      feeCollectorAddressObj,
    } = await getOracleData(oracleNftPolicyId);

    // Build plutus NFT minting script
    const nftCbor = applyParamsToScript(
      blueprint.validators[4]!.compiledCode,
      [stringToHex(collectionName), oracleNftPolicyId]
    );
    const nftPolicyId = resolveScriptHash(nftCbor, "V3");

    const tokenName = `${collectionName} (${nftIndex})`;
    const tokenNameHex = stringToHex(tokenName);

    const updatedOracleDatum: OracleDatum = conStr0([
      integer((nftIndex as number) + 1),
      integer(price),
      feeCollectorAddressObj,
    ]);

    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      verbose: true,
    });

    const tx = txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        oracleUtxo.input.txHash,
        oracleUtxo.input.outputIndex,
        oracleUtxo.output.amount,
        oracleUtxo.output.address
      )
      .txInRedeemerValue(mConStr0([]))
      .txInScript(oracleCbor)
      .txInInlineDatumPresent()
      .txOut(oracleAddress, [{ unit: oracleNftPolicyId, quantity: "1" }])
      .txOutInlineDatumValue(updatedOracleDatum, "JSON")
      .mintPlutusScriptV3()
      .mint("1", nftPolicyId, tokenNameHex)
      .mintingScript(nftCbor);

    const assetMetadata = {
      name: `${collectionName} (${nftIndex})`,
      image: "ipfs://QmRzicpReutwCkM6aotuKjErFCUD213DpwPq6ByuzMJaua",
      mediaType: "image/jpg",
      description: "This NFT was minted by Mesh (https://meshjs.dev/).",
    };

    const metadata = {
      [nftPolicyId]: { [tokenName]: { ...assetMetadata } },
    };
    tx.metadataValue(721, metadata);

    tx.mintRedeemerValue(mConStr0([]))
      .txOut(feeCollectorAddress, [
        { unit: "lovelace", quantity: price.toString() },
      ])
      .txInCollateral(
        collateral.input.txHash,
        collateral.input.outputIndex,
        collateral.output.amount,
        collateral.output.address
      )
      .changeAddress(walletAddress)
      .selectUtxosFrom(utxos);

    const txHex = await tx.complete();

    const signedTx = await wallet.signTx(txHex);
    const txHash = await wallet.submitTx(signedTx);
    console.log("Mint NFT tx hash:", txHash);
  }

  return (
    <div>
      <CardanoWallet isDark={true} />
      <br />
      <button onClick={() => setupOracle()}>Setup Oracle</button> |{" "}
      <button
        onClick={() =>
          mintPlutusNFT(
            "REPLACE_WITH_PARAM_UTXO_TX_HASH",
            0 // replace with your paramUtxo output index
          )
        }
      >
        Mint Plutus NFT
      </button>
    </div>
  );
}
