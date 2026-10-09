"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { InstallApp } from "@/components/install-app";
import { resetDemo, useDemoState, demoSearch } from "@/lib/demo/store";
import { parseFeedParams } from "@/lib/filters";
import { useToast } from "@/components/toast";
import { EmptyState } from "@/components/empty-state";
import { MemoriesView } from "./memories-view";
import { MemoryDetail } from "./memory-detail";
import { SearchView } from "./search-view";

// /demo screens: the same views as the live app, fed from the in-browser demo store.

function DemoLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="page-head">
        <span className="sk" style={{ width: 160, height: 32 }} />
      </div>
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <span>
        <b>Demo.</b> Nothing is saved to an account.
        <span className="demo-banner-long"> Sample data, kept only in this browser tab.</span>
      </span>
      <Link href="/">Exit demo</Link>
    </div>
  );
}

export function DemoMemories() {
  const state = useDemoState();
  const params = useSearchParams();
  if (!state) return <DemoLoading />;
  const filters = parseFeedParams(Object.fromEntries(params));
  const memories = state.memories.filter(
    (m) => (filters.kind === "all" || m.kind === filters.kind) && (!filters.projectId || m.projectId === filters.projectId),
  );
  return (
    <MemoriesView
      memories={memories}
      kind={filters.kind}
      projectId={filters.projectId}
      totalEmpty={state.memories.length === 0}
    />
  );
}

export function DemoMemory({ id }: { id: string }) {
  const state = useDemoState();
  if (!state) return <DemoLoading />;
  const memory = state.memories.find((m) => m.id === id);
  if (!memory) {
    return (
      <EmptyState title="Not found" action={<Link href="/demo/memories" className="btn btn-secondary">Back to memories</Link>}>
        This memory doesn&apos;t exist, or it was deleted.
      </EmptyState>
    );
  }
  return <MemoryDetail key={`${memory.id}:${memory.updatedAt}`} memory={memory} />;
}

export function DemoSearch() {
  const state = useDemoState();
  const q = (useSearchParams().get("q") ?? "").trim().slice(0, 200);
  if (!state) return <DemoLoading />;
  return <SearchView key={q} query={q} results={demoSearch(state.memories, q)} />;
}

export function DemoSettings() {
  const toast = useToast();
  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>
      <section className="settings-group" aria-labelledby="account-h">
        <h2 id="account-h" className="nav-title">Account</h2>
        <div className="settings-row">
          <div>
            <div className="label">Demo account</div>
            <div className="help">Signed-in users see their email and a Sign out button here.</div>
          </div>
          <Link href="/login" className="btn btn-secondary">Sign in</Link>
        </div>
      </section>
      <section className="settings-group" aria-labelledby="demo-h">
        <h2 id="demo-h" className="nav-title">Demo</h2>
        <div className="settings-row">
          <div>
            <div className="label">Reset sample data</div>
            <div className="help">Undo everything you changed in the demo.</div>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              resetDemo();
              toast.show("Demo reset.");
            }}
          >
            <RotateCcw className="icon" aria-hidden />
            Reset
          </button>
        </div>
      </section>
      <section className="settings-group" aria-labelledby="app-h">
        <h2 id="app-h" className="nav-title">App</h2>
        <InstallApp />
      </section>
    </>
  );
}
