"use client";

/* eslint-disable @next/next/no-img-element */
import { Icon } from "@/components/desktop/AppIcons";
import type { PhoneAppId } from "./apps";
import { PHONE_APPS, PHONE_DOCK, PHONE_GRID } from "./apps";
import aief from "@/content/aief.json";
import { useIosClock } from "./PhoneStatusBar";

function Widgets({ onOpen }: { onOpen: (id: PhoneAppId) => void }) {
  const now = new Date();
  const month = now.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" });
  return (
    <div className="ios-widgets">
      <button type="button" className="ios-widget ios-widget-cal" onClick={() => onOpen("settings")}>
        <p className="ios-cal-day">{weekday.toUpperCase()}</p>
        <p className="ios-cal-num">{now.getDate()}</p>
        <p className="ios-cal-month">{month}</p>
      </button>
      <button type="button" className="ios-widget ios-widget-photo" onClick={() => onOpen("photos")}>
        <img src={aief.photos[0]!.src} alt="" />
        <span>AIE.F · Sofia</span>
      </button>
    </div>
  );
}

export function PhoneHome({ onOpen }: { onOpen: (id: PhoneAppId) => void }) {
  const time = useIosClock();
  return (
    <div className="ios-home">
      <Widgets onOpen={onOpen} />

      <div className="ios-grid">
        {PHONE_GRID.map((id) => (
          <button key={id} type="button" className="ios-app" onClick={() => onOpen(id)}>
            <span className="ios-app-icon"><Icon name={PHONE_APPS[id].icon} /></span>
            <span className="ios-app-label">{PHONE_APPS[id].label}</span>
          </button>
        ))}
      </div>

      <p className="ios-hint">{time ? "Tap Terminal — everything is in there." : ""}</p>

      <div className="ios-dock">
        {PHONE_DOCK.map((id) => (
          <button key={id} type="button" className="ios-app ios-app-dock" onClick={() => onOpen(id)}>
            <span className="ios-app-icon"><Icon name={PHONE_APPS[id].icon} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
