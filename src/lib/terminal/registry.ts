import eggs from "@/content/eggs.json";
import { THEME_NAMES, isThemeName } from "@/lib/themes";
import type { Command, CommandResult } from "./types";

const egg = (text: string): CommandResult => ({ kind: "block", blockType: "egg", props: { text } });

export const COMMANDS: Command[] = [
  {
    name: "help",
    aliases: ["?", "man"],
    description: "list every command",
    suggestedNext: ["whoami", "neofetch", "posts"],
    run: () => ({ kind: "block", blockType: "help" }),
  },
  {
    name: "whoami",
    aliases: ["about", "whois"],
    description: "who is this guy",
    suggestedNext: ["juma", "aief", "history"],
    run: () => ({ kind: "block", blockType: "whoami" }),
  },
  {
    name: "juma",
    aliases: ["team-gpt", "teamgpt"],
    description: "what I'm building now",
    suggestedNext: ["posts", "history", "contact"],
    run: () => ({ kind: "block", blockType: "juma" }),
  },
  {
    name: "aief",
    aliases: ["community", "aief.europe"],
    description: "the AI community I run in Sofia",
    suggestedNext: ["contact", "posts", "sf"],
    run: () => ({ kind: "block", blockType: "aief" }),
  },
  {
    name: "sf",
    aliases: ["sanfrancisco", "san-francisco"],
    description: "the San Francisco chapter",
    suggestedNext: ["history", "juma", "whoami"],
    run: () => ({ kind: "block", blockType: "sf" }),
  },
  {
    name: "posts",
    aliases: ["linkedin", "top"],
    description: "greatest hits from LinkedIn",
    suggestedNext: ["juma", "aief", "contact"],
    run: () => ({ kind: "block", blockType: "posts" }),
  },
  {
    name: "history",
    aliases: ["timeline", "log"],
    description: "career log, oldest first",
    suggestedNext: ["whoami", "juma", "neofetch"],
    run: () => ({ kind: "block", blockType: "history" }),
  },
  {
    name: "neofetch",
    aliases: ["fetch", "specs"],
    description: "me, as a system spec",
    suggestedNext: ["whoami", "history", "contact"],
    run: () => ({ kind: "block", blockType: "neofetch" }),
  },
  {
    name: "contact",
    aliases: ["hi", "email", "say-hi"],
    description: "say hi",
    suggestedNext: ["whoami", "aief", "help"],
    run: () => ({ kind: "block", blockType: "contact" }),
  },
  {
    name: "theme",
    description: "change the look — theme list | theme <name>",
    usage: "theme [name]",
    suggestedNext: [],
    run: ({ args, shell }) => {
      const arg = (args[0] === "set" ? args[1] : args[0])?.toLowerCase();
      if (!arg || arg === "list") return { kind: "block", blockType: "theme-list" };
      if (isThemeName(arg)) {
        shell.setTheme(arg);
        return { kind: "block", blockType: "theme-set", props: { name: arg } };
      }
      const near = THEME_NAMES.find((n) => n.startsWith(arg));
      return {
        kind: "text",
        text: `theme: no theme '${arg}'.${near ? ` did you mean '${near}'?` : ""} try 'theme list'.`,
        tone: "error",
      };
    },
  },
  {
    name: "clear",
    aliases: ["cls"],
    description: "wipe the screen",
    run: ({ shell }) => {
      shell.clear();
      return { kind: "none" };
    },
  },
  // ---- hidden / easter eggs ----
  {
    name: "sudo",
    hidden: true,
    description: "absolutely not",
    run: () => egg(eggs.sudo),
  },
  {
    name: "ls",
    aliases: ["dir"],
    hidden: true,
    description: "list sections",
    run: () => ({ kind: "block", blockType: "ls" }),
  },
  {
    name: "cd",
    hidden: true,
    description: "go nowhere",
    run: ({ args, shell }) => {
      const target = args[0]?.replace(/\/$/, "").toLowerCase();
      if (target && ["juma", "aief", "sf", "posts", "history"].includes(target)) {
        shell.run(target, "chip");
        return { kind: "none" };
      }
      return egg(eggs.cd);
    },
  },
  { name: "cat", hidden: true, description: "read files", run: () => egg(eggs.cat) },
  { name: "vim", aliases: ["vi", "nvim"], hidden: true, description: "editor wars", run: () => egg(eggs.vim) },
  { name: "emacs", hidden: true, description: "editor wars", run: () => egg(eggs.emacs) },
  { name: "coffee", aliases: ["brew"], hidden: true, description: "essential", run: () => egg(eggs.coffee) },
  { name: "exit", aliases: ["logout", "quit", ":q", ":q!"], hidden: true, description: "no", run: () => egg(eggs.exit) },
  {
    name: "matrix",
    hidden: true,
    description: "wake up",
    run: () => ({ kind: "block", blockType: "matrix" }),
  },
  {
    name: "reboot",
    hidden: true,
    description: "replay the boot",
    run: () => {
      try {
        localStorage.removeItem("yc:boot:v1");
      } catch {}
      if (typeof window !== "undefined") window.location.reload();
      return { kind: "none" };
    },
  },
];

const lookup = new Map<string, Command>();
for (const cmd of COMMANDS) {
  lookup.set(cmd.name, cmd);
  for (const a of cmd.aliases ?? []) lookup.set(a, cmd);
}

export function resolveCommand(token: string): Command | undefined {
  return lookup.get(token);
}

export function getVisibleCommands(): Command[] {
  return COMMANDS.filter((c) => !c.hidden);
}

export function getCompletions(prefix: string): string[] {
  if (!prefix) return [];
  const names = COMMANDS.filter((c) => !c.hidden).map((c) => c.name);
  return names.filter((n) => n.startsWith(prefix.toLowerCase()) && n !== prefix);
}
