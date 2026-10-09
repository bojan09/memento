import type { Metadata } from "next";
import { MemoriesView } from "@/components/views/memories-view";
import { listMemories } from "@/lib/data";
import { parseFeedParams } from "@/lib/filters";

export const metadata: Metadata = { title: "Memories" };

export default async function MemoriesPage(props: PageProps<"/memories">) {
  const filters = parseFeedParams(await props.searchParams);
  const { memories, nextCursor } = await listMemories(filters);
  const unfiltered = filters.kind === "all" && !filters.projectId && !filters.before;
  return (
    <MemoriesView
      memories={memories}
      kind={filters.kind}
      projectId={filters.projectId}
      nextCursor={nextCursor}
      totalEmpty={unfiltered && memories.length === 0}
    />
  );
}
