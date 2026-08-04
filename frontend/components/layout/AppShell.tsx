"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import GlobalSearch from "@/components/layout/GlobalSearch";
import { navigation } from "@/config/navigation";
import AppHeader from "@/components/layout/AppHeader";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050b14] text-white">
      <div className="flex min-h-screen">
        <aside className="w-72 shrink-0 border-r border-white/10 bg-[#081320] p-8">
          <h1 className="text-3xl font-black text-cyan-300">TodayState</h1>

          <div className="mt-8">
            <GlobalSearch />
          </div>

          <nav className="mt-10 space-y-8">
            {navigation.map((group) => (
              <div key={group.title}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {group.title}
                </p>

                <div className="space-y-2">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 transition ${
                          isActive
                            ? "border-cyan-400 bg-cyan-400/15 font-semibold text-cyan-300"
                            : "border-transparent text-slate-300 hover:bg-cyan-400/10 hover:text-white"
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>

                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-10">
          <AppHeader />

          {children}
        </main>
      </div>
    </div>
  );
}
