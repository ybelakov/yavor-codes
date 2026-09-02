"use client";

import { useState } from "react";
import { FS, KIND_LABEL, type FsNode } from "@/lib/desktop/filesystem";
import { IosNav, useIosNav } from "../IosNav";
import { IosGroup, IosRow } from "../IosList";
import { IosSheet } from "../IosSheet";
import { NodeIcon } from "@/components/desktop/NodeIcon";
import { Glyph } from "../Glyph";

const LOCATIONS = ["Desktop", "Documents", "Downloads", "Projects", "Photos"];

function FolderScreen({ folder, onPreview }: { folder: string; onPreview: (n: FsNode) => void }) {
  const nav = useIosNav();
  const items = FS[folder] ?? [];
  return (
    <IosGroup footer={`${items.length} items`}>
      {items.map((n) => (
        <IosRow
          key={n.name}
          icon={<span className="ios-file-icon"><NodeIcon node={n} /></span>}
          label={n.name}
          detail={`${n.modified}${n.size && n.size !== "--" ? ` · ${n.size}` : ""}`}
          chevron={n.kind === "folder"}
          onPress={() => {
            if (n.kind === "folder" && FS[n.name]) {
              nav.push({ key: n.name, title: n.name, backLabel: folder, render: () => <FolderScreen folder={n.name} onPreview={onPreview} /> });
            } else {
              onPreview(n);
            }
          }}
        />
      ))}
    </IosGroup>
  );
}

function BrowseRoot({ onPreview }: { onPreview: (n: FsNode) => void }) {
  const nav = useIosNav();
  return (
    <>
      <IosGroup header="Locations">
        <IosRow icon={<Glyph name="folder" />} tint="#007AFF" label="Yavor's MacBook Pro" chevron onPress={() => {}} />
        <IosRow icon={<Glyph name="clock" />} tint="#8E8E93" label="Recents" chevron onPress={() => nav.push({ key: "recents", title: "Recents", backLabel: "Browse", render: () => <FolderScreen folder="Documents" onPreview={onPreview} /> })} />
      </IosGroup>
      <IosGroup header="Favorites">
        {LOCATIONS.map((f) => (
          <IosRow
            key={f}
            icon={<Glyph name="folder" />}
            tint="#4A90D9"
            label={f}
            value={String((FS[f] ?? []).length)}
            chevron
            onPress={() => nav.push({ key: f, title: f, backLabel: "Browse", searchable: true, render: () => <FolderScreen folder={f} onPreview={onPreview} /> })}
          />
        ))}
      </IosGroup>
      <IosGroup header="Tags">
        {[["Work", "#4a90d9"], ["Personal", "#f5a623"], ["Shipped", "#3ec46d"]].map(([t, c]) => (
          <IosRow key={t} icon={<span className="ios-tagdot" style={{ background: c }} />} label={t} chevron onPress={() => {}} />
        ))}
      </IosGroup>
    </>
  );
}

export function IosFiles() {
  const [preview, setPreview] = useState<FsNode | null>(null);
  return (
    <>
      <IosNav root={{ key: "browse", title: "Browse", searchable: true, render: () => <BrowseRoot onPreview={setPreview} /> }} />
      <IosSheet open={!!preview} title={preview?.name ?? ""} onClose={() => setPreview(null)}>
        {preview && (
          <div className="ios-preview">
            <span className="ios-preview-icon"><NodeIcon node={preview} /></span>
            <p className="ios-preview-name">{preview.name}</p>
            <IosGroup>
              <IosRow label="Kind" value={KIND_LABEL[preview.kind]} />
              <IosRow label="Size" value={preview.size ?? "--"} />
              <IosRow label="Modified" value={preview.modified} />
            </IosGroup>
            <p className="ios-preview-note">This filesystem is read-only — it&rsquo;s a portfolio.</p>
          </div>
        )}
      </IosSheet>
    </>
  );
}
