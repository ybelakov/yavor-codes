"use client";

import { useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { NodeIcon } from "./NodeIcon";
import { DESKTOP_ITEMS, type FsNode } from "@/lib/desktop/filesystem";
import { trackEvent } from "@/lib/analytics";
import { fileMenuItems } from "@/lib/desktop/file-menu";

export function DesktopIcons() {
  const openApp = useDesktop((s) => s.openApp);
  const openContextMenu = useDesktop((s) => s.openContextMenu);
  const [selected, setSelected] = useState<string | null>(null);

  const activate = (node: FsNode) => {
    if (node.goto) {
      trackEvent("app_open", { app: "finder", source: "desktop" });
      openApp("finder", { folder: node.goto });
    } else if (node.open) {
      trackEvent("app_open", { app: node.open.app, source: "desktop" });
      openApp(node.open.app, node.open.payload);
    }
  };

  return (
    <div className="desktop-icons">
      {DESKTOP_ITEMS.map((node) => (
        <button
          key={node.name}
          type="button"
          className={`desk-icon ${selected === node.name ? "desk-icon-selected" : ""}`}
          onClick={() => setSelected(node.name)}
          onDoubleClick={() => activate(node)}
          onKeyDown={(e) => e.key === "Enter" && activate(node)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelected(node.name);
            openContextMenu({
              x: e.clientX,
              y: e.clientY,
              items: fileMenuItems(node, "Desktop", () => activate(node)),
            });
          }}
        >
          <span className="desk-icon-img"><NodeIcon node={node} /></span>
          <span className="desk-icon-label">{node.name}</span>
        </button>
      ))}
    </div>
  );
}
