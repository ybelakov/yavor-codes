"use client";

import { useTerminal } from "@/lib/terminal/store";
import { resolveCommand } from "@/lib/terminal/registry";
import { runCommand } from "@/lib/terminal/run";

const ANCHORS = ["help", "whoami", "theme", "clear"];
const INITIAL = ["help", "whoami", "juma", "posts", "contact", "theme"];

export function ChipTray() {
  const entries = useTerminal((s) => s.entries);
  const booting = useTerminal((s) => s.booting);

  const last = [...entries].reverse().find((e) => e.input);
  const lastCmd = last?.input ? resolveCommand(last.input.split(" ")[0] ?? "") : undefined;
  const contextual = (lastCmd?.suggestedNext ?? []).slice(0, 3);
  const chips = lastCmd
    ? [...contextual, ...ANCHORS.filter((a) => !contextual.includes(a))]
    : INITIAL;

  return (
    <nav className="chip-tray" aria-label="Suggested commands">
      <div className="chip-tray-scroll">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            className="chip"
            disabled={booting}
            onClick={() => runCommand(c, "chip")}
          >
            {c}
          </button>
        ))}
      </div>
    </nav>
  );
}
