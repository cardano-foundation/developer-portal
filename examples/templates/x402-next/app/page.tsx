import { USDM_PREPROD_ASSET } from "@x402/cardano";
import Paywall from "@/components/Paywall";

export default function Home() {
  return (
    <main>
      <h1>x402 on Cardano</h1>
      <p className="muted">
        Two API routes behind x402 payments on Cardano preprod: one priced in tADA, one priced in
        the tUSDM stablecoin. Pay in the browser with a CIP-30 wallet, or headless with the x402
        client packages.
      </p>
      <Paywall url="/api/message" priceLabel="A message, 1 tADA" />
      <Paywall
        url="/api/message-usdm"
        priceLabel="The same message, 0.10 tUSDM"
        asset={USDM_PREPROD_ASSET}
        maxAmount="100000"
      />
      <footer>
        The routes are protected in <code>app/api/*/route.ts</code> with <code>withX402</code>.
        Replace the handlers with your API; a new paid route is the same config, copied. tUSDM is
        a self-serve claim at tusdm.moneta.global.
      </footer>
    </main>
  );
}
