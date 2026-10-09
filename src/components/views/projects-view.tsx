"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { CircleAlert, FolderClosed, Pencil, Trash2 } from "lucide-react";
import { useApp, useHref } from "@/components/app/app-context";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/ui/modal";
import type { Project } from "@/lib/types";
import { LIMITS } from "@/lib/validation";

export function ProjectsView() {
  const api = useApp();
  const toast = useToast();
  const inputId = useId();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const result = await api.createProject(name);
    setBusy(false);
    if (!result.ok) return setError(result.error);
    setName("");
    setError(null);
    toast.show("Project created.");
  }

  return (
    <>
      <div className="page-head">
        <h1>Projects</h1>
      </div>

      <form className="project-new" onSubmit={create} noValidate>
        <label htmlFor={inputId} className="sr-only">
          New project name
        </label>
        <input
          id={inputId}
          className="input"
          placeholder="New project, e.g. Kitchen renovation"
          value={name}
          maxLength={LIMITS.projectName}
          aria-invalid={error ? true : undefined}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={!name.trim()} aria-busy={busy}>
          <span className="spin" aria-hidden />
          Create
        </button>
      </form>
      {error && (
        <p className="err" role="alert">
          <CircleAlert className="icon-sm" aria-hidden />
          {error}
        </p>
      )}

      {api.loading ? null : api.projects.length === 0 ? (
        <EmptyState title="No projects yet">Group memories that belong together, like a trip, a renovation or a side project.</EmptyState>
      ) : (
        <ul className="project-list">
          {api.projects.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </ul>
      )}
    </>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const api = useApp();
  const href = useHref();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function rename(e: FormEvent) {
    e.preventDefault();
    if (name.trim() === project.name) return setEditing(false);
    const result = await api.renameProject(project.id, name);
    if (!result.ok) return toast.show(result.error, "error");
    setEditing(false);
  }

  async function remove() {
    setBusy(true);
    const result = await api.deleteProject(project.id);
    setBusy(false);
    setConfirming(false);
    toast.show(result.ok ? "Project deleted." : result.error, result.ok ? "default" : "error");
  }

  return (
    <li className="project-row">
      {editing ? (
        <form className="project-rename" onSubmit={rename}>
          <input
            className="input"
            aria-label="Project name"
            value={name}
            maxLength={LIMITS.projectName}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setName(project.name);
                setEditing(false);
              }
            }}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Save
          </button>
        </form>
      ) : (
        <Link href={href(`/memories?project=${project.id}`)} className="project-link">
          <span className="kind">
            <FolderClosed className="icon" aria-hidden />
          </span>
          <span className="project-name">{project.name}</span>
          <span className="help mono">
            {project.memoryCount} {project.memoryCount === 1 ? "memory" : "memories"}
          </span>
        </Link>
      )}
      {!editing && (
        <div className="project-actions">
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={`Rename ${project.name}`} onClick={() => setEditing(true)}>
            <Pencil className="icon-sm" aria-hidden />
          </button>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label={`Delete ${project.name}`} onClick={() => setConfirming(true)}>
            <Trash2 className="icon-sm" aria-hidden />
          </button>
        </div>
      )}
      <ConfirmDialog
        open={confirming}
        title={`Delete "${project.name}"?`}
        body="The memories in it are kept; they just won't belong to a project any more."
        confirmLabel="Delete project"
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirming(false)}
      />
    </li>
  );
}
