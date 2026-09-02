"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTerminal } from "@/lib/terminal/store";
import { appendSystemEntry, runCommand } from "@/lib/terminal/run";
import { getVisibleCommands } from "@/lib/terminal/registry";
import { OutputBlock } from "@/components/terminal/OutputBlock";
import { Glyph } from "../Glyph";

const QUICK = ["help", "whoami", "juma", "aief", "sf", "posts", "history", "neofetch", "contact"];

/** The command engine is shared (it's content), but every pixel of chrome
 *  here is iOS: nav bar, scroll view, and a keyboard accessory bar. */
export function IosTerminal() {
  const entries = useTerminal((s) => s.entries);
  const resetKey = useTerminal((s) => s.resetKey);
  const inputValue = useTerminal((s) => s.inputValue);
  const setInput = useTerminal((s) => s.setInput);
  const scrollRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const d = new Date();
    appendSystemEntry(
      { type: "text", props: { text: `Last login: ${d.toDateString().slice(0, 10)} ${d.toTimeString().slice(0, 8)}`, tone: "muted" } },
      true,
    );
    appendSystemEntry(
      { type: "text", props: { text: "tap a command below, or type one.", tone: "muted" } },
      true,
    );
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [entries]);

  const suggest = useMemo(() => {
    const v = inputValue.trim().toLowerCase();
    if (!v) return [] as string[];
    return getVisibleCommands().map((c) => c.name).filter((n) => n.startsWith(v) && n !== v).slice(0, 4);
  }, [inputValue]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = inputValue;
    setInput("");
    runCommand(v, "typed");
  };

  return (
    <div className="ios-term">
      <header className="ios-term-bar">
        <span className="ios-term-title">yavor — zsh</span>
        <button type="button" className="ios-term-clear" onClick={() => useTerminal.getState().clearEntries()}>Clear</button>
      </header>

      <div className="ios-term-scroll" ref={scrollRef} key={resetKey}>
        {entries.map((e) => <OutputBlock key={e.id} entry={e} />)}
      </div>

      <div className="ios-term-accessory">
        <div className="ios-term-chips">
          {(suggest.length ? suggest : QUICK).map((c) => (
            <button key={c} type="button" onClick={() => { setInput(""); runCommand(c, "chip"); }}>
              {c}
            </button>
          ))}
        </div>
        <form className="ios-term-input" onSubmit={submit}>
          <span className="ios-term-prompt">%</span>
          <input
            value={inputValue}
            onChange={(e) => setInput(e.target.value)}
            placeholder="command"
            aria-label="Terminal command"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button type="submit" aria-label="Run" disabled={!inputValue.trim()}>
            <Glyph name="chevron" />
          </button>
        </form>
      </div>
    </div>
  );
}
