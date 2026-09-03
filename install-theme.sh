#!/usr/bin/env bash
# CyberPhunk Omarchy desktop-theme installer.
# Stages the theme (colors.toml + backgrounds + preview art) into
# ~/.config/omarchy/themes/cyberphunk and offers the matching lazygit palette.
# Idempotent: safe to re-run. Does NOT touch ~/.config/opencode.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO"
DEST="${XDG_CONFIG_HOME:-$HOME/.config}/omarchy/themes/cyberphunk"

[ -f "$SRC/colors.toml" ]   || { echo "missing $SRC/colors.toml (this checkout is not a theme repo)"; exit 1; }
[ -f "$SRC/icons.theme" ]   || { echo "missing $SRC/icons.theme"; exit 1; }
[ -f "$SRC/hyprland.conf" ] || { echo "missing $SRC/hyprland.conf"; exit 1; }
[ -f "$SRC/preview.png" ]   || { echo "missing $SRC/preview.png"; exit 1; }
[ -f "$SRC/preview-unlock.png" ] || { echo "missing $SRC/preview-unlock.png"; exit 1; }
[ -f "$SRC/unlock.png" ]    || { echo "missing $SRC/unlock.png"; exit 1; }
[ -d "$SRC/backgrounds" ]   || { echo "missing $SRC/backgrounds/"; exit 1; }

echo "→ staging desktop theme → $DEST"
mkdir -p "$DEST/backgrounds"
cp -f "$SRC/colors.toml"         "$DEST/colors.toml"
cp -f "$SRC/hyprland.conf"       "$DEST/hyprland.conf"
cp -f "$SRC/icons.theme"         "$DEST/icons.theme"
cp -f "$SRC/preview.png"         "$DEST/preview.png"
cp -f "$SRC/preview-unlock.png"  "$DEST/preview-unlock.png"
cp -f "$SRC/unlock.png"          "$DEST/unlock.png"
cp -f "$SRC/backgrounds/"*.png   "$DEST/backgrounds/"

# optional: matching lazygit palette (only writes if the user has none)
LG_DEST="${XDG_CONFIG_HOME:-$HOME/.config}/lazygit/config.yml"
LG_SRC="$REPO/lazygit.yml"
if command -v lazygit >/dev/null 2>&1 && [ -f "$LG_SRC" ]; then
  echo
  if [ -s "$LG_DEST" ]; then
    echo "  lazygit: leaving existing $LG_DEST alone."
  else
    echo "  → writing lazygit palette → $LG_DEST"
    mkdir -p "$(dirname "$LG_DEST")"
    cp -f "$LG_SRC" "$LG_DEST"
  fi
fi

echo
echo "✔ CyberPhunk desktop theme staged."
echo "  Apply with:"
echo "    omarchy theme set cyberphunk"
echo "  Revert with your previous theme, e.g.:"
echo "    omarchy theme set catppuccin"
