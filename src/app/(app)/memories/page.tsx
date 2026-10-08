import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";

export default async function MemoriesPage() {
  const supabase = await createClient();
  const { count, error } = await supabase.from("memories").select("id", { count: "exact", head: true });

  return (
    <>
      <div className="page-head">
        <h1>Memories</h1>
        {!error && count ? <span className="help mono">{count.toLocaleString("en")} saved</span> : null}
      </div>
      {error ? (
        <div className="banner error" role="alert">Couldn&apos;t load your memories. Refresh to try again.</div>
      ) : (
        <EmptyState
          title="Nothing here yet"
          action={
            <Link href="/capture" className="btn btn-primary">
              <Plus className="icon" aria-hidden />
              Capture
            </Link>
          }
        >
          Paste a link, drop a screenshot, or jot a thought.
        </EmptyState>
      )}
    </>
  );
}
