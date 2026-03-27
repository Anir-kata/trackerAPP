import type { Metadata } from "next";
import Link from "next/link";
import { Cinzel, Nunito_Sans } from "next/font/google";
import "./globals.css";

const titleFont = Cinzel({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const bodyFont = Nunito_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Frostbitten Tracker",
  description: "Suivi des rares Frostbitten pour World of Warcraft WotLK 3.3.5 Warmane",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${titleFont.variable} ${bodyFont.variable}`}>
      <body>
        <header className="top-nav">
          <Link href="/" className="brand">
            Frostbitten Tracker
          </Link>
          <nav>
            <Link href="/">Dashboard</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
