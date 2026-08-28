"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { runCommand } from "@/lib/terminal/run";
import { trackEvent } from "@/lib/analytics";
import { Chip } from "@/components/terminal/Chip";

export function TextBlock({ text, tone }: { text: string; tone?: string }) {
  return <p className={tone === "error" ? "text-error" : tone === "muted" ? "dim-text" : ""}>{text}</p>;
}

export function EggBlock({ text }: { text: string }) {
  useEffect(() => {
    trackEvent("easter_egg", { name: text.slice(0, 20) });
  }, [text]);
  return <p className="dim-text">{text}</p>;
}

const SECTIONS = ["juma/", "aief/", "sf/", "posts/", "history/", "ideas/"];

export function LsBlock() {
  const [denied, setDenied] = useState(false);
  return (
    <div>
      <p className="ls-row">
        {SECTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="cmd-link ls-item"
            onClick={() => {
              if (s === "ideas/") setDenied(true);
              else runCommand(s.replace("/", ""), "chip");
            }}
          >
            {s}
          </button>
        ))}
      </p>
      {denied && <p className="text-error">ideas/: permission denied (ships only)</p>}
    </div>
  );
}

export function NotFoundBlock({
  input,
  suggestions,
  hint,
}: {
  input: string;
  suggestions: string[];
  hint: string;
}) {
  return (
    <div>
      <p className="text-error">zsh: command not found: {input}</p>
      {suggestions.length > 0 && (
        <p>
          did you mean{" "}
          {suggestions.map((s, i) => (
            <span key={s}>
              {i > 0 && " or "}
              <button type="button" className="cmd-link" onClick={() => runCommand(s, "chip")}>
                &apos;{s}&apos;
              </button>
            </span>
          ))}
          ?
        </p>
      )}
      <p className="dim-text">{hint}</p>
      <div className="chip-row">
        <Chip command="help" />
      </div>
    </div>
  );
}

export function MatrixBlock() {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(!!reduced);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDone(true);
      return;
    }
    canvas.width = canvas.offsetWidth;
    canvas.height = 220;
    const cols = Math.floor(canvas.width / 14);
    const drops = new Array(cols).fill(1);
    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--t-accent").trim() || "#33ff66";
    let frame = 0;
    const interval = setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accent;
      ctx.font = "12px monospace";
      drops.forEach((y, i) => {
        ctx.fillText(String(Math.floor(Math.random() * 10)), i * 14, y * 14);
        drops[i] = y * 14 > canvas.height && Math.random() > 0.97 ? 0 : y + 1;
      });
      frame++;
      if (frame > 120) {
        clearInterval(interval);
        setDone(true);
      }
    }, 33);
    return () => clearInterval(interval);
  }, [reduced]);

  return (
    <div>
      {!reduced && <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />}
      {done && (
        <p className="accent-text">
          {reduced ? "the matrix has you. (animation skipped, as you asked)" : "wake up, Yavor… the demo is due."}
        </p>
      )}
    </div>
  );
}
