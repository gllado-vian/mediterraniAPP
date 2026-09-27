#!/bin/bash
# Prepara les sessions de Claude Code al núvol:
#  - dependències npm (tests amb Vitest i typecheck)
#  - plugins del projecte: Superpowers (TDD) i Impeccable (disseny)
#  - a totes les sessions (també en local): activa .githooks/pre-commit
set -euo pipefail

# A totes les sessions: la comprovació de secrets abans de cada commit (.githooks/pre-commit).
git -C "$CLAUDE_PROJECT_DIR" config core.hooksPath .githooks

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
