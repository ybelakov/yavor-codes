"use client";

import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { AppIcon } from "./AppIcons";
import { trackEvent } from "@/lib/analytics";

export function Dock() {
  const windows = useDesktop((s) => s.windows);
  const openApp = useDesktop((s) => s.openApp);

  return (
    <nav className="dock" aria-label="Dock">
      <div className="dock-panel">
        {DOCK_ORDER.map((id) => {
          const running = windows.some((w) => w.appId === id);
          return (
            <button
              key={id}
              type="button"
              className="dock-item"
              onClick={() => {
                trackEvent("app_open", { app: id, source: "dock" });
                openApp(id);
              }}
              aria-label={APPS[id].name}
            >
              <span className="dock-tooltip">{APPS[id].name}</span>
              <span className="dock-icon">
                <AppIcon appId={id} />
              </span>
              <span className={`dock-dot ${running ? "dock-dot-on" : ""}`} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
