import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import { Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css";
import "./singularity.css";

// Space Grotesk sets the whole page; JetBrains Mono is the telemetry face —
// the stage bar, chapter eyebrows and every readout in the HUD.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Samuel's Portfolio",
  description:
    "Welcome to my portfolio inconveniently located in the singularity of Gargantua's black hole!",
  icons: {
    icon: [
      { url: "/myfavicon.ico", type: "image/x-icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Samuel's Portfolio",
    description:
      "Welcome to my portfolio inconveniently located in the singularity of Gargantua's black hole!",
    url: "https://samuelpt.dev",
    images: [
      {
        url: "https://samuelpt.dev/p2.png",
        width: 600,
        height: 600,
        alt: "Portfolio Preview Image",
      },
    ],
    siteName: "Samuel's Portfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: some browser extensions inject attributes onto
    // <html>/<body> (e.g. data-__host_prefix_..._-filters-channel) before React
    // hydrates, which otherwise trips a hydration mismatch. This only tolerates
    // attribute diffs on these root elements — it does not affect the app UI.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${grotesk.variable} ${jetbrains.variable}`}
        suppressHydrationWarning
      >
        {children}
        <SpeedInsights />
        <Analytics />
        {/* Only load analytics in production */}
        {process.env.NODE_ENV === "production" && (
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
        )}
      </body>
    </html>
  );
}
