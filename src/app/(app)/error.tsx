"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

// Shown inside the app shell when a signed-in page fails to load (network, database).
export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="state" role="alert">
      <h3>Couldn&apos;t load this page</h3>
      <p>Something went wrong on our side. Your memories are safe.</p>
      <button type="button" className="btn btn-primary" onClick={() => retry()}>
        <RotateCcw className="icon" aria-hidden />
        Try again
      </button>
      {error.digest && <p className="help mono">Ref: {error.digest}</p>}
    </div>
  );
}
