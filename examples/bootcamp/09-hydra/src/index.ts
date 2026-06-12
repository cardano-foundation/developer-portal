import { HydraProvider, HydraInstance } from "@meshsdk/hydra";
import { BlockfrostProvider, MeshTxBuilder } from "@meshsdk/core";
import { MeshCardanoHeadlessWallet, AddressType } from "@meshsdk/wallet";

async function main() {
  // -------------------------------------------------------
  // Configuration — replace these values before running
  // -------------------------------------------------------
  const BLOCKFROST_KEY = "YOUR_BLOCKFROST_KEY";
  const HYDRA_API_URL = "http://localhost:4001";
  const ALICE_SKEY_PATH = "credentials/alice-funds.sk";
  const BOB_ADDRESS = "addr_test1..."; // Replace with Bob's actual address

  // -------------------------------------------------------
  // 1. Set up providers
  // -------------------------------------------------------
  const blockfrost = new BlockfrostProvider(BLOCKFROST_KEY);

  const hydraProvider = new HydraProvider({
    httpUrl: HYDRA_API_URL,
  });

  const instance = new HydraInstance({
    provider: hydraProvider,
    fetcher: blockfrost,
    submitter: blockfrost,
  });

  // -------------------------------------------------------
  // 2. Create wallet from CLI keys
  // -------------------------------------------------------
  const wallet = await MeshCardanoHeadlessWallet.fromCliKeys({
    networkId: 0,
    walletAddressType: AddressType.Base,
    fetcher: blockfrost,
    submitter: blockfrost,
    paymentSkey: ALICE_SKEY_PATH,
  });

  const aliceAddress = await wallet.getChangeAddressBech32();
  console.log("Alice address:", aliceAddress);

  // -------------------------------------------------------
  // 3. Connect to Hydra node
  // -------------------------------------------------------
  await hydraProvider.connect();
  const connected = await hydraProvider.isConnected();
  console.log("Connected to Hydra node:", connected);

  // -------------------------------------------------------
  // 4. Set up event-driven lifecycle
  // -------------------------------------------------------
  hydraProvider.onMessage(async (message) => {
    switch (message.tag) {
      // Head is initializing — commit funds
      case "HeadIsInitializing": {
        console.log("Head initializing, committing funds...");
        const utxos = await wallet.getUtxosMesh();
        if (utxos.length === 0) {
          console.error("No UTxOs available to commit. Fund the wallet first.");
          return;
        }

        const commitTx = await instance.commitFunds(
          utxos[0].input.txHash,
          utxos[0].input.outputIndex
        );
        const signedCommit = await wallet.signTx(commitTx, true, false);
        await wallet.submitTx(signedCommit);
        console.log("Commit transaction submitted.");
        break;
      }

      // Head is open — send a Layer 2 transaction
      case "HeadIsOpen": {
        console.log("Head is open! Sending L2 transaction...");
        const pp = await hydraProvider.fetchProtocolParameters();
        const l2Utxos = await hydraProvider.fetchAddressUTxOs(aliceAddress);

        if (l2Utxos.length === 0) {
          console.error("No UTxOs in the Head for Alice.");
          return;
        }

        const txBuilder = new MeshTxBuilder({
          fetcher: hydraProvider,
          submitter: hydraProvider,
          isHydra: true,
          params: pp,
        });

        const unsignedTx = await txBuilder
          .txOut(BOB_ADDRESS, [{ unit: "lovelace", quantity: "5000000" }])
          .changeAddress(aliceAddress)
          .selectUtxosFrom(l2Utxos)
          .setNetwork("preprod")
          .complete();

        const signedTx = await wallet.signTx(unsignedTx, false);
        const txHash = await hydraProvider.submitTx(signedTx);
        console.log("L2 transaction submitted:", txHash);
        break;
      }

      // Transaction confirmed in snapshot — close the Head
      case "SnapshotConfirmed": {
        console.log("Snapshot confirmed. Closing Head...");
        await hydraProvider.close();
        break;
      }

      // Contestation period ended — fanout to Layer 1
      case "ReadyToFanout": {
        console.log("Contestation period ended. Fanning out...");
        await hydraProvider.fanout();
        break;
      }

      // Head finalized — funds are back on Layer 1
      case "HeadIsFinalized": {
        console.log("Head finalized! Funds are back on Layer 1.");
        await hydraProvider.disconnect();
        process.exit(0);
      }

      // Log other events for visibility
      case "TxValid": {
        const msg = message as { tag: string; transactionId?: string };
        console.log("Transaction confirmed:", msg.transactionId);
        break;
      }

      case "TxInvalid": {
        const msg = message as { tag: string; validationError?: unknown };
        console.error("Transaction rejected:", msg.validationError);
        break;
      }

      case "Committed": {
        console.log("Participant committed funds to the Head.");
        break;
      }

      default: {
        console.log(`Event: ${message.tag}`);
      }
    }
  });

  // -------------------------------------------------------
  // 5. Initialize the Head — kicks off the lifecycle
  // -------------------------------------------------------
  console.log("Initializing Hydra Head...");
  await hydraProvider.init();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
