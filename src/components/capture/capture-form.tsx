"use client";

import { useId, useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent } from "react";
import { CircleAlert, Image as ImageIcon, Link as LinkIcon, StickyNote, X } from "lucide-react";
import { useApp } from "@/components/app/app-context";
import { useToast } from "@/components/toast";
import { detectInput, hostLabel } from "@/lib/capture/detect";
import type { CaptureDraft } from "@/lib/types";
import { LIMITS } from "@/lib/validation";

// One field for everything: a URL becomes a link, an image becomes a screenshot,
// anything else is a note. "Why" and project are optional.
export function CaptureForm({ onDone, autoFocus = true }: { onDone?: (id: string) => void; autoFocus?: boolean }) {
  const api = useApp();
  const toast = useToast();
  const ids = { text: useId(), why: useId(), project: useId(), error: useId() };

  const [text, setText] = useState("");
  const [why, setWhy] = useState("");
  const [projectId, setProjectId] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const detected = image ? ({ kind: "image" } as const) : detectInput(text);

  function attach(file: File | undefined | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only images can be attached for now.");
      return;
    }
    if (image) URL.revokeObjectURL(image.preview);
    setImage({ file, preview: URL.createObjectURL(file) });
    setError(null);
  }

  function clearImage() {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  function onPaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
    if (file) {
      e.preventDefault();
      attach(file);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    attach(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")));
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    if (saving) return;
    let draft: CaptureDraft;
    if (detected.kind === "image" && image) draft = { kind: "image", image: image.file };
    else if (detected.kind === "link") draft = { kind: "link", url: detected.url };
    else if (detected.kind === "note") draft = { kind: "note", note: detected.note };
    else {
      setError("Paste a link, write a note or add an image.");
      return;
    }
    draft.why = why;
    draft.projectId = projectId || null;

    setSaving(true);
    setError(null);
    const result = await api.capture(draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.show("Kept.");
    setText("");
    setWhy("");
    clearImage();
    onDone?.(result.data.id);
  }

  const label =
    detected.kind === "link" ? (
      <>
        <LinkIcon className="icon-sm" aria-hidden /> Link · <b>{hostLabel(detected.url)}</b>
      </>
    ) : detected.kind === "note" ? (
      <>
        <StickyNote className="icon-sm" aria-hidden /> <b>Note</b>
      </>
    ) : detected.kind === "image" ? (
      <>
        <ImageIcon className="icon-sm" aria-hidden /> <b>Screenshot</b>
      </>
    ) : (
      <>Links, notes and screenshots</>
    );

  return (
    <form className="capture" onSubmit={submit} noValidate>
      <div
        className={dragging ? "composer drag" : "composer"}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        {image ? (
          <div className="composer-image">
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={image.preview} alt="Image to save" />
            <button type="button" className="btn btn-secondary btn-icon btn-sm" aria-label="Remove image" onClick={clearImage}>
              <X className="icon-sm" aria-hidden />
            </button>
          </div>
        ) : (
          <>
            <label htmlFor={ids.text} className="sr-only">
              Link or note
            </label>
            <textarea
              id={ids.text}
              value={text}
              autoFocus={autoFocus}
              maxLength={LIMITS.note}
              placeholder="Paste a link, jot a thought, or drop a screenshot…"
              aria-describedby={error ? ids.error : undefined}
              onChange={(e) => setText(e.target.value)}
              onPaste={onPaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
              }}
            />
          </>
        )}
        <div className="composer-why">
          <label htmlFor={ids.why} className="sr-only">
            Why are you saving this? (optional)
          </label>
          <input
            id={ids.why}
            value={why}
            maxLength={LIMITS.why}
            placeholder="Why are you saving this? (optional)"
            onChange={(e) => setWhy(e.target.value)}
          />
        </div>
        <div className="composer-bar">
          <span className="detect" aria-live="polite">
            {label}
          </span>
          <span className="spacer" />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => attach(e.target.files?.[0])}
          />
          {!image && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInput.current?.click()}>
              <ImageIcon className="icon-sm" aria-hidden />
              Image
            </button>
          )}
        </div>
      </div>

      {api.projects.length > 0 && (
        <div className="field">
          <label htmlFor={ids.project}>
            Project <span className="opt">(optional)</span>
          </label>
          <select id={ids.project} className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">No project</option>
            {api.projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p id={ids.error} className="err" role="alert">
          <CircleAlert className="icon-sm" aria-hidden />
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary btn-lg capture-save" disabled={detected.kind === "empty"} aria-busy={saving}>
        <span className="spin" aria-hidden />
        Save
      </button>
    </form>
  );
}
