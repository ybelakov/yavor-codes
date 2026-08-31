import { AppIcon, Icon } from "./AppIcons";
import type { FsNode } from "@/lib/desktop/filesystem";

const KIND_ICON: Record<string, string> = {
  folder: "folder",
  text: "file-text",
  image: "file-image",
  pdf: "file-pdf",
  key: "file-key",
  archive: "file-zip",
  code: "file-text",
};

export function NodeIcon({ node }: { node: FsNode }) {
  if (node.kind === "app" && node.appId) return <AppIcon appId={node.appId} />;
  if (node.name === "Downloads") return <Icon name="folder-downloads" />;
  return <Icon name={KIND_ICON[node.kind] ?? "file"} />;
}
