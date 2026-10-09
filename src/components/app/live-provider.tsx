"use client";

import { useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  createMemory,
  createProject,
  deleteMemory,
  deleteProject,
  quickSearch,
  refreshLinkPreview,
  renameProject,
  updateMemory,
} from "@/app/(app)/actions";
import { prepareImage } from "@/lib/capture/image";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult, Project } from "@/lib/types";
import { AppContext, type AppApi } from "./app-context";

export function LiveAppProvider({ userId, projects, children }: { userId: string; projects: Project[]; children: ReactNode }) {
  const router = useRouter();

  const api = useMemo<AppApi>(() => {
    // After any write, re-render the current server page with fresh data.
    const refreshing = <T,>(p: Promise<ActionResult<T>>) =>
      p.then((r) => {
        if (r.ok) router.refresh();
        return r;
      });

    return {
      mode: "live",
      basePath: "",
      projects,
      loading: false,
      async capture(draft) {
        if (draft.kind !== "image") return refreshing(createMemory(draft));
        if (!draft.image) return { ok: false, error: "Add an image first." };
        let prepared;
        try {
          prepared = await prepareImage(draft.image);
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : "Couldn't read that image." };
        }
        const path = `${userId}/${crypto.randomUUID()}.${prepared.ext}`;
        const supabase = createClient();
        const { error } = await supabase.storage
          .from("captures")
          .upload(path, prepared.blob, { contentType: prepared.blob.type, upsert: false });
        if (error) return { ok: false, error: "Upload failed. Check your connection and try again." };
        const result = await refreshing(createMemory({ kind: "image", imagePath: path, why: draft.why, projectId: draft.projectId }));
        if (!result.ok) await supabase.storage.from("captures").remove([path]);
        return result;
      },
      update: (id, patch) => refreshing(updateMemory(id, patch)),
      remove: (id) => refreshing(deleteMemory(id)),
      refreshPreview: (id) => refreshing(refreshLinkPreview(id)),
      createProject: (name) => refreshing(createProject(name)),
      renameProject: (id, name) => refreshing(renameProject(id, name)),
      deleteProject: (id) => refreshing(deleteProject(id)),
      search: (q) => quickSearch(q),
    };
  }, [projects, router, userId]);

  return <AppContext value={api}>{children}</AppContext>;
}
