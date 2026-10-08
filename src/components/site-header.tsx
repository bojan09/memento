import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-wrap site-header-inner">
        <Link href="/" className="lockup" aria-label="memento home">
          <Logo size={24} />
          <span className="wordmark" style={{ fontSize: 20 }}>memento</span>
        </Link>
        <nav className="site-nav" aria-label="Main">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="site-actions">
          <Link href="/login" className="btn btn-ghost site-signin">Sign in</Link>
          <Link href="/login" className="btn btn-primary">Get started</Link>
        </div>
      </div>
    </header>
  );
}
