import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StarsCanvas } from "@/app/components/StarBackground";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Samuel's Portfolio",
  description: "Enjoy my space themed portfolio!",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" }, // Fallback for Safari
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }, // Standard favicon
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
      </head>

      <body className={`${inter.className}`}>
        <StarsCanvas />

        {children}
      </body>
    </html>
  );
}
