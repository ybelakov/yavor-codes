"use client";

import { useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { AppIcon } from "@/components/desktop/AppIcons";
import type { AppId } from "@/lib/desktop/types";

export function ForceQuitApp() {
  const windows = useDesktop((s) => s.windows);
  const close = useDesktop((s) => s.close);
  const showToast = useDesktop((s) => s.showToast);
  const running = DOCK_ORDER.filter((id) => windows.some((w) => w.appId === id));
  const list: AppId[] = running.length ? running : ["finder"];
  const [picked, setPicked] = useState<AppId>(list[0]!);

  return (
    <div className="forcequit">
      <p className="fq-lead">
        If an app doesn&rsquo;t respond for a while, select its name and click Force Quit.
      </p>
      <ul className="fq-list">
        {list.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={picked === id ? "fq-row fq-sel" : "fq-row"}
              onClick={() => setPicked(id)}
            >
              <span className="fq-icon"><AppIcon appId={id} /></span>
              {APPS[id].name}
              {id === "chrome" && <em className="fq-hang"> (not responding)</em>}
            </button>
          </li>
        ))}
      </ul>
      <div className="fq-actions">
        <button
          type="button"
          className="fq-btn"
          onClick={() => {
            const targets = useDesktop.getState().windows.filter((w) => w.appId === picked);
            targets.forEach((w) => close(w.id));
            showToast(`${APPS[picked].name} was force quit. It had no unsaved changes. Probably.`);
          }}
        >
          Force Quit
        </button>
      </div>
    </div>
  );
}
