export interface ParsedInput {
  raw: string;
  command: string;
  args: string[];
}

export function tokenize(raw: string): ParsedInput {
  const trimmed = raw.trim();
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;
  for (const ch of trimmed) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === " " && !inQuote) {
      if (current) tokens.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  const [first = "", ...rest] = tokens;
  return { raw: trimmed, command: first.toLowerCase(), args: rest };
}
