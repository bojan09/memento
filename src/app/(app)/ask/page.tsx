import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = { title: "Ask" };

export default function AskPage() {
  return (
    <>
      <div className="page-head">
        <h1>Ask</h1>
      </div>
      <EmptyState title="Not built yet">Ask My Knowledge arrives with Phase 3. Answers will cite your own memories, and say so when nothing matches.</EmptyState>
    </>
  );
}
