import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-wrap site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/" className="lockup" aria-label="memento home">
            <Logo size={24} />
            <span className="wordmark" style={{ fontSize: 18 }}>memento</span>
          </Link>
          <p>Capture now. Find it when it matters.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link href="/login">Sign in</Link>
        </nav>
      </div>
      <div className="site-wrap site-footer-base">
        <span>© {new Date().getFullYear()} memento</span>
      </div>
    </footer>
  );
}
