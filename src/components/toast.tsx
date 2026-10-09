"use client";

import { createContext, use, useCallback, useMemo, useRef, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; tone: "default" | "error" };
type ToastContext = { show: (message: string, tone?: Toast["tone"]) => void };

const Ctx = createContext<ToastContext | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3200);
  }, []);
  const value = useMemo(() => ({ show }), [show]);

  return (
    <Ctx value={value}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={t.tone === "error" ? "toast toast-error" : "toast"}>
            <span className="node" aria-hidden style={t.tone === "error" ? { background: "var(--error)" } : undefined} />
            {t.message}
          </div>
        ))}
      </div>
    </Ctx>
  );
}

export function useToast() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
