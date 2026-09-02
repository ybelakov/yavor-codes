"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import profile from "@/content/profile.json";
import { WallpaperArt } from "@/components/desktop/WallpaperArt";
import { PhoneStatusBar, useIosClock } from "./PhoneStatusBar";
import { sounds } from "@/lib/desktop/sounds";

export function PhoneLock({ onUnlock }: { onUnlock: () => void }) {
  const time = useIosClock();
  const [lifting, setLifting] = useState(false);
  const now = new Date();

  const unlock = () => {
    if (lifting) return;
    setLifting(true);
    sounds.login();
    setTimeout(onUnlock, 380);
  };

  return (
    <div
      className={`ios-lock ${lifting ? "ios-lock-lifting" : ""}`}
      onPointerDown={unlock}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && unlock()}
      aria-label="Unlock"
    >
      <div className="ios-lock-wall" aria-hidden="true"><WallpaperArt /></div>
      <PhoneStatusBar />
      <div className="ios-lock-clock">
        <p className="ios-lock-date">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <p className="ios-lock-time">{time}</p>
      </div>
      <div className="ios-lock-notif">
        <img src={profile.avatar} alt="" />
        <div>
          <strong>{profile.name}</strong>
          <span>{profile.headline}</span>
        </div>
      </div>
      <div className="ios-lock-foot">
        <p className="ios-lock-hint">swipe up to open</p>
        <span className="ios-home-bar" aria-hidden="true" />
      </div>
    </div>
  );
}
