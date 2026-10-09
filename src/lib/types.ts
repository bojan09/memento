// Shared shapes used by the real app (Supabase) and the demo (in-browser store).

export type MemoryKind = "link" | "note" | "image";
export type MemoryStatus = "pending" | "processing" | "ready" | "failed";

export type Memory = {
  id: string;
  kind: MemoryKind;
  status: MemoryStatus;
  url: string | null;
  note: string | null;
  why: string | null;
  title: string | null;
  siteName: string | null;
  description: string | null;
  /** Preview image from the linked page (remote URL). */
  imageUrl: string | null;
  /** Storage path of an uploaded screenshot. */
  imagePath: string | null;
  /** Displayable URL for the screenshot (signed URL, or a data URL in the demo). */
  imageSrc: string | null;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = { id: string; name: string; memoryCount: number; createdAt: string };

export type KindFilter = MemoryKind | "all";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export type CaptureDraft = {
  kind: MemoryKind;
  url?: string;
  note?: string;
  why?: string;
  projectId?: string | null;
  image?: Blob;
};

export type MemoryPatch = { title?: string | null; note?: string | null; why?: string | null; projectId?: string | null };
