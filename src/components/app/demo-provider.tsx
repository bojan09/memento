"use client";

import { useMemo, type ReactNode } from "react";
import { hostLabel } from "@/lib/capture/detect";
import { blobToDataUrl, prepareImage } from "@/lib/capture/image";
import { demoSearch, setDemo, useDemoState, withCounts } from "@/lib/demo/store";
import type { ActionResult, Memory } from "@/lib/types";
import { captureSchema, memoryPatchSchema, projectNameSchema } from "@/lib/validation";
import { AppContext, type AppApi } from "./app-context";

const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
const fail = (error: string): ActionResult<never> => ({ ok: false, error });

// Same contract as the live provider, same validation rules, but writes go to the
// in-browser demo store. Link previews are simulated (the demo never fetches pages).
export function DemoAppProvider({ children }: { children: ReactNode }) {
  const state = useDemoState();

  const api = useMemo<AppApi>(() => {
    const now = () => new Date().toISOString();
    return {
      mode: "demo",
      basePath: "/demo",
      projects: state ? withCounts(state) : [],
      loading: !state,
      async capture(draft) {
        let imageSrc: string | null = null;
        if (draft.kind === "image") {
          if (!draft.image) return fail("Add an image first.");
          try {
            imageSrc = await blobToDataUrl((await prepareImage(draft.image)).blob);
          } catch (e) {
            return fail(e instanceof Error ? e.message : "Couldn't read that image.");
          }
        }
        const check = captureSchema.safeParse(
          draft.kind === "image" ? { ...draft, imagePath: `${crypto.randomUUID()}/${crypto.randomUUID()}.webp` } : draft,
        );
        if (!check.success) return fail(check.error.issues[0]?.message ?? "That doesn't look right.");

        const memory: Memory = {
          id: crypto.randomUUID(),
          kind: draft.kind,
          status: draft.kind === "link" ? "pending" : "ready",
          url: draft.kind === "link" ? (draft.url ?? null) : null,
          note: draft.kind === "note" ? (draft.note?.trim() ?? null) : null,
          why: draft.why?.trim() || null,
          title: null,
          siteName: draft.kind === "link" ? hostLabel(draft.url ?? null) : null,
          description: null,
          imageUrl: null,
          imagePath: null,
          imageSrc,
          projectId: draft.projectId ?? null,
          createdAt: now(),
          updatedAt: now(),
        };
        setDemo((s) => ({ ...s, memories: [memory, ...s.memories] }));
        if (memory.kind === "link") {
          setTimeout(() => {
            setDemo((s) => ({
              ...s,
              memories: s.memories.map((m) =>
                m.id === memory.id
                  ? { ...m, status: "ready", title: hostLabel(m.url), description: "In the real app, the page's own title, description and image appear here." }
                  : m,
              ),
            }));
          }, 1500);
        }
        return ok({ id: memory.id });
      },
      async update(memoryId, patch) {
        const parsed = memoryPatchSchema.safeParse(patch);
        if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "That doesn't look right.");
        if ("note" in patch && !parsed.data.note) return fail("A note can't be empty.");
        setDemo((s) => ({
          ...s,
          memories: s.memories.map((m) =>
            m.id === memoryId
              ? {
                  ...m,
                  ...("title" in patch ? { title: parsed.data.title ?? null } : {}),
                  ...("note" in patch ? { note: parsed.data.note ?? null } : {}),
                  ...("why" in patch ? { why: parsed.data.why ?? null } : {}),
                  ...("projectId" in patch ? { projectId: patch.projectId ?? null } : {}),
                  updatedAt: now(),
                }
              : m,
          ),
        }));
        return ok(undefined);
      },
      async remove(memoryId) {
        setDemo((s) => ({ ...s, memories: s.memories.filter((m) => m.id !== memoryId) }));
        return ok(undefined);
      },
      async refreshPreview() {
        return ok(undefined);
      },
      async createProject(name) {
        const parsed = projectNameSchema.safeParse(name);
        if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Give the project a name.");
        if (state?.projects.some((p) => p.name.toLowerCase() === parsed.data.toLowerCase())) {
          return fail("You already have a project with that name.");
        }
        const project = { id: crypto.randomUUID(), name: parsed.data, createdAt: now() };
        setDemo((s) => ({ ...s, projects: [...s.projects, project] }));
        return ok({ id: project.id });
      },
      async renameProject(projectId, name) {
        const parsed = projectNameSchema.safeParse(name);
        if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Give the project a name.");
        if (state?.projects.some((p) => p.id !== projectId && p.name.toLowerCase() === parsed.data.toLowerCase())) {
          return fail("You already have a project with that name.");
        }
        setDemo((s) => ({ ...s, projects: s.projects.map((p) => (p.id === projectId ? { ...p, name: parsed.data } : p)) }));
        return ok(undefined);
      },
      async deleteProject(projectId) {
        setDemo((s) => ({
          projects: s.projects.filter((p) => p.id !== projectId),
          memories: s.memories.map((m) => (m.projectId === projectId ? { ...m, projectId: null } : m)),
        }));
        return ok(undefined);
      },
      async search(q) {
        return ok(state ? demoSearch(state.memories, q).slice(0, 8) : []);
      },
    };
  }, [state]);

  return <AppContext value={api}>{children}</AppContext>;
}
