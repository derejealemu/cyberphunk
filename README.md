# CyberPhunk

Cyberpunk reskin. The core is an **opencode** 1.18+ TUI plugin (one plugin file
+ one theme, loaded through opencode's standard plugin API — no fork, wrapper,
or daemon). A matching **Omarchy desktop theme** ships alongside: same palette,
applied system-wide with one `omarchy` command.

- Neon palette (cyan / pink / amber / slate) via the built-in theme API
- Logo + footer brand, a 1.5 s boot splash
- A persistent status **pill** (bottom of every screen): model · cost · title · live feed
- **The Deck** — `ctrl+d` for a HUD with real session data: model, cost, tokens,
  messages, active todos (with status), and a live event feed
- Cyberpunk verbs (`/deck`, `/cyberphunk.on`, `/cyberphunk.notify`, `/cyberphunk.diag`, …)
- Attention notifications: desktop ping + `error` sound on `session.error`, blurred-only

## Requirements

- opencode ≥ 1.18 (tested 1.18.23)
- Nothing else. The bundled Bun inside the opencode binary loads the plugin.

## Install

```sh
bash install.sh
```

Restart opencode.

Manual install, if you prefer:

```sh
mkdir -p ~/.config/opencode/plugins ~/.config/opencode/themes
cp src/plugin.ts             ~/.config/opencode/plugins/cyberphunk.ts
cp src/cyberphunk.theme.json ~/.config/opencode/themes/cyberphunk.json
# add ~/.config/opencode/tui.json:
#   { "theme": "cyberphunk", "plugin": ["~/.config/opencode/plugins/cyberphunk.ts"] }
```

## Uninstall

```sh
rm ~/.config/opencode/plugins/cyberphunk.ts
# remove the plugin entry from ~/.config/opencode/tui.json
```

## Omarchy desktop theme (optional)

The `theme/` directory is a complete [Omarchy](https://omarchy.org) theme using
the same palette: wallpaper/ladder, active-border gradient, all terminals
(foot/alacritty/kitty), btop, helix, neovim, VS Code, and a synthesized
lock-screen / theme-picker wordmark. The palette lives in one file —
`theme/colors.toml` — and every app config is generated from it by Omarchy.

```sh
bash install-theme.sh        # stages ~/.config/omarchy/themes/cyberphunk (+ optional lazygit palette)
omarchy theme set cyberphunk # apply
omarchy theme set catppuccin # revert to your previous theme
```

On a non-Omarchy machine, drop `theme/` into `~/.config/omarchy/themes/` (or
point the relevant apps at `theme/colors.toml` / `theme/lazygit.yml`).

## Keyboard & verbs

| What                  | Keyboard        | Verb               |
| --------------------- | --------------- | ------------------ |
| The Deck (HUD)        | `ctrl+d`        | `/deck`            |
| Close deck/dialog     | `ctrl+e` / `q`  | `/deck-close`      |
| Enable/disable UI     | —               | `/cyberphunk.on` / `/cyberphunk.off` |
| Test notification     | —               | `/cyberphunk.notify` |
| Write API snapshot*   | —               | `/cyberphunk.diag` |

\* Snapshot lands at `~/.local/state/cyberphunk/api-diag.json`.

State survives restarts (via opencode's `kv` store); `/cyberphunk.off` leaves the
theme + slots up and only mutes the splash, deck, and notifications.

## Develop

```sh
npm i            # dev deps: typescript, @types/node
npm run typecheck
```

Edit `src/plugin.ts`, restart opencode, watch `~/.local/state/cyberphunk/log.jsonl`
for the probe lines. There is no build step; the file ships as-is.

## Files

```
src/plugin.ts            # the plugin (entry point)
src/cyberphunk.theme.json# the opencode TUI theme

theme/colors.toml        # the Omarchy palette (single source of truth)
theme/backgrounds/*.png  # synthwave wallpapers + lock-screen art
theme/preview*.png       # theme-picker art
theme/icons.theme        # icon set preference
theme/lazygit.yml        # lazygit theme (optional, installed by install-theme.sh)

install.sh               # one-line installer for the opencode TUI (idempotent)
install-theme.sh         # one-line installer for the Omarchy desktop theme
package.json  tsconfig.json  AGENTS.md
```

## License

MIT — see `LICENSE`.
