import { connectWallet } from "./connect-wallet.ts";
import { sendAdaToSelf } from "./send-ada.ts";

// A tiny page that runs the two snippets: connect the wallet, then send 1 ADA to
// yourself. This is just the harness, the interesting code is in the snippets.
const out = document.querySelector<HTMLParagraphElement>("#out")!;
const button = document.querySelector<HTMLButtonElement>("#go")!;

button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    out.textContent = "Connecting to Lace…";
    const { wallet } = await connectWallet("lace");

    out.textContent = "Building, signing and submitting… approve it in Lace.";
    const txHash = await sendAdaToSelf(wallet);

    out.innerHTML =
      `Submitted! <a target="_blank" rel="noreferrer" ` +
      `href="https://explorer.cardano.org/preview/transaction?id=${txHash}">view on explorer</a>`;
  } catch (error) {
    out.textContent = "error: " + (error as Error).message;
  } finally {
    button.disabled = false;
  }
});
