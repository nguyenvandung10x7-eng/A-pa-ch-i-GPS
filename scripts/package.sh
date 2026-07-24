#!/usr/bin/env bash

set -euo pipefail

repository_root="$(git rev-parse --show-toplevel)"
archive_path="${1:-${repository_root}/../A-pa-ch-i-GPS.zip}"

mkdir -p "$(dirname "${archive_path}")"
rm -f "${archive_path}"

git -C "${repository_root}" archive \
  --format=zip \
  --output="${archive_path}" \
  --prefix="A-pa-ch-i-GPS/" \
  HEAD

printf 'Created %s\n' "${archive_path}"
