"use client";

export interface IosTab {
  id: string;
  label: string;
  glyph: React.ReactNode;
}

export function IosTabBar({
  tabs,
  active,
  onSelect,
  dark,
}: {
  tabs: IosTab[];
  active: string;
  onSelect: (id: string) => void;
  dark?: boolean;
}) {
  return (
    <nav className={`ios-tabbar ${dark ? "ios-tabbar-dark" : ""}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`ios-tab ${active === t.id ? "ios-tab-active" : ""}`}
          onClick={() => onSelect(t.id)}
        >
          {t.glyph}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
