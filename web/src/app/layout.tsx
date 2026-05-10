import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import "./globals.css";

const display = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "BANPOOL — 금지어 수영장 파티",
  description: "실시간 공간형 금지어 심리전 파티게임",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${display.variable} font-display`}>{children}</body>
    </html>
  );
}
