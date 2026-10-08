import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <>
      <div className="page-head">
        <h1>Search</h1>
      </div>
      <EmptyState title="Not built yet">Search and ⌘K arrive with Phase 3, once memories have text to search.</EmptyState>
    </>
  );
}
