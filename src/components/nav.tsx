"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderClosed, Layers, MessageCircleQuestionMark, Plus, Search, type LucideIcon } from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon };

export const NAV_ITEMS: Item[] = [
  { href: "/", label: "Memories", icon: Layers },
  { href: "/search", label: "Search", icon: Search },
  { href: "/ask", label: "Ask", icon: MessageCircleQuestionMark },
  { href: "/projects", label: "Projects", icon: FolderClosed },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
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

// Mobile: Memories, Search, [Capture], Ask, Projects. Capture sits in the thumb zone.
export function TabBar() {
  const pathname = usePathname();
  const [memories, search, ask, projects] = NAV_ITEMS;
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
      <Link href="/capture" className="tab-capture" aria-label="Capture">
        <Plus width={24} height={24} strokeWidth={2} aria-hidden />
      </Link>
      {tab(ask)}
      {tab(projects)}
    </nav>
  );
}
