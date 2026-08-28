export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min((curr[j - 1] ?? 0) + 1, (prev[j] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = curr;
  }
  return prev[n] ?? 0;
}

export function suggest(token: string, candidates: string[]): string[] {
  const scored = candidates
    .map((c) => {
      if (c.startsWith(token)) return { c, score: 0 };
      if (c.includes(token)) return { c, score: 1 };
      const d = levenshtein(token, c);
      const threshold = Math.max(1, Math.floor(token.length / 3) + 1);
      return { c, score: d <= threshold ? 1 + d : Infinity };
    })
    .filter((s) => s.score !== Infinity)
    .sort((a, b) => a.score - b.score);
  return scored.slice(0, 3).map((s) => s.c);
}
