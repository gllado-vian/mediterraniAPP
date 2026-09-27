#!/bin/bash
# Prepara les sessions de Claude Code al núvol:
#  - dependències npm (tests amb Vitest i typecheck)
#  - plugins del projecte: Superpowers (TDD) i Impeccable (disseny)
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

npm install --no-audit --no-fund

install_plugin() {
  local marketplace_repo="$1" plugin="$2"
  if claude plugin list 2>/dev/null | grep -q "> ${plugin}\$"; then
    echo "Plugin ${plugin} ja instal·lat"
    return
  fi
  claude plugin marketplace add "$marketplace_repo" --scope project
  claude plugin install "$plugin" --scope project
}

install_plugin obra/superpowers-marketplace superpowers@superpowers-marketplace
install_plugin pbakaus/impeccable impeccable@impeccable
