import { trackEvent } from "@/lib/analytics";
import eggsJson from "@/content/eggs.json";
import { nextEntryId } from "./ids";
import { tokenize } from "./parser";
import { getVisibleCommands, resolveCommand } from "./registry";
import { suggest } from "./fuzzy";
import { useTerminal } from "./store";
import type { CommandResult, HistoryEntry, InputSource, ShellApi } from "./types";

let themeSetter: ((name: string) => boolean) | null = null;
export function registerThemeSetter(fn: (name: string) => boolean): void {
  themeSetter = fn;
}

const shell: ShellApi = {
  clear: () => useTerminal.getState().clearEntries(),
  run: (input, source = "chip") => runCommand(input, source),
  setTheme: (name) => (themeSetter ? themeSetter(name) : false),
};

function resultToEntry(
  raw: string,
  source: InputSource,
  result: CommandResult | null,
  status: "ok" | "error",
  instant: boolean,
): HistoryEntry {
  let block: HistoryEntry["block"] = null;
  if (result) {
    if (result.kind === "block") block = { type: result.blockType, props: result.props };
    else if (result.kind === "text")
      block = { type: "text", props: { text: result.text, tone: result.tone ?? "default" } };
  }
  return { id: nextEntryId(), input: raw || null, source, status, block, instant, ts: Date.now() };
}

export function runCommand(raw: string, source: InputSource, instant = false): void {
  const state = useTerminal.getState();
  const parsed = tokenize(raw);

  if (!parsed.command) {
    state.appendEntry(resultToEntry("", source, null, "ok", instant));
    return;
  }

  if (source === "typed" || source === "chip") state.pushInputHistory(parsed.raw);

  const cmd = resolveCommand(parsed.command);
  if (!cmd) {
    const names = getVisibleCommands().map((c) => c.name);
    const suggestions = suggest(parsed.command, names);
    const hints = eggsJson.notfound;
    const hint = hints[Math.floor(Math.random() * hints.length)] ?? hints[0];
    trackEvent("command_unknown", { input: parsed.command.slice(0, 40) });
    state.appendEntry(
      resultToEntry(
        parsed.raw,
        source,
        { kind: "block", blockType: "not-found", props: { input: parsed.command, suggestions, hint } },
        "error",
        instant,
      ),
    );
    return;
  }

  trackEvent("command_run", { command: cmd.name, source });
  const result = cmd.run({ args: parsed.args, raw: parsed.raw, shell });
  if (result.kind === "none") {
    if (cmd.name !== "clear") return;
    return;
  }
  state.appendEntry(resultToEntry(parsed.raw, source, result, "ok", instant));
}

export function appendSystemEntry(block: HistoryEntry["block"], instant = false): void {
  useTerminal.getState().appendEntry({
    id: nextEntryId(),
    input: null,
    source: "system",
    status: "ok",
    block,
    instant,
    ts: Date.now(),
  });
}
