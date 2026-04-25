import { newWallet, provider, sleep } from "./common";
import { MeshContractTx } from "./transactions/tx";

const testTx = async () => {
  const setup = async () => {
    const address = (await wallet.getUsedAddresses())[0];
    await provider.fundWallet(address, 1000);
    await sleep(1);
    await tx.prepare();
    await sleep(1);
    const txHex = await tx.lockAndRegisterCert();
    // console.log("Setup", txHex);
    await tx.signAndSubmit(txHex, "Setup:");
    await sleep(1);
  };

  const testMintV3 = async () => {
    const txHex = await tx.mintingAlwaysSucceed();
    // console.log("MintV3", txHex);
    await tx.signAndSubmit(txHex, "MintV3");
    await sleep(1);
  };

  const testUnlockV3 = async () => {
    const txHex = await tx.unlockHelloWorld();
    // console.log("SpendV3", txHex);
    await tx.signAndSubmit(txHex, "SpendV3");
    await sleep(1);
  };

  const testWithdrawV3 = async () => {
    const txHex = await tx.withdrawZero();
    // console.log("WithdrawV3", txHex);
    await tx.signAndSubmit(txHex, "WithdrawV3");
    await sleep(1);
  };

  const testPublishV3 = async () => {
    const txHex = await tx.deregisterStake();
    // console.log("PublishV3", txHex);
    await tx.signAndSubmit(txHex, "PublishV3");
    await sleep(1);
  };

  console.log("Start testing Aiken PlutusV3 + Mesh on Yaci");

  const wallet = newWallet();
  const tx = new MeshContractTx(wallet);
  await setup();
  await testMintV3();
  await testUnlockV3();
  await testWithdrawV3();
  await testPublishV3();
};

testTx();
