"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

const subscribe = () => () => {};

export default function NotFound() {
  const path = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => "/that-page",
  );
  useEffect(() => {
    trackEvent("notfound_view", { path: window.location.pathname.slice(0, 60) });
  }, []);

  return (
    <main className="terminal notfound-page">
      <div className="output-log">
        <p className="text-error">zsh: command not found: {path}</p>
        <p className="dim-text">this site has exactly one page, and this isn&apos;t it.</p>
        <p>
          <Link href="/" className="chip">
            cd ~ →
          </Link>
        </p>
      </div>
    </main>
  );
}
