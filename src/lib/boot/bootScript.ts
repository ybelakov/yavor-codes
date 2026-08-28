export interface BootLine {
  id: string;
  text: string;
  status?: string;
  tone?: "ok" | "info" | "warn";
  delayBefore: number;
  statusDelay?: number;
}

export const ASCII_LOGO: string[] = [
  "██╗   ██╗ █████╗ ██╗   ██╗ ██████╗ ██████╗     ██████╗ ██████╗ ██████╗ ███████╗███████╗",
  "╚██╗ ██╔╝██╔══██╗██║   ██║██╔═══██╗██╔══██╗   ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔════╝",
  " ╚████╔╝ ███████║██║   ██║██║   ██║██████╔╝   ██║     ██║   ██║██║  ██║█████╗  ███████╗",
  "  ╚██╔╝  ██╔══██║╚██╗ ██╔╝██║   ██║██╔══██╗   ██║     ██║   ██║██║  ██║██╔══╝  ╚════██║",
  "   ██║   ██║  ██║ ╚████╔╝ ╚██████╔╝██║  ██║██╗╚██████╗╚██████╔╝██████╔╝███████╗███████║",
  "   ╚═╝   ╚═╝  ╚═╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝"
];

export const ASCII_LOGO_COMPACT: string[] = [
  "▄█ █▄ ▄▀▄ █ █ ▄▀▄ █▀▄",
  " ▀█▀  █▀█ ▀▄▀ ▀▄▀ █▀▄ .codes",
];

export const FULL_BOOT: BootLine[] = [
  { id: "bios", text: "yavor.codes bios v1.0", delayBefore: 0 },
  { id: "mem", text: "memory check", status: "640K ok (should be enough for anybody)", tone: "ok", delayBefore: 200 },
  { id: "logo", text: "@logo", delayBefore: 250 },
  { id: "juma", text: "mounting /dev/juma", status: "ok", tone: "ok", delayBefore: 320 },
  { id: "sync", text: "syncing sofia <-> san francisco", status: "ok (-10h offset)", tone: "info", delayBefore: 140 },
  { id: "aief", text: "warming up aie.f community", status: "1000+ members", tone: "ok", delayBefore: 140 },
  { id: "coffee", text: "brewing coffee", status: "ok", tone: "ok", delayBefore: 140, statusDelay: 320 },
  { id: "posts", text: "counting linkedin posts", status: "100+ found", tone: "info", delayBefore: 140 },
  { id: "done", text: "boot complete in 1.9s", delayBefore: 220 },
];

export const SHORT_BOOT: BootLine[] = [
  { id: "logo", text: "@logo", delayBefore: 0 },
  { id: "back", text: "welcome back — last boot cached", status: "ok", tone: "ok", delayBefore: 180 },
];

export const BOOT_STORAGE_KEY = "yc:boot:v1";
