"use client";

import { useState } from "react";
import profile from "@/content/profile.json";
import postsData from "@/content/posts.json";
import { IosNav, useIosNav } from "../IosNav";
import { IosSheet } from "../IosSheet";
import { Glyph } from "../Glyph";

interface Msg {
  id: string;
  from: string;
  initials: string;
  subject: string;
  date: string;
  preview: string;
  body: string[];
  unread?: boolean;
}

const MESSAGES: Msg[] = [
  {
    id: "welcome",
    from: "Yavor Belakov",
    initials: "YB",
    subject: "Hey — you found the phone",
    date: "09:41",
    unread: true,
    preview: "Everything on this device is real except the device itself.",
    body: [
      "Hey,",
      "Everything on this device is real except the device itself. The photos are from actual AIE.F nights in Sofia. The numbers in Settings → Juma are the real ones. The Terminal is the same one I use to talk about my work.",
      "If you want the fast version: open Terminal and type `whoami`.",
      "If you want to talk: just reply. This opens your real mail app.",
      "— Yavor",
    ],
  },
  {
    id: "juma",
    from: "Juma",
    initials: "J",
    subject: "Announcing Juma",
    date: "Nov 19",
    unread: true,
    preview: "AI workspace built especially for marketers. By marketers.",
    body: [
      "AI workspace built especially for marketers. By marketers.",
      "Born as Team-GPT in April 2023. OpenAI's lawyers sent two letters about the name, so in November 2025 we launched Juma at True Ventures' HQ in San Francisco.",
      "75,000 users. 500+ companies. $1M ARR in 30 months.",
      "juma.ai",
    ],
  },
  {
    id: "aief",
    from: "AIE.F Europe",
    initials: "AI",
    subject: "After Hours #51 — Wednesday",
    date: "Feb 18",
    preview: "7:00 PM · Work&Share, Synergy Tower. Pizza as always.",
    body: [
      "After Hours #51",
      "Wednesday, 7:00 PM · Work&Share, Synergy Tower, Sofia.",
      "Free as always. Pizza as always. Bring someone who's never been.",
      "We have 49 more events planned for 2026.",
    ],
  },
  {
    id: "techcrunch",
    from: "TechCrunch",
    initials: "TC",
    subject: "Team-GPT raises $4.5M",
    date: "Nov 14",
    preview: "The biggest seed round raised by a Bulgarian company.",
    body: [
      "Team-GPT raises $4.5M led by True Ventures.",
      "The biggest ever seed round raised by a Bulgarian company.",
      `Top post that week: ${postsData.posts[0]?.stats.reactions ?? 512} reactions.`,
    ],
  },
];

function MessageView({ m }: { m: Msg }) {
  return (
    <div className="ios-mail-msg">
      <h2 className="ios-mail-msg-subject">{m.subject}</h2>
      <div className="ios-mail-msg-head">
        <span className="ios-avatar">{m.initials}</span>
        <div>
          <p className="ios-mail-msg-from">{m.from}</p>
          <p className="ios-mail-msg-to">To: me</p>
        </div>
        <span className="ios-mail-msg-date">{m.date}</span>
      </div>
      <div className="ios-mail-msg-body">
        {m.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </div>
  );
}

function Inbox({ onCompose }: { onCompose: () => void }) {
  const nav = useIosNav();
  return (
    <div className="ios-mail-list">
      {MESSAGES.map((m) => (
        <button
          key={m.id}
          type="button"
          className="ios-mail-row"
          onClick={() =>
            nav.push({
              key: m.id,
              title: "Inbox",
              backLabel: "Inbox",
              largeTitle: false,
              render: () => <MessageView m={m} />,
              action: { glyph: <Glyph name="reply" />, onPress: onCompose },
            })
          }
        >
          <span className={`ios-mail-dot ${m.unread ? "ios-mail-unread" : ""}`} aria-hidden="true" />
          <span className="ios-mail-text">
            <span className="ios-mail-top">
              <strong>{m.from}</strong>
              <span className="ios-mail-date">{m.date} <Glyph name="chevron" className="ios-chevron" /></span>
            </span>
            <span className="ios-mail-subject">{m.subject}</span>
            <span className="ios-mail-preview">{m.preview}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function IosMail() {
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = () => {
    window.location.href = `mailto:${profile.contact.email}?subject=${encodeURIComponent(subject || "Hi Yavor")}&body=${encodeURIComponent(body)}`;
    setComposing(false);
  };

  return (
    <>
      <IosNav
        root={{
          key: "inbox",
          title: "Inbox",
          searchable: true,
          render: () => <Inbox onCompose={() => setComposing(true)} />,
          action: { glyph: <Glyph name="compose" />, onPress: () => setComposing(true) },
        }}
      />
      <IosSheet
        open={composing}
        title="New Message"
        onClose={() => setComposing(false)}
        action={{ label: "Send", onPress: send }}
      >
        <div className="ios-compose">
          <label className="ios-compose-field"><span>To:</span><input readOnly value={profile.contact.email} /></label>
          <label className="ios-compose-field">
            <span>Subject:</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Saying hi" />
          </label>
          <textarea
            className="ios-compose-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hi Yavor,"
          />
          <p className="ios-compose-note">Send hands off to your real mail app.</p>
        </div>
      </IosSheet>
    </>
  );
}
