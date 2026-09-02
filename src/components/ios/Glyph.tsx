const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export type GlyphName =
  | "chevron" | "chevron-left" | "back" | "search" | "photos" | "albums" | "share"
  | "heart" | "info" | "compose" | "trash" | "reply" | "folder" | "clock" | "star"
  | "grid" | "list" | "aa" | "shield" | "plus" | "x" | "book" | "person" | "globe"
  | "terminal" | "mail" | "note" | "gear" | "wave" | "moon" | "bell" | "sparkle";

export function Glyph({ name, className = "" }: { name: GlyphName; className?: string }) {
  const c = `ios-glyph-svg ${className}`;
  switch (name) {
    case "chevron": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M9 5l7 7-7 7" /></svg>;
    case "chevron-left":
    case "back": return <svg viewBox="0 0 24 24" className={c}><path {...S} strokeWidth={2.4} d="M15 5l-7 7 7 7" /></svg>;
    case "search": return <svg viewBox="0 0 24 24" className={c}><circle cx="10.5" cy="10.5" r="6.5" {...S} /><path {...S} d="M15.5 15.5L21 21" /></svg>;
    case "photos": return <svg viewBox="0 0 24 24" className={c}><rect x="3" y="4.5" width="18" height="15" rx="3" {...S} /><circle cx="8.5" cy="9.5" r="1.6" {...S} /><path {...S} d="M4 17l4.5-4.5 3 3 3.5-2.5L20 17" /></svg>;
    case "albums": return <svg viewBox="0 0 24 24" className={c}><rect x="3" y="3" width="8" height="8" rx="2" {...S} /><rect x="13" y="3" width="8" height="8" rx="2" {...S} /><rect x="3" y="13" width="8" height="8" rx="2" {...S} /><rect x="13" y="13" width="8" height="8" rx="2" {...S} /></svg>;
    case "share": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 15V3.5M8.5 7L12 3.5 15.5 7" /><path {...S} d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" /></svg>;
    case "heart": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20z" /></svg>;
    case "info": return <svg viewBox="0 0 24 24" className={c}><circle cx="12" cy="12" r="9" {...S} /><path {...S} d="M12 11v5" /><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none" /></svg>;
    case "compose": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M17 3.5l3.5 3.5L9 18.5 4.5 20l1.5-4.5z" /><path {...S} d="M14.5 6l3.5 3.5" /></svg>;
    case "trash": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M4 6.5h16M9 6.5V4.5h6v2M6 6.5l1 13.5h10l1-13.5" /></svg>;
    case "reply": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M9 7L4 12l5 5" /><path {...S} d="M4 12h9a7 7 0 0 1 7 7v1" /></svg>;
    case "folder": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.8l2 2.5h7.2A2.5 2.5 0 0 1 21 10v7.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z" /></svg>;
    case "clock": return <svg viewBox="0 0 24 24" className={c}><circle cx="12" cy="12" r="9" {...S} /><path {...S} d="M12 6.8V12l3.6 2.4" /></svg>;
    case "star": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z" /></svg>;
    case "grid": return <svg viewBox="0 0 24 24" className={c}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" {...S} /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" {...S} /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" {...S} /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" {...S} /></svg>;
    case "list": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M8 6.5h13M8 12h13M8 17.5h13M3.6 6.5h.01M3.6 12h.01M3.6 17.5h.01" /></svg>;
    case "aa": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M3 18l4-11 4 11M4.4 14.4h5.2M13 18l4-11 4 11M14.4 14.4h5.2" /></svg>;
    case "shield": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 3l7 2.6v5.2c0 4.6-3 8-7 10.2-4-2.2-7-5.6-7-10.2V5.6z" /></svg>;
    case "plus": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 5v14M5 12h14" /></svg>;
    case "x": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M6 6l12 12M18 6L6 18" /></svg>;
    case "book": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M4 5.5A2 2 0 0 1 6 3.5h5v17H6a2 2 0 0 1-2-2zM20 5.5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 0 2-2z" /></svg>;
    case "person": return <svg viewBox="0 0 24 24" className={c}><circle cx="12" cy="8" r="4" {...S} /><path {...S} d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>;
    case "globe": return <svg viewBox="0 0 24 24" className={c}><circle cx="12" cy="12" r="9" {...S} /><path {...S} d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.8-3.8-9S9.5 5.6 12 3z" /></svg>;
    case "terminal": return <svg viewBox="0 0 24 24" className={c}><rect x="3" y="4.5" width="18" height="15" rx="3" {...S} /><path {...S} d="M7.5 10l2.5 2-2.5 2M12.5 14.5h4" /></svg>;
    case "mail": return <svg viewBox="0 0 24 24" className={c}><rect x="3" y="5.5" width="18" height="13" rx="3" {...S} /><path {...S} d="M4 8l7.1 5a1.6 1.6 0 0 0 1.8 0L20 8" /></svg>;
    case "note": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M5 4.5h14v11l-4.5 4.5H5z" /><path {...S} d="M19 15.5h-4.5V20" /></svg>;
    case "gear": return <svg viewBox="0 0 24 24" className={c}><circle cx="12" cy="12" r="3.2" {...S} /><path {...S} d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M18 6l-1.4 1.4M7.4 16.6L6 18" /></svg>;
    case "wave": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M3 14c2.5-4 5-4 7.5 0s5 4 7.5 0M3 8.5c2.5-4 5-4 7.5 0" /></svg>;
    case "moon": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></svg>;
    case "bell": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M6.5 17V10a5.5 5.5 0 1 1 11 0v7M4.5 17h15M10 20.2a2.2 2.2 0 0 0 4 0" /></svg>;
    case "sparkle": return <svg viewBox="0 0 24 24" className={c}><path {...S} d="M12 3.5l1.7 4.3 4.3 1.7-4.3 1.7L12 15.5l-1.7-4.3L6 9.5l4.3-1.7zM18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></svg>;
  }
}
