"use client";

import Link from "next/link";
import { FolderClosed, Image as ImageIcon, Link as LinkIcon, StickyNote } from "lucide-react";
import { useHref } from "@/components/app/app-context";
import { displayTitle, secondaryText, sourceLabel } from "@/lib/memory-display";
import { relativeTime } from "@/lib/time";
import type { Memory } from "@/lib/types";

const KIND_ICON = { link: LinkIcon, note: StickyNote, image: ImageIcon } as const;

export function MemoryCard({ memory, projectName }: { memory: Memory; projectName?: string | null }) {
  const href = useHref();
  const Icon = KIND_ICON[memory.kind];
  const media = memory.kind === "image" ? memory.imageSrc : memory.imageUrl;
  const secondary = secondaryText(memory);

  return (
    <Link href={href(`/memories/${memory.id}`)} className="mcard interactive">
      <div className="mcard-head">
        <span className="kind">
          <Icon className="icon" aria-hidden />
        </span>
        <span className="mcard-src">{sourceLabel(memory)}</span>
        <time className="mcard-time mono" dateTime={memory.createdAt} suppressHydrationWarning>
          {relativeTime(memory.createdAt)}
        </time>
      </div>
      {media && (
        <div className="mcard-media">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URLs and remote preview images */}
          <img src={media} alt="" loading="lazy" referrerPolicy="no-referrer" />
        </div>
      )}
      <h3>{displayTitle(memory)}</h3>
      {secondary && <p className="summary">{secondary}</p>}
      {memory.why && (
        <div className="why">
          <q>{memory.why}</q>
        </div>
      )}
      {memory.status === "pending" && (
        <div className="status">
          <span className="node breathe node-muted" aria-hidden />
          Fetching preview…
        </div>
      )}
      {projectName && (
        <div className="tags">
          <span className="tag">
            <FolderClosed className="icon-sm" aria-hidden />
            {projectName}
          </span>
        </div>
      )}
    </Link>
  );
}
