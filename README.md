# CyberPhunk

> _the fook is in the machine_

A cyberpunk reskin in two halves that share one palette:

1. **TUI plugin** — an **opencode** 1.18+ plugin (one file) loaded through
   opencode's standard API. No fork, wrapper, or daemon.
2. **Desktop theme** — the same palette for an **Omarchy** desktop: Hyprland
   borders, every terminal, btop, helix, neovim, VS Code, lock screen. One
   command applies it.

The TUI plugin gives you:

- Neon palette (cyan / pink / amber / slate) via the built-in theme API
- Logo + footer brand, a 1.5 s boot splash
- A persistent status **pill** (bottom of every screen): model · cost · title · live feed
- **The Deck** — `ctrl+d` for a HUD with real session data: model, cost, tokens,
  messages, active todos (with status), and a live event feed
- Cyberpunk verbs (`/deck`, `/cyberphunk.on`, `/cyberphunk.notify`, `/cyberphunk.diag`, …)
- Attention notifications: desktop ping + `error` sound on `session.error`, blurred-only

## Requirements

- **TUI plugin:** opencode ≥ 1.18 (tested 1.18.23). The bundled Bun loads the plugin.
- **Desktop theme (optional):** [Omarchy](https://omarchy.org). On any other
  system the palette still works — just point apps at `theme/colors.toml`.

## Quick start

```sh
git clone https://github.com/derejealemu/cyberphunk && cd cyberphunk
bash install.sh          # opencode TUI → restart opencode
bash install-theme.sh    # Omarchy desktop theme (optional)
omarchy theme set cyberphunk
```

## Install (details)

**TUI plugin**

```sh
bash install.sh
```

Manual, if you prefer:

```sh
mkdir -p ~/.config/opencode/plugins ~/.config/opencode/themes
cp src/plugin.ts             ~/.config/opencode/plugins/cyberphunk.ts
cp src/cyberphunk.theme.json ~/.config/opencode/themes/cyberphunk.json
# add to ~/.config/opencode/tui.json:
#   { "theme": "cyberphunk", "plugin": ["~/.config/opencode/plugins/cyberphunk.ts"] }
```

**Desktop theme**

```sh
bash install-theme.sh        # stages ~/.config/omarchy/themes/cyberphunk (+ optional lazygit palette)
omarchy theme set cyberphunk # apply
```

The palette lives in one file — `theme/colors.toml` — and Omarchy generates
every app config from it (Hyprland borders, terminals, btop, helix, neovim,
VS Code, the bar, and the lock screen). The desktop theme also carries
synthwave wallpapers, theme-picker art, and a matching lazygit palette.

## Uninstall

```sh
# TUI plugin
rm ~/.config/opencode/plugins/cyberphunk.ts
# remove the plugin entry from ~/.config/opencode/tui.json

# Desktop theme (revert to your previous theme, then optionally remove it)
omarchy theme set catppuccin
rm -rf ~/.config/omarchy/themes/cyberphunk
```

## Keyboard & verbs

| What                  | Keyboard        | Verb               |
| --------------------- | --------------- | ------------------ |
| The Deck (HUD)        | `ctrl+d`        | `/deck`            |
| Close deck/dialog     | `ctrl+e` / `esc`  | `/deck-close`      |
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

## On the bench (ideas, not yet built)

The two halves exist but don't talk to each other yet, and a few pieces of the
cyberpunk kit are still unbuilt. Ideas in no particular order:

- **Bridge the halves** — a verb like `/cyberphunk.desktop` that runs
  `omarchy theme set cyberphunk`, and `/cyberphunk.bg next` to cycle the
  synthwave wallpapers, so the desktop is driven from the TUI (the motif).
- **Keyboard RGB** — a `theme/keyboard.rgb` matching the palette (Omarchy
  supports it; we don't ship one yet).
- **Wallpaper pack** — more than two synthwave scenes; a "city at night" set.
- **Sound** — a custom boot chime + notification tone instead of stock `error`.
- **Boot splash 2.0** — glitch/VHS matrix-rain for the 1.5 s splash.
- **Distribution** — a `curl | bash` one-liner, an AUR package, registry publish.

## License

MIT — see `LICENSE`.
