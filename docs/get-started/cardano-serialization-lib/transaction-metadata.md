---
id: transaction-metadata
title: Transaction Metadata
sidebar_label: Transaction Metadata
description: Transaction Metadata with Cardano Serialization Lib
image: ./img/og-developer-portal.png
--- 

## Transaction Metadata format

Transaction after the Shelley hardfork can contain arbitrary transaction meta (**note:** this is NOT the same as pool metadata)

Transaction metadata takes the form of a map of metadatums, which are recursive JSON-like structures.

It is defined in [CDDL](https://tools.ietf.org/html/rfc8610), a schema grammar for representing [CBOR](https://tools.ietf.org/html/rfc7049) binary encoding as:
```
transaction_metadatum =
    { * transaction_metadatum => transaction_metadatum }
  / [ * transaction_metadatum ]
  / int
  / bytes .size (0..64)
  / text .size (0..64)

transaction_metadatum_label = uint

transaction_metadata =
  { * transaction_metadatum_label => transaction_metadatum }
```

For each use we use a metadatum label specific to our use into the `TransactionMetadatum` map. If we had a JSON object such as
```json
{
  "receiver_id": "SJKdj34k3jjKFDKfjFUDfdjkfd",
  "sender_id": "jkfdsufjdk34h3Sdfjdhfduf873",
  "comment": "happy birthday",
  "tags": [0, 264, -1024, 32]
}
```

There are 4 ways we can achieve this with different trade-offs:

1) Directly use: using the Metadata-related structures used in the library
2) JSON conversion: conversion to/from JSON using our utility functions
3) CDDL subset: writing a CDDL spec of this structure that is representable by that recursive metadatum CDDL
4) Raw bytes: encoding raw-bytes using our utility functions.

Each section will give examples of how to encode a similar structure. Understanding CDDL is only necessary for the last 2 options, but it is fairly simple to understand.

If your metadata schema is fixed and will be used frequently you should consider the CDDL spec option.
If your schema is not often used or used from many languages, the JSON option can be good as it is low set-up and fairly tech agnostic.
If your schema is very dynamic or non-existent, the direct use or JSON options are likely best.
The raw bytes option is only recommended if your data does not conform to the metadata format.

## Metadata limitations

These limitations are mentioned in the CDDL definition, but are worth also mentioning in prose:

- Strings must be at most 64 bytes when UTF-8 encoded.
- Bytestrings are hex-encoded, with a maximum length of 64 bytes.

## Direct use

Upsides:
* Flexible
* Readable by other methods

Downsides:
* Can be quite tedious to write
* Structural validation must be done by hand (partially)

As the metadatum structure is fairly expressive, we can directly use it using the structs in the metadata module of this library. These directly represent the types given in the CDDL. Namely:
* TransactionMetadatum - Can represent one of those 5 variant types.
* MetadataMap - The map variant that maps from metadatums to other metadatums. This is unordered and indexed by metadatums. This is like an object in JSON.
* MetadataList - An ordered list indexed starting at 0. This is like an array in JSON.

The variants for numbers, bytes and text are not specific to metadata and are directly used with the general `Int` type representing a signed or unsigned number, byte arrays accepting byte arrays/`Buffer`, and strings being JS strings.

We could construct the JSON example above with the following code:
```javascript
const map = CardanoWasm.MetadataMap.new();
map.insert(
  CardanoWasm.TransactionMetadatum.new_text("receiver_id"),
  CardanoWasm.TransactionMetadatum.new_text("SJKdj34k3jjKFDKfjFUDfdjkfd"),
);
map.insert(
  CardanoWasm.TransactionMetadatum.new_text("sender_id"),
  CardanoWasm.TransactionMetadatum.new_text("jkfdsufjdk34h3Sdfjdhfduf873"),
);
map.insert(
  CardanoWasm.TransactionMetadatum.new_text("comment"),
  CardanoWasm.TransactionMetadatum.new_text("happy birthday"),
);
const tags = CardanoWasm.MetadataList.new();
tags.add(CardanoWasm.TransactionMetadatum.new_int(CardanoWasm.Int.new(CardanoWasm.BigNum.from_str("0"))));
tags.add(CardanoWasm.TransactionMetadatum.new_int(CardanoWasm.Int.new(CardanoWasm.BigNum.from_str("264"))));
tags.add(CardanoWasm.TransactionMetadatum.new_int(CardanoWasm.Int.new_negative(CardanoWasm.BigNum.from_str("1024"))));
tags.add(CardanoWasm.TransactionMetadatum.new_int(CardanoWasm.Int.new(CardanoWasm.BigNum.from_str("32"))));
map.insert(
  CardanoWasm.TransactionMetadatum.new_text("tags"),
  CardanoWasm.TransactionMetadatum.new_list(tags),
);
const metadatum = CardanoWasm.TransactionMetadatum.new_map(map);
```

