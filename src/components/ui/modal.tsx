"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

// Native <dialog>: focus trap, Esc to close and the backdrop come from the browser.
// `sheet` turns it into a bottom sheet on phones (see dialog.sheet in components.css).
export function Modal({
  open,
  onClose,
  title,
  sheet = false,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sheet?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={[sheet ? "sheet" : "", className ?? ""].join(" ").trim() || undefined}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="grabber" aria-hidden />
      <div className="dlg-head">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="btn btn-ghost btn-icon btn-sm" aria-label="Close" onClick={onClose}>
          <X className="icon" aria-hidden />
        </button>
      </div>
      {open ? children : null}
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="dlg-body">
        <p className="help">{body}</p>
      </div>
      <div className="dlg-foot">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" aria-busy={busy} onClick={onConfirm}>
          <span className="spin" aria-hidden />
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
