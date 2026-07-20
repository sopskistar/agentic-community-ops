import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { AppNav } from "./components/app-nav";

export const metadata: Metadata = {
  title: "Agentic Ops | AI Communication Intelligence Platform",
  description:
    "Agentic Ops is an AI Communication Intelligence Platform. The current MVP focuses on Web3 community security, with a roadmap for broader business communication intelligence.",
  icons: {
    icon: "/logo/Agentic-Ops.jpg",
    shortcut: "/logo/Agentic-Ops.jpg",
  },
  openGraph: {
    title: "Agentic Ops | AI Communication Intelligence Platform",
    description:
      "Current MVP: Web3 community security. Roadmap: omnichannel business communication intelligence.",
    siteName: "Agentic Ops",
    images: [
      {
        url: "/logo/Agentic-Ops.jpg",
        width: 440,
        height: 440,
        alt: "Agentic Ops logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var stored=localStorage.getItem("aco-theme");var prefers=window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=stored|| (prefers?"dark":"light");document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.style.colorScheme=theme;}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col app-bg text-slate-950">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <AppNav />
        <div id="main-content" className="flex-1">
          {children}
        </div>
        <footer className="border-t border-slate-200/80 bg-white/90 transition-colors duration-300">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/logo/Agentic-Ops.jpg"
                  alt="Agentic Ops logo"
                  width={36}
                  height={36}
                  className="rounded-lg border border-slate-200 object-contain"
                />
                <p className="font-semibold text-slate-950">
                  Agentic Ops
                </p>
              </div>
              <p className="mt-1 text-xs">
                Copyright 2026 Agentic Ops. All rights reserved.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="https://github.com/"
                className="font-semibold text-slate-700 transition-colors hover:text-teal-700"
              >
                GitHub
              </Link>
              <Link
                href="/docs/asp"
                className="font-semibold text-slate-700 transition-colors hover:text-teal-700"
              >
                Documentation
              </Link>
              <Link
                href="/privacy"
                className="font-semibold text-slate-700 transition-colors hover:text-teal-700"
              >
                Privacy
              </Link>
              <Link
                href="/data-deletion"
                className="font-semibold text-slate-700 transition-colors hover:text-teal-700"
              >
                Data Deletion
              </Link>
              <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                Version 0.1.0
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
