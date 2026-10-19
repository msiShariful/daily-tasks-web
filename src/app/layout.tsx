import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Daily Tasks",
    template: "%s · Daily Tasks",
  },
  description: "Daily task log for the team",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      {/*
        Browser extensions (ColorZilla, Grammarly, password managers) add their own
        attributes to <body> before React hydrates, and React reports that as a
        hydration mismatch. This silences it for this element's own attributes only;
        mismatches inside the app are still reported.
      */}
      <body className="min-h-full font-sans" suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
