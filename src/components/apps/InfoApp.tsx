"use client";

import { Icon } from "@/components/desktop/AppIcons";

export function InfoApp({
  name = "Unknown",
  kind = "Document",
  size = "--",
  modified = "--",
  icon = "file",
  where = "Desktop",
}: {
  name?: string;
  kind?: string;
  size?: string;
  modified?: string;
  icon?: string;
  where?: string;
}) {
  return (
    <div className="info-app">
      <div className="info-head">
        <span className="info-icon"><Icon name={icon} /></span>
        <div>
          <p className="info-name">{name}</p>
          <p className="info-sub">{size === "--" ? kind : `${kind} — ${size}`}</p>
        </div>
      </div>
      <dl className="info-rows">
        <div><dt>Kind</dt><dd>{kind}</dd></div>
        <div><dt>Size</dt><dd>{size}</dd></div>
        <div><dt>Where</dt><dd>Macintosh HD › Users › yavor › {where}</dd></div>
        <div><dt>Modified</dt><dd>{modified}</dd></div>
        <div><dt>Owner</dt><dd>yavor (Read only — it&rsquo;s a portfolio)</dd></div>
      </dl>
    </div>
  );
}
