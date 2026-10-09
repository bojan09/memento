"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderClosed, Layers, Plus, Search, Settings, type LucideIcon } from "lucide-react";
import { useCapture } from "@/components/capture/capture-provider";

type Item = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: Item[] = [
  { href: "/memories", label: "Memories", icon: Layers },
  { href: "/search", label: "Search", icon: Search },
  { href: "/projects", label: "Projects", icon: FolderClosed },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav className="nav" aria-label="Main">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined}>
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
  const [memories, search, projects, settings] = NAV_ITEMS;
  const tab = ({ href, label, icon: Icon }: Item) => (
    <Link key={href} href={href} className="tab-item" aria-current={isActive(pathname, href) ? "page" : undefined}>
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
