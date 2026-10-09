import "server-only";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { KindFilter, Memory, MemoryKind, MemoryStatus, Project } from "@/lib/types";

// Reads for signed-in pages. RLS limits every query to the caller's rows; requireUser()
// makes signed-out access fail fast with a redirect instead of an empty page.

export const MEMORY_COLUMNS =
  "id,kind,status,url,note,why,title,site_name,description,image_url,image_path,project_id,created_at,updated_at";

type MemoryRow = {
  id: string;
  kind: MemoryKind;
  status: MemoryStatus;
  url: string | null;
  note: string | null;
  why: string | null;
  title: string | null;
  site_name: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export const PAGE_SIZE = 30;
const SIGNED_URL_TTL = 60 * 60;

async function toMemories(rows: MemoryRow[]): Promise<Memory[]> {
  const paths = rows.map((r) => r.image_path).filter((p): p is string => Boolean(p));
  const signed = new Map<string, string>();
  if (paths.length) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from("captures").createSignedUrls(paths, SIGNED_URL_TTL);
    for (const item of data ?? []) if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
  }
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    status: r.status,
    url: r.url,
    note: r.note,
    why: r.why,
    title: r.title,
    siteName: r.site_name,
    description: r.description,
    imageUrl: r.image_url,
    imagePath: r.image_path,
    imageSrc: r.image_path ? (signed.get(r.image_path) ?? null) : null,
    projectId: r.project_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function listMemories(opts: { kind?: KindFilter; projectId?: string | null; before?: string | null }) {
  await requireUser();
  const supabase = await createClient();
  let query = supabase
    .from("memories")
    .select(MEMORY_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);
  if (opts.kind && opts.kind !== "all") query = query.eq("kind", opts.kind);
  if (opts.projectId) query = query.eq("project_id", opts.projectId);
  if (opts.before) query = query.lt("created_at", opts.before);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MemoryRow[];
  const page = rows.slice(0, PAGE_SIZE);
  return {
    memories: await toMemories(page),
    nextCursor: rows.length > PAGE_SIZE ? page[page.length - 1].created_at : null,
  };
}

export async function getMemory(id: string): Promise<Memory | null> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("memories").select(MEMORY_COLUMNS).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return (await toMemories([data as MemoryRow]))[0];
}

export async function searchMemories(q: string): Promise<Memory[]> {
  await requireUser();
  if (!q.trim()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_memories", { q, max_results: 30 }).select(MEMORY_COLUMNS);
  if (error) throw new Error(error.message);
  return toMemories((data ?? []) as MemoryRow[]);
}

export async function listProjects(): Promise<Project[]> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,created_at,memories(count)")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    createdAt: p.created_at as string,
    memoryCount: (p.memories as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}
