"use client";

import { getVisibleCommands } from "@/lib/terminal/registry";
import { runCommand } from "@/lib/terminal/run";
import { ChipRow } from "./shared";

export function HelpBlock() {
  const commands = getVisibleCommands();
  return (
    <div className="block-frame">
      <h2 className="block-title">yavor.codes — available commands</h2>
      <dl className="help-grid">
        {commands.map((c) => (
          <div key={c.name} className="help-row">
            <dt>
              <button type="button" className="cmd-link" onClick={() => runCommand(c.name, "chip")}>
                {c.name}
              </button>
            </dt>
            <dd>{c.description}</dd>
          </div>
        ))}
      </dl>
      <p className="dim-hint">psst: this terminal has secrets. try things.</p>
      <ChipRow commands={["whoami", "neofetch", "posts"]} />
    </div>
  );
}
