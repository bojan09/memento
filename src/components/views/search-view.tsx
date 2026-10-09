"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useApp, useHref } from "@/components/app/app-context";
import { EmptyState } from "@/components/empty-state";
import type { Memory } from "@/lib/types";
import { MemoryCard } from "./memory-card";

// The query lives in the URL (?q=), so results are shareable and the back button works.
export function SearchView({ query, results }: { query: string; results: Memory[] }) {
  const api = useApp();
  const href = useHref();
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(query);
  const projectNames = new Map(api.projects.map((p) => [p.id, p.name]));

  useEffect(() => {
    const next = value.trim();
    if (next === query) return;
    const t = setTimeout(() => {
      router.replace(href(next ? `/search?q=${encodeURIComponent(next)}` : "/search"), { scroll: false });
    }, 250);
    return () => clearTimeout(t);
  }, [value, query, router, href]);

  return (
    <>
      <div className="page-head">
        <h1>Search</h1>
      </div>
      <form className="search-box" role="search" onSubmit={(e) => e.preventDefault()}>
        <Search className="icon" aria-hidden />
        <label htmlFor={inputId} className="sr-only">
          Search your memories
        </label>
        <input
          id={inputId}
          type="search"
          value={value}
          autoFocus
          placeholder="Search titles, notes, reasons and sites"
          onChange={(e) => setValue(e.target.value)}
        />
      </form>

      {!query ? (
        <p className="help">Every word matches the start of a word, so “fig mult” finds “Figma multiplayer”.</p>
      ) : results.length === 0 ? (
        <EmptyState title="No matches">Nothing saved matches “{query}”. Try fewer or shorter words.</EmptyState>
      ) : (
        <>
          <p className="help" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="feed-grid">
            {results.map((m) => (
              <MemoryCard key={m.id} memory={m} projectName={m.projectId ? projectNames.get(m.projectId) : null} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
