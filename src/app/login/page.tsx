import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="auth">
      <div className="auth-card">
        <span className="lockup">
          <Logo size={40} />
          <span className="wordmark" style={{ fontSize: 28 }}>memento</span>
        </span>
        <LoginForm />
      </div>
    </main>
  );
}