We could then parse the information back as such:
```javascript
try {
  const map = metadatum.as_map();
  const receiver = map.get(CardanoWasm.TransactionMetadatum.new_text("receiver_id"));
  const sender = map.get(CardanoWasm.TransactionMetadatum.new_text("sender_id"));
  const comment = map.get(CardanoWasm.TransactionMetadatum.new_text("comment"));
  const tags = map.get(CardanoWasm.TransactionMetadatum.new_text("tags"));
} catch (e) {
  // structure did not match
}
```

For decoding in a more exploratory manner we can check the types first as such:
```javascript
function parseMetadata(metadata) {
  // we must check the type first to know how to handle it
  switch (metadata.kind()) {
    case CardanoWasm.TransactionMetadatumKind.MetadataMap:
      const mapRet = new Map();
      const map = metadata.as_map();
      const keys = maps.keys();
      for (var i = 0; i < keys.len(); i += 1) {
        const key = keys.get(i);
        const value = parseMetadata(map.get(key);
        mapRet.set(key, value);
      }
      return mapRet;
    case CardanoWasm.TransactionMetadatumKind.MetadataList:
      let arrRet = [];
      const arr = metadata.as_list();
      for (var i = 0; i < arr.len(); i += 1) {
        const elem = parseMetadata(arr.get(i));
        arrRet.push(elem);
      }
      return arrRet;
    case CardanoWasm.TransactionMetadatumKind.Int:
      const x = metadata.as_int();
      // If the integer is too big as_i32() returns undefined
      // to handle larger numbers we need to use x.as_positive() / x.as_negative() and
      // convert from BigNums after checking x.is_positive() first
      return x.as_i32();
    case CardanoWasm.TransactionMetadatumKind.Bytes:
      return Buffer.from(metadata.as_bytes());
    case CardanoWasm.TransactionMetadatumKind.Text:
      return metadata.as_text();
  }
}
```
which recursively parses the `TransactionMetadatum` struct and transforms it into a JS `Map` / JS `object` structure by manually checking the types.


## JSON conversion

Upsides:
* Flexible
* Readable by other methods
* Lowest set-up work involved

Downsides:
* Does not support negative integers between `-2^64 + 1` and `-2^63` (serde_json library restriction)
* Structural validation must be done by hand
* Can use more space as string keyed maps are likely to be used more than arrays would be in the CDDL solutions

```javascript
const obj = {
  receiver_id: "SJKdj34k3jjKFDKfjFUDfdjkfd",
  sender_id: "jkfdsufjdk34h3Sdfjdhfduf873",
  comment: "happy birthday",
  tags: [0, 264, -1024, 32]
};
const metadata = CardanoWasm.encode_json_str_to_metadatum(JSON.stringify(obj), CardanoWasm.MetadataJsonSchema.NoConversions);
const metadataString = CardanoWasm.decode_metadatum_to_json_str(metadata, CardanoWasm.MetadataJsonSchema.NoConversions);
```

To support an extended set of metadata we also support 3 additional modes for JSON conversion following IOHK's [cardano-node JSON schemas](https://github.com/input-output-hk/cardano-node/blob/master/cardano-api/src/Cardano/Api/TxMetadata.hs).

The three modes are:
* `NoConversions` - Faithfully converts between the minimal shared feature set between JSON and Metadata
* `BasicConversions` - Adds additional support for byte(as hex strings)/integers (as strings) keys / byte (as hex strings) values.
* `DetailedSchema` - Can convert almost all metadata into a specific JSON schema but is very verbose on the JSON side.

Details on the formats can be found in our library's metadata module or in the `cardano-node` file linked above. `DetailedSchema` is likely most useful if you need to parse any possible kind of metadata into JSON specifically, possibly to display or for debugging.
For most reasonable schemas `NoConversions` should suffice, or `BasicConversions` if byte/string keys and byte values are needed.
If you are in charge of your own schema and you do not need arbitrary keys, it is recommended not to use `DetailedSchema` as it is significantly more complicated to use.

