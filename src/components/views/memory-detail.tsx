"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleAlert, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { useApp, useHref } from "@/components/app/app-context";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/ui/modal";
import { displayTitle, sourceLabel } from "@/lib/memory-display";
import { fullDate } from "@/lib/time";
import type { Memory, MemoryPatch } from "@/lib/types";
import { LIMITS } from "@/lib/validation";

export function MemoryDetail({ memory }: { memory: Memory }) {
  const api = useApp();
  const href = useHref();
  const router = useRouter();
  const toast = useToast();
  const ids = { title: useId(), note: useId(), why: useId(), project: useId() };

  const initial = {
    title: memory.title ?? "",
    note: memory.note ?? "",
    why: memory.why ?? "",
    projectId: memory.projectId ?? "",
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = (Object.keys(initial) as (keyof typeof initial)[]).some((k) => form[k] !== initial[k]);
  const set = (key: keyof typeof initial) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const patch: MemoryPatch = {};
    if (form.title !== initial.title) patch.title = form.title;
    if (form.note !== initial.note) patch.note = form.note;
    if (form.why !== initial.why) patch.why = form.why;
    if (form.projectId !== initial.projectId) patch.projectId = form.projectId || null;
    setSaving(true);
    setError(null);
    const result = await api.update(memory.id, patch);
    setSaving(false);
    if (!result.ok) return setError(result.error);
    toast.show("Saved.");
  }

  async function remove() {
    setDeleting(true);
    const result = await api.remove(memory.id);
    setDeleting(false);
    if (!result.ok) {
      setConfirming(false);
      return toast.show(result.error, "error");
    }
    toast.show("Deleted.");
    router.push(href("/memories"));
  }

  async function refreshPreview() {
    const result = await api.refreshPreview(memory.id);
    toast.show(result.ok ? "Fetching the preview again…" : result.error, result.ok ? "default" : "error");
  }

  return (
    <article className="detail">
      <Link href={href("/memories")} className="btn btn-ghost btn-sm detail-back">
        <ArrowLeft className="icon-sm" aria-hidden />
        Memories
      </Link>

      <header className="detail-head">
        <span className="help">
          {sourceLabel(memory)} · <time dateTime={memory.createdAt} suppressHydrationWarning>{fullDate(memory.createdAt)}</time>
        </span>
        <h1>{displayTitle(memory)}</h1>
      </header>

      {memory.kind === "link" && (
        <div className="detail-preview">
          {memory.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- remote preview image
            <img src={memory.imageUrl} alt="" referrerPolicy="no-referrer" />
          )}
          {memory.description && <p className="help">{memory.description}</p>}
          {memory.status === "pending" && (
            <div className="status">
              <span className="node breathe node-muted" aria-hidden />
              Fetching preview…
            </div>
          )}
          <div className="row">
            <a href={memory.url ?? "#"} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              <ExternalLink className="icon" aria-hidden />
              Open link
            </a>
            {api.mode === "live" && memory.status !== "pending" && !memory.description && (
              <button type="button" className="btn btn-secondary" onClick={refreshPreview}>
                <RefreshCw className="icon" aria-hidden />
                Try preview again
              </button>
            )}
          </div>
          <p className="help detail-url">{memory.url}</p>
        </div>
      )}

      {memory.kind === "image" && memory.imageSrc && (
        <a href={memory.imageSrc} target="_blank" rel="noopener noreferrer" className="detail-image">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
          <img src={memory.imageSrc} alt={memory.why ?? "Saved screenshot"} />
        </a>
      )}

      <form className="detail-form" onSubmit={save} noValidate>
        {memory.kind !== "note" && (
          <div className="field">
            <label htmlFor={ids.title}>
              Title <span className="opt">(optional)</span>
            </label>
            <input id={ids.title} className="input" value={form.title} maxLength={LIMITS.title} onChange={set("title")} />
          </div>
        )}
        {memory.kind === "note" && (
          <div className="field">
            <label htmlFor={ids.note}>Note</label>
            <textarea id={ids.note} className="input" rows={6} value={form.note} maxLength={LIMITS.note} onChange={set("note")} />
          </div>
        )}
        <div className="field">
          <label htmlFor={ids.why}>
            Why you saved it <span className="opt">(optional)</span>
          </label>
          <input id={ids.why} className="input" value={form.why} maxLength={LIMITS.why} onChange={set("why")} />
        </div>
        <div className="field">
          <label htmlFor={ids.project}>Project</label>
          <select id={ids.project} className="input" value={form.projectId} onChange={set("projectId")}>
            <option value="">No project</option>
            {api.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="err" role="alert">
            <CircleAlert className="icon-sm" aria-hidden />
            {error}
          </p>
        )}

        <div className="detail-actions">
          <button type="submit" className="btn btn-primary" disabled={!dirty} aria-busy={saving}>
            <span className="spin" aria-hidden />
            Save changes
          </button>
          <button type="button" className="btn btn-ghost detail-delete" onClick={() => setConfirming(true)}>
            <Trash2 className="icon" aria-hidden />
            Delete
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        title="Delete this memory?"
        body="It's removed for good, including any uploaded image."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </article>
  );
}
