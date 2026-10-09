"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useApp, useHref } from "@/components/app/app-context";
import { useCapture } from "@/components/capture/capture-provider";
import { EmptyState } from "@/components/empty-state";
import type { KindFilter, Memory } from "@/lib/types";
import { MemoryCard } from "./memory-card";

const KINDS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "link", label: "Links" },
  { value: "note", label: "Notes" },
  { value: "image", label: "Screenshots" },
];

export function MemoriesView({
  memories,
  kind,
  projectId,
  nextCursor,
  totalEmpty,
}: {
  memories: Memory[];
  kind: KindFilter;
  projectId: string | null;
  nextCursor?: string | null;
  /** True when the user has no memories at all (not just none matching the filter). */
  totalEmpty: boolean;
}) {
  const api = useApp();
  const href = useHref();
  const capture = useCapture();
  const projectNames = new Map(api.projects.map((p) => [p.id, p.name]));
  const activeProject = projectId ? api.projects.find((p) => p.id === projectId) : null;

  const filterHref = (next: { kind?: KindFilter; project?: string | null; before?: string | null }) => {
    const params = new URLSearchParams();
    const k = next.kind ?? kind;
    const p = next.project === undefined ? projectId : next.project;
    if (k !== "all") params.set("kind", k);
    if (p) params.set("project", p);
    if (next.before) params.set("before", next.before);
    const qs = params.toString();
    return href(`/memories${qs ? `?${qs}` : ""}`);
  };

  return (
    <>
      <div className="page-head">
        <h1>{activeProject ? activeProject.name : "Memories"}</h1>
      </div>

      {!totalEmpty && (
        <div className="filters">
          <nav className="chips" aria-label="Filter by kind">
            {KINDS.map((k) => (
              <Link key={k.value} href={filterHref({ kind: k.value })} className="chip" aria-current={k.value === kind ? "true" : undefined}>
                {k.label}
              </Link>
            ))}
          </nav>
          {api.projects.length > 0 && (
            <nav className="chips" aria-label="Filter by project">
              {activeProject ? (
                <Link href={filterHref({ project: null })} className="chip" aria-current="true">
                  {activeProject.name}
                  <X className="icon-sm" aria-label="Clear project filter" />
                </Link>
              ) : (
                api.projects.map((p) => (
                  <Link key={p.id} href={filterHref({ project: p.id })} className="chip">
                    {p.name}
                  </Link>
                ))
              )}
            </nav>
          )}
        </div>
      )}

      {totalEmpty ? (
        <EmptyState
          title="Nothing here yet"
          action={
            <button type="button" className="btn btn-primary" onClick={capture.open}>
              <Plus className="icon" aria-hidden />
              Capture
            </button>
          }
        >
          Paste a link, drop a screenshot, or jot a thought.
        </EmptyState>
      ) : memories.length === 0 ? (
        <EmptyState title="Nothing matches" action={<Link href={href("/memories")} className="btn btn-secondary">Show everything</Link>}>
          No memories match this filter yet.
        </EmptyState>
      ) : (
        <div className="feed-grid">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} projectName={!projectId && m.projectId ? projectNames.get(m.projectId) : null} />
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="feed-more">
          <Link href={filterHref({ before: nextCursor })} className="btn btn-secondary">
            Show older
          </Link>
        </div>
      )}

      {api.mode === "live" && <PendingRefresher pending={memories.some((m) => m.status === "pending")} />}
    </>
  );
}

// While link previews are being fetched in the background, re-check every 2.5 s (max 8 times).
function PendingRefresher({ pending }: { pending: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    let ticks = 0;
    const timer = setInterval(() => {
      ticks += 1;
      router.refresh();
      if (ticks >= 8) clearInterval(timer);
    }, 2500);
    return () => clearInterval(timer);
  }, [pending, router]);
  return null;
}
