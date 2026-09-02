"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDesktop } from "@/lib/desktop/store";
import { APPS, DOCK_ORDER } from "@/lib/desktop/apps-meta";
import { FS } from "@/lib/desktop/filesystem";
import { getVisibleCommands } from "@/lib/terminal/registry";
import { runCommand } from "@/lib/terminal/run";
import { Icon } from "./AppIcons";
import { trackEvent } from "@/lib/analytics";

interface Hit {
  id: string;
  title: string;
  sub: string;
  icon: string;
  section: string;
  run: () => void;
}

function buildIndex(): Hit[] {
  const s = () => useDesktop.getState();
  const hits: Hit[] = [];

  for (const id of DOCK_ORDER) {
    hits.push({
      id: `app-${id}`,
      title: APPS[id].name,
      sub: "Application",
      icon: id === "finder" ? "finder" : id,
      section: "Applications",
      run: () => s().openApp(id),
    });
  }
  for (const [folder, nodes] of Object.entries(FS)) {
    for (const n of nodes) {
      if (n.kind === "app") continue;
      hits.push({
        id: `fs-${folder}-${n.name}`,
        title: n.name,
        sub: folder,
        icon: n.kind === "folder" ? "folder" : `file-${n.kind === "text" || n.kind === "code" ? "text" : n.kind === "image" ? "image" : n.kind === "pdf" ? "pdf" : n.kind === "key" ? "key" : n.kind === "archive" ? "zip" : "text"}`,
        section: n.kind === "folder" ? "Folders" : "Documents",
        run: () => {
          if (n.open) s().openApp(n.open.app, n.open.payload);
          else s().openApp("finder", { folder });
        },
      });
    }
  }
  for (const cmd of getVisibleCommands()) {
    hits.push({
      id: `cmd-${cmd.name}`,
      title: cmd.name,
      sub: `Terminal — ${cmd.description}`,
      icon: "terminal",
      section: "Terminal Commands",
      run: () => {
        s().openApp("terminal");
        runCommand(cmd.name, "chip");
      },
    });
  }
  return hits;
}

function SpotlightPanel() {
  const setSpotlight = useDesktop((s) => s.setSpotlight);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(() => buildIndex(), []);

  useEffect(() => {
    inputRef.current?.focus();
    trackEvent("spotlight_open");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSpotlight(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const raw = query.trim();
  const q = raw.toLowerCase();

  /* macOS Spotlight does arithmetic inline */
  let calc: string | null = null;
  if (/^[\d\s+\-*/().%^]+$/.test(raw) && /[+\-*/]/.test(raw) && raw.length < 40) {
    try {
      const val = Function(`"use strict";return (${raw.replace(/\^/g, "**")})`)();
      if (typeof val === "number" && Number.isFinite(val)) {
        calc = Number.isInteger(val) ? String(val) : String(Number(val.toFixed(6)));
      }
    } catch {}
  }

  const results = q
    ? index
        .map((h) => {
          const t = h.title.toLowerCase();
          const score = t === q ? 0 : t.startsWith(q) ? 1 : t.includes(q) ? 2 : h.sub.toLowerCase().includes(q) ? 3 : -1;
          return { h, score };
        })
        .filter((r) => r.score >= 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 7)
        .map((r) => r.h)
    : [];

  if (q && results.length < 7) {
    results.push({
      id: "web",
      title: `Search the Web for “${raw}”`,
      sub: "Google",
      icon: "chrome",
      section: "Suggested",
      run: () => window.open(`https://www.google.com/search?q=${encodeURIComponent(raw)}`, "_blank", "noopener"),
    });
  }

  const grouped: { section: string; hits: Hit[] }[] = [];
  for (const h of results) {
    const g = grouped.find((x) => x.section === h.section);
    if (g) g.hits.push(h);
    else grouped.push({ section: h.section, hits: [h] });
  }
  let flatIndex = -1;

  const pick = (hit: Hit) => {
    hit.run();
    setSpotlight(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSpotlight(false);
    else if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
    else if (e.key === "Enter" && results[cursor]) pick(results[cursor]);
  };

  return (
    <div className="spotlight-backdrop" onPointerDown={(e) => e.target === e.currentTarget && setSpotlight(false)}>
      <div className="spotlight" role="dialog" aria-label="Spotlight Search">
        <div className="spotlight-field">
          <svg viewBox="0 0 14 14" className="spotlight-glass" aria-hidden="true">
            <circle cx="6.2" cy="6.2" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9.6 9.6L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            placeholder="Spotlight Search"
            aria-label="Spotlight Search"
          />
        </div>
        {calc && (
          <div className="spotlight-calc">
            <span className="spotlight-calc-q">{raw}</span>
            <span className="spotlight-calc-a">{calc}</span>
          </div>
        )}
        {results.length > 0 && (
          <div className="spotlight-results">
            {grouped.map((g) => (
              <div key={g.section}>
                <p className="spotlight-section">{g.section}</p>
                <ul>
                  {g.hits.map((h) => {
                    flatIndex += 1;
                    const i = flatIndex;
                    return (
                      <li key={h.id}>
                        <button
                          type="button"
                          className={i === cursor ? "spotlight-hit spotlight-active" : "spotlight-hit"}
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => pick(h)}
                        >
                          <span className="spotlight-icon"><Icon name={h.icon} /></span>
                          <span className="spotlight-text">
                            <strong>{h.title}</strong>
                            <small>{h.sub}</small>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
        {q && results.length === 0 && !calc && <p className="spotlight-none">No results for “{query}”</p>}
      </div>
    </div>
  );
}

export function Spotlight() {
  const open = useDesktop((s) => s.spotlightOpen);
  if (!open) return null;
  return <SpotlightPanel />;
}
