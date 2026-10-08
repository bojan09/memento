import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Capture" };

export default function CapturePage() {
  return (
    <>
      <div className="page-head">
        <h1>Capture</h1>
      </div>
      <EmptyState title="Not built yet">The capture sheet arrives with Phase 1: one field for links, notes and screenshots.</EmptyState>
    </>
  );
}
