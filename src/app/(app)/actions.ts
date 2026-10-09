"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { hostLabel } from "@/lib/capture/detect";
import { searchMemories } from "@/lib/data";
import { getLinkPreview } from "@/lib/link-preview";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult, Memory, MemoryPatch } from "@/lib/types";
import { captureSchema, idSchema, memoryPatchSchema, projectNameSchema } from "@/lib/validation";

const fail = (error: string): ActionResult<never> => ({ ok: false, error });
const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? "Something about that input isn't right.";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createMemory(input: unknown): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = captureSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const v = parsed.data;

  if (v.kind === "image" && !v.imagePath.startsWith(`${user.id}/`)) return fail("Invalid upload.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memories")
    .insert({
      kind: v.kind,
      url: v.kind === "link" ? v.url : null,
      note: v.kind === "note" ? v.note : null,
      image_path: v.kind === "image" ? v.imagePath : null,
      site_name: v.kind === "link" ? hostLabel(v.url) : null,
      why: v.why ?? null,
      project_id: v.projectId ?? null,
      status: v.kind === "link" ? "pending" : "ready",
    })
    .select("id")
    .single();
  if (error || !data) return fail("Couldn't save that. Try again.");

  if (v.kind === "link") after(() => fillLinkPreview(data.id, v.url));
  return { ok: true, data: { id: data.id } };
}

// Runs after the response: reads the page's own metadata, never blocks the save.
async function fillLinkPreview(id: string, url: string) {
  const preview = await getLinkPreview(url);
  const supabase = await createClient();
  await supabase
    .from("memories")
    .update({
      title: preview.title,
      description: preview.description,
      site_name: preview.siteName,
      image_url: preview.imageUrl,
      status: "ready",
      error: preview.ok ? null : "preview_unavailable",
      processed_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function refreshLinkPreview(id: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return fail("Not found.");
  const supabase = await createClient();
  const { data } = await supabase.from("memories").select("url,kind").eq("id", id).maybeSingle();
  if (!data || data.kind !== "link" || !data.url) return fail("Not found.");
  await supabase.from("memories").update({ status: "pending" }).eq("id", id);
  after(() => fillLinkPreview(id, data.url as string));
  return { ok: true, data: undefined };
}

export async function updateMemory(id: string, patch: MemoryPatch): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return fail("Not found.");
  const parsed = memoryPatchSchema.safeParse(patch);
  if (!parsed.success) return fail(firstIssue(parsed.error));

  const changes: Record<string, string | null> = {};
  if ("title" in patch) changes.title = parsed.data.title ?? null;
  if ("why" in patch) changes.why = parsed.data.why ?? null;
  if ("projectId" in patch) changes.project_id = parsed.data.projectId ?? null;
  if ("note" in patch) {
    if (!parsed.data.note) return fail("A note can't be empty.");
    changes.note = parsed.data.note;
  }

  const supabase = await createClient();
  const { error, count } = await supabase.from("memories").update(changes, { count: "exact" }).eq("id", id);
  if (error) return fail("Couldn't save your changes.");
  if (!count) return fail("Not found.");
  return { ok: true, data: undefined };
}

export async function deleteMemory(id: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return fail("Not found.");
  const supabase = await createClient();
  const { data, error } = await supabase.from("memories").delete().eq("id", id).select("image_path").maybeSingle();
  if (error) return fail("Couldn't delete that.");
  if (data?.image_path) await supabase.storage.from("captures").remove([data.image_path]);
  return { ok: true, data: undefined };
}

export async function createProject(name: string): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = projectNameSchema.safeParse(name);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert({ name: parsed.data }).select("id").single();
  if (error?.code === "23505") return fail("You already have a project with that name.");
  if (error || !data) return fail("Couldn't create the project.");
  return { ok: true, data: { id: data.id } };
}

export async function renameProject(id: string, name: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return fail("Not found.");
  const parsed = projectNameSchema.safeParse(name);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const supabase = await createClient();
  const { error } = await supabase.from("projects").update({ name: parsed.data }).eq("id", id);
  if (error?.code === "23505") return fail("You already have a project with that name.");
  if (error) return fail("Couldn't rename the project.");
  return { ok: true, data: undefined };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireUser();
  if (!idSchema.safeParse(id).success) return fail("Not found.");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return fail("Couldn't delete the project.");
  return { ok: true, data: undefined };
}

export async function quickSearch(q: string): Promise<ActionResult<Memory[]>> {
  const query = String(q ?? "").slice(0, 200);
  try {
    return { ok: true, data: (await searchMemories(query)).slice(0, 8) };
  } catch {
    return fail("Search isn't available right now.");
  }
}
