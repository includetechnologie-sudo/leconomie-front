"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent } from "@/lib/cookies-consent";

const APP_ID = "0112806c-6570-4ed1-b5a2-fa570dbcffa5";

function loadOneSignal() {
  if (document.querySelector('script[src*="OneSignalSDK"]')) return;
  const script = document.createElement("script");
  script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
  script.defer = true;
  script.onload = () => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: OneSignalType) => {
      await OneSignal.init({
        appId: APP_ID,
        safari_web_id: "",
        notifyButton: { enable: false },
        promptOptions: {
          slidedown: {
            prompts: [
              {
                type: "push",
                autoPrompt: true,
                text: {
                  actionMessage: "Recevez les dernières actualités économiques de la zone CEMAC directement sur votre appareil.",
                  acceptButton: "Activer",
                  cancelButton: "Plus tard",
                },
                delay: {
                  pageViews: 2,
                  timeDelay: 10,
                },
              },
            ],
          },
        },
      });
    });
  };
  document.head.appendChild(script);
}

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (hasAnalyticsConsent()) {
      loadOneSignal();
    }

    function onConsentUpdate(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.analytics) loadOneSignal();
    }

    window.addEventListener("cookie-consent-update", onConsentUpdate);
    return () => window.removeEventListener("cookie-consent-update", onConsentUpdate);
  }, []);

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneSignalType = any;

declare global {
  interface Window {
    OneSignalDeferred?: ((os: OneSignalType) => void)[];
  }
}
