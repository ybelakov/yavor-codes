"use client";

import { runCommand } from "@/lib/terminal/run";

export function Chip({ command, label }: { command: string; label?: string }) {
  return (
    <button
      type="button"
      className="chip"
      onClick={() => runCommand(command, "chip")}
    >
      {label ?? command} <span className="chip-arrow" aria-hidden="true">→</span>
    </button>
  );
}
