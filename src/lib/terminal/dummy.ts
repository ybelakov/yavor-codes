import type { Command, CommandResult } from "./types";

const text = (t: string, tone: "default" | "error" | "muted" = "default"): CommandResult => ({
  kind: "text",
  text: t,
  tone,
});

const pre = (t: string): CommandResult => ({ kind: "block", blockType: "pre", props: { text: t } });

function shortDate(): string {
  return new Date().toString().replace(/ \(.*\)$/, "");
}

/**
 * Commands that exist purely so poking around feels like a real shell.
 * All hidden from `help` — discovering them is the point.
 */
export const DUMMY_COMMANDS: Command[] = [
  {
    name: "pwd",
    hidden: true,
    description: "print working directory",
    run: () => text("/home/yavor"),
  },
  {
    name: "whoareyou",
    aliases: ["id"],
    hidden: true,
    description: "user id",
    run: () => text("uid=1000(yavor) gid=1000(builders) groups=1000(builders),27(sudo-denied),42(aief)"),
  },
  {
    name: "echo",
    hidden: true,
    description: "echo back",
    run: ({ args }) => text(args.join(" ") || ""),
  },
  {
    name: "date",
    hidden: true,
    description: "current date",
    run: () => text(shortDate()),
  },
  {
    name: "uname",
    hidden: true,
    description: "system info",
    run: ({ args }) =>
      text(
        args.includes("-a")
          ? "Darwin yavor.codes 24.0.0 Darwin Kernel Version 24.0.0; MacBook Pro M4 Max arm64"
          : "Darwin",
      ),
  },
  {
    name: "uptime",
    hidden: true,
    description: "how long since boot",
    run: () =>
      text(
        `${new Date().toTimeString().slice(0, 5)}  up since Sep 1999, 3 users, load average: 0.42, 1.00, 9.99`,
      ),
  },
  {
    name: "top",
    aliases: ["htop", "ps"],
    hidden: true,
    description: "running processes",
    run: () =>
      pre(
        [
          "  PID  USER   %CPU  %MEM  COMMAND",
          "    1  yavor  42.0   8.1  juma --serve --marketers",
          "  128  yavor  31.4   4.2  aief-europe --events=50 --next=51",
          "  256  yavor  18.7   2.0  cursor --agent --background",
          "  512  yavor  12.3   1.4  claude-code",
          " 1024  yavor   6.6  22.0  coffee.service (leaking)",
          " 2048  yavor   0.1   0.0  sleep (rarely scheduled)",
        ].join("\n"),
      ),
  },
  {
    name: "git",
    hidden: true,
    description: "version control",
    run: ({ args }) => {
      const sub = args[0];
      if (sub === "status")
        return pre(
          [
            "On branch main",
            "Your branch is ahead of 'origin/main' by 3 commits.",
            "",
            "Changes not staged for commit:",
            "\tmodified:   life/work-life-balance.md",
            "\tmodified:   sleep-schedule.json",
            "",
            "Untracked files:",
            "\tideas/",
            "",
            'no changes added to commit (use "git add" — or just ship it)',
          ].join("\n"),
        );
      if (sub === "log")
        return pre(
          [
            "beda963 (HEAD -> main) launch Juma at True Ventures HQ",
            "a4f1c02 cross $1M ARR",
            "77e9d31 host After Hours #50",
            "1b3d8fa win $1K at an SF hackathon",
            "0000001 hello, world",
          ].join("\n"),
        );
      if (sub === "push") return text("Everything up-to-date. (this site deploys on merge to main)");
      if (sub === "blame") return text("it was probably me.");
      if (sub === "rebase")
        return text("we don't rebase here. we merge. always merge.", "error");
      return text("usage: git <status|log|push|blame>  — try 'history' for the real log.", "muted");
    },
  },
  {
    name: "npm",
    aliases: ["pnpm", "yarn", "bun"],
    hidden: true,
    description: "package manager",
    run: ({ args, raw }) => {
      const mgr = raw.split(" ")[0] ?? "npm";
      if (args[0] === "install" || args[0] === "i" || args[0] === "add")
        return pre(
          [
            `${mgr}: resolving dependencies…`,
            "added 1 package in 0.3s",
            "",
            "  + curiosity@1.0.0",
            "",
            "1 package is looking for funding — run 'contact'",
          ].join("\n"),
        );
      if (args[0] === "run" || args[0] === "start" || args[0] === "dev")
        return text("already running. you're looking at it.");
      return text(`usage: ${mgr} <install|run|start>`, "muted");
    },
  },
  {
    name: "curl",
    aliases: ["wget", "http"],
    hidden: true,
    description: "http client",
    run: ({ args }) => {
      const url = args.find((a) => !a.startsWith("-")) ?? "yavor.codes";
      return pre(
        [
          `> GET ${url}`,
          "< HTTP/2 200",
          "< content-type: text/terminal; charset=utf-8",
          "< x-powered-by: coffee",
          "",
          "you're already here. try 'help'.",
        ].join("\n"),
      );
    },
  },
  {
    name: "ping",
    hidden: true,
    description: "network check",
    run: ({ args }) => {
      const host = args[0] ?? "yavor.codes";
      return pre(
        [
          `PING ${host}: 56 data bytes`,
          `64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.042 ms`,
          `64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.038 ms`,
          "",
          `--- ${host} ping statistics ---`,
          "2 packets transmitted, 2 received, 0.0% packet loss",
        ].join("\n"),
      );
    },
  },
  {
    name: "ssh",
    hidden: true,
    description: "remote login",
    run: ({ args }) =>
      text(
        `ssh: connect to host ${args[0] ?? "yavor"} port 22: Permission denied (publickey). nice try though.`,
        "error",
      ),
  },
  {
    name: "rm",
    hidden: true,
    description: "remove files",
    run: ({ args }) =>
      args.includes("-rf") && (args.includes("/") || args.includes("*"))
        ? text("rm: it took me years to build this. absolutely not.", "error")
        : text(`rm: ${args[args.length - 1] ?? "file"}: read-only filesystem (this is a portfolio)`, "error"),
  },
  {
    name: "mkdir",
    aliases: ["touch", "mv", "cp", "chmod"],
    hidden: true,
    description: "modify files",
    run: ({ raw }) =>
      text(`${raw.split(" ")[0]}: read-only filesystem. the only thing you can change here is the theme.`, "error"),
  },
  {
    name: "man",
    hidden: true,
    description: "manual pages",
    run: ({ args }) =>
      args[0]
        ? text(`No manual entry for ${args[0]}. run 'help' — it's better written anyway.`, "muted")
        : text("What manual page do you want? (try 'help')", "muted"),
  },
  {
    name: "grep",
    aliases: ["find", "which", "awk", "sed"],
    hidden: true,
    description: "search",
    run: ({ args, raw }) => {
      const term = args.find((a) => !a.startsWith("-"));
      const cmd = raw.split(" ")[0];
      return term
        ? text(`${cmd}: searched everything for '${term}'. try 'posts' — there are 100+ of them.`, "muted")
        : text(`usage: ${cmd} <pattern>`, "muted");
    },
  },
  {
    name: "history-bash",
    aliases: ["hist"],
    hidden: true,
    description: "shell history",
    run: () => text("run 'history' — mine's more interesting than bash's."),
  },
  {
    name: "python",
    aliases: ["python3", "node", "irb", "ruby"],
    hidden: true,
    description: "repl",
    run: ({ raw }) =>
      text(`${raw.split(" ")[0]}: no REPL here — this terminal only speaks yavor. run 'help'.`, "muted"),
  },
  {
    name: "open",
    hidden: true,
    description: "open things",
    run: ({ args }) =>
      text(`open: ${args[0] ?? "that"}? try 'contact' — that's how you actually reach me.`, "muted"),
  },
  {
    name: "hello",
    aliases: ["hey", "yo", "hi-there"],
    hidden: true,
    description: "greeting",
    run: () => text("hey 👋 — 'whoami' if you want the intro, 'contact' if you want to talk."),
  },
];
