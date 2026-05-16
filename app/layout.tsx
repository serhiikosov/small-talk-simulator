import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Small Talk Simulator",
  description: "Тренажер світської бесіди на базі Gemini",
};

export const viewport: Viewport = {
  themeColor: "#08070f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

function StatusBar() {
  return (
    <div className="flex shrink-0 items-center justify-between px-7 pt-3 pb-1 text-[12px] font-semibold tracking-tight">
      <span>9:41</span>
      <span className="flex items-center gap-1.5 text-slate-200">
        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor" aria-hidden>
          <rect x="0" y="6" width="2.5" height="4" rx="0.5" />
          <rect x="4" y="4" width="2.5" height="6" rx="0.5" />
          <rect x="8" y="2" width="2.5" height="8" rx="0.5" />
          <rect x="12" y="0" width="2.5" height="10" rx="0.5" />
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden>
          <path
            d="M7 9C9.5 5.5 11.5 4 14 4L7 9L0 4C2.5 4 4.5 5.5 7 9Z"
            fill="currentColor"
            opacity=".9"
          />
        </svg>
        <span className="ml-0.5 inline-flex items-center">
          <span className="relative inline-block h-[10px] w-[22px] rounded-[3px] border border-current/70">
            <span className="absolute inset-[1.5px] rounded-[1.5px] bg-current" />
          </span>
          <span className="ml-[1px] inline-block h-[5px] w-[1.5px] rounded-r-sm bg-current/70" />
        </span>
      </span>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={lora.variable}>
      <body className="phone-glow text-slate-100">
        <div className="flex min-h-[100dvh] items-stretch justify-center sm:items-center sm:p-6">
          <div className="relative flex w-full max-w-[440px] flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 min-h-[100dvh] sm:min-h-0 sm:h-[860px] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[44px] sm:border sm:border-white/10 sm:shadow-[0_30px_120px_-20px_rgba(124,58,237,0.45),0_0_0_1px_rgba(255,255,255,0.03)]">
            <StatusBar />
            <main className="relative flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
            {/* Home indicator (decorative) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-50 flex justify-center">
              <span className="hidden sm:block h-1 w-28 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
