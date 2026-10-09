import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "x402 on Cardano",
  description: "Payment-gated Next.js API routes via x402 on Cardano preprod.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
