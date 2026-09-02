import { useSyncExternalStore } from "react";

const PHONE_MAX = 820;

function subscribe(cb: () => void): () => void {
  window.addEventListener("resize", cb);
  window.addEventListener("orientationchange", cb);
  return () => {
    window.removeEventListener("resize", cb);
    window.removeEventListener("orientationchange", cb);
  };
}

/** Server renders the desktop; the client swaps to the phone shell right
 *  after hydration. CSS hides the desktop under 820px so there's no flash. */
export function useIsPhone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth <= PHONE_MAX,
    () => false,
  );
}
