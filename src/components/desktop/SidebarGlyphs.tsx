const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function SideGlyph({ name }: { name: string }) {
  switch (name) {
    case "AirDrop":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><path {...P} d="M4.4 10.4a5 5 0 0 1 7.2 0M6.2 12.4a2.6 2.6 0 0 1 3.6 0" /><circle cx="8" cy="4.6" r="1.5" {...P} /></svg>
      );
    case "Recents":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><circle cx="8" cy="8" r="6" {...P} /><path {...P} d="M8 4.6V8l2.4 1.6" /></svg>
      );
    case "Applications":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><rect x="2" y="2" width="5" height="5" rx="1.4" {...P} /><rect x="9" y="2" width="5" height="5" rx="1.4" {...P} /><rect x="2" y="9" width="5" height="5" rx="1.4" {...P} /><rect x="9" y="9" width="5" height="5" rx="1.4" {...P} /></svg>
      );
    case "Photos":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><rect x="2" y="3" width="12" height="10" rx="2" {...P} /><circle cx="6" cy="6.6" r="1.1" {...P} /><path {...P} d="M3 11.6l3.2-3 2.2 2 2-1.6L13 11.6" /></svg>
      );
    case "Downloads":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><circle cx="8" cy="8" r="6" {...P} /><path {...P} d="M8 5v6M5.6 8.6L8 11l2.4-2.4" /></svg>
      );
    case "Trash":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><path {...P} d="M3.4 4.6h9.2M6 4.6V3.4h4v1.2M4.6 4.6l.6 8.2h5.6l.6-8.2" /></svg>
      );
    case "iCloud":
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><path {...P} d="M4.6 12a2.9 2.9 0 0 1 .3-5.8 4 4 0 0 1 7.5 1.2A2.4 2.4 0 0 1 11.8 12z" /></svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" className="side-glyph"><path {...P} d="M2 5.2a1.6 1.6 0 0 1 1.6-1.6h2.6l1.4 1.6h4.8A1.6 1.6 0 0 1 14 6.8v5A1.6 1.6 0 0 1 12.4 13.4H3.6A1.6 1.6 0 0 1 2 11.8z" /></svg>
      );
  }
}
