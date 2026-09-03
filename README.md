# CyberPhunk

> _the fook is in the machine_

A cyberpunk reskin for [Omarchy](https://omarchy.org) and [opencode](https://opencode.ai).
One shared palette — cyan / pink / amber / slate on a near-black base — applied
to the whole machine with two independent kits:

1. **Omarchy desktop theme** (the main artifact) — `colors.toml` at the repo
   root drives Hyprland borders, every terminal, btop, helix, neovim, VS Code,
   the bar, and the lock screen. Ships synthwave wallpapers and picker art.
2. **opencode TUI plugin** (the add-on) — splash, logo/footer, a persistent
   status pill, **The Deck** (`ctrl+d`) with live session data, and a
   cyberpunk verb set.

Both kits are MIT, both load from this single repo with no forking or
wrapping, and both stay synced: change one hex in `colors.toml` and the whole
palette follows.

**[![omarchytheme.com badge](https://img.shields.io/badge/omarchytheme.com-coming%20soon-blue?style=flat-square)](https://omarchytheme.com)**
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Requirements

- **Desktop theme:** [Omarchy](https://omarchy.org). The palette file also
  works on any other system if you point apps at `colors.toml`.
- **TUI plugin (optional):** opencode ≥ 1.18 (tested against 1.18.23). The
  bundled Bun inside the opencode binary loads the plugin; no extra runtime.

## Quick start

```sh
git clone https://github.com/derejealemu/cyberphunk && cd cyberphunk
bash install.sh          # opencode TUI (restart opencode when done)
bash install-theme.sh    # Omarchy desktop theme
omarchy theme set cyberphunk
```

To install the **theme only** (no opencode / no TUI plugin):

```sh
git clone https://github.com/derejealemu/cyberphunk && cd cyberphunk
bash install-theme.sh
omarchy theme set cyberphunk
```

Or via Omarchy's own theme-installer (works on any Omarchy box, no clone):

```sh
omarchy theme install git@github.com:derejealemu/cyberphunk.git
omarchy theme set cyberphunk
```

## What the desktop theme ships

- `colors.toml` — single source of truth (16 ANSI colors, surface ladder,
  `hyprland_active_border` gradient). Omarchy generates every app config
  from this file.
- `backgrounds/1-synthwave-hero.png` + `backgrounds/2-synthwave-sun.png` —
  two synthwave wallpapers; also feed the lock screen (Omarchy blurs the
  current background behind the lock panel).
- `preview.png`, `preview-unlock.png`, `unlock.png` — the standard
  theme-picker / unlock artwork.
- `icons.theme` — picks `Yaru-magenta-dark` (a dark neon set that pairs with
  cyan/magenta).
- `lazygit.yml` — matching lazygit color mapping, written by
  `install-theme.sh` only if you don't already have one.

## What the opencode TUI plugin gives you

- Neon palette via opencode's built-in theme API
- A centered, staged **boot splash** (emblem + wordmark + status lines +
  READY hold)
- A persistent status **pill** (bottom of every screen): brand · title ·
  model · cost · live feed tail
- **The Deck** — `ctrl+d` for a HUD: model, cost, tokens, message count,
  open todos with status, and a live event feed
- Cyberpunk verbs: `/deck`, `/cyberphunk.on`, `/cyberphunk.off`,
  `/cyberphunk.notify`, `/cyberphunk.diag`
- Attention notifications: desktop ping + `error` sound on `session.error`

Keyboard map (TUI):

| What                  | Keyboard             | Verb               |
| --------------------- | -------------------- | ------------------ |
| The Deck (HUD)        | `ctrl+d`             | `/deck`            |
| Close deck/dialog     | `ctrl+e` / `esc`     | `/deck-close`      |
| Enable/disable UI     | —                    | `/cyberphunk.on` / `/cyberphunk.off` |
| Test notification     | —                    | `/cyberphunk.notify` |
| Write API snapshot*   | —                    | `/cyberphunk.diag` |

\* Snapshot lands at `~/.local/state/cyberphunk/api-diag.json`.

State survives restarts (via opencode's `kv` store); `/cyberphunk.off`
leaves the theme + slots up and only mutes the splash, deck, and
notifications.

## Uninstall

```sh
# desktop theme
omarchy theme set catppuccin   # or your previous theme
rm -rf ~/.config/omarchy/themes/cyberphunk

# opencode TUI plugin
rm ~/.config/opencode/plugins/cyberphunk.ts
# and remove the "plugin" entry from ~/.config/opencode/tui.json
```

## Repo layout

```
colors.toml              # Omarchy palette — the source of truth
backgrounds/*.png        # synthwave wallpapers + lock-screen art
preview.png              # theme-picker card image (required by omarchytheme.com)
preview-unlock.png       # theme-picker unlock preview
unlock.png               # unlock screen wordmark
icons.theme              # preferred icon set
lazygit.yml              # matching lazygit color mapping (installed if absent)

src/plugin.ts            # opencode TUI plugin
src/cyberphunk.theme.json# opencode TUI theme (kept in sync with the palette)

install.sh               # opencode TUI installer (idempotent)
install-theme.sh         # Omarchy theme installer (idempotent)
README.md  LICENSE  AGENTS.md  package.json  tsconfig.json
```

## Develop

```sh
npm i            # dev deps: typescript, @types/node
npm run typecheck
```

Theme: edit `colors.toml`, then `omarchy theme set cyberphunk` to re-apply.
TUI plugin: edit `src/plugin.ts`, restart opencode, watch
`~/.local/state/cyberphunk/log.jsonl` for probes. No build step; the file
ships as-is.

## On the bench

- **Bridge the kits** — a TUI verb like `/cyberphunk.desktop` that runs
  `omarchy theme set cyberphunk` and `/cyberphunk.bg next` to cycle
  wallpapers. So the TUI drives the desktop.
- **Keyboard RGB** — a `keyboard.rgb` matching the palette.
- **Wallpaper pack** — more than two synthwave scenes; a "city at night" set.
- **Sound** — a custom boot chime + notification tone.
- **Registry** — AUR package and/or a `curl | bash` one-liner.

## License

MIT — see `LICENSE`.