The additions of `BasicConversions` are demonstrated below
```json
{
  "0x8badf00d": "0xdeadbeef",
  "9": 5,
  "obj": {
    "a":[
      {
        "5": 2
      },
      {
      }
    ]
  }
}
```
which creates a map with 3 elements:
* 4 byte bytestring (0x8badf00d) => 4 byte bytestring (0xdeadbeef)
* int (9) => int (5)
* string ("obj") => object (string ("a") => list [ object (int (5) => int (2)), object (empty) ])

All bytestrings must be prefixed with "0x" or they will be treated as regular strings.
All strings that parse as an integer such as "125" will be treated as a metadata integer.

The `DetailedSchema` is here:
```json
{"map":[
  {
    "k":{"bytes":"8badf00d"},
    "v":{"bytes":"deadbeef"}
  },
  {
    "k":{"int":9},
    "v":{"int":5}
  },
  {
    "k":{"string":"obj"},
    "v":{"map":[
      {
        "k":{"string":"a"},
        "v":{"list":[
          {"map":[
            {
              "k":{"int":5},
              "v":{"int":2}
            }
          ]},
          {"map":[
          ]}
        ]}
      }
    ]}
  }
]}
```

All values are represented as an object with 1 field with the key tagging the type and the value being the value itself.
This is the exact same metadata as the `BasicConversions` example which should illustrate that it is much more verbose to use this format,
but it can represent every kind of metadata possible, including non-string/byte/int keys.
Do note that byte strings do not start with "0x", unlike with `BasicConversions`.

This additional freedom in keys can be seen here:
```json
{"map":[
  {
    "k":{"list":[
      {"map": [
        {
          "k": {"int": 5},
          "v": {"int": 7}
        },
        {
          "k": {"string": "hello"},
          "v": {"string": "world"}
        }
      ]},
      {"bytes": "ff00ff00"}
    ]},
    "v":{"int":5}
  }
]}
```
has a 1-element map with a value of just 5, but with a very complicated key consisting of a list with 2 elements:
* a 2-element map (5 => 7, "hello" => "world")
* a bytestring (0xFF00FF00)

Most reasonable metadata formats, however, likely do not use map/key/compound keys and thus this is more of a fringe use or when all possible metadata must be examined from JSON (almost) without exception.
Due to library implementation details it can still fail to decode if there is a very negative number between `-2^64 + 1` and `-2^63`.

## Using a CDDL Subset

Upsides:
* Automatic structural typing in deserialization
* Readable by other methods
* Possible reduced space due to array structs not serializing keys

Downsides:
* Requires additional set-up

For static or relatively static types this is probably the best choice, especially if you care about structural validation or need the binary types or more complex keys.

As we saw in the other examples, most reasonable structures can be encoded using the standard metadata CDDL as it is almost a superset of JSON outside of true/false/null. Not only this, but if we represent a struct using an array in CDDL such as:
```
foo = [
  receiver_id: text,
  sender_id: text,
  comment: text,
  tags: [*int]
]
```
there is space savings as the keys are not stored as it is represented as an ordered array of 4 elements instead of a direct map encoding of:
```
foo = {
  receiver_id: text,
  sender_id: text,
  comment: text,
  tags": [*int]
}
```
which would serialize the keys as strings inside the resulting CBOR. Using these CDDL definitions for the example JSON structure we had results in sizes of 89 bytes for the array definition and 124 bytes for the map one. Using the JSON encoding would also result in a metadata size of 124 bytes. Maps however do have the advantage of easy optional fields and a more readable metadata for external users who don't have access to the CDDL as the field names will be stored directly.

After you have created your CDDL definition, if you need to check that your CDDL conforms to the metadata CDDL we have a tool located in the `/tools/metadata-cddl-checker/` directory. Move to this directory and put your CDDL in a file called `input.cddl` there first, then run

```
cargo build
cargo run
```

