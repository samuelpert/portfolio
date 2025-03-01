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
  openGraph: {
    title: "Samuel's Portfolio",
    description: "Enjoy my space themed portfolio!",
    url: "https://samuelpt.dev", // Replace with your actual URL
    images: [
      {
        url: "/p2.png", // Corrected image URL
        width: 800,
        height: 600,
        alt: "A description of the image",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico", // Corrected favicon link
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
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className}`}>
        <StarsCanvas />

        {children}
      </body>
    </html>
  );
}
