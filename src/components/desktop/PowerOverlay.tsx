"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDesktop } from "@/lib/desktop/store";
import profile from "@/content/profile.json";
import { WallpaperArt } from "./WallpaperArt";
import { sounds } from "@/lib/desktop/sounds";

let tick = 0;
const listeners = new Set<() => void>();
function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (listeners.size === 1) {
    tick = Date.now();
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  const t = setInterval(() => {
    tick = Date.now();
    listeners.forEach((l) => l());
  }, 20_000);
  return () => {
    clearInterval(t);
    listeners.delete(cb);
  };
}

function LockClock() {
  const t = useSyncExternalStore(subscribe, () => tick, () => 0);
  if (!t) return null;
  const now = new Date(t);
  return (
    <div className="lock-clock">
      <p className="lock-date">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <p className="lock-time">
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/ [AP]M/, "")}
      </p>
    </div>
  );
}

export function PowerOverlay() {
  const overlay = useDesktop((s) => s.overlay);
  const setOverlay = useDesktop((s) => s.setOverlay);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const t = setTimeout(() => setHint(true), overlay === "off" ? 1400 : 700);
    const dismiss = () => {
      if (overlay === "login") return; // login needs the password form
      if (overlay === "off") {
        try { localStorage.removeItem("yc:booted"); } catch {}
        window.location.reload();
        return;
      }
      setOverlay(null);
    };
    const onKey = () => dismiss();
    const onClick = () => dismiss();
    /* small delay so the click that opened the menu doesn't immediately dismiss */
    const arm = setTimeout(() => {
      window.addEventListener("keydown", onKey);
      window.addEventListener("pointerdown", onClick);
    }, 250);
    return () => {
      clearTimeout(t);
      clearTimeout(arm);
      setHint(false);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [overlay, setOverlay]);

  if (!overlay) return null;

  if (overlay === "sleep" || overlay === "off") {
    return (
      <div className="power-overlay power-black" role="dialog" aria-label={overlay === "off" ? "Shut down" : "Sleep"}>
        {hint && (
          <p className="power-hint">
            {overlay === "off" ? "Press any key to start up" : "Press any key to wake"}
          </p>
        )}
      </div>
    );
  }

  return <LockScreen onUnlock={() => setOverlay(null)} hint={hint} />;
}

function LockScreen({ onUnlock, hint }: { onUnlock: () => void; hint: boolean }) {
  const [value, setValue] = useState("");
  const [shaking, setShaking] = useState(false);
  const [tries, setTries] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 400);
    return () => clearTimeout(t);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    /* any password works — but the first attempt shakes, like a real
       mistyped login, because that moment is the whole illusion */
    if (tries === 0 && value.length > 0) {
      setTries(1);
      setShaking(true);
      setValue("");
      setTimeout(() => setShaking(false), 520);
      return;
    }
    sounds.login();
    onUnlock();
  };

  return (
    <div className="power-overlay lock-screen" role="dialog" aria-label="Lock screen">
      <div className="lock-wallpaper" aria-hidden="true">
        <WallpaperArt />
      </div>
      <LockClock />
      <div className="lock-user">
        <img src={profile.avatar} alt="" className="lock-avatar" />
        <p className="lock-name">{profile.name}</p>
        <form onSubmit={submit} className={shaking ? "lock-form lock-shake" : "lock-form"}>
          <input
            ref={inputRef}
            type="password"
            className="lock-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={tries === 0 ? "Enter Password" : "Try again — anything works"}
            aria-label="Password"
          />
          <button type="submit" className="lock-go" aria-label="Log in">→</button>
        </form>
        {hint && (
          <p className="power-hint">
            {tries === 0 ? "Hint: any password. Press ⏎" : "Told you — any password."}
          </p>
        )}
      </div>
    </div>
  );
}
