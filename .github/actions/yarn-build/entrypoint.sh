#!/bin/sh
set -e

# had to add this line due to changes within git
# see: https://github.com/actions/runner/issues/2033
git config --global --add safe.directory /github/workspace

sh -c "yarn $*"
