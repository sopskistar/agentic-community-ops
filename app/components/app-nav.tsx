"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Security Engine", href: "/security-engine" },
  { label: "Demo", href: "/demo" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "ASP Docs", href: "/docs/asp" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <Link
          href="/"
          className="group flex w-fit items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm shadow-emerald-900/20 transition-transform group-hover:-translate-y-0.5">
            AO
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-wide text-slate-950">
              Agentic Community Ops
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Web3 security desk
            </span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
