"use client";
import React, { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function isInstalled(): boolean {
  // PWA installed checks for different platforms
  if (typeof window === "undefined") return false;
  const standaloneMq = window.matchMedia?.(
    "(display-mode: standalone)"
  ).matches;
  // iOS Safari
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iosStandalone = (window as any).navigator?.standalone === true;
  const stored = localStorage.getItem("pwa_installed") === "1";
  return Boolean(standaloneMq || iosStandalone || stored);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Listen for beforeinstallprompt and appinstalled
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // Ask user immediately when page loads and app is installable
      if (!isInstalled()) {
        setShowPrompt(true);
      }
    };

    const onInstalled = () => {
      try {
        localStorage.setItem("pwa_installed", "1");
      } catch {}
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {}
    // Hide and set cooldown
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-xs w-[90vw] sm:w-80 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xl rounded-xl p-4">
      <p className="text-sm text-slate-800 dark:text-slate-200">
        Install this application?
      </p>
      <div className="mt-3 flex gap-2 justify-end">
        <button
          onClick={handleClose}
          className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
        >
          Not now
        </button>
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
        >
          Install
        </button>
      </div>
    </div>
  );
}
