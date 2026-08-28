import { track } from "@vercel/analytics";

type Props = Record<string, string | number | boolean>;

export function trackEvent(name: string, props?: Props): void {
  try {
    track(name, props);
  } catch {
    // analytics must never break the terminal
  }
}
