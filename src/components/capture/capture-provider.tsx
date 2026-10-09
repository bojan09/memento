"use client";

import { createContext, use, useCallback, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type CaptureContext = { open: () => void };

const Ctx = createContext<CaptureContext | null>(null);

export function CaptureProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const open = useCallback(() => router.push("/capture"), [router]);
  const value = useMemo(() => ({ open }), [open]);
  return <Ctx value={value}>{children}</Ctx>;
}

export function useCapture() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useCapture must be used inside CaptureProvider");
  return ctx;
}
