import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "yavor.codes — a terminal where stdout is React";

export default async function OgImage() {
  let fontData: Buffer | null = null;
  try {
    fontData = await readFile(join(process.cwd(), "src/app/_og/JetBrainsMono-Bold.ttf"));
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0b0b12",
          padding: 60,
          fontFamily: fontData ? "JetBrains Mono" : "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#12121c",
            border: "1px solid #26263a",
            borderRadius: 16,
            padding: 48,
            height: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#f87171" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#fbbf24" }} />
            <div style={{ width: 16, height: 16, borderRadius: 8, background: "#34d399" }} />
            <div style={{ color: "#8b8ba3", fontSize: 22, marginLeft: 16 }}>yavor@codes: ~</div>
          </div>
          <div style={{ display: "flex", color: "#a78bfa", fontSize: 34 }}>❯ whoami</div>
          <div style={{ display: "flex", color: "#e6e6f0", fontSize: 58, fontWeight: 700, marginTop: 24 }}>
            Yavor Belakov
          </div>
          <div style={{ display: "flex", color: "#8b8ba3", fontSize: 30, marginTop: 16 }}>
            Head of AI @ Juma · Founder @ AIE.F Europe
          </div>
          <div style={{ display: "flex", color: "#8b8ba3", fontSize: 30, marginTop: 8 }}>
            Sofia {"<->"} San Francisco
          </div>
          <div style={{ display: "flex", marginTop: "auto", alignItems: "center" }}>
            <div style={{ display: "flex", color: "#22d3ee", fontSize: 28 }}>yavor.codes</div>
            <div
              style={{
                display: "flex",
                width: 18,
                height: 34,
                background: "#a78bfa",
                marginLeft: 20,
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "JetBrains Mono", data: fontData, weight: 700 as const }]
        : undefined,
    },
  );
}
