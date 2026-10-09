"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { CaptureForm } from "./capture-form";

type CaptureContext = { open: () => void };

const Ctx = createContext<CaptureContext | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <Ctx value={value}>
      {children}
      <Modal open={isOpen} onClose={() => setOpen(false)} title="Capture" sheet className="capture-dialog">
        <div className="dlg-body">
          <CaptureForm onDone={() => setOpen(false)} />
        </div>
      </Modal>
    </Ctx>
  );
}

export function useCapture() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useCapture must be used inside CaptureProvider");
  return ctx;
}
