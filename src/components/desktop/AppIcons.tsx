/* eslint-disable @next/next/no-img-element */
import type { AppId } from "@/lib/desktop/types";

/** Real macOS/Chrome icons, extracted from the .icns bundles on disk and
 *  served from /public/icons. See scripts/extract-icons.sh. */
export function Icon({ name, alt = "" }: { name: string; alt?: string }) {
  return (
    <img
      src={`/icons/${name}.png`}
      alt={alt}
      className="app-icon-img"
      width={128}
      height={128}
      draggable={false}
    />
  );
}

const APP_ICON: Record<AppId, string> = {
  terminal: "terminal",
  chrome: "chrome",
  finder: "finder",
  notes: "notes",
  photos: "photos",
  mail: "mail",
  settings: "settings",
  about: "finder",
  info: "file",
};

export function AppIcon({ appId }: { appId: AppId }) {
  return <Icon name={APP_ICON[appId] ?? "file"} />;
}

export function FolderIcon({ variant }: { variant?: "downloads" }) {
  return <Icon name={variant === "downloads" ? "folder-downloads" : "folder"} />;
}

export function FileIcon() {
  return <Icon name="file" />;
}

export function TrashIcon() {
  return <Icon name="trash" />;
}
