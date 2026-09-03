#!/usr/bin/env bash
# CyberPhunk installer — wires the plugin into a standard opencode install.
# Idempotent: safe to re-run. Backs up your tui.json before modifying it.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_SRC="$REPO/src/plugin.ts"
THEME_SRC="$REPO/src/cyberphunk.theme.json"
CFG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
PLUGIN_DIR="$CFG_DIR/plugins"
THEMES_DIR="$CFG_DIR/themes"
TUI_JSON="$CFG_DIR/tui.json"

[ -f "$PLUGIN_SRC" ] || { echo "missing $PLUGIN_SRC"; exit 1; }
[ -f "$THEME_SRC" ] || { echo "missing $THEME_SRC"; exit 1; }

mkdir -p "$PLUGIN_DIR" "$THEMES_DIR"

echo "→ installing theme → $THEMES_DIR/cyberphunk.json"
cp -f "$THEME_SRC" "$THEMES_DIR/cyberphunk.json"

echo "→ installing plugin → $PLUGIN_DIR/cyberphunk.ts"
cp -f "$PLUGIN_SRC" "$PLUGIN_DIR/cyberphunk.ts"

# Merge into tui.json (theme + ensure this plugin is listed once), keep other keys.
echo "→ updating tui.json (backed up to tui.json.bak.<ts>)"
cp -f "$TUI_JSON" "$TUI_JSON.bak.$(date +%s)" 2>/dev/null || true
python3 - "$TUI_JSON" "$PLUGIN_DIR/cyberphunk.ts" <<'PY'
import json, sys, os
path, plugin = sys.argv[1], sys.argv[2]
data = {}
if os.path.exists(path):
    with open(path) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            # Malformed tui.json: abort loudly instead of silently rebuilding it.
            # The backup we just made has the user's original bytes.
            print(f"ERROR: {path} is not valid JSON ({e}).", file=sys.stderr)
            print(f"       Fix it (or restore the .bak just created) and re-run install.sh. Nothing was changed.", file=sys.stderr)
            sys.exit(1)
data.setdefault("$schema", "https://opencode.ai/tui.json")
data["theme"] = "cyberphunk"
plugins = data.get("plugin") or []
if plugin not in plugins:
    plugins.append(plugin)
data["plugin"] = plugins
with open(path, "w") as f:
    json.dump(data, f, indent=2)
print("   " + open(path).read().replace("\n", "\n   "))
PY

echo
echo "✔ CyberPhunk installed. Restart opencode to load it."
echo "  · splash on boot  · logo + footer  · persistent status pill"
echo "  · ctrl+d → THE DECK   ·   /deck  /cyberphunk.on  /cyberphunk.off"
echo "  · /cyberphunk.notify  /cyberphunk.diag"
