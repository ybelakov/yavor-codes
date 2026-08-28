import { Backdrop } from "@/components/chrome/Backdrop";
import { CrtOverlay } from "@/components/chrome/CrtOverlay";
import { Terminal } from "@/components/terminal/Terminal";

export default function Home() {
  return (
    <>
      <Backdrop />
      <Terminal />
      <CrtOverlay />
      <noscript>
        <p style={{ padding: "1rem" }}>
          this terminal needs JavaScript — meanwhile:{" "}
          <a href="https://linkedin.com/in/yavor-belakov">linkedin.com/in/yavor-belakov</a>
        </p>
      </noscript>
    </>
  );
}
