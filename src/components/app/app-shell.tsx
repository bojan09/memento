"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { CaptureProvider } from "@/components/capture/capture-provider";
import { CommandPalette, openPalette } from "@/components/command-palette";
import { Logo } from "@/components/logo";
import { CaptureButton, SideNav, TabBar } from "@/components/nav";
import { ToastProvider } from "@/components/toast";
import { useHref } from "./app-context";

// Signed-in chrome shared by the live app and the demo: sidebar (desktop),
// top bar + tab bar (mobile), capture dialog, ⌘K palette and toasts.
export function AppShell({ children, banner }: { children: ReactNode; banner?: ReactNode }) {
  const href = useHref();
  const lockup = (
    <Link href={href("/memories")} className="lockup">
      <Logo size={24} />
      <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
    </Link>
  );

  return (
    <ToastProvider>
      <CaptureProvider>
        {banner}
        <div className="app">
          <aside className="side">
            {lockup}
            <CaptureButton className="btn btn-primary side-capture">
              <Plus className="icon" aria-hidden />
              Capture
            </CaptureButton>
            <button type="button" className="searchbar" onClick={openPalette}>
              <Search className="icon-sm" aria-hidden />
              <span className="searchbar-text">Search</span>
              <span className="kbd">⌘K</span>
            </button>
            <SideNav />
          </aside>
          <div className="main">
            <header className="topbar">{lockup}</header>
            <main className="content">{children}</main>
          </div>
          <TabBar />
        </div>
        <CommandPalette />
      </CaptureProvider>
    </ToastProvider>
  );
}
