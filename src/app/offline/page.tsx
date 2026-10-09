import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { Logo } from "@/components/logo";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "Offline" };

// Precached by the service worker and shown when a page can't load without a network.
export default function OfflinePage() {
  return (
    <main className="auth">
      <div className="auth-card" style={{ justifyItems: "center", textAlign: "center" }}>
        <Logo size={40} />
        <div className="state">
          <WifiOff className="icon" aria-hidden />
          <h1 style={{ fontSize: 24 }}>You&apos;re offline</h1>
          <p>Your memories will be here when you&apos;re back online.</p>
          <RetryButton />
        </div>
      </div>
    </main>
  );
}
