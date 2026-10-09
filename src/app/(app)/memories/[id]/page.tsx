import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MemoryDetail } from "@/components/views/memory-detail";
import { getMemory } from "@/lib/data";
import { isUuid } from "@/lib/filters";

export const metadata: Metadata = { title: "Memory" };

export default async function MemoryPage(props: PageProps<"/memories/[id]">) {
  const { id } = await props.params;
  if (!isUuid(id)) notFound();
  const memory = await getMemory(id);
  if (!memory) notFound();
  // Keyed on updatedAt so the form resets to fresh values after a save.
  return <MemoryDetail key={`${memory.id}:${memory.updatedAt}`} memory={memory} />;
}
