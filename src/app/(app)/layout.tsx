import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { SideNav, TabBar } from "@/components/nav";
import { signOut } from "./actions";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app">
      <aside className="side">
        <Link href="/" className="lockup">
          <Logo size={24} />
          <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
        </Link>
        <Link href="/capture" className="btn btn-primary" style={{ width: "100%" }}>
          <Plus className="icon" aria-hidden />
          Capture
        </Link>
        <SideNav />
        <form action={signOut} className="side-foot nav">
          <button type="submit">
            <LogOut className="icon" aria-hidden />
            Sign out
          </button>
        </form>
      </aside>
      <div className="main">
        <header className="topbar">
          <Link href="/" className="lockup">
            <Logo size={24} />
            <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn btn-ghost btn-icon" aria-label="Sign out">
              <LogOut className="icon" aria-hidden />
            </button>
          </form>
        </header>
        <main className="content">{children}</main>
      </div>
      <TabBar />
    </div>
  );
}
