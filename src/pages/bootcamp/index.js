import React from "react";
import Layout from "@theme/Layout";
import BootcampLanding from "@site/src/components/BootcampLanding";

const TITLE = "Cardano Bootcamp";
const DESCRIPTION = "The end-to-end Cardano developer journey. Theory, smart contracts, design patterns, security.";

export default function BootcampPage() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <BootcampLanding />
    </Layout>
  );
}
