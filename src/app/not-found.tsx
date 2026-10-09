import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="auth">
      <div className="auth-card" style={{ justifyItems: "center", textAlign: "center" }}>
        <Logo size={40} />
        <div className="state">
          <h1 style={{ fontSize: 24 }}>Nothing kept here</h1>
          <p>This page doesn&apos;t exist, or it was moved.</p>
          <Link href="/" className="btn btn-primary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
