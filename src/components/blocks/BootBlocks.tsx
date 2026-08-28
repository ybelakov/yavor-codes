"use client";

import { ASCII_LOGO, ASCII_LOGO_COMPACT } from "@/lib/boot/bootScript";

export function BootLineRow({
  text,
  status,
  tone,
}: {
  text: string;
  status?: string;
  tone?: "ok" | "info" | "warn";
}) {
  return (
    <p className="boot-line">
      <span className="boot-label">{text}</span>
      {status && (
        <>
          <span className="boot-dots" aria-hidden="true">
            {" "}
            {".".repeat(Math.max(2, 34 - text.length))}{" "}
          </span>
          <span className={`boot-status boot-status-${tone ?? "ok"}`}>{status}</span>
        </>
      )}
    </p>
  );
}

export function BootLogo() {
  return (
    <div aria-hidden="false" role="img" aria-label="yavor.codes">
      <pre className="ascii-logo ascii-logo-wide" aria-hidden="true">
        {ASCII_LOGO.join("\n")}
      </pre>
      <pre className="ascii-logo ascii-logo-compact" aria-hidden="true">
        {ASCII_LOGO_COMPACT.join("\n")}
      </pre>
    </div>
  );
}
