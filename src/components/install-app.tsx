"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, SquarePlus } from "lucide-react";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

type Platform = "installed" | "ios" | "other";

function readPlatform(): Platform {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return "installed";
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia("(display-mode: standalone)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

// Android/desktop Chromium: native install prompt. iOS has no prompt, so show the Share-sheet steps.
export function InstallApp() {
  const platform = useSyncExternalStore(subscribe, readPlatform, () => "other" as Platform);
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (platform === "installed") {
    return (
      <div className="settings-row">
        <div>
          <div className="label">Installed</div>
          <div className="help">You&apos;re using memento as an app.</div>
        </div>
      </div>
    );
  }

  if (platform === "ios") {
    return (
      <div className="settings-row settings-row-stack">
        <div className="label">Install on iPhone or iPad</div>
        <ol className="install-steps">
          <li>
            Tap <Share className="icon-sm" aria-label="Share" /> in Safari&apos;s toolbar.
          </li>
          <li>
            Choose <SquarePlus className="icon-sm" aria-hidden /> <b>Add to Home Screen</b>.
          </li>
        </ol>
      </div>
    );
  }

  return (
    <div className="settings-row">
      <div>
        <div className="label">Install memento</div>
        <div className="help">
          {promptEvent
            ? "Add it to your home screen or dock. It opens like a regular app."
            : "Use your browser's menu (Install app / Add to Home screen) to add memento to your device."}
        </div>
      </div>
      {promptEvent && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
          }}
        >
          <Download className="icon" aria-hidden />
          Install
        </button>
      )}
    </div>
  );
}
