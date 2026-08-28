"use client";

import { useEffect, useRef } from "react";
import { useTerminal } from "@/lib/terminal/store";
import { appendSystemEntry, runCommand } from "@/lib/terminal/run";
import { BOOT_STORAGE_KEY, FULL_BOOT, SHORT_BOOT, type BootLine } from "@/lib/boot/bootScript";
import { trackEvent } from "@/lib/analytics";
import { OutputLog } from "./OutputLog";
import { PromptLine } from "./PromptLine";
import { ChipTray } from "./ChipTray";

function appendBootLine(line: BootLine, instant: boolean): void {
  if (line.text === "@logo") {
    appendSystemEntry({ type: "boot-logo" }, instant);
  } else {
    appendSystemEntry(
      { type: "boot-line", props: { text: line.text, status: line.status, tone: line.tone, instant } },
      instant,
    );
  }
}

function markBooted(): void {
  try {
    const prev = localStorage.getItem(BOOT_STORAGE_KEY);
    const count = prev ? (JSON.parse(prev).count ?? 0) + 1 : 1;
    localStorage.setItem(BOOT_STORAGE_KEY, JSON.stringify({ seenAt: Date.now(), count }));
  } catch {}
}

export function Terminal() {
  const setBooting = useTerminal((s) => s.setBooting);
  const booting = useTerminal((s) => s.booting);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const variant = document.documentElement.dataset.boot ?? "full";
    const script = variant === "short" ? SHORT_BOOT : FULL_BOOT;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let idx = 0;
    let finished = false;

    const finish = (skipped: boolean) => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onSkip, true);
      window.removeEventListener("pointerdown", onSkip, true);
      // append any remaining lines instantly
      for (let i = idx; i < script.length; i++) {
        const line = script[i];
        if (line) appendBootLine(line, true);
      }
      markBooted();
      trackEvent("boot", { outcome: skipped ? "skipped" : "completed" });
      runCommand("whoami", "boot", skipped);
      setBooting(false);
      // focus input on fine-pointer devices only
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        document.getElementById("cmd-input")?.focus();
      }
    };

    const onSkip = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.key === "Meta" || e.key === "Control" || e.key === "Alt" || e.key === "Shift")) return;
      finish(true);
    };

    if (variant === "static") {
      for (const line of script) appendBootLine(line, true);
      idx = script.length;
      finish(false);
      return;
    }

    window.addEventListener("keydown", onSkip, true);
    window.addEventListener("pointerdown", onSkip, true);

    let t = 100;
    script.forEach((line, i) => {
      t += line.delayBefore + (line.statusDelay ?? 0);
      timers.push(
        setTimeout(() => {
          appendBootLine(line, false);
          idx = i + 1;
          if (i === script.length - 1) {
            timers.push(setTimeout(() => finish(false), 250));
          }
        }, t),
      );
    });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("keydown", onSkip, true);
      window.removeEventListener("pointerdown", onSkip, true);
    };
  }, [setBooting]);

  // click anywhere focuses input (desktop only, never over selections/interactive)
  const onShellClick = (e: React.MouseEvent) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, img, [data-no-focus]")) return;
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;
    document.getElementById("cmd-input")?.focus();
  };

  return (
    <main className="terminal" aria-label="Yavor Belakov interactive terminal" onClick={onShellClick}>
      <h1 className="sr-only">Yavor Belakov — yavor.codes interactive terminal</h1>
      <OutputLog />
      <div className="terminal-footer">
        <ChipTray />
        <PromptLine />
        {booting && (
          <p className="skip-hint" aria-hidden="true">
            press any key to skip
          </p>
        )}
      </div>
    </main>
  );
}
