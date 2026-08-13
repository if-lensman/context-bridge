#!/usr/bin/env bash

set -euo pipefail

# nvm is only in ~/.zshrc; bash shells need to source it manually
if ! command -v node &>/dev/null && [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "${script_dir}/context-bridge.mjs" "$@"
