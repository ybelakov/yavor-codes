"use client";

import { useState } from "react";
import profile from "@/content/profile.json";
import { trackEvent } from "@/lib/analytics";

export function MailApp() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const send = () => {
    trackEvent("external_link_click", { target: "mailto" });
    const href = `mailto:${profile.contact.email}?subject=${encodeURIComponent(
      subject || "Hi Yavor",
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="mail">
      <div className="mail-toolbar">
        <button type="button" className="mail-send" onClick={send}>
          Send
        </button>
        <span className="mail-toolbar-title">New Message</span>
      </div>
      <div className="mail-fields">
        <label className="mail-field">
          <span>To:</span>
          <input readOnly value={profile.contact.email} />
        </label>
        <label className="mail-field">
          <span>Subject:</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Speaking at AIE.F / trying Juma / just saying hi"
          />
        </label>
      </div>
      <textarea
        className="mail-body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Hi Yavor,\n\n`}
      />
      <div className="mail-status">
        {sent
          ? "Handing off to your mail app…"
          : profile.contact.fastest}
      </div>
    </div>
  );
}
