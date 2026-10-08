import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
      </div>
      <EmptyState title="Not built yet">Projects arrive with Phase 1, together with capture.</EmptyState>
    </>
  );
}
