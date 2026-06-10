import {
  MeshWallet,
  AppWalletKeyType,
  YaciProvider,
  MeshTxBuilder,
} from "@meshsdk/core";
import axios from "axios";

const yaciBaseUrl = process.env.YACI_BASE_URL || "https://yaci-node.meshjs.dev";

export class MeshYaciProvider extends YaciProvider {
  constructor() {
    super(`${yaciBaseUrl}/api/v1`);
  }

  fundWallet = async (walletAddress: string, adaAmount: number) => {
    const res = await axios.post(`${yaciBaseUrl}/admin/topup`, {
      wallet_address: walletAddress,
      ada_amount: adaAmount,
    });
    return res.data;
  };

  getGenesis = async () => {
    const res = await axios.get(`${yaciBaseUrl}/admin/genesis`);
    return res.data;
  };
}

export const provider = new MeshYaciProvider();

export const newWallet = (providedMnemonic?: string[]) => {
  let mnemonic = providedMnemonic;
  if (!providedMnemonic) {
    mnemonic = MeshWallet.brew() as string[];
    console.log(
      "Wallet generated, if you want to reuse the same address, please save the mnemonic:"
    );
    console.log(mnemonic);
  }
  const signingKey: AppWalletKeyType = {
    type: "mnemonic",
    words: mnemonic as string[],
  };

  const wallet = new MeshWallet({
    key: signingKey,
    networkId: 0,
    fetcher: provider,
    submitter: provider,
  });
  return wallet;
};

export class MeshTx {
  constructor(public wallet: MeshWallet) {}

  newTx = async () => {
    const address = (await this.wallet.getUsedAddresses())[0];

    const txBuilder = new MeshTxBuilder({
      fetcher: provider,
      evaluator: provider,
    });
    const utxos = await this.wallet.getUtxos();
    txBuilder.changeAddress(address).selectUtxosFrom(utxos);
    return txBuilder;
  };

  newValidationTx = async () => {
    const txBuilder = await this.newTx();
    const collateral = (await this.wallet.getCollateral())[0];
    txBuilder.txInCollateral(
      collateral.input.txHash,
      collateral.input.outputIndex,
      collateral.output.amount,
      collateral.output.address
    );
    return txBuilder;
  };

  prepare = async () => {
    const address = (await this.wallet.getUsedAddresses())[0];

    const txBuilder = await this.newTx();
    const txHex = await txBuilder
      .txOut(address, [{ unit: "lovelace", quantity: "5000000" }])
      .txOut(address, [{ unit: "lovelace", quantity: "5000000" }])
      .txOut(address, [{ unit: "lovelace", quantity: "5000000" }])
      .complete();
    const singedTx = this.wallet.signTx(txHex);
    const txHash = await this.wallet.submitTx(singedTx);
    console.log("Prepare txHash:", txHash);
  };

  signAndSubmit = async (txHex: string, trace = "txHash: ") => {
    const signedTx = this.wallet.signTx(txHex, true);
    const txHash = await this.wallet.submitTx(signedTx);
    console.log(trace, txHash);
  };
}

export const sleep = (second: number) =>
  new Promise((resolve) => setTimeout(resolve, second * 1000));
