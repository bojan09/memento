"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderClosed, Layers, Plus, Search, Settings, type LucideIcon } from "lucide-react";
import { useHref } from "@/components/app/app-context";
import { useCapture } from "@/components/capture/capture-provider";

type Item = { path: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: Item[] = [
  { path: "/memories", label: "Memories", icon: Layers },
  { path: "/search", label: "Search", icon: Search },
  { path: "/projects", label: "Projects", icon: FolderClosed },
  { path: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav() {
  const pathname = usePathname();
  const href = useHref();
  return (
    <nav className="nav" aria-label="Main">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
        <Link key={path} href={href(path)} aria-current={isActive(pathname, href(path)) ? "page" : undefined}>
          <Icon className="icon" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function CaptureButton({ className, children }: { className?: string; children?: React.ReactNode }) {
  const { open } = useCapture();
  return (
    <button type="button" className={className} onClick={() => open()} aria-label={children ? undefined : "Capture"}>
      {children ?? <Plus width={24} height={24} strokeWidth={2} aria-hidden />}
    </button>
  );
}

// Mobile: Memories, Search, [Capture], Projects, Settings. Capture sits in the thumb zone.
export function TabBar() {
  const pathname = usePathname();
  const href = useHref();
  const [memories, search, projects, settings] = NAV_ITEMS;
  const tab = ({ path, label, icon: Icon }: Item) => (
    <Link key={path} href={href(path)} className="tab-item" aria-current={isActive(pathname, href(path)) ? "page" : undefined}>
      <Icon className="icon" aria-hidden />
      {label}
    </Link>
  );
  return (
    <nav className="tabbar" aria-label="Main">
      {tab(memories)}
      {tab(search)}
      <CaptureButton className="tab-capture" />
      {tab(projects)}
      {tab(settings)}
    </nav>
  );
}
