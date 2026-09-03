/// <reference types="node" />
/**
 * CyberPhunk — TUI reskin for opencode 1.18.23.
 *
 * Render contract — mirrors the host's OWN plugins (verified in the binary):
 *   slot:   home_footer(){ return createComponent(Comp, { api }) }
 *   dialog: ui.dialog.replace(() => createComponent(Comp, { api }))
 * i.e. the renderer needs real Solid renderables (createComponent), not raw
 * {type,props} objects. Comp is built with the host reconciler via jsx().
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { jsx } from "@opentui/solid/jsx-runtime";
import { createComponent } from "@opentui/solid";

const ID = "das.cyberphunk";
const VERSION = "1.2.0";
const THEME = "cyberphunk";

// Portable path resolution (no hardcoded user paths).
const home = () => process.env["HOME"] ?? ".";
const cfg = (n: string) => (process.env["XDG_CONFIG_HOME"] ? path.join(process.env["XDG_CONFIG_HOME"], n) : path.join(home(), ".config", n));
const state = (n: string) => (process.env["XDG_STATE_HOME"] ? path.join(process.env["XDG_STATE_HOME"], n) : path.join(home(), ".local", "state", n));
const here = path.dirname(fileURLToPath(import.meta.url));

const LOG = state("cyberphunk/log.jsonl");
const DIAG = state("cyberphunk/api-diag.json");
// Theme: standard install location first, then next-to-this-file (in-repo dev).
const _themeCandidates = [
  process.env["CP_THEME_FILE"] ?? "",
  cfg("opencode/themes/" + THEME + ".json"),
  path.join(here, "cyberphunk.theme.json"),
  path.join(here, "src" + path.sep + "cyberphunk.theme.json"),
].filter(Boolean);
const THEME_FILE = (typeof process !== "undefined" && _themeCandidates.find((p) => { try { return fs.existsSync(p); } catch { return false; } })) ?? _themeCandidates[0];

const CYAN = "#22E4FF", PINK = "#FF6BD6", FOOT = "#4A6B82", AMBER = "#FFB74D", BG = "#060A14";

const _ensureLog = () => { try { const d = LOG.slice(0, LOG.lastIndexOf("/")); fs.mkdirSync(d, { recursive: true }); } catch {} };
const probe = (tag: string, x?: object) => { try { _ensureLog(); fs.appendFileSync(LOG, JSON.stringify({ tag, pid: process.pid, at: Date.now(), ...(x ?? {}) }) + "\n"); } catch {} };
const errlog = (tag: string, e: unknown) => { try { _ensureLog(); fs.appendFileSync(LOG, JSON.stringify({ tag, err: String((e as any)?.message ?? e) }) + "\n"); } catch {}; };
const isTui = (a: any) => !!a && typeof a.slots?.register === "function" && typeof a.ui?.toast === "function" && typeof a.theme?.install === "function";

const txt = (fg: string, s: string, extra: any = {}) => jsx("text", { fg, children: s, ...extra });
const row = (gap: number, c: any[]) => jsx("box", { flexDirection: "row", gap, children: c });
const col = (gap: number, c: any[]) => jsx("box", { flexDirection: "column", gap, children: c });

// ── State (module-level, shared across components) ──────────────────────────
const feed: string[] = [];
const push = (ev: string, p?: any) => {
  const t = new Date().toISOString().slice(11, 19);
  const extra = p && typeof p === "object" && typeof p.type === "string" ? " type=" + p.type : "";
  feed.unshift(t + " " + ev + extra);
  if (feed.length > 12) feed.length = 12;
};

// ── KV enable/disable ────────────────────────────────────────────────────────
const KV_KEY = "cyberphunk.enabled";
const isOn = (api: any) => { try { return api.kv ? api.kv.get(KV_KEY, true) !== false : true } catch { return true } };
const setOn = (api: any, v: boolean) => { try { api.kv?.set(KV_KEY, v) } catch {} };

// ── Real data readers ────────────────────────────────────────────────────────
// api.state.session is an object of METHODS (count/get/messages/todo/status),
// each taking a sessionID. The active sessionID comes from api.route.current
// on a "session" route. Model/tokens/cost/title live on Session from .get().
const readState = (api: any) => {
  const out: any = { home: true, sessions: 0, title: "home screen (no active session)", model: "—", cost: "—", tokens: "—", msgs: 0, todos: [] as { c: string; s: string }[] };
  try {
    const S = api.state?.session ?? {};
    out.sessions = typeof S.count === "function" ? S.count() : 0;
    const rc = api.route?.current;
    const sid: string | null = rc && rc.params && rc.params.sessionID ? rc.params.sessionID : null;
    if (!sid) return out;
    out.home = false;
    let sess: any = null;
    try { sess = S.get ? S.get(sid) : null; } catch {}
    if (sess) {
      out.title = sess.title ?? "(untitled)";
      out.model = sess.model ? `${sess.model.providerID ?? ""}/${sess.model.id ?? ""}${sess.model.variant ? " · " + sess.model.variant : ""}` : "—";
      out.cost = typeof sess.cost === "number" ? "$" + sess.cost.toFixed(4) : "—";
      if (sess.tokens) out.tokens = `${sess.tokens.input ?? 0} in · ${sess.tokens.output ?? 0} out`;
      try { const m = S.messages ? S.messages(sid) : null; out.msgs = Array.isArray(m) ? m.length : 0; } catch {}
      try {
        const t = S.todo ? S.todo(sid) : null;
        if (Array.isArray(t) && t.length) out.todos = t.slice(0, 5).map((x: any) => ({ c: x?.content ?? "(todo)", s: x?.status ?? "?" }));
      } catch {}
    }
  } catch (e) { out.err = String((e as any)?.message ?? e); }
  return out;
};

const todoMark = (s: string) => s === "completed" ? "✓" : s === "in_progress" ? "▸" : s === "cancelled" ? "✗" : "·";

// ── Components ───────────────────────────────────────────────────────────────
const Logo = () => jsx("box", { gap: 0, children: [
  txt(CYAN, "CYBERPHUNK", { fontWeight: "bold" }),
  txt(PINK, "   the fook is in the machine"),
  txt(FOOT, "   v" + VERSION),
] });

const Footer = () => row(2, [
  txt(CYAN, "CYBERPHUNK", { fontWeight: "bold" }),
  txt(PINK, "optimize · fook"),
  txt(FOOT, "· ctrl+d deck · /deck open · /cyberphunk.off"),
]);

// Inline persistent pill (app_bottom, shown on every screen).
// Full brand word — never abbreviated, per the project's hard rule.
const Pill = ({ api }: any) => {
  const d = readState(api);
  const last = feed[0] ?? "quiet";
  const children: any[] = [
    txt(CYAN, "◉", { fontWeight: "bold" }),
    txt(CYAN, "CYBERPHUNK", { fontWeight: "bold" }),
    txt(FOOT, "·"),
    txt(d.home ? FOOT : CYAN, d.home ? "home" : (d.title ?? "session").slice(0, 40)),
    txt(d.model === "—" ? FOOT : CYAN, d.model),
    ...(d.cost !== "—" ? [txt(AMBER, d.cost)] : []),
    txt(FOOT, "· feed: " + last.slice(0, 60)),
  ];
  return row(4, children);
};

// Compact: every line stays < 26 chars so it never wraps in a sized dialog.
const EMBLEM: string[] = [
  "╭─────────────────╮",
  "│   ◉       ◉     │",
  "│   ────────      │",
  "╰─────────────────╯",
];
const STAGES: [string, string][] = [
  ["neon theme", "linked"],
  ["deck + pill", "live"],
  ["fook", "online"],
];
const PROGRESS = [12, 48, 82, 100];
const BAR_LEN = 12;

const SplashFrame = ({ frame }: { frame: number }) => {
  const ready = frame >= STAGES.length;
  const pct = PROGRESS[Math.min(frame, PROGRESS.length - 1)] ?? 0;
  const filled = Math.round((pct / 100) * BAR_LEN);
  const bar = "█".repeat(filled) + "░".repeat(BAR_LEN - filled);
  const lit = STAGES.slice(0, frame);
  const state = ready ? "READY" : "BOOT";
  const head = (state + " · v" + VERSION).padEnd(18) + (ready ? "◆" : "⠋");
  const children: any[] = [
    txt(CYAN, "CYBERPHUNK", { fontWeight: "bold" }),
    txt(PINK, "the fook is in the machine"),
    ...EMBLEM.map((l) => txt(CYAN, l, { fontWeight: "bold" })),
    txt(FOOT, head, { fontWeight: ready ? "bold" : "normal" }),
    ...lit.map(([k, v]) => txt(CYAN, "▸ " + k.padEnd(14) + v)),
    txt(pct >= 100 ? AMBER : FOOT, "boot [" + bar + "] " + pct + "%"),
    ...(ready ? [txt(PINK, "◆ READY — press a key", { fontWeight: "bold" })] : []),
  ];
  return jsx("box", {
    gap: 1,
    padding: [3, 4, 3, 4],
    backgroundColor: BG,
    borderColor: CYAN,
    border: [true, true, true, true],
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    children,
  });
};

const Deck = ({ api }: any) => {
  const d = readState(api);
  const lines = feed.length ? feed.map((l) => txt(FOOT, "    " + l)) : [txt(FOOT, "    (no events yet — the machine is idle)")];
  const todoLines = d.todos.length
    ? d.todos.map((t: any) => txt(t.s === "in_progress" ? PINK : t.s === "completed" ? CYAN : FOOT, "    " + todoMark(t.s) + "  " + t.c))
    : [txt(FOOT, "    (no active todos)")];
  const children: any[] = [
    row(1, [ txt(CYAN, "  ▮▮ THE DECK", { fontWeight: "bold" }), txt(PINK, "  the system is foking") ]),
    txt(FOOT, "    " + (d.home ? "◦ " : "● ") + d.title),
    row(2, [
      txt(FOOT, "model "), txt(CYAN, d.model, { fontWeight: "bold" }),
      txt(FOOT, "   cost "), txt(d.cost === "—" ? FOOT : AMBER, d.cost, { fontWeight: d.cost === "—" ? "normal" : "bold" }),
    ]),
    ...(d.tokens !== "—" ? [txt(FOOT, "    " + d.tokens)] : []),
    row(2, [ txt(FOOT, "msgs "), txt(AMBER, String(d.msgs)), txt(FOOT, "   total sessions "), txt(AMBER, String(d.sessions)) ]),
    col(0, [ txt(PINK, "    ▮ todos", { fontWeight: "bold" }), ...todoLines ]),
    col(0, [ txt(PINK, "    ▮ live event feed", { fontWeight: "bold" }), ...lines ]),
    ...(d.err ? [txt(PINK, "    ⚠ " + d.err)] : []),
    txt(FOOT, "    esc / ctrl+e → close deck      ctrl+d → open"),
  ];
  return jsx("box", { gap: 2, padding: 1, backgroundColor: BG, borderColor: CYAN, border: [true, true, true, true], children });
};

// ── Boot ─────────────────────────────────────────────────────────────────────
async function run(api: any) {
  if (!isTui(api)) { probe("not-tui"); return {}; }
  probe("tui", { keys: Object.keys(api).sort().join(",") });

  // 1. Theme
  try { await api.theme.install(THEME_FILE); api.theme.set(THEME); probe("theme-ok"); }
  catch (e) {
    errlog("theme", e);
    try { api.ui.toast({ variant: "error", title: "CYBERPHUNK", message: "theme: " + String((e as any)?.message ?? e) }); } catch {}
  }

  // 2. Slots — home logo + footer + persistent bottom pill
  try {
    api.slots.register({ id: ID, slots: {
      home_logo:   () => createComponent(Logo   as any, { api }),
      home_footer: () => createComponent(Footer as any, { api }),
      app_bottom:  () => createComponent(Pill   as any, { api }),
    } });
    probe("slots-ok");
  } catch (e) {
    errlog("slots", e);
    try { api.ui.toast({ variant: "warning", title: "CYBERPHUNK", message: "slots: " + String((e as any)?.message ?? e) }); } catch {}
  }

  // 3. Live event feed — real event names from @opencode-ai/sdk v2 Event union
  if (api.event?.on) {
    const events: any[] = [
      "session.idle", "session.status", "session.compacted",
      "permission.asked", "permission.replied",
      "question.asked", "question.replied", "question.rejected",
      "todo.updated", "vcs.branch.updated", "pty.exited",
    ];
    for (const ev of events) {
      try { api.event.on(ev, (p: any) => push(ev, p)); } catch {}
    }
    // Attention: fire a desktop notification on error/question/permission (blurred only).
    // Honors /cyberphunk.off — notifications are part of what "off" mutes, per README.
    try {
      api.event.on("session.error", (p: any) => {
        if (!isOn(api)) return; // muted — off means off
        try {
          api.attention?.notify({
            title: "CYBERPHUNK · session error",
            message: String(p?.properties?.error ?? "the machine hit a snag"),
            notification: { when: "blurred" },
            sound: { name: "error", when: "blurred" },
          });
        } catch {}
      });
    } catch {}
    probe("feed-ok", { events });
  }

  // 4. Splash — staged boot, hold on READY long enough to read, then clear.
  //    Timer hygiene: every timeout handle is tracked; any user interaction
  //    with the dialog system (deck open, esc, another dialog replace) bumps
  //    splashGen so pending splash timers no-op instead of stomping the
  //    user's dialog, and the trailing clear() only fires while the splash
  //    generation is still the active one.
  try {
    if (isOn(api)) {
      const STEP = 380, HOLD = 1700;
      let splashGen = 0;
      const timers: ReturnType<typeof setTimeout>[] = [];
      const cancelTimers = () => { for (const t of timers) clearTimeout(t); timers.length = 0; };
      const invalidate = () => { splashGen++; cancelTimers(); };
      const show = (gen: number, frame: number) => {
        if (gen !== splashGen) return; // superseded — never touch the dialog
        try {
          api.ui.dialog.replace(() => createComponent(SplashFrame as any, { api, frame }), invalidate);
          api.ui.dialog.setSize("xlarge");
        } catch (e) { errlog("splash", e); }
      };
      const clearIfOurs = (gen: number) => {
        if (gen !== splashGen) return; // user opened something else — leave it alone
        try { api.ui.dialog.clear(); } catch {}
      };
      const gen = splashGen;
      show(gen, 0);
      for (let f = 1; f <= STAGES.length; f++) timers.push(setTimeout(() => show(gen, f), STEP * f));
      timers.push(setTimeout(() => clearIfOurs(gen), STEP * STAGES.length + HOLD));
      // User opening the deck / any verb during the splash kills the splash timers.
      for (const ev of ["keydown", "dialog.replace"]) {
        try { api.event?.on?.(ev as any, invalidate); } catch {}
      }
      probe("splash");
    }
  } catch (e) {
    errlog("splash", e);
  }

  // 5. Verbs — deck, cyberphunk on/off, notify, diag
  const openDeck = () => {
    if (!isOn(api)) {
      try { api.ui.toast({ variant: "warning", title: "CYBERPHUNK", message: "off — run /cyberphunk.on" }); } catch {}
      return;
    }
    try { api.ui.dialog.replace(() => createComponent(Deck as any, { api }), () => {}); api.ui.dialog.setSize("large"); probe("deck-open"); }
    catch (e) { errlog("deck-open", e); try { api.ui.toast({ variant: "error", title: "CYBERPHUNK", message: "deck: " + String((e as any)?.message ?? e) }); } catch {} }
  };
  const closeDeck = () => { try { api.ui.dialog.clear(); probe("deck-close"); } catch {} };
  const cyberphunkOn = () => { setOn(api, true); try { api.ui.toast({ variant: "success", title: "CYBERPHUNK", message: "on · fooking" }); } catch {} };
  const cyberphunkOff = () => { setOn(api, false); try { api.ui.toast({ variant: "warning", title: "CYBERPHUNK", message: "off · idle mode" }); } catch {} };
  const notify = () => {
    try {
      api.attention?.notify({
        title: "CYBERPHUNK",
        message: "hello from the machine",
        notification: true,
        sound: { name: "default", when: "always" },
      });
    } catch (e) { errlog("notify", e); }
  };
  const diag = () => {
    try {
      const shape: any = {
        at: new Date().toISOString(),
        keys: Object.keys(api).sort(),
        ui: Object.keys(api.ui ?? {}),
        route: api.route,
        state: {
          keys: Object.keys(api.state ?? {}),
          session: { keys: Object.keys(api.state?.session ?? {}) },
          config: api.state?.config
            ? { keys: Object.keys(api.state.config), provider_count: Array.isArray((api.state.config as any).provider) ? (api.state.config as any).provider.length : null }
            : null,
        },
        tuiConfig: api.tuiConfig ? { keys: Object.keys(api.tuiConfig) } : null,
        kv: api.kv ? { get: api.kv.get(KV_KEY, true) } : null,
        active: { title: readState(api).title, model: readState(api).model },
        feed: [...feed],
        version: VERSION,
      };
      fs.writeFileSync(DIAG, JSON.stringify(shape, null, 2));
      try { api.ui.toast({ variant: "success", title: "CYBERPHUNK", message: "diag written to " + DIAG }); } catch {}
      probe("diag");
    } catch (e) { errlog("diag", e); }
  };

  try {
    api.keymap.registerLayer({
      commands: [
        { name: "deck",              title: "Open the deck (HUD)",     slashName: "deck",           category: "CyberPhunk", namespace: "palette", run: openDeck },
        { name: "deck.close",        title: "Close the deck",          slashName: "deck-close",     category: "CyberPhunk", namespace: "palette", run: closeDeck },
        { name: "cyberphunk.on",     title: "CyberPhunk on",           slashName: "cyberphunk.on",  category: "CyberPhunk", namespace: "palette", run: cyberphunkOn },
        { name: "cyberphunk.off",    title: "CyberPhunk off",          slashName: "cyberphunk.off", category: "CyberPhunk", namespace: "palette", run: cyberphunkOff },
        { name: "cyberphunk.notify", title: "Send a test notification",slashName: "cyberphunk.notify", category: "CyberPhunk", namespace: "palette", run: notify },
        { name: "cyberphunk.diag",   title: "Write API diagnostic",    slashName: "cyberphunk.diag", category: "CyberPhunk", namespace: "palette", run: diag },
      ],
      bindings: [
        { key: "ctrl+d", desc: "Open the deck", group: "Global", cmd: openDeck },
        { key: "ctrl+e", desc: "Close the deck", group: "Global", cmd: closeDeck },
        { key: "esc", desc: "Close the deck", group: "Deck dialog", cmd: closeDeck },
      ],
    });
    probe("verbs-ok");
  } catch (e) { errlog("verbs", e); }

  return {};
}

probe("MODULE-IMPORT");
export const tui = (api: any) => run(api);
export default { id: ID, tui: (api: any) => run(api) };
