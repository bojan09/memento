import Link from "next/link";
import { Plus } from "lucide-react";
import { CaptureProvider } from "@/components/capture/capture-provider";
import { Logo } from "@/components/logo";
import { CaptureButton, SideNav, TabBar } from "@/components/nav";
import { ToastProvider } from "@/components/toast";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <ToastProvider>
      <CaptureProvider>
        <div className="app">
          <aside className="side">
            <Link href="/memories" className="lockup">
              <Logo size={24} />
              <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
            </Link>
            <CaptureButton className="btn btn-primary side-capture">
              <Plus className="icon" aria-hidden />
              Capture
            </CaptureButton>
            <SideNav />
          </aside>
          <div className="main">
            <header className="topbar">
              <Link href="/memories" className="lockup">
                <Logo size={24} />
                <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
              </Link>
            </header>
            <main className="content">{children}</main>
          </div>
          <TabBar />
        </div>
      </CaptureProvider>
    </ToastProvider>
  );
}
