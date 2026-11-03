import {
  applyParamsToScript,
  mConStr0,
  resolveScriptHash,
  serializeData,
  serializePlutusScript,
  stringToHex,
} from "@meshsdk/core";
import type { Data } from "@meshsdk/core";
import { csl } from "@meshsdk/core-csl";
import { blake2b } from "blakejs";

// The `plutus.json` that `aiken build` wrote for this project, copied in from
// `../../on-chain/aiken/plutus.json`. It holds three lock-ups, which take their
// parameters three ways, and five reward policies that recognize them.
import blueprint from "../../blueprints/parameter-validation.plutus.json" with { type: "json" };

const PLUTUS_VERSION = "V3";

/// Every reward policy in the blueprint, by the validator's title without its
/// handler.
export const POLICIES = {
  naive: "naive.rewards",
  byHand: "by_hand.rewards",
  withLibrary: "with_library.rewards",
  hashedTerms: "hashed_terms.rewards",
  rawTerms: "raw_terms.rewards",
} as const;

export type Policy = keyof typeof POLICIES;

/// The one token name the policies mint.
export const REWARD_NAME_HEX = stringToHex("REWARD");

/// A member of the rewards program: their key hash, and when their lock-up
/// opens, in POSIX milliseconds. The first three policies give every member
/// the program's date; the last two allow that date or a later one per member.
export type Member = { owner: string; unlockAt: number };

type Blueprint = { validators: { title: string; compiledCode: string }[] };

function compiledCode(title: string): string {
  const validator = (blueprint as Blueprint).validators.find((v) => v.title === title);
  if (!validator) throw new Error(`validator "${title}" not found in the blueprint`);
  return validator.compiledCode;
}

/// A 28-byte BLAKE2b hash, the one script hashes and the library use.
export function blake2b224(hex: string): string {
  return Buffer.from(blake2b(Buffer.from(hex, "hex"), undefined, 28)).toString("hex");
}

/// A member's terms as on-chain data: `Terms` in `lib/lockups.ak`.
export function termsData(member: Member): Data {
  return mConStr0([member.owner, member.unlockAt]);
}

// ---------------------------------------------------------------------------
// The lock-ups: which one each policy pays into, and its script.

/// The lock-up each policy recognizes.
export function lockupKind(policy: Policy): "lockup" | "terms" | "raw" {
  if (policy === "hashedTerms") return "terms";
  if (policy === "rawTerms") return "raw";
  return "lockup";
}

// #region lockup-script
/// `member`'s lock-up, compiled with its parameters applied, as Mesh hands it
/// to a transaction.
export function lockupScriptCbor(policy: Policy, member: Member): string {
  switch (lockupKind(policy)) {
    case "lockup":
      // The program's date first, then the member's key: the prefix ends
      // just before the key.
      return applyParamsToScript(compiledCode("lockup.lockup.spend"), [member.unlockAt, member.owner]);
    case "terms":
      // Only the hash of the terms goes into the script.
      return applyParamsToScript(compiledCode("lockup_terms.lockup_terms.spend"), [
        blake2b224(serializeData(termsData(member))),
      ]);
    case "raw":
      return applyParamsToScript(compiledCode("lockup_raw.lockup_raw.spend"), [termsData(member)]);
  }
}
// #endregion lockup-script

export function lockupHash(policy: Policy, member: Member): string {
  return resolveScriptHash(lockupScriptCbor(policy, member), PLUTUS_VERSION);
}

export function lockupAddress(policy: Policy, member: Member, networkId: number): string {
  return serializePlutusScript(
    { code: lockupScriptCbor(policy, member), version: PLUTUS_VERSION },
    undefined,
    networkId,
  ).address;
}

// ---------------------------------------------------------------------------
// Prefixes: the compiled lock-up up to where its last parameter goes. A
// prefix comes from an instance applied to a placeholder, so it always
// matches the blueprint in use.

/// A placeholder for a 28-byte parameter.
const PLACEHOLDER = "00".repeat(28);

/// What `applyParamsToScript` returns is CBOR-wrapped twice. A script hash
/// covers the bytes wrapped once, so prefixes are cut from those.
function wrappedOnce(script: string): string {
  return Buffer.from(csl.PlutusScript.from_bytes(Buffer.from(script, "hex")).bytes()).toString("hex");
}

// #region prefix
/// Cut `script` just before its last parameter, a 28-byte placeholder. Checks
/// the cut-off part is exactly the placeholder and the two bytes that end every
/// such script, so a change in how scripts are encoded fails here, loudly.
function prefixBefore(script: string): string {
  const once = wrappedOnce(script);
  const ending = PLACEHOLDER + "0001";
  if (!once.endsWith(ending)) throw new Error("the parameter is not where a prefix expects it");
  return once.slice(0, once.length - ending.length);
}

/// The prefix of every lock-up in a program whose lock-ups open at
/// `unlockAt`: the date is applied, the owner's key is not.
export function lockupPrefix(unlockAt: number): string {
  return prefixBefore(applyParamsToScript(compiledCode("lockup.lockup.spend"), [unlockAt, PLACEHOLDER]));
}
// #endregion prefix

