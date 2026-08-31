"use client";

import { useEffect, useRef } from "react";
import { appendSystemEntry } from "@/lib/terminal/run";
import { OutputLog } from "@/components/terminal/OutputLog";
import { PromptLine } from "@/components/terminal/PromptLine";
import { ChipTray } from "@/components/terminal/ChipTray";

function loginLine(): string {
  const d = new Date();
  const stamp = d.toDateString().slice(0, 10) + " " + d.toTimeString().slice(0, 8);
  return `Last login: ${stamp} on ttys001`;
}

export function TerminalApp() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    appendSystemEntry({ type: "text", props: { text: loginLine(), tone: "muted" } }, true);
    appendSystemEntry(
      {
        type: "text",
        props: { text: "type 'help' to see what this thing can do, or tap a chip below.", tone: "muted" },
      },
      true,
    );
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      setTimeout(() => document.getElementById("cmd-input")?.focus(), 60);
    }
  }, []);

  const onClick = (e: React.MouseEvent) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const t = e.target as HTMLElement;
    if (t.closest("a, button, input, img, [data-no-focus]")) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    document.getElementById("cmd-input")?.focus();
  };

  return (
    <div className="terminal terminal-app" onClick={onClick}>
      <OutputLog />
      <div className="terminal-footer">
        <ChipTray />
        <PromptLine />
      </div>
    </div>
  );
}
