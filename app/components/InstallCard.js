"use client";

import { useEffect, useState } from "react";

export default function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setInstalled(standalone);

    const handleInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener("beforeinstallprompt", handleInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstall);
    };
  }, []);

  async function installApp() {
    if (!deferredPrompt) {
      alert(
        "To install GBK AI: open your browser menu and choose 'Add to Home screen' or 'Install app'."
      );
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  if (installed) return null;

  return (
    <div className="installCard">
      <div>
        <strong>📱 Install GBK AI</strong>
        <p>Learn faster with GBK AI on your home screen.</p>
      </div>

      <button onClick={installApp}>
        Install App
      </button>
    </div>
  );
}
