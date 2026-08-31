"use client";

import { useEffect, useState } from "react";

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = !!localStorage.getItem("yc:booted");
    } catch {}

    if (reduced || seen) {
      onDone();
      return;
    }

    const started = Date.now();
    const total = 1700;
    const tick = setInterval(() => {
      const p = Math.min(100, ((Date.now() - started) / total) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(tick);
        setHiding(true);
        try {
          localStorage.setItem("yc:booted", "1");
        } catch {}
        setTimeout(onDone, 420);
      }
    }, 40);

    const skip = () => {
      clearInterval(tick);
      setHiding(true);
      try {
        localStorage.setItem("yc:booted", "1");
      } catch {}
      setTimeout(onDone, 200);
    };
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      clearInterval(tick);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div className={`bootscreen ${hiding ? "bootscreen-hiding" : ""}`}>
      <svg viewBox="0 0 24 24" className="boot-apple" aria-hidden="true">
        <path
          fill="currentColor"
          d="M17.6 12.7c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9s-1.9-.9-3.2-.8c-1.6 0-3.1 1-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8 2.2-1.2 3-2.3c.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.6-3.7zM15.2 4.9c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"
        />
      </svg>
      <div className="boot-bar">
        <div className="boot-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
