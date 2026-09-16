# Onboarding Advanced: the example contracts

The contracts the onboarding **Advanced** lectures have you write, finished and tested. Each lecture
tells you which folder it uses. Nothing here needs a wallet or a network: every project is on-chain
code with its tests.

Get just this folder (no need to clone the whole repo):

```bash
npx giget@latest gh:cardano-foundation/developer-portal/examples/onboarding/lectures/advanced advanced
cd advanced
```

## giftcard-shop (lecture 1, Detecting vulnerabilities)

The Intermediate gift card grown into a shop that issues many cards, with one UTxO behind each card.
Three files hold the same contract at three moments:

- `validators/giftcard_shop_open.ak`: the contract as first written. Its last test is the first attack,
  one burned card releasing two locked UTxOs, and that test **passes**.
- `validators/giftcard_shop.ak`: the first door closed. The spend handler counts the locked UTxOs being
  spent, the first attack test is marked `fail`, and a test with two burned cards passes instead. Its
  last test is the second attack, a card releasing the UTxO locked behind a different card, and that
  test **passes**.
- `validators/giftcard_shop_named.ak`: both doors closed. Every card has its own name, the locked UTxO
  carries that name in its datum, and the spend handler counts per name. Both attack tests are marked
  `fail`.

```bash
cd giftcard-shop/on-chain/aiken
aiken check    # compile + run the tests in both files
aiken build    # regenerate plutus.json
```
