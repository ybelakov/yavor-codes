import { AppIcon, ArchiveIcon, DocIcon, FileIcon, FolderIcon, ImageFileIcon } from "./AppIcons";
import type { FsNode } from "@/lib/desktop/filesystem";

export function NodeIcon({ node }: { node: FsNode }) {
  switch (node.kind) {
    case "app":
      return node.appId ? <AppIcon appId={node.appId} /> : <FileIcon />;
    case "folder":
      return <FolderIcon />;
    case "image":
      return <ImageFileIcon />;
    case "archive":
      return <ArchiveIcon />;
    case "pdf":
      return <DocIcon tint="#e5484d" label="PDF" />;
    case "key":
      return <DocIcon tint="#f5a623" label="KEY" />;
    case "code":
      return <DocIcon tint="#3178c6" label="TS" />;
    default:
      return <DocIcon tint="#8a93a0" label="TXT" />;
  }
}
