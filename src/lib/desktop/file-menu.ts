import { useDesktop, type MenuSpecEntry } from "./store";
import { KIND_LABEL, type FsNode } from "./filesystem";

const INFO_ICON: Record<string, string> = {
  folder: "folder", text: "file-text", image: "file-image", pdf: "file-pdf",
  key: "file-key", archive: "file-zip", code: "file-text", app: "file",
};

export function openGetInfo(node: FsNode, where: string): void {
  useDesktop.getState().openApp("info", {
    title: `${node.name} Info`,
    name: node.name,
    kind: KIND_LABEL[node.kind],
    size: node.size ?? "--",
    modified: node.modified,
    icon: node.kind === "app" && node.appId ? node.appId : (INFO_ICON[node.kind] ?? "file"),
    where,
  });
}

export function fileMenuItems(node: FsNode, where: string, activate: () => void): MenuSpecEntry[] {
  const s = useDesktop.getState();
  return [
    { label: "Open", run: activate },
    "sep",
    { label: "Get Info", shortcut: "⌘I", run: () => openGetInfo(node, where) },
    { label: "Rename", disabled: true },
    { label: "Duplicate", shortcut: "⌘D", disabled: true },
    "sep",
    {
      label: "Move to Trash",
      shortcut: "⌘⌫",
      run: () => s.showToast(`"${node.name}" can't be moved to the Trash — this portfolio is read-only.`),
    },
  ];
}

export function desktopMenuItems(): MenuSpecEntry[] {
  const s = useDesktop.getState();
  return [
    { label: "New Folder", disabled: true },
    "sep",
    { label: "Get Info", disabled: true },
    { label: "Change Wallpaper…", run: () => s.openApp("settings") },
    "sep",
    { label: "Use Stacks", disabled: true },
    { label: "Sort By", disabled: true },
    { label: "Show View Options", disabled: true },
  ];
}
