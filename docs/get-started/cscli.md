---
id: cscli
title: Get Started with cscli
sidebar_label: cscli
description: Get Started with cscli
image: /img/og/og-getstarted-cscli.png
--- 

`cscli` is a lightweight cross-platform CLI tool for Cardano supporting the following features out of the box:
 - Building and serialising wallet primitives (i.e. recovery-phrases, keys, addresses and transactions) 
 - Live querying of accounts, addresses, transactions and native assets across both Testnet and Mainnet networks
 - Submitting transactions to the Testnet or Mainnet network
 - Cryptographic and encoding transformations (blake2b, bech32, etc.)

## Advantages

Why would you use `cscli` in addition to `cardano-cli`, `cardano-address`, `cardano-wallet` and a host of other tools?
 - Simple installation and powerful commands with **no dependencies** on a local full node or other tools/sdks
 - Easy recovery-phrase (aka mnemonic) based key and address derivation for [Hierarchical Deterministic (HD) wallets](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki), perfect for offline management
 - [Passphrase](https://vault12.com/securemycrypto/crypto-security-basics/what-is-a-passphrase/passphrases-increase-your-protection-and-your-risk) support for additional root key security
 - [International multi-language](https://github.com/CardanoSharp/cardanosharp-wallet/tree/main/CardanoSharp.Wallet/Words) support for [recovery-phrases](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
 - Generates compatible outputs for `cardano-cli`, `cardano-address` and `cardano-wallet`

## Getting Started

Download the platform-specific binaries from the [latest release](https://github.com/CardanoSharp/cscli/releases) and run. Alternatively build from source following the [instructions on GitHub](https://github.com/CardanoSharp/cscli#as-a-net-global-tool-or-built-from-source).

## Overview and Help
```console
$ cscli --help
cscli v0.3.0
A lightweight cross-platform tool for building and serialising Cardano wallet entities (i.e. recovery-phrases, keys, addresses and transactions), querying the chain and submitting transactions to the testnets or Mainnet. Please refer to https://github.com/CardanoSharp/cscli for further documentation.

USAGE: cscli (OPTION | COMMAND)

Options:
    -v, --version   Show the cscli version
    -h, --help      Show this help text

Wallet commands:
    wallet recovery-phrase generate --size <size> [--language <language>]
    wallet key root derive --recovery-phrase "<string>" [--language <language>] [--passphrase "<string>"]
    wallet key account derive --recovery-phrase "<string>" [--language <language>] [--passphrase "<string>"] [--account-index <index>]
    wallet key stake derive --recovery-phrase "<string>" [--account-index <index>] [--address-index <index>]
    wallet key payment derive --recovery-phrase "<string>" [--account-index <index>] [--address-index <index>]
    wallet key policy derive --recovery-phrase "<string>" [--policy-index <index>] 
    wallet key verification convert --signing-key "<bech32_skey>" 
    wallet address stake derive --recovery-phrase "<string>" --network <network> [--account-index <index>] [--address-index <index>]
    wallet address payment derive --recovery-phrase "<string>" --network <network> --payment-address-type <payment-address-type> [--account-index <index>] [--address-index <index>] [--stake-account-index <index>] [--stake-address-index <index>]

Query commands:
    query tip --network <network>
    query protocol-parameters --network <network>
    query info account --network <network> [--stake-address <stake_address> | --address <payment_base_address>]
    query asset account --network <network> --stake-address <stake_address>
    query info address --network <network> --address <payment_address>
    query info transaction --network <network> --tx-id <transaction_id>

Transaction Commands:
    transaction submit --network <network> --cbor-hex <hex_string>
    BETA: transaction simple-payment build --network <network> --from <address> --to <address> --amount <ada_amount> [--signing-key <bech32_skey>] [--submit (true | false)] [--message <message>] [--out-file <output_path>] 
    BETA: transaction view --cbor-hex <hex_string>

Encoding/Cryptography Commands:
    bech32 encode --value <hex_string> --prefix <string>
    bech32 decode --value <bech32_string>
    blake2b hash --value <hex_string> [--length <digest_length>]

Arguments:
    <size> ::= 9 | 12 | 15 | 18 | 21 | 24(default)
    <language> ::= english(default)|chinesesimplified|chinesetraditional|french|italian|japanese|korean|spanish|czech|portuguese
    <derivation-index> ::= 0(default) | 1 | .. | 2147483647
    <network> ::= testnet | mainnet
    <payment-address-type> ::= enterprise | base
    <digest_length> ::= 160 | 224(default) | 256 | 512
```

## Wallet Commands

### Generate Recovery Phrase
:::caution

Note: Recovery-phrases and keys should ideally be generated and stored in airgapped machines 

:::

```console
$ cscli wallet recovery-phrase generate | tee phrase.en.prv
more enjoy seminar food bench online render dry essence indoor crazy page eight fragile mango zoo burger exhibit crouch drop rocket property alter uphold
```

<details>
  <summary>Generating a recovery phrase in Spanish</summary>

```console
$ cscli wallet recovery-phrase generate --language spanish | tee phrase.es.prv
solución aborto víspera puma molino ático ética feroz hacer orador salero baba carbón lonja texto sanción sobre pasar iris masa vacuna diseño pez playa
```
</details>

### Derive Root Key
```console
$ cscli wallet key root derive --recovery-phrase "$(cat phrase.en.prv)" | tee root.en.xsk
root_xsk12qpr53a6r7dpjpu2mr6zh96vp4whx2td4zccmplq3am6ph6z4dga6td8nph4qpcnlkdcjkd96p83t23mplvh2w42n6yc3urav8qgph3d9az6lc0px7xq7sau4r4dsfp9h0syfkhge8e6muhd69vz9j6fggdhgd4e
```

### Derive Account Key
```console
$ cscli wallet key account derive --recovery-phrase "$(cat phrase.en.prv)" | tee acct_0.en.xsk
acct_xsk13pfkzdyzuagmsquy0xjvszdxdjt84x49yrmvt2f3z8ndp6zz4dgka03j3ctm4gne9s5gullvjd7kynxxkny4qwyuuup2mcjfztctswdu3zp4s3ps5dskaq929vrp6cw8z3u77x7mymgntjw46f4l9kh3mcvg78y9
```

<details>
  <summary>Account Key with Specific Index</summary>

```console
$ cscli wallet key account derive --recovery-phrase "$(cat phrase.en.prv)" --account-index 96884067 | tee acct_96884067.en.xsk
acct_xsk1vzcpqwahy0asxuua4gswzjagmt5awjepy9clhmvtr8tgpejz4dglkfl7zhunx0dcrvljtmgcx59yzv728wlxllp646qudhgkuaj3xycu4pkysaaau0lm4z2s8t2yum7nyfn99e3xxrwgaz5yt367r8638uetazlu
```
</details>

### Derive Payment Key
```console
$ cscli wallet key payment derive --recovery-phrase "$(cat phrase.en.prv)" | tee pay_0_0.en.xsk
addr_xsk1fzw9r482t0ekua7rcqewg3k8ju5d9run4juuehm2p24jtuzz4dg4wpeulnqhualvtx9lyy7u0h9pdjvmyhxdhzsyy49szs6y8c9zwfp0eqyrqyl290e6dr0q3fvngmsjn4aask9jjr6q34juh25hczw3euust0dw
```
<details>
  <summary>Payment Key with Custom Indexes</summary>

```console
$ cscli wallet key payment derive --recovery-phrase "$(cat phrase.en.prv)" --account-index 569 --address-index 6949 | tee pay_569_6949.en.xsk
addr_xsk1kzjky39hv28q30qecg46f3cag3nwsjnnvn5uf0jtkrsxau2z4dgssyrv8jfwdh6frfkd0hskhszcf98xskje0c6ttcnz7k2cwdmc62uv7k6w7nwdcngkwn0semehjsdaajlv2nr5c0rg077dnsyjwxm05vhkuqet
```
</details>
<details>
  <summary>Payment Key with cardano-cli Output Key Files</summary>

```console
$ cscli wallet key payment derive --recovery-phrase "$(cat phrase.en.prv)" --signing-key-file pay_0_0.en.skey --verification-key-file pay_0_0.en.vkey | tee pay_0_0.en.xsk
addr_xsk1kzjky39hv28q30qecg46f3cag3nwsjnnvn5uf0jtkrsxau2z4dgssyrv8jfwdh6frfkd0hskhszcf98xskje0c6ttcnz7k2cwdmc62uv7k6w7nwdcngkwn0semehjsdaajlv2nr5c0rg077dnsyjwxm05vhkuqet
$ cat pay_0_0.en.skey
{
  "type": "PaymentExtendedSigningKeyShelley_ed25519_bip32",
  "description": "Payment Signing Key",
  "cborHex": "5880489c51d4ea5bf36e77c3c032e446c79728d28f93acb9ccdf6a0aab25f042ab5157073cfcc17e77ec598bf213dc7dca16c99b25ccdb8a04254b0143443e0a2724de9503426759fa18624657f5bcc932f38220ec9eceb262907caf2d198b6e0faa2fc8083013ea2bf3a68de08a59346e129d7bd858b290f408d65cbaa97c09d1cf"
}
$ cat pay_0_0.en.vkey
{
  "type": "PaymentExtendedVerificationKeyShelley_ed25519_bip32",
  "description": "Payment Verification Key",
  "cborHex": "5840de9503426759fa18624657f5bcc932f38220ec9eceb262907caf2d198b6e0faa2fc8083013ea2bf3a68de08a59346e129d7bd858b290f408d65cbaa97c09d1cf"
}
```
</details>
<details>
  <summary>Payment Key from Spanish recovery-phrase with custom passphrase</summary>

```console
$ cscli wallet key payment derive --language spanish --recovery-phrase "$(cat phrase.es.prv)" --passphrase "/\\/\\`/ |\\|4/\\/\\3 !5 02`//\\/\\4|\\||)!45, |<!|\\|9 0|= |<!|\\|95" --signing-key-file pay_0_0.es.skey --verification-key-file pay_0_0.es.vkey | tee pay_0_0.es.xsk
addr_xsk15pt6dccwyy2jjgmv9gxszjyzc6kchhas2dr9q6ky0xpwz4679e2t5qu0yehpmg7xr3sc3wkcyagujlk2euwl0007w68wcfdm7ajl2tzkqve7vmqds5sf38syns3u2wey05yeh70p9m5n05kftku30uqjlqy0gjh2
$ cat pay_0_0.es.skey
{
  "type": "PaymentExtendedSigningKeyShelley_ed25519_bip32",
  "description": "Payment Signing Key",
  "cborHex": "5880a057a6e30e211529236c2a0d014882c6ad8bdfb05346506ac47982e1575e2e54ba038f266e1da3c61c6188bad82751c97ecacf1df7bdfe768eec25bbf765f52ca592e0a3f8f0be44c9d65c0ac5347206b32b73ed45ba4e704014c269e2560db9560333e66c0d8520989e049c23c53b247d099bf9e12ee937d2c95db917f012f8"
}
$ cat pay_0_0.es.vkey
{
  "type": "PaymentExtendedVerificationKeyShelley_ed25519_bip32",
  "description": "Payment Verification Key",
  "cborHex": "5840a592e0a3f8f0be44c9d65c0ac5347206b32b73ed45ba4e704014c269e2560db9560333e66c0d8520989e049c23c53b247d099bf9e12ee937d2c95db917f012f8"
}
```
</details>

### Derive Stake Key
```console
$ cscli wallet key stake derive --recovery-phrase "$(cat phrase.en.prv)" | tee stake_0_0.en.xsk
stake_xsk1xr5c8423vymrfvrqz58wqqtpekg8cl2s7zvuedeass77emzz4dgs32nfp944ljxw86h7wkxcrut8gr8qmql8gvc9slc8nj9x47a6jtaqqxf9ywd4wfhrzv4c54vcjp827fytdzrxs3gdh5f0a0s7hcf8a5e4ay8g
```

<details>
  <summary>Stake Key with Custom Indexes</summary>

```console
$ cscli wallet key stake derive --recovery-phrase "$(cat phrase.en.prv)" --account-index 968 --address-index 83106 | tee stake_968_83106.en.xsk
stake_xsk14p0lhj3txvfcj8j08dk3ur954hmcfz6u6t00q0a3vnrsd7zz4dgcy9dwcxgf67v4rdp4mk9tkeqw70y4m7va73thnel7jwyx0achc5tyyx8r2au5x3pw37zhznj03v2cajc96paltxlh8hpefssucyecus24q26n
```
</details>
<details>
  <summary>Stake Key with cardano-cli Output Key Files</summary>

```console
$ cscli wallet key stake derive --recovery-phrase "$(cat phrase.en.prv)" --signing-key-file stake_0_0.en.skey --verification-key-file stake_0_0.en.vkey | tee stake_0_0.en.xsk
stake_xsk14p0lhj3txvfcj8j08dk3ur954hmcfz6u6t00q0a3vnrsd7zz4dgcy9dwcxgf67v4rdp4mk9tkeqw70y4m7va73thnel7jwyx0achc5tyyx8r2au5x3pw37zhznj03v2cajc96paltxlh8hpefssucyecus24q26n
$ cat stake_0_0.en.skey
{
  "type": "StakeExtendedSigningKeyShelley_ed25519_bip32",
  "description": "Stake Signing Key",
  "cborHex": "588030e983d551613634b060150ee00161cd907c7d50f099ccb73d843decec42ab5108aa69096b5fc8ce3eafe758d81f16740ce0d83e74330587f079c8a6afbba92f1bd85ec71d2d8ce0180138310983aafffa4585486db1576bc385b0ae350562e6a001925239b5726e3132b8a5598904eaf248b688668450dbd12febe1ebe127ed"
}
$ cat stake_0_0.en.vkey
{
  "type": "StakeVerificationKeyShelley_ed25519",
  "description": "Stake Verification Key",
  "cborHex": "58201bd85ec71d2d8ce0180138310983aafffa4585486db1576bc385b0ae350562e6"
}
```
</details>

### Derive Stake/Reward Address
```console
$ cscli wallet address stake derive --recovery-phrase "$(cat phrase.en.prv)" --network mainnet | tee stake_0_0.en.addr
stake1u9wqktpz964g6jaemt5wr5tspy9cqxpdkw98d022d85kxxc2n2yxj
```

<details>
  <summary>Stake Address with Custom Indexes</summary>

```console
$ cscli wallet address stake derive --recovery-phrase "$(cat phrase.en.prv)" --network mainnet --account-index 1 --address-index 7 | tee stake_1_7.en.addr
stake1u87phtdn9shvp39c44elyfdduuqg7wz072vs0vjvc20hvaqym7xan
```
</details>
<details>
  <summary>Stake Address from Spanish recovery-phrase with custom passphrase</summary>

```console
$ cscli wallet address stake derive --language spanish --recovery-phrase "$(cat phrase.es.prv)" --passphrase "/\\/\\`/ |\\|4/\\/\\3 !5 02`//\\/\\4|\\||)!45, |<!|\\|9 0|= |<!|\\|95" --network testnet | tee stake_0_0.es.addr
stake_test1uztkvps54v3yrwvxhvfz9uph8g6e2zd8jcg2cyss45g7xqclj4scq
```
</details>

### Derive Payment Enterprise Address
```console
$ cscli wallet address payment derive --recovery-phrase "$(cat phrase.en.prv)" --payment-address-type enterprise --network mainnet | tee pay_0_0.en.addr
addr1vy5zuhh9685fup86syuzmu3e6eengzv8t46mfqxg086cvqqrukl6w
```

<details>
  <summary>Payment Enterprise Address with Custom Indexes</summary>

```console
$ cscli wallet address payment derive --recovery-phrase "$(cat phrase.en.prv)" --payment-address-type enterprise --network mainnet --account-index 1387 --address-index 12 | tee pay_1387_12.en.addr
addr1vy3y89nnzdqs4fmqv49fmpqw24hjheen3ce7tch082hh6xcc8pzd9
```
</details>

### Derive Payment Base Address
```console
$ cscli wallet address payment derive --recovery-phrase "$(cat phrase.en.prv)" --payment-address-type base --network mainnet | tee pay_0_0_0_0.en.addr
addr1qy5zuhh9685fup86syuzmu3e6eengzv8t46mfqxg086cvqzupvkzyt42349mnkhgu8ghqzgtsqvzmvu2w675560fvvdspma4ht
```

<details>
  <summary>Payment Base Address with Custom Indexes</summary>

```console
$ cscli wallet address payment derive --recovery-phrase "$(cat phrase.en.prv)" --payment-address-type base --network mainnet --account-index 1387 --address-index 12 --stake-account-index 968 --stake-address-index 83106 | tee pay_1387_12_968_83106.en.addr
addr1qy3y89nnzdqs4fmqv49fmpqw24hjheen3ce7tch082hh6x7nwwgg06dngunf9ea4rd7mu9084sd3km6z56rqd7e04ylslhzn9h
```
</details>
<details>
  <summary>Payment Base Address from Spanish recovery-phrase with custom passphrase</summary>

```console
$ cscli wallet address payment derive --language spanish --recovery-phrase "$(cat phrase.es.prv)" --passphrase "/\\/\\`/ |\\|4/\\/\\3 !5 02`//\\/\\4|\\||)!45, |<!|\\|9 0|= |<!|\\|95" --network testnet --payment-address-type base | tee pay_0_0_0_0.es.addr
addr_test1qpvttg5263dnutj749k5dcr35yk5mr94fxx0q2zs2xeuxq5hvcrpf2ezgxucdwcjytcrww34j5y609ss4sfpptg3uvpsxmcdtf
```
</details>

### Derive Policy Key
```console
$ cscli wallet key policy derive --recovery-phrase "$(cat phrase.en.prv)" | tee policy_0.en.sk
policy_sk1trt3shjrd4gy70q4m2ejgjgsdzwej4whc4r2trrcwedlpm6z4dglxl4nycrd8fptxrkye3tl3q29euxlqj7zndk9cfg4tskqlnp90uqwjqz02
```
<details>
  <summary>Policy Key with Custom Indexes</summary>

```console
$ cscli wallet key policy derive --recovery-phrase "$(cat phrase.en.prv)" --policy-index 88 | tee policy_88.en.xsk
policy_sk1tz5k03lravcx7ecjveg6j0ndyydma2a89ny4zkmvzvpz4u6z4dgkxctdpcvhjvjl3j4peywe4l25zu4672eg5qsluz36z5mgm4n2ftg3nhmyd
```
</details>
<details>
  <summary>Policy Key with cardano-cli Output Key Files</summary>

```console
$ cscli wallet key policy derive --recovery-phrase "$(cat phrase.en.prv)" --signing-key-file policy_0.skey --verification-key-file policy_0.vkey | tee policy_0.xsk
policy_sk1trt3shjrd4gy70q4m2ejgjgsdzwej4whc4r2trrcwedlpm6z4dglxl4nycrd8fptxrkye3tl3q29euxlqj7zndk9cfg4tskqlnp90uqwjqz02
$ cat policy_0.skey
{
  "type": "PaymentExtendedSigningKeyShelley_ed25519_bip32",
  "description": "Payment Signing Key",
  "cborHex": "588058d7185e436d504f3c15dab3244910689d9955d7c546a58c78765bf0ef42ab51f37eb32606d3a42b30ec4cc57f88145cf0df04bc29b6c5c25155c2c0fcc257f0f4145721658fe51d9e2f05fe131c66a42eedaff2bb60e6c892cac23bf284ef6ed1e8fc6b2fbf0ff79876723feea8bfa2e683318657f34480e1e16686bb442029"
}
$ cat policy_0.vkey
{
  "type": "PaymentExtendedVerificationKeyShelley_ed25519_bip32",
  "description": "Payment Verification Key",
  "cborHex": "5840f4145721658fe51d9e2f05fe131c66a42eedaff2bb60e6c892cac23bf284ef6ed1e8fc6b2fbf0ff79876723feea8bfa2e683318657f34480e1e16686bb442029"
}
```
</details>

### Convert Signing to Verification Key 
```console
$ cscli wallet key verification convert --signing-key $(cat pay_0_0.en.xsk) | tee pay_0_0.en.xvk
addr_xvk1m62sxsn8t8apscjx2l6mejfj7wpzpmy7e6ex9yru4uk3nzmwp74zljqgxqf752ln56x7pzjex3hp98tmmpvt9y85prt9ew4f0syarncveq5jl
```

<details>
  <summary>Verification Key with cardano-cli Output Key Files</summary>

```console
$ cscli wallet key verification convert --signing-key $(cat stake_0_0.en.xsk) --verification-key-file stake_0_0.en.vkey | tee stake_0_0.en.xvk
stake_xvk1r0v9a3ca9kxwqxqp8qcsnqa2llaytp2gdkc4w67rskc2udg9vtn2qqvj2gum2unwxyet3f2e3yzw4ujgk6yxdpzsm0gjl6lpa0sj0mg4tq9sj
$ cat stake_0_0.en.vkey
{
  "type": "StakeVerificationKeyShelley_ed25519",
  "description": "Stake Verification Key",
  "cborHex": "58201bd85ec71d2d8ce0180138310983aafffa4585486db1576bc385b0ae350562e6"
}
```
</details>

## Query Commands

### Query Tip
```console
$ cscli query tip --network mainnet
{
  "hash": "cffd3acb9728066a92fe033f73a7d86957b8a0e35dce4b7013f9a9a2fd272929",
  "epoch_no": 345,
  "abs_slot": 64056977,
  "epoch_slot": 380177,
  "block_no": 7394590,
  "block_time": "2022-06-19T07:21:08"
}
```

### Query Protocol Parameters
```console
$ cscli query protocol-parameters --network mainnet
{
  "epoch_no": 345,
  "min_fee_a": 44,
  "min_fee_b": 155381,
  ...
  "coins_per_utxo_word": 34482
}    
```

### Query Account Info
```console
$ cscli query info account --network mainnet --stake-address stake1uyrx65wjqjgeeksd8hptmcgl5jfyrqkfq0xe8xlp367kphsckq250
[
  {
    "status": "registered",
    "delegated_pool": "pool14wk2m2af7y4gk5uzlsmsunn7d9ppldvcxxa5an9r5ywek8330fg",
    "total_balance": "1126364036992",
    "utxo": "1120067931255",
    "rewards": "90668729339",
    "withdrawals": "84372623602",
    "rewards_available": "6296105737",
    "reserves": "0",
    "treasury": "0"
  }
]
```
<details>
  <summary>Query Account Info of Payment Address (requires base address)</summary>

```console
$ cscli query info account --network mainnet --address addr1q9r4307pqxq93fh554yvfssha46atz7h8waha568d8ddvnktwkkz3tg57qd9knlsfyhlgjuxpyxhl09u2w8f4l20hk2q7dt678
[
  {
    "status": "registered",
    "delegated_pool": "pool1ddg6t2h9kj6lqlec4ncjs945lzj43m3ggrgdhf5sgzhtygpkznz",
    "total_balance": "7031456885",
    "utxo": "7019386794",
    "rewards": "56497309",
    "withdrawals": "44427218",
    "rewards_available": "12070091",
    "reserves": "0",
    "treasury": "0"
  }
]
```
</details>

### Query Account Asset 
```console
$ cscli query asset account --network testnet --stake-address $(cat stake_0_0.es.addr)
[
  {
    "asset_policy": "540f107c7a3df20d2111a41c3bc407cce3e63c10c8dd673d51a02c22",
    "asset_name": "COND1",
    "quantity": "1"
  }
]
```
<details>
  <summary>Query Account Asset of Payment Address (requires base address)</summary>

```console
$ cscli query asset account --network testnet --address $(cat pay_0_0_0_0.es.addr)
[
  {
    "asset_policy": "540f107c7a3df20d2111a41c3bc407cce3e63c10c8dd673d51a02c22",
    "asset_name": "COND1",
    "quantity": "1"
  }
]
```
</details>

### Query Address Info 
```console
$ cscli query info address --network testnet --address $(cat pay_0_0_0_0.es.addr)
{
  "balance": "1001344798",
  "stake_address": "stake_test1uztkvps54v3yrwvxhvfz9uph8g6e2zd8jcg2cyss45g7xqclj4scq",
  "utxo_set": [ ... ]
}
```

### Query Transaction Info 
```console
$ cscli query info transaction --network testnet --txid 4fe73db7e345f6853ade214b0779d5db51f9a4b5e296198d3cb84b7b707e7d34
[
  {
    "tx_hash": "4fe73db7e345f6853ade214b0779d5db51f9a4b5e296198d3cb84b7b707e7d34",
    "block_hash": "e96c400f303d2f30f7b49761b1c541b5a29b43ddb28268a1f179b2877f828aad",
    ...
    "inputs": [ ... ],
    "outputs": [ ... ],
    ...
  }
]
```

## Transaction Commands

### Submit Transaction
```console
$ cscli transaction submit --network testnet --cbor-hex 84a600818258207f1d24706e65b3eaef608d6ba5adf8b2bf69254bbd1e1532fa7c601a1d6aca3d000d8001828258390058b5a28ad45b3e2e5ea96d46e071a12d4d8cb5498cf0285051b3c30297660614ab2241b986bb1222f0373a359509a79610ac1210ad11e3031a05f5e10082581d60f3a76db98805ebfb391d8a7fa176e0a4da4d20955c47a5d35936353c1a35a23dbb021a0002ab45031a03831a6f0e80a1008182582047a69a1a41541c00a1e62ab8d78c1870e4f04c0507530b90c7dfde2a144d0cfa58406f50cd131250768a3b707e5eb5797e1dc519157e8c7ac27a72ac472fb546bc4604d3b51b2460e4517e28aea5fd0d19ddf8d95d9bf223e59f0306db0a7794d40af5f6
5c9f1456a2f7cdf30c12d569ede3f298b377115a63dc0cef791e692dbe4be26b
```

## Cryptography / Encoding Commands

### Bech32 Decode
```console
$ cscli bech32 decode --value "$(cat pay_0_0.en.addr)"
61282e5ee5d1e89e04fa81382df239d6733409875d75b480c879f58600
```

### Bech32 Encode
```console
$ cscli bech32 encode --value 61282e5ee5d1e89e04fa81382df239d6733409875d75b480c879f58600 --prefix addr
addr1vy5zuhh9685fup86syuzmu3e6eengzv8t46mfqxg086cvqqrukl6w
```

### Blake2b Hash
```console
$ cscli blake2b hash --length 224 --value de9503426759fa18624657f5bcc932f38220ec9eceb262907caf2d198b6e0faa  
282e5ee5d1e89e04fa81382df239d6733409875d75b480c879f58600
```
