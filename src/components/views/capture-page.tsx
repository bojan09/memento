"use client";

import { useRouter } from "next/navigation";
import { useHref } from "@/components/app/app-context";
import { CaptureForm } from "@/components/capture/capture-form";

// Full-page capture: used when /capture is opened directly (links, home-screen shortcuts).
export function CapturePage() {
  const router = useRouter();
  const href = useHref();
  return (
    <>
      <div className="page-head">
        <h1>Capture</h1>
      </div>
      <CaptureForm onDone={() => router.push(href("/memories"))} />
    </>
  );
}
