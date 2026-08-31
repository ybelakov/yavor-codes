"use client";

/* eslint-disable @next/next/no-img-element */
import { useSyncExternalStore } from "react";
import { useDesktop } from "@/lib/desktop/store";
import aief from "@/content/aief.json";

/* ---- shared "today" source, kept outside React so widgets never
   set state from an effect and SSR/CSR agree on an empty first paint ---- */
let dayTick = 0;
const dayListeners = new Set<() => void>();

function subscribeDay(cb: () => void): () => void {
  dayListeners.add(cb);
  if (dayListeners.size === 1) {
    dayTick = Date.now();
    queueMicrotask(() => dayListeners.forEach((l) => l()));
  }
  const t = setInterval(
    () => {
      dayTick = Date.now();
      dayListeners.forEach((l) => l());
    },
    60 * 60 * 1000,
  );
  return () => {
    clearInterval(t);
    dayListeners.delete(cb);
  };
}

function useToday(): Date | null {
  const tick = useSyncExternalStore(
    subscribeDay,
    () => dayTick,
    () => 0,
  );
  return tick ? new Date(tick) : null;
}

/* ---------------- Calendar ---------------- */
function CalendarWidget() {
  const today = useToday();
  if (!today) return <div className="widget widget-calendar" aria-hidden="true" />;

  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay(); // 0 = Sunday, matching the S M T W T F S header
  const cells: (number | null)[] = [
    ...Array.from({ length: startDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="widget widget-calendar">
      <p className="cal-month">{today.toLocaleDateString("en-US", { month: "long" })}</p>
      <div className="cal-grid cal-head">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="cal-grid cal-body">
        {cells.map((d, i) => (
          <span key={i} className={d === today.getDate() ? "cal-today" : undefined}>
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Weather ---------------- */
/** Plausible Sofia climate normals so the widget never reads as stale. */
const SOFIA_CLIMATE: { hi: number; lo: number; cond: string; icon: string }[] = [
  { hi: 4, lo: -3, cond: "Light Snow", icon: "snow" },
  { hi: 7, lo: -2, cond: "Partly Cloudy", icon: "cloud-sun" },
  { hi: 12, lo: 1, cond: "Partly Cloudy", icon: "cloud-sun" },
  { hi: 18, lo: 5, cond: "Mostly Sunny", icon: "sun" },
  { hi: 23, lo: 10, cond: "Mostly Sunny", icon: "sun" },
  { hi: 27, lo: 14, cond: "Sunny", icon: "sun" },
  { hi: 30, lo: 16, cond: "Sunny", icon: "sun" },
  { hi: 30, lo: 16, cond: "Sunny", icon: "sun" },
  { hi: 25, lo: 12, cond: "Partly Cloudy", icon: "cloud-sun" },
  { hi: 19, lo: 7, cond: "Partly Cloudy", icon: "cloud-sun" },
  { hi: 11, lo: 2, cond: "Cloudy", icon: "cloud" },
  { hi: 5, lo: -1, cond: "Cloudy", icon: "cloud" },
];

function WeatherGlyph({ kind }: { kind: string }) {
  if (kind === "sun") {
    return (
      <svg viewBox="0 0 24 24" className="weather-glyph">
        <circle cx="12" cy="12" r="5" fill="#ffcf3f" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="11.2" y="1" width="1.6" height="3.4" rx="0.8" fill="#ffcf3f" transform={`rotate(${i * 45} 12 12)`} />
        ))}
      </svg>
    );
  }
  if (kind === "snow") {
    return (
      <svg viewBox="0 0 24 24" className="weather-glyph">
        <path d="M7 16a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.4 1.6A3.2 3.2 0 0 1 17.5 16z" fill="#eaf2fb" />
        <circle cx="9" cy="20" r="1.1" fill="#fff" />
        <circle cx="13" cy="21" r="1.1" fill="#fff" />
        <circle cx="17" cy="20" r="1.1" fill="#fff" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="weather-glyph">
      {kind === "cloud-sun" && <circle cx="8.5" cy="8" r="3.6" fill="#ffcf3f" />}
      <path d="M7.5 19a4.2 4.2 0 0 1 .4-8.4 5.7 5.7 0 0 1 10.8 1.7A3.35 3.35 0 0 1 18 19z" fill="#f2f6fb" />
    </svg>
  );
}

function WeatherWidget() {
  const today = useToday();
  if (!today) return <div className="widget widget-weather" aria-hidden="true" />;

  const c = SOFIA_CLIMATE[today.getMonth()]!;
  // a gentle in-month drift so it isn't the exact same number all month
  const drift = ((today.getDate() % 5) - 2);
  const now = c.hi - 3 + drift;

  return (
    <div className="widget widget-weather">
      <p className="weather-city">Sofia</p>
      <p className="weather-temp">{now}°</p>
      <div className="weather-foot">
        <WeatherGlyph kind={c.icon} />
        <div>
          <p className="weather-cond">{c.cond}</p>
          <p className="weather-hilo">
            H:{c.hi}° L:{c.lo}°
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Photos ---------------- */
function PhotosWidget() {
  const openApp = useDesktop((s) => s.openApp);
  const photo = aief.photos[0]!;
  return (
    <button
      type="button"
      className="widget widget-photos"
      onClick={() => openApp("photos")}
      aria-label="Open Photos"
    >
      <img src={photo.src} alt={photo.alt} />
      <span className="widget-photos-label">AIE.F · Sofia</span>
    </button>
  );
}

export function Widgets() {
  return (
    <div className="widgets" aria-label="Desktop widgets">
      <div className="widgets-row">
        <CalendarWidget />
        <WeatherWidget />
      </div>
      <PhotosWidget />
    </div>
  );
}
