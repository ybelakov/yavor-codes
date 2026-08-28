"use client";

import posts from "@/content/posts.json";
import { trackEvent } from "@/lib/analytics";
import { ChipRow } from "./shared";

export function PostsBlock() {
  return (
    <div className="block-frame">
      <h2 className="block-title">posts --top</h2>
      <p className="dim-text">greatest hits, ranked by reactions. full archive on LinkedIn.</p>
      <div className="post-list">
        {posts.posts.map((p) => (
          <a
            key={p.rank}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="post-card"
            onClick={() => trackEvent("external_link_click", { target: "linkedin_post" })}
          >
            <div className="post-card-head">
              <span className="accent-text">#{p.rank}</span>
              <span className={`post-tag post-tag-${p.tag}`}>{p.tag}</span>
              <span className="dim-text">{p.date}</span>
            </div>
            <p className="post-excerpt">{p.excerpt}</p>
            <p className="post-stats dim-text">
              ▲ {p.stats.reactions} · 💬 {p.stats.comments} · ⟳ {p.stats.reposts}
            </p>
          </a>
        ))}
      </div>
      <p>
        <a href={posts.profileUrl} target="_blank" rel="noopener noreferrer" className="link">
          posts --all → linkedin.com/in/yavor-belakov
        </a>
      </p>
      <ChipRow commands={["juma", "aief", "contact"]} />
    </div>
  );
}
