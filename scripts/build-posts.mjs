#!/usr/bin/env node
// Curates content/posts.json from the raw LinkedIn export (lives outside the repo).
// Usage: node scripts/build-posts.mjs [path-to-raw.json]
import fs from "node:fs";

const src =
  process.argv[2] ??
  `${process.env.HOME}/Downloads/dataset_linkedin-profile-posts_2026-01-31_11-49-35-587.json`;
const raw = JSON.parse(fs.readFileSync(src, "utf8"));

const clean = (t) =>
  (t ?? "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/(#\w+\s*){2,}$/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 190)
    .replace(/\s+\S*$/, "…");

const tag = (t) => {
  const tl = (t ?? "").toLowerCase();
  if (tl.includes("juma")) return "juma";
  if (tl.includes("aie.f") || tl.includes("after hours") || tl.includes("ai engineer foundation")) return "aief";
  if (tl.includes("team-gpt") || tl.includes("team gpt")) return "team-gpt";
  return "build";
};

const posts = raw
  .filter((p) => p.post_type === "regular" && (p.stats?.total_reactions ?? 0) >= 50)
  .sort((a, b) => b.stats.total_reactions - a.stats.total_reactions)
  .slice(0, 8)
  .map((p, i) => ({
    rank: i + 1,
    date: (p.posted_at?.date ?? "").slice(0, 10),
    excerpt: clean(p.text),
    stats: {
      reactions: p.stats?.total_reactions ?? 0,
      comments: p.stats?.comments ?? 0,
      reposts: p.stats?.reposts ?? 0,
    },
    url: (p.url ?? "").replace(/\?.*$/, ""),
    tag: tag(p.text),
  }));

const out = {
  generatedAt: new Date().toISOString(),
  source: "linkedin export",
  profileUrl: "https://linkedin.com/in/yavor-belakov",
  posts,
};
fs.writeFileSync("src/content/posts.json", JSON.stringify(out, null, 2));
console.log(`wrote src/content/posts.json (${posts.length} posts)`);
