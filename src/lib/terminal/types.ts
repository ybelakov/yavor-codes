export type InputSource = "typed" | "chip" | "boot" | "system";

export interface BlockDescriptor {
  type: string;
  props?: Record<string, unknown>;
}

export interface HistoryEntry {
  id: string;
  input: string | null; // echoed prompt line; null = system-emitted
  source: InputSource;
  status: "ok" | "error";
  block: BlockDescriptor | null;
  instant?: boolean; // render without entrance animation
  ts: number;
}

export interface ShellApi {
  clear: () => void;
  run: (input: string, source?: InputSource) => void;
  setTheme: (name: string) => boolean;
}

export type CommandResult =
  | { kind: "block"; blockType: string; props?: Record<string, unknown> }
  | { kind: "text"; text: string; tone?: "default" | "error" | "muted" }
  | { kind: "none" };

export interface CommandContext {
  args: string[];
  raw: string;
  shell: ShellApi;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  hidden?: boolean;
  suggestedNext?: string[];
  run: (ctx: CommandContext) => CommandResult;
}
