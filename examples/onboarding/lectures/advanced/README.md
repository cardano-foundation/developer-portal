# Onboarding Advanced: the example contracts

The contracts the onboarding **Advanced** lectures have you write, finished and tested. Each lecture
tells you which folder it uses. Every project except `oracle` is on-chain code with its tests, and
needs no wallet and no network.

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
aiken check    # compile + run the tests in all three files
aiken build    # regenerate plutus.json
```

## splitter (lecture 1, Detecting vulnerabilities)

A shared pot: anyone may donate to it, and a split pays every benefactor an equal share of everything it
holds. Two files:

- `validators/splitter_open.ak`: the contract as first written. A donation only has to leave the pot
  holding at least as much of every asset. Its last two tests are the attack: a donation of dust tokens,
  which **passes**, and a split of a pot holding 60 of them, whose memory cost is over the maximum a
  transaction may use.
- `validators/splitter.ak`: the door closed. A donation may add ADA and nothing else, and the dust
  donation test is marked `fail`.

`splitter.ak` also holds the property from lecture 3, Higher assurance: every generated donation that
adds a token is refused.

## vault (lecture 1, Detecting vulnerabilities)

A vault that belongs to one owner, where anybody may donate ADA. Two files:

- `validators/vault_open.ak`: the contract as first written. A donation checks only the payment part of
  the address the vault goes back to. Its last test is the attack, a donation that moves the vault to an
  address with the attacker's stake key, and that test **passes**.
- `validators/vault.ak`: the door closed. A donation puts the vault back at exactly the address it came
  from, and the attack test is marked `fail`.

`vault.ak` also holds the two properties from lecture 3, Higher assurance: a donation to an address
with any other stake part is refused, and an honest donation to a vault at any address is accepted.

```bash
cd splitter/on-chain/aiken   # or vault/on-chain/aiken
aiken check
aiken build
```

## atomic-swap (lecture 2, Optimization)

The swap from the onboarding tutorial, with a price in lovelace that may be paid across several
outputs, each tagged with the offer's output reference. Four files hold the same contract at four
moments, each one the previous plus a single change inside the function that checks the payment:

- `validators/swap.ak`: as first written. It filters the outputs, then adds up what the filter kept,
  and thirty offers in one transaction go over the memory limit.
- `validators/swap_one_pass.ak`: one walk over the outputs does both jobs.
- `validators/swap_address_first.ak`: the address is compared before the tag is read.
- `validators/swap_stop_early.ak`: the walk stops as soon as the price is covered.

```bash
cd atomic-swap/on-chain/aiken
aiken check                 # the tests of all four, with the memory and CPU of each
aiken bench --max-size 50   # how each one grows, and where it crosses the budget
aiken build                 # regenerate plutus.json
```

## oracle (lecture 4, Going to production)

The oracle and its consumer from the Intermediate lectures, taken to Preprod. The three validators
compile to the same code as in Intermediate. What changes is who runs what:

- `on-chain/aiken/validators/never.ak`: a validator that refuses every spend. The consumer's
  reference script is published at its address, where nobody can spend it.
- `off-chain/mesh/scripts/`: the operator's side, run with Node. `operator:new` creates the
  operator's key, `deploy` mints the beacon, locks the first rate, publishes the consumer's script and
  writes `deployments/<network>.json`, `update` publishes a new rate, and `monitor` checks the live
  deployment and exits with 1 when a check fails.
- `off-chain/mesh/src/app.tsx`: the users' side, a page that reads the deployment record, the rate,
  and locks and unlocks ADA at the consumer through the published script.

The compiled blueprint is committed and copied into `off-chain/mesh/blueprints/`. To rebuild it:

```bash
cd oracle/on-chain/aiken
aiken check
aiken build
cp plutus.json ../../off-chain/mesh/blueprints/oracle.plutus.json
```

The off-chain side needs a Blockfrost key for the network, a funded operator key, and Lace for the page:

```bash
cd oracle/off-chain/mesh
npm install
cp .env.example .env      # your Blockfrost Preprod key
npm run operator:new      # put the phrase it prints in .env, fund the address it prints
npm run deploy
npm run dev               # the page, for users
npm run monitor           # the operator's health check
npm test                  # the builders and the checks, offline
```
