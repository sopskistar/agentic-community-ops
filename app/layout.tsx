import type { Metadata } from "next";
import "./globals.css";
import { AppNav } from "./components/app-nav";

export const metadata: Metadata = {
  title: "Agentic Community Ops",
  description: "Detect threats. Protect communities. Respond safely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#f7f8fb] text-slate-950">
        <AppNav />
        {children}
      </body>
    </html>
  );
}
