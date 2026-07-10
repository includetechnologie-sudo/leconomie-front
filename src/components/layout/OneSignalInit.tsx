"use client";

import { useEffect } from "react";

const APP_ID = "0112806c-6570-4ed1-b5a2-fa570dbcffa5";

export default function OneSignalInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    script.onload = () => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: OneSignalType) => {
        await OneSignal.init({
          appId: APP_ID,
          safari_web_id: "",
          notifyButton: { enable: false }, // on gère le bouton nous-mêmes
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
                    pageViews: 2,   // demande après 2 pages vues
                    timeDelay: 10,  // et après 10 secondes
                  },
                },
              ],
            },
          },
        });
      });
    };
    document.head.appendChild(script);
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