Once we have the CDDL file and it has passed metadata format validation we can use the [cddl-codegen](https://github.com/Emurgo/cddl-codegen) tool that we used to initially generate the serialization/deserialization/structural code for the core Shelley structures from the [shelley cddl spec](https://github.com/input-output-hk/cardano-ledger-specs/blob/master/shelley/chain-and-ledger/shelley-spec-ledger-test/cddl-files/shelley.cddl).

Assuming we are in the `cddl-codegen` root directory and have created a `input.cddl` file in that directory containing the CDDL we wish to generate we can build and code-generate with
```
cargo build
cargo run
```
which should generate a wasm-convertible rust library for parsing our CDDL definition in the `/export/` directory.
After this we need to generate a wasm package from the rust code by running the following (you can do `--target=browser` too)
```
cd export
wasm-pack build --target=nodejs
wasm-pack pack
```

which should give you the library as a package in the `/pkg/` directory.

Once we have imported the library we can then use it as such:
```javascript
const tags = OurMetadataLib.Ints.new();
// if we have smaller (32-bit signed) numbers we can construct easier
tags.add(OurMetadataLib.Int.new_i32(0));
// but for bigger (>= 2^32) numbers we must use BigNum and specify the sign ourselves
tags.add(OurMetadataLib.Int.new(CardanoWasm.Int.from_str("264")));
// and for negative large (< -2^32) numbers (here we construct -1024)
tags.add(OurMetadataLib.Int.new_negative(CardanoWasm.Int.from_str("1024")));
tags.add(OurMetadataLib.Int.new_i32(32));
const map = OurMetadataLib.Foo.new("SJKdj34k3jjKFDKfjFUDfdjkfd", "jkfdsufjdk34h3Sdfjdhfduf873", "happy birthday", tags)
let metadata;
try {
  metadata = CardanoWasm.TransactionMetadata.from_bytes(map.to_bytes());
} catch (e) {
  // this should never happen if OurMetadataLib was generated from compatible CDDL with the metadata definition
}
```

likewise you can parse the metadata back very simply with:
```javascript
let cddlMetadata;
try {
  cddlMetadata = OurMetadataLib.Foo.from_bytes(metadata.to_bytes());
} catch (e) {
  // this should never happen if OurMetadataLib was generated from compatible CDDL with the metadata definition
}
// we can now directly access the fields with cddlMetadata.receiver_id(), etc
```

If we take advantage of the additional primitives not defined in CDDL but defined for `cddl-codegen`, then we can specify precisions of `u32`, `u64`, `i64`, `i32` for specifying 32 or 64 bits instead of just a general purpose `uint`/`nint`/`int`.
If you know your metadata will always be within one of these ranges it can be much more convenient to work with, and if you have signed data this will also make it easier to work with instead of the `Int` class that CDDL `int` might generate, since that is either an up to 64-bit positive or an up to 64 negative numbers.
This is particularly useful here as lists of CDDL primitives can be exposed directly as `Vec<T>` to wasm from rust, but when we have `int` (converts to `Int` struct) or `uint` (converts to `BigNum` struct) a separate structure like that `Ints` one used above is used. Using the 32-bit versions allows direct js `number` conversions to/from wasm.

If we simply change the `tags` field to `tags: [+i32]` our code becomes:
```javascript
// notice how we can directly work with js numbers here now!
// but remember they must fit into a 32-bit number now - no 64-bit numbers like are allowed in the metadata
const tags = [0, 264, -1024, 32];
const map = OurMetadataLib.Foo.new("SJKdj34k3jjKFDKfjFUDfdjkfd", "jkfdsufjdk34h3Sdfjdhfduf873", "happy birthday", tags)
```

and deserializaing likewise is much simpler as `metadata.tags()` will return a JS array or numbers rather than a rust-wasm struct that must be accessed via the wasm boundary.

## Raw Bytes Encoding

Upsides:
* Can store arbitrary data
* Potential space-savings if the data is compressed

Downsides:
* Not readable by other methods - must be decoded using this method
* Requires additional set-up

While most data would likely conform to the metadata CDDL subset (or JSON), if your data does not fit there then this encoding style will be necessary.

If you still want to take advantage of CDDL type-checking it is possible to create a library just as in the CDDL subset section but without running the checker tool. This could be useful if you are using CDDL outside of the metadata CDDL structure. Otherwise, you can store whatever bytes you want.

*Note*: To conform with the 64-byte limitation on metadata binary values, this method will split the bytes into 64-byte chunks

```javascript
const bytes = /* whatever method you want - you can use the CDDL solution in the 3rd option here */
const metadata = CardanoWasm.encode_arbitrary_bytes_as_metadatum(bytes);
const decoded_bytes = CardanoWasm.decode_arbitrary_bytes_from_metadatum(metadata);
assertEquals(bytes, decoded_bytes);
```

