"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { search, type SearchResult } from "@/engine/search";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results: SearchResult[] = query.trim().length > 0 ? search(query) : [];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-400 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
      >
        <span>Search TodayState</span>
        <span className="rounded-md border border-white/10 px-2 py-1 text-xs">
          Ctrl K
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-24 backdrop-blur-sm"
          onMouseDown={closeSearch}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#081320] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="border-b border-white/10 p-5">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search themes, companies and evidence..."
                className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3">
              {query.trim().length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  Start typing to search TodayState.
                </p>
              ) : results.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No matching intelligence found.
                </p>
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={result.href}
                      onClick={closeSearch}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 transition hover:bg-white/[0.05]"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {result.title}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                          {result.type}
                        </p>
                      </div>

                      <span className="text-cyan-300">→</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
