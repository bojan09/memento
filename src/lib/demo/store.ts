"use client";

import { useSyncExternalStore } from "react";
import type { Memory, Project } from "@/lib/types";
import { demoSeed } from "./fixtures";

// In-browser store for /demo. Lives in sessionStorage: survives navigation and reloads
// in this tab, never leaves the device, and "Reset demo" puts the samples back.

export type DemoState = { memories: Memory[]; projects: Omit<Project, "memoryCount">[] };

const KEY = "memento-demo-v1";
let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  if (state) return state;
  try {
    const raw = sessionStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as DemoState) : demoSeed(Date.now());
  } catch {
    state = demoSeed(Date.now());
  }
  return state;
}

function persist(next: DemoState) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded (large images): keep it in memory for this visit.
  }
}

export function setDemo(update: (s: DemoState) => DemoState) {
  state = update(load());
  persist(state);
  listeners.forEach((l) => l());
}

export function resetDemo() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
  state = demoSeed(Date.now());
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** null during server render and hydration; the demo renders a skeleton until the store loads. */
export function useDemoState(): DemoState | null {
  return useSyncExternalStore(subscribe, load, () => null);
}

export function withCounts(s: DemoState): Project[] {
  return s.projects
    .map((p) => ({ ...p, memoryCount: s.memories.filter((m) => m.projectId === p.id).length }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function demoSearch(memories: Memory[], q: string): Memory[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return memories.filter((m) => {
    const text = [m.title, m.note, m.why, m.description, m.siteName, m.url].join(" ").toLowerCase();
    const tokens = text.split(/[^\p{L}\p{N}]+/u);
    return words.every((w) => tokens.some((t) => t.startsWith(w)) || text.includes(w));
  });
}