/// The prefix of every `lockup_terms` instance: everything but the hash.
export function termsPrefix(): string {
  return prefixBefore(applyParamsToScript(compiledCode("lockup_terms.lockup_terms.spend"), [PLACEHOLDER]));
}

// #region flat-prefix
/// The prefix the library's `advanced.apply_param` takes: the compiled
/// `lockup_raw` up to the parameter, without the CBOR header around the whole
/// script, and without the byte that gives the parameter's length. The
/// library rebuilds both on-chain from the terms it is given.
export function rawFlatPrefix(): string {
  const placeholder = serializeData(termsData({ owner: PLACEHOLDER, unlockAt: 0 }));
  const once = wrappedOnce(applyParamsToScript(compiledCode("lockup_raw.lockup_raw.spend"), [termsData({ owner: PLACEHOLDER, unlockAt: 0 })]));
  // The CBOR header: 0x58 is followed by a one-byte length, 0x59 by two.
  const headerBytes = { "58": 2, "59": 3, "5a": 5 }[once.slice(0, 2)];
  if (!headerBytes) throw new Error("unexpected CBOR header on the compiled script");
  const flat = once.slice(headerBytes * 2);
  const lengthByte = (placeholder.length / 2).toString(16).padStart(2, "0");
  const ending = lengthByte + placeholder + "0001";
  if (!flat.endsWith(ending)) throw new Error("the parameter is not where a prefix expects it");
  return flat.slice(0, flat.length - ending.length);
}
// #endregion flat-prefix

// ---------------------------------------------------------------------------
// Applying a long byte string. Mesh 1.9.1's `applyParamsToScript` keeps only
// the first 64 bytes of a byte-string parameter, and a prefix is hundreds of
// bytes long. So the policies get theirs here: Mesh applies every other
// parameter, with an empty byte string in the prefix's place, and the real
// prefix is spliced in where the empty one was.

/// CBOR header for a byte string of `length` bytes.
function cborBytesHeader(length: number): string {
  if (length < 24) return (0x40 + length).toString(16).padStart(2, "0");
  if (length < 0x100) return "58" + length.toString(16).padStart(2, "0");
  if (length < 0x10000) return "59" + length.toString(16).padStart(4, "0");
  return "5a" + length.toString(16).padStart(8, "0");
}

function cborBytes(hex: string): string {
  return cborBytesHeader(hex.length / 2) + hex;
}

/// A byte string as Flat writes it: chunks of at most 255 bytes, each after
/// its length, then a zero.
function flatBytes(hex: string): string {
  let out = "";
  for (let i = 0; i < hex.length; i += 510) {
    const chunk = hex.slice(i, i + 510);
    out += (chunk.length / 2).toString(16).padStart(2, "0") + chunk;
  }
  return out + "00";
}

/// `code` with `params` applied, then `last`, a byte string of any length.
function applyWithLongLast(code: string, params: Data[], last: string): string {
  const once = wrappedOnce(applyParamsToScript(code, [...params, ""]));
  const headerBytes = { "58": 2, "59": 3, "5a": 5 }[once.slice(0, 2)];
  if (!headerBytes) throw new Error("unexpected CBOR header on the compiled script");
  const flat = once.slice(headerBytes * 2);
  // The empty byte string as data is CBOR `40`, written as one 1-byte chunk,
  // then the zero that ends the chunks, then the byte of padding that ends
  // the script.
  const empty = "01" + "40" + "00" + "01";
  if (!flat.endsWith(empty)) throw new Error("the last parameter is not where it was expected");
  const spliced = flat.slice(0, flat.length - empty.length) + flatBytes(serializeData(last)) + "01";
  // Mesh hands scripts around CBOR-wrapped twice.
  return cborBytes(cborBytes(spliced));
}

// ---------------------------------------------------------------------------
// The reward policies.

/// `policy` compiled for a program run by `admin`. `unlockAt` is the common
/// date for key-only lock-ups and the minimum date for the terms policies.
/// The naive policy trusts the supplied list of lock-ups instead.
export function policyScriptCbor(policy: Policy, admin: string, unlockAt: number, listed: string[] = []): string {
  const code = compiledCode(`${POLICIES[policy]}.mint`);
  switch (policy) {
    case "naive":
      return applyParamsToScript(code, [admin, listed]);
    case "byHand":
    case "withLibrary":
      return applyWithLongLast(code, [admin], lockupPrefix(unlockAt));
    case "hashedTerms":
      return applyWithLongLast(code, [admin, unlockAt], termsPrefix());
    case "rawTerms":
      return applyWithLongLast(code, [admin, unlockAt], rawFlatPrefix());
  }
}

export function policyId(policyCbor: string): string {
  return resolveScriptHash(policyCbor, PLUTUS_VERSION);
}

/// The size of a compiled script with its parameters applied, in bytes.
export function scriptSize(cbor: string): number {
  return wrappedOnce(cbor).length / 2;
}
