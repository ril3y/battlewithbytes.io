"use client";

import { useEffect, useState } from "react";
import { VERSION } from "./version";

/**
 * Component that checks for new versions when running as PWA
 * Shows a notification when an update is available
 */
export default function VersionChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState("");

  useEffect(() => {
    // Only run in standalone PWA mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        (window.navigator as { standalone?: boolean }).standalone) ||
      document.referrer.includes("android-app://");

    if (!isStandalone) {
      return;
    }

    // Check for updates every 30 minutes
    const checkForUpdates = async () => {
      try {
        const response = await fetch("/tools/serial-terminal", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (response.ok) {
          const html = await response.text();

          // Extract version from the page source (looking for version.ts content)
          const versionMatch = html.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);

          if (versionMatch && versionMatch[1] !== VERSION) {
            setLatestVersion(versionMatch[1]);
            setUpdateAvailable(true);
          }
        }
      } catch (error) {
        console.log("Version check failed:", error);
      }
    };

    // Check immediately and then every 30 minutes
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-900 border border-green-500 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔔</span>
        <div className="flex-1">
          <h3 className="font-bold text-green-400 mb-1">Update Available</h3>
          <p className="text-sm text-gray-300 mb-3">
            BattleTerm {latestVersion} is now available. You are using {VERSION}
            .
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
            >
              Refresh Now
            </button>
            <button
              onClick={() => setUpdateAvailable(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
