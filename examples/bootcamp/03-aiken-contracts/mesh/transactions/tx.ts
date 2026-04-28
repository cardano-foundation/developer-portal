import {
  applyCborEncoding,
  applyParamsToScript,
  parseDatumCbor,
} from "@meshsdk/core-csl";
import blueprint from "../../aiken-workspace/plutus.json";
import {
  ConStr0,
  deserializeAddress,
  mConStr0,
  MeshWallet,
  PubKeyHash,
  resolveScriptHash,
  serializePlutusScript,
  serializeRewardAddress,
  stringToHex,
  UTxO,
} from "@meshsdk/core";
import { MeshTx, provider } from "../common";

const mintingScriptCompiledCode = blueprint.validators[0].compiledCode;
const spendingScriptCompiledCode = blueprint.validators[2].compiledCode;
const withdrawScriptCompiledCode = blueprint.validators[4].compiledCode;

export class MeshContractTx extends MeshTx {
  constructor(wallet: MeshWallet) {
    super(wallet);
  }

  mintingAlwaysSucceed = async () => {
    const scriptCbor = applyCborEncoding(mintingScriptCompiledCode);
    const policyId = resolveScriptHash(scriptCbor, "V3");

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .mintPlutusScriptV3()
      .mint("1", policyId, "")
      .mintingScript(scriptCbor)
      .mintRedeemerValue("")
      .complete();

    return txHex;
  };

  lockAndRegisterCert = async () => {
    const ownPubKey = deserializeAddress(this.address).pubKeyHash;
    const spendingScriptCbor = applyCborEncoding(spendingScriptCompiledCode);
    const validatorAddress = serializePlutusScript({
      code: spendingScriptCbor,
      version: "V3",
    }).address;
    const withdrawScriptCbor = applyParamsToScript(
      withdrawScriptCompiledCode,
      [ownPubKey],
      "Mesh"
    );
    const withdrawScriptHash = resolveScriptHash(withdrawScriptCbor, "V3");
    const withdrawScriptRewardAddress = serializeRewardAddress(
      withdrawScriptHash,
      true,
      0
    );

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .txOut(validatorAddress, [])
      .txOutInlineDatumValue(mConStr0([ownPubKey]))
      .registerStakeCertificate(withdrawScriptRewardAddress)
      .complete();

    return txHex;
  };

  unlockHelloWorld = async () => {
    const ownPubKey = deserializeAddress(this.address).pubKeyHash;
    const spendingScriptCbor = applyCborEncoding(spendingScriptCompiledCode);
    const validatorAddress = serializePlutusScript({
      code: spendingScriptCbor,
      version: "V3",
    }).address;
    const scriptInput = (
      await provider.fetchAddressUTxOs(validatorAddress)
    ).find((input) => {
      if (input.output.plutusData) {
        const datum: ConStr0<[PubKeyHash]> = parseDatumCbor(
          input.output.plutusData
        );
        if (datum && datum.fields && datum.fields.length > 0) {
          return datum.fields[0].bytes === ownPubKey;
        }
      }
      return false;
    });

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .spendingPlutusScriptV3()
      .txIn(
        scriptInput!.input.txHash,
        scriptInput!.input.outputIndex,
        scriptInput!.output.amount,
        scriptInput!.output.address
      )
      .txInInlineDatumPresent()
      .txInScript(spendingScriptCbor)
      .txInRedeemerValue(mConStr0([stringToHex("Hello, World!")]))
      .requiredSignerHash(ownPubKey)
      .complete();

    return txHex;
  };

  withdrawZero = async () => {
    const ownPubKey = deserializeAddress(this.address).pubKeyHash;
    const withdrawScriptCbor = applyParamsToScript(
      withdrawScriptCompiledCode,
      [ownPubKey],
      "Mesh"
    );
    const withdrawScriptHash = resolveScriptHash(withdrawScriptCbor, "V3");
    const withdrawScriptRewardAddress = serializeRewardAddress(
      withdrawScriptHash,
      true,
      0
    );

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .withdrawalPlutusScriptV3()
      .withdrawal(withdrawScriptRewardAddress, "0")
      .withdrawalScript(withdrawScriptCbor)
      .withdrawalRedeemerValue("")
      .complete();

    return txHex;
  };

  deregisterStake = async () => {
    const ownPubKey = deserializeAddress(this.address).pubKeyHash;
    const withdrawScriptCbor = applyParamsToScript(
      withdrawScriptCompiledCode,
      [ownPubKey],
      "Mesh"
    );
    const withdrawScriptHash = resolveScriptHash(withdrawScriptCbor, "V3");
    const withdrawScriptRewardAddress = serializeRewardAddress(
      withdrawScriptHash,
      true,
      0
    );

    const txBuilder = await this.newValidationTx();
    const txHex = await txBuilder
      .deregisterStakeCertificate(withdrawScriptRewardAddress)
      .certificateScript(withdrawScriptCbor, "V3")
      .certificateRedeemerValue("")
      .complete();

    return txHex;
  };
}
