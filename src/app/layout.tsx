import type { Metadata } from "next";
import { Lora, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Body / content — a classic, warm, readable serif.
const lora = Lora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Headings — DX Slight (free for personal/non-profit use; commercial use needs
// a license). Wide, geometric, futuristic display face.
const dxSlight = localFont({
  src: "./fonts/DXSlight-MediumUltra.otf",
  variable: "--font-heading-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXORA — We turn complexity into clarity",
  description:
    "Strategy. Systems. Software. Impact. Tailored solutions for ambitious businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${jetbrainsMono.variable} ${dxSlight.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
