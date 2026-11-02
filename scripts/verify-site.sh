#!/usr/bin/env bash
# ODD LAB: run every available check without npm, pip, or other package installs.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 tests/static_site_check.py
while IFS= read -r -d '' js; do
  node --check "$js"
done < <(find . -type f -name '*.js' -not -path './.git/*' -print0)
node --test tests/*.test.cjs
