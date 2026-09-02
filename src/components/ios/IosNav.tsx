"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Glyph } from "./Glyph";

export interface Screen {
  key: string;
  title: string;
  /** shown in the back button of the *next* screen */
  backLabel?: string;
  render: () => React.ReactNode;
  /** right-hand nav bar button */
  action?: { label?: string; glyph?: React.ReactNode; onPress: () => void };
  largeTitle?: boolean;
  searchable?: boolean;
}

interface NavCtx {
  push: (s: Screen) => void;
  pop: () => void;
  depth: number;
}

const Ctx = createContext<NavCtx>({ push: () => {}, pop: () => {}, depth: 0 });
export const useIosNav = () => useContext(Ctx);

/** iOS navigation stack: large title that shrinks on scroll, slide-in
 *  push/pop, back button carrying the previous screen's name. */
export function IosNav({ root, tint = "#007AFF" }: { root: Screen; tint?: string }) {
  const [stack, setStack] = useState<Screen[]>([root]);
  const [anim, setAnim] = useState<"push" | "pop" | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = useCallback((s: Screen) => {
    setAnim("push");
    setStack((st) => [...st, s]);
    setCollapsed(false);
    setQuery("");
    setTimeout(() => setAnim(null), 320);
  }, []);

  const pop = useCallback(() => {
    setStack((st) => (st.length > 1 ? (setAnim("pop"), setTimeout(() => setAnim(null), 320), st.slice(0, -1)) : st));
    setCollapsed(false);
  }, []);

  const current = stack[stack.length - 1]!;
  const previous = stack[stack.length - 2];
  const large = current.largeTitle !== false;

  return (
    <Ctx.Provider value={{ push, pop, depth: stack.length }}>
      <div className="ios-nav" style={{ ["--tint" as string]: tint }}>
        <header className={`ios-navbar ${collapsed || !large ? "ios-navbar-inline" : ""}`}>
          <div className="ios-navbar-row">
            {previous ? (
              <button type="button" className="ios-back" onClick={pop}>
                <Glyph name="back" />
                <span>{previous.backLabel ?? previous.title}</span>
              </button>
            ) : (
              <span className="ios-navbar-slot" />
            )}
            <span className="ios-navbar-title">{current.title}</span>
            {current.action ? (
              <button type="button" className="ios-navbar-action" onClick={current.action.onPress}>
                {current.action.glyph ?? current.action.label}
              </button>
            ) : (
              <span className="ios-navbar-slot" />
            )}
          </div>
        </header>

        <div
          className={`ios-nav-scroll ${anim ? `ios-nav-${anim}` : ""}`}
          ref={scrollRef}
          key={current.key}
          onScroll={(e) => setCollapsed(e.currentTarget.scrollTop > 12)}
        >
          {large && <h1 className="ios-large-title">{current.title}</h1>}
          {current.searchable && (
            <div className="ios-searchbar">
              <span className="ios-search-field">
                <Glyph name="search" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search" />
              </span>
            </div>
          )}
          {current.render()}
          <div className="ios-nav-pad" />
        </div>
      </div>
    </Ctx.Provider>
  );
}
