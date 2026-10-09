"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Link as LinkIcon, Plus, Search, StickyNote } from "lucide-react";
import { useApp, useHref } from "@/components/app/app-context";
import { useCapture } from "@/components/capture/capture-provider";
import { displayTitle, sourceLabel } from "@/lib/memory-display";
import type { Memory } from "@/lib/types";

const KIND_ICON = { link: LinkIcon, note: StickyNote, image: ImageIcon } as const;

type Option = { key: string; label: string; hint?: string; icon: typeof Search; run: () => void };

// ⌘K / Ctrl+K anywhere in the app: quick search plus "capture" and "see all results".
export function CommandPalette() {
  const api = useApp();
  const href = useHref();
  const router = useRouter();
  const capture = useCapture();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Memory[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("memento:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("memento:open-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!open || !q) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const r = await api.search(q);
      if (!cancelled) {
        setResults(r.ok ? r.data : []);
        setActive(0);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, open, api]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setActive(0);
  }

  const q = query.trim();
  const options: Option[] = [
    ...(q ? results : []).map((m) => ({
      key: m.id,
      label: displayTitle(m),
      hint: sourceLabel(m),
      icon: KIND_ICON[m.kind],
      run: () => router.push(href(`/memories/${m.id}`)),
    })),
    ...(q
      ? [{ key: "all", label: `See all results for “${q}”`, icon: Search, run: () => router.push(href(`/search?q=${encodeURIComponent(q)}`)) }]
      : []),
    { key: "capture", label: "Capture something new", icon: Plus, run: () => capture.open() },
  ];

  if (!open) return null;

  return (
    <div className="palette-scrim" onClick={close}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <div className="pal-input">
          <Search className="icon" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={options[active] ? `${listId}-${options[active].key}` : undefined}
            placeholder="Search memories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, options.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter" && options[active]) {
                e.preventDefault();
                options[active].run();
                close();
              }
            }}
          />
        </div>
        <ul id={listId} className="pal-list" role="listbox">
          {q && results.length === 0 && <li className="pal-empty">No memories match “{q}”.</li>}
          {options.map((o, i) => (
            <li
              key={o.key}
              id={`${listId}-${o.key}`}
              role="option"
              aria-selected={i === active}
              className="pal-opt"
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                o.run();
                close();
              }}
            >
              <o.icon className="icon" aria-hidden />
              <span className="pal-label">{o.label}</span>
              {o.hint && <small>{o.hint}</small>}
            </li>
          ))}
        </ul>
        <div className="pal-foot">
          <span>
            <span className="kbd">↑</span> <span className="kbd">↓</span> to move
          </span>
          <span>
            <span className="kbd">↵</span> to open
          </span>
          <span>
            <span className="kbd">Esc</span> to close
          </span>
        </div>
      </div>
    </div>
  );
}

export function openPalette() {
  window.dispatchEvent(new Event("memento:open-palette"));
}
