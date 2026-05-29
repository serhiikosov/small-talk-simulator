import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { UIPrefsProvider } from "@/components/UIPrefs";
import { SceneControllerProvider } from "@/components/SceneController";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RiseGuide — Small Talk Simulator",
  description: "In-lesson small talk practice",
};

export const viewport: Viewport = {
  themeColor: "#ECE7F5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="rg-body">
        <UIPrefsProvider>
          <SceneControllerProvider>
            <AppShell>{children}</AppShell>
          </SceneControllerProvider>
        </UIPrefsProvider>
      </body>
    </html>
  );
}
