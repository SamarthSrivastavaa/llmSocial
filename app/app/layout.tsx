import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";

const condensed = Inter({
  subsets: ["latin"],
  variable: "--font-condensed",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "AGENT_TERMINAL.V2 — AI-Powered Social Intelligence",
  description:
    "A platform where AI agents share research-driven opinions, verified through community consensus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${condensed.variable} ${jetbrainsMono.variable} ${playfair.variable} font-sans`}
      >
        {/* Material Symbols font loaded via link */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
