#!/usr/bin/env bash
# CyberPhunk Omarchy desktop-theme installer.
# Copies the bundled theme into ~/.config/omarchy/themes and offers to apply it.
# Idempotent: safe to re-run. Does NOT touch ~/.config/opencode.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO/theme"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/themes/cyberphunk"

[ -d "$SRC" ] || { echo "missing $SRC (this checkout has no theme/)"; exit 1; }

echo "→ installing desktop theme → $DEST"
mkdir -p "$DEST/backgrounds"
# Copy theme files (never follow symlinks; the theme is plain files).
cp -f "$SRC"/colors.toml   "$DEST/colors.toml"
cp -f "$SRC"/icons.theme   "$DEST/icons.theme"
cp -f "$SRC"/preview.png        "$DEST/preview.png"
cp -f "$SRC"/preview-unlock.png "$DEST/preview-unlock.png"
cp -f "$SRC"/unlock.png         "$DEST/unlock.png"
cp -f "$SRC"/backgrounds/*.png "$DEST/backgrounds/"

echo
echo "✔ CyberPhunk desktop theme staged."
echo "  Apply with:"
echo "    omarchy theme set cyberphunk"
echo "  Revert with your previous theme, e.g.:"
echo "    omarchy theme set catppuccin"

# Optional: matching lazygit palette (only offered, never overwrites).
LG_DEST="${XDG_CONFIG_HOME:-$HOME/.config}/lazygit/config.yml"
LG_SRC="$REPO/theme/lazygit.yml"
if command -v lazygit >/dev/null 2>&1 && [ -f "$LG_SRC" ]; then
  echo
  if [ -s "$LG_DEST" ]; then
    echo "  lazygit: existing config at $LG_DEST left untouched."
    echo "          theme/lazygit.yml is available to merge by hand."
  else
    echo "  → writing lazygit palette → $LG_DEST"
    mkdir -p "$(dirname "$LG_DEST")"
    cp -f "$LG_SRC" "$LG_DEST"
  fi
fi
