import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ALL_THEMES_CSS } from "@/lib/themes";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-next",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yavor.codes"),
  title: {
    default: "Yavor Belakov — yavor.codes",
    template: "%s — yavor.codes",
  },
  description:
    "Yavor Belakov's desktop. Head of AI at Juma, founder of AIE.F Europe. Open the Terminal — everything is in there. Sofia ⇄ San Francisco.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://yavor.codes",
    siteName: "yavor.codes",
    title: "Yavor Belakov — yavor.codes",
    description:
      "Yavor Belakov's desktop. Head of AI at Juma, founder of AIE.F Europe. Sofia ⇄ San Francisco.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b0b12",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yavor Belakov",
  url: "https://yavor.codes",
  jobTitle: "Head of AI at Juma",
  sameAs: ["https://linkedin.com/in/yavor-belakov", "https://github.com/ybelakov"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jetbrainsMono.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <style dangerouslySetInnerHTML={{ __html: ALL_THEMES_CSS }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
