"use client";

/* eslint-disable @next/next/no-img-element */
import { Icon } from "@/components/desktop/AppIcons";
import { PHONE_APPS, PHONE_DOCK, PHONE_GRID, type PhoneAppId } from "./apps";
import aief from "@/content/aief.json";
import { Glyph } from "@/components/ios/Glyph";

function Widgets({ onOpen }: { onOpen: (id: PhoneAppId) => void }) {
  const now = new Date();
  return (
    <div className="ios-widgets">
      <button type="button" className="ios-widget ios-widget-cal" onClick={() => onOpen("settings")}>
        <p className="ios-cal-day">{now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}</p>
        <p className="ios-cal-num">{now.getDate()}</p>
        <p className="ios-cal-month">{now.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</p>
      </button>
      <button type="button" className="ios-widget ios-widget-photo" onClick={() => onOpen("photos")}>
        <img src={aief.photos[0]!.src} alt="" />
        <span>AIE.F · Sofia</span>
      </button>
    </div>
  );
}

export function PhoneHome({ onOpen }: { onOpen: (id: PhoneAppId) => void }) {
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

      <div className="ios-home-foot">
        <span className="ios-page-dots" aria-hidden="true">
          <i className="ios-dot-on" /><i />
        </span>
        <button type="button" className="ios-search-pill" onClick={() => onOpen("terminal")}>
          <Glyph name="search" /> Search
        </button>
      </div>

      <div className="ios-dock">
        {PHONE_DOCK.map((id) => (
          <button key={id} type="button" className="ios-app ios-app-dock" onClick={() => onOpen(id)} aria-label={PHONE_APPS[id].label}>
            <span className="ios-app-icon"><Icon name={PHONE_APPS[id].icon} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
