import { hostLabel, noteTitle } from "@/lib/capture/detect";
import type { Memory } from "@/lib/types";

// How a memory reads in lists: one title line and an optional secondary line.
export function displayTitle(m: Memory): string {
  if (m.kind === "link") return m.title || hostLabel(m.url) || "Link";
  if (m.kind === "note") return noteTitle(m.note) || "Note";
  return m.title || "Screenshot";
}

export function secondaryText(m: Memory): string | null {
  if (m.kind === "link") return m.description;
  if (m.kind === "note") {
    const lines = (m.note ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.length > 1 ? lines.slice(1).join(" ") : null;
  }
  return null;
}

export function sourceLabel(m: Memory): string {
  if (m.kind === "link") return m.siteName || hostLabel(m.url);
  return m.kind === "note" ? "Note" : "Screenshot";
}
