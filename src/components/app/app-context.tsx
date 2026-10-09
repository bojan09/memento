"use client";

import { createContext, use } from "react";
import type { ActionResult, CaptureDraft, Memory, MemoryPatch, Project } from "@/lib/types";

// Everything a screen needs from "the backend". The live app implements it with server
// actions + Supabase; the demo implements it with an in-browser store. Screens never know which.
export type AppApi = {
  mode: "live" | "demo";
  basePath: "" | "/demo";
  projects: Project[];
  /** True until the data source is ready (the demo store loads after hydration). */
  loading: boolean;
  capture: (draft: CaptureDraft) => Promise<ActionResult<{ id: string }>>;
  update: (id: string, patch: MemoryPatch) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
  refreshPreview: (id: string) => Promise<ActionResult>;
  createProject: (name: string) => Promise<ActionResult<{ id: string }>>;
  renameProject: (id: string, name: string) => Promise<ActionResult>;
  deleteProject: (id: string) => Promise<ActionResult>;
  search: (q: string) => Promise<ActionResult<Memory[]>>;
};

export const AppContext = createContext<AppApi | null>(null);

export function useApp() {
  const api = use(AppContext);
  if (!api) throw new Error("useApp must be used inside an app provider");
  return api;
}

export function useHref() {
  const { basePath } = useApp();
  return (path: string) => `${basePath}${path}`;
}
