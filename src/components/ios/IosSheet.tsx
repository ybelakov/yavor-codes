"use client";

import { useEffect } from "react";

export function IosSheet({
  open,
  title,
  onClose,
  action,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  action?: { label: string; onPress: () => void; disabled?: boolean };
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="ios-sheet-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ios-sheet" role="dialog" aria-label={title}>
        <span className="ios-grabber" aria-hidden="true" />
        <header className="ios-sheet-bar">
          <button type="button" className="ios-sheet-btn" onClick={onClose}>Cancel</button>
          <span className="ios-sheet-title">{title}</span>
          {action ? (
            <button type="button" className="ios-sheet-btn ios-sheet-strong" onClick={action.onPress} disabled={action.disabled}>
              {action.label}
            </button>
          ) : (
            <span className="ios-sheet-btn" />
          )}
        </header>
        <div className="ios-sheet-body">{children}</div>
      </div>
    </div>
  );
}
