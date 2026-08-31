import { Desktop } from "@/components/desktop/Desktop";

export default function Home() {
  return (
    <>
      <h1 className="sr-only">
        Yavor Belakov — Head of AI at Juma, founder of AIE.F Europe. Sofia and San Francisco.
      </h1>
      <Desktop />
      <noscript>
        <p style={{ padding: "1rem", color: "#fff" }}>
          This desktop needs JavaScript — meanwhile:{" "}
          <a href="https://linkedin.com/in/yavor-belakov">linkedin.com/in/yavor-belakov</a>
        </p>
      </noscript>
    </>
  );
}
