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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <StarsCanvas />

        {children}
      </body>
    </html>
  );
}
