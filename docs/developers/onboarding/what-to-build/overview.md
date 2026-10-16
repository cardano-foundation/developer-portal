---
title: "What to build"
sidebar_label: "What to build"
description: "Real things you can build on Cardano, who is building them today, and the open spaces nobody has filled yet."
---

import DocCard from '@theme/DocCard';
import BuildIdea from '@site/src/components/BuildIdea';

# What to build

Cardano is a platform for building things people can **own, trust, and exchange** directly, without a bank, a platform, or a middleman sitting in between, taking a cut, and holding all the keys. You don't need to be a crypto expert to build something useful on it.

The tools are ready; many of the products are not. [AlphaGrowth's ecosystem audit](https://blue-careful-catshark-349.mypinata.cloud/ipfs/bafybeibw2hkvqy7bjb3j2rvirhexgf42prquwm4ci4qpcjk2zox7n3axpa) (September 2026) scored Cardano against other chains across 25 categories, and the only one at its benchmark is smart contract languages, SDKs, and libraries. Each card below lists projects live today and, where the audit found one, the **open spaces**: capabilities it did not observe in production on Cardano.

## Payments and finance

<BuildIdea
  title="Payments and stablecoins"
  description="Accept and send money anywhere in seconds, with fees measured in cents. Payroll, remittances, in-app purchases, or a stablecoin of your own, with no card networks or banking rails to wire up."
  live={[
    {label: 'USDM', href: 'https://moneta.global'},
    {label: 'Djed', href: 'https://djed.xyz'},
    {label: 'USDA', href: 'https://anzens.com'},
  ]}
  gaps={[
    'Invoicing and business payments',
    'Card and app-wallet acceptance',
    'Branded stablecoin issuance',
    'Yield-bearing stablecoin',
    'Loyalty and gift cards',
  ]}
  sections="2.12, 2.22, 2.25, 2.27"
/>

<BuildIdea
  title="Trading"
  description="Exchanges where code, not a company, holds the funds: swap one token for another, provide liquidity, or trade derivatives."
  live={[
    {label: 'Minswap', href: 'https://minswap.org'},
    {label: 'SundaeSwap', href: 'https://sundae.fi'},
    {label: 'Splash', href: 'https://splash.trade'},
    {label: 'Strike', href: 'https://strikefinance.org'},
  ]}
  gaps={[
    'Concentrated liquidity',
    'Automated liquidity management',
    'Options and derivatives',
    'Shared order-execution network',
    'Secondary markets for LP and vault positions',
  ]}
  sections="2.4, 2.7, 2.8, 2.14, 2.28"
/>

<BuildIdea
  title="Lending and yield"
  description="Lend, borrow, and earn on assets, with collateral and interest rules enforced by code and no middleman holding the funds."
  live={[
    {label: 'Liqwid', href: 'https://liqwid.finance'},
    {label: 'Indigo', href: 'https://indigoprotocol.io'},
  ]}
  gaps={[
    'Curated lending markets',
    'Shared vault standard',
    'Liquid staked ADA',
    'Yield on posted collateral',
    'On-chain insurance',
    'Benchmark interest rate',
  ]}
  sections="2.5, 2.6, 2.10, 2.17, 2.24, 2.28"
/>

## Assets and ownership

<BuildIdea
  title="Tokens, NFTs, and real-world assets"
  description="Launch a token, sell art or memberships that buyers own and resell with a royalty to the creator, issue tickets that can't be forged, or turn property and invoices into shares people can own a fraction of."
  live={[
    {label: 'SNEK', href: 'https://www.snek.com'},
  ]}
  gaps={[
    'NFT marketplace',
    'Token launchpad',
    'Real-world assets and credit',
    'Tokenized compute',
  ]}
  sections="2.16, 2.18, 2.19, 2.23"
/>

<BuildIdea
  title="Identity and provenance"
  description="Let people prove who they are or what they've earned without handing over more data than necessary, and let anyone verify a product is genuine, from its origin to the shelf."
  live={[
    {label: 'Identus', href: 'https://www.hyperledger.org/projects/identus'},
  ]}
/>

## Users and organizations

<BuildIdea
  title="Wallets and onboarding"
  description="The front door to every app: wallets, sign-in, and the campaigns that bring new users in."
  live={[
    {label: 'Lace', href: 'https://www.lace.io'},
    {label: 'Eternl', href: 'https://eternl.io'},
  ]}
  gaps={[
    'One wallet for EVM and Cardano',
    'Transaction preview before signing',
    'Social-login onboarding',
    'Incentive campaign engine',
    'Integration pathway for Web2 businesses',
  ]}
  sections="2.2, 2.3, 2.26"
/>

<BuildIdea
  title="Treasuries and governance"
  description="Let a team, a DAO, or a whole community pool its funds and decide together, out in the open, how to spend them."
  gaps={[
    'Smart accounts with spending policies',
  ]}
  sections="2.15"
/>

<BuildIdea
  title="AI agents"
  description="Software agents that pay for services, sell their own, and act on-chain on behalf of their users."
  live={[
    {label: 'Masumi', href: 'https://www.masumi.network'},
  ]}
  gaps={[
    'Agents that use DeFi under bounded key permissions',
  ]}
  sections="2.20"
/>

## Infrastructure

<BuildIdea
  title="Oracles, bridges, and security"
  description="The services other builders pay for: price feeds, routes to other chains, and monitoring that catches an exploit while it happens."
  live={[
    {label: 'Charli3', href: 'https://charli3.io'},
    {label: 'Orcfax', href: 'https://orcfax.io'},
  ]}
  gaps={[
    'Independent price feeds',
    'EVM-to-Cardano bridge',
    'Bridge aggregation',
    'Runtime exploit detection',
  ]}
  sections="2.1, 2.13, 2.21"
/>

## Ready to build?

<div className="row margin-bottom--md">
  <div className="col col--6">
    <DocCard item={{type: 'link', href: '/docs/developers/onboarding/get-started/overview', label: 'Get started', description: 'Scaffold a new project in minutes.'}} />
  </div>
  <div className="col col--6">
    <DocCard item={{type: 'link', href: '/docs/developers/onboarding/tutorial/overview', label: 'Build a swap', description: 'Learn by doing in the step-by-step Tutorial.'}} />
  </div>
</div>
