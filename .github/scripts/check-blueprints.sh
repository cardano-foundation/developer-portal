#!/usr/bin/env bash
# Rebuilds an Aiken project and checks that the committed blueprints still
# match it. The onboarding lectures print validator hashes straight from these
# files, so a stale blueprint means a lecture shows a hash the reader cannot
# reproduce.
#
# Usage: check-blueprints.sh <aiken project dir>
#
# Checks two things:
# - the project's own plutus.json matches a fresh `aiken build`;
# - every copy of it under the sibling off-chain/ folder matches too. A copy
#   may hold only some of the validators; each one it holds must match.
#
# Only titles, hashes and compiled code are compared. The preamble records
# the exact compiler build, which differs between machines.

set -euo pipefail

project=$1
committed=$(mktemp)
cp "$project/plutus.json" "$committed"

(cd "$project" && aiken build)

validators() {
  jq -S '[.validators[] | {title, hash, compiledCode}] | sort_by(.title)' "$1"
}

status=0

if ! diff <(validators "$committed") <(validators "$project/plutus.json") > /dev/null; then
  echo "::error file=$project/plutus.json::plutus.json is stale. Run \`aiken build\` in $project and commit the result."
  status=1
fi

off_chain=$(dirname "$(dirname "$project")")/off-chain
if [ -d "$off_chain" ]; then
  while IFS= read -r copy; do
    titles=$(jq -c '[.validators[].title]' "$copy")
    expected=$(jq -S --argjson titles "$titles" \
      '[.validators[] | select(.title as $t | $titles | index($t)) | {title, hash, compiledCode}] | sort_by(.title)' \
      "$project/plutus.json")
    if [ "$(validators "$copy")" != "$expected" ]; then
      echo "::error file=$copy::$copy does not match the contract in $project. Copy the fresh plutus.json over it."
      status=1
    else
      echo "ok: $copy"
    fi
  done < <(find "$off_chain" -name '*plutus.json' -not -path '*/node_modules/*')
fi

[ "$status" = 0 ] && echo "ok: $project/plutus.json"
exit "$status"
