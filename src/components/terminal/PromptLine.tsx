"use client";

import { useMemo, useRef, useState } from "react";
import { useTerminal } from "@/lib/terminal/store";
import { runCommand } from "@/lib/terminal/run";
import { getCompletions } from "@/lib/terminal/registry";
import { THEME_NAMES } from "@/lib/themes";

export function PromptLine() {
  const inputValue = useTerminal((s) => s.inputValue);
  const setInput = useTerminal((s) => s.setInput);
  const historyPrev = useTerminal((s) => s.historyPrev);
  const historyNext = useTerminal((s) => s.historyNext);
  const booting = useTerminal((s) => s.booting);
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const ghost = useMemo(() => {
    const trimmed = inputValue.trimStart();
    if (trimmed.startsWith("theme ")) {
      const arg = trimmed.slice(6);
      const match = arg ? THEME_NAMES.find((n) => n.startsWith(arg) && n !== arg) : undefined;
      return match ? match.slice(arg.length) : "";
    }
    if (!trimmed || trimmed.includes(" ")) return "";
    const completions = getCompletions(trimmed);
    return completions[0] ? completions[0].slice(trimmed.length) : "";
  }, [inputValue]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      const value = inputValue;
      setInput("");
      runCommand(value, "typed");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      historyPrev();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      historyNext();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (ghost) setInput(inputValue + ghost);
    } else if (e.key === "Escape") {
      setInput("");
    }
  };

  return (
    <form
      className="prompt-line"
      onSubmit={(e) => e.preventDefault()}
      data-testid="prompt"
    >
      <label className="sr-only" htmlFor="cmd-input">
        Command input. Type a command, or use the suggested command buttons. Try &quot;help&quot;.
      </label>
      <span className="prompt-glyph" aria-hidden="true">
        <span className="zsh-user">yavor@MacBook-Pro</span> <span className="zsh-path">~</span> %
      </span>
      <div className="prompt-input-wrap">
        <input
          id="cmd-input"
          ref={inputRef}
          className="prompt-input"
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={booting}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={booting ? "" : "type a command…"}
        />
        {ghost && focused && (
          <span className="prompt-ghost" aria-hidden="true">
            <span className="prompt-ghost-typed">{inputValue}</span>
            {ghost}
          </span>
        )}
      </div>
    </form>
  );
}
