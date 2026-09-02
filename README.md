# CyberPhunk

Cyberpunk reskin for the **opencode** 1.18+ TUI. One plugin file + one theme,
loaded through opencode's standard plugin API. No fork, no wrapper, no daemon.

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
src/cyberphunk.theme.json# the theme

install.sh               # one-line installer (idempotent, backs up tui.json)
package.json  tsconfig.json  AGENTS.md
```

## License

MIT — see `LICENSE`.
