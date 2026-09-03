# AGENTS.md

Rules for AI co-editors (and humans) working in this repo.

## Hard rules (do not break)

1. **`default` export must be an object with `tui` = a function and NO `server`.**
   The TUI host's `rQ` validator rejects a plugin that default-exports a bare
   function, an object with both `server` and `tui`, or an object with a
   non-function `tui`. This is a load-time hard error.
2. **Render via `createComponent(Comp, { api })` from `@opentui/solid`.**
   The slot and dialog renderers expect real VNode instances from the host's
   Solid reconciler. Returning a plain `{ type, props }` object or `jsx("box", …)`
   directly from a slot/dialog function will load fine then paint nothing.
3. **Only these runtime imports** are allowed in `src/plugin.ts`:
   - `@opentui/solid/jsx-runtime` → `jsx`
   - `@opentui/solid` → `createComponent`
   - Node builtins (`node:fs`, `node:path`, `node:url`)
   Do not import `solid-js`, `@opentui/core`, or `@opentui/keymap` at
   runtime — they aren't resolvable from the plugin's context reliably.
4. **No hardcoded absolute paths** (`/home/…`, `/Users/…`). Derive them from
   `process.env.HOME`, `XDG_CONFIG_HOME`, `XDG_STATE_HOME`, and `import.meta.url`.
5. **Never abbreviate "CyberPhunk"** in user-facing UI. The brand word shows in
   full — `CYBERPHUNK` (wordmark, pill, footer, headers, toasts). Short forms
   like `CP` / `Cyph` / `Cphk` are banned from the rendered TUI. The all-caps
   `CYBERPHUNK` form is the display name; `cyberphunk` is fine for identifiers,
   file paths, and slash verbs.
6. **Typecheck must pass** before any commit: `npm run typecheck`
   (or `npx tsc --noEmit -p .`).

## Where things live

- `src/plugin.ts` — the only runtime artifact. All UI logic, verbs, event
  handlers live here.
- `src/cyberphunk.theme.json` — the opencode TUI theme (12 colors + semantic
  aliases). Keep in sync with `~/.config/opencode/themes/cyberphunk.json`.
- `theme/colors.toml` — the **Omarchy** palette. Single source of truth for the
  whole desktop (borders, terminals, btop, editors, lock). Keep its 16 hex
  colors consistent with `src/cyberphunk.theme.json` when you change the palette.
- `theme/backgrounds/`, `theme/preview*.png`, `theme/unlock.png` — desktop art.
  Generated (SVG→PNG); regenerate rather than hand-edit if the look changes.
- `theme/lazygit.yml` — matching lazygit theme (installed by `install-theme.sh`).
- `install.sh` — one-liner installer for the TUI. Idempotent. Backs up `tui.json`.
- `install-theme.sh` — one-liner installer for the Omarchy desktop theme. Idempotent;
  stages `theme/` → `~/.config/omarchy/themes/cyberphunk`, offers the lazygit palette,
  never overwrites an existing `~/.config/lazygit/config.yml`.
- `tui.json` (in the *user's* `~/.config/opencode/`) — what actually loads
  the plugin at runtime. Do not commit a `tui.json` in this repo; it's a
  per-machine config.

## Testing workflow

There is no test runner. The only reliable oracle is:

1. Edit `src/plugin.ts` or the theme.
2. Copy to `~/.config/opencode/plugins/cyberphunk.ts` **or** point
   `tui.json → plugin` at `src/plugin.ts` directly (the latter is in
   `install.sh`).
3. Restart opencode (kill the TUI process, not the shell).
4. Watch `~/.local/state/cyberphunk/log.jsonl` for probe/err lines.
5. Press `ctrl+d` to open the deck, `esc` (or `ctrl+e`) to close.
6. Check the pane via `tmux capture-pane` (if in tmux) or by eye.

**Do not** rely on `tmux new-session` as the test harness — the test
process can attach to the host's `--auto` server via the inherited
`OPENCODE_PID` env var, and the TUI plugin path in that case never fires
(`tui()` doesn't run, only the `default` export is validated). Always
clear `OPENCODE_PID` and `OPENCODE` from the test env, or test by
restarting the real user window.

## What the real API is (from `@opencode-ai/plugin/dist/tui.d.ts`)

The plugin receives `TuiPluginApi` — **not** the `PluginInput` a server
plugin gets. The key surfaces:

- `api.slots.register({ id, slots: { home_logo, home_footer, app_bottom, … } })`
  — slot names are a fixed list; see `TuiHostSlotMap` in `tui.d.ts`.
- `api.ui.dialog.replace(render, onClose)` + `api.ui.dialog.setSize("medium"|"large"|"xlarge")`
  + `api.ui.dialog.clear()`.
- `api.ui.toast({ variant, title, message })`.
- `api.keymap.registerLayer({ commands: TuiCommandLike[], bindings: BindingLike[] })`.
- `api.theme.install(jsonPath)` + `api.theme.set(name)`.
- `api.state.session` — **object of methods** (`count()`, `get(id)`,
  `messages(id)`, `todo(id)`, `status(id)`, `permission(id)`, `question(id)`).
  Read the type, not the value.
- `api.route.current` — the active route; sessionID is at
  `.params.sessionID` when `route.current.name === "session"`.
- `api.attention.notify({ title, message, notification, sound })`.
- `api.kv.get(key, fallback)` / `api.kv.set(key, value)` — persist plugin
  state across TUI restarts.
- `api.event.on(type, handler)` — returns an unsubscribe. All event type
  names are in `@opencode-ai/sdk/dist/v2/gen/types.gen.d.ts`.

Don't guess field names from the surface list; read the types.

## Style

- ESM, TypeScript, `strict: true`, `noUncheckedIndexedAccess` not set.
- No `console.log` — use the built-in `probe`/`errlog` for diagnostics;
  they write to `~/.local/state/cyberphunk/log.jsonl`.
- No comments explaining *what* the code does (the code does that); short
  *why* comments only where the reason is non-obvious (e.g. the render
  contract above).
