import type { BrowserWallet } from "@meshsdk/core";

import { connectWallet } from "./connect-wallet.ts";
import { sendAdaToSelf } from "./send-ada.ts";
import { mintToken } from "./mint-token.ts";
import { sendWithMetadata } from "./send-with-metadata.ts";
import { sendWithDeadline } from "./send-with-deadline.ts";

// A tiny page that runs the lecture snippets: connect the wallet, then either
// send 1 ADA to yourself or mint a token. This is just the harness, the
// interesting code lives in the snippets.
const out = document.querySelector<HTMLParagraphElement>("#out")!;

function wire(id: string, working: string, action: (wallet: BrowserWallet) => Promise<string>) {
  const button = document.querySelector<HTMLButtonElement>(id)!;
  button.addEventListener("click", async () => {
    button.disabled = true;
    try {
      out.textContent = "Connecting to Lace…";
      const { wallet } = await connectWallet("lace");

      out.textContent = working;
      const txHash = await action(wallet);

      out.innerHTML =
        `Submitted! <a target="_blank" rel="noreferrer" ` +
        `href="https://explorer.cardano.org/preview/transaction?id=${txHash}">view on explorer</a>`;
    } catch (error) {
      out.textContent = "error: " + (error as Error).message;
    } finally {
      button.disabled = false;
    }
  });
}

wire("#send", "Sending 1 ADA to yourself… approve it in Lace.", (w) => sendAdaToSelf(w));
wire("#mint", "Minting 100 GOLD… approve it in Lace.", (w) => mintToken(w, "GOLD", "100"));
wire("#metadata", "Sending a transaction with a memo… approve it in Lace.", (w) =>
  sendWithMetadata(w, "gm from the beginner lectures"),
);
wire("#deadline", "Sending a time-limited transaction… approve it in Lace.", (w) =>
  sendWithDeadline(w),
);
