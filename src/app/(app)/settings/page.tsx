import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { InstallApp } from "@/components/install-app";
import { requireUser } from "@/lib/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <section className="settings-group" aria-labelledby="account-h">
        <h2 id="account-h" className="nav-title">Account</h2>
        <div className="settings-row">
          <div>
            <div className="label">Signed in as</div>
            <div className="help">{user.email ?? "Unknown email"}</div>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn btn-secondary">
              <LogOut className="icon" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </section>

      <section className="settings-group" aria-labelledby="app-h">
        <h2 id="app-h" className="nav-title">App</h2>
        <InstallApp />
      </section>
    </>
  );
}
