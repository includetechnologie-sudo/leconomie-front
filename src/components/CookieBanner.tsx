"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/cookies-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getConsent()) {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  function acceptAll() {
    setConsent({ analytics: true, marketing: true });
    setVisible(false);
  }

  function refuseAll() {
    setConsent({ analytics: false, marketing: false });
    setVisible(false);
  }

  function savePrefs() {
    setConsent({ analytics, marketing });
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 sm:p-5 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {!showPrefs ? (
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-10 h-10 bg-gray-100 rounded-xl items-center justify-center shrink-0">
                <svg width="22" height="22" fill="none" stroke="#374151" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="8" cy="9" r="1.5" fill="#374151"/>
                  <circle cx="15" cy="8" r="1" fill="#374151"/>
                  <circle cx="10" cy="14" r="1" fill="#374151"/>
                  <circle cx="16" cy="13" r="1.5" fill="#374151"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-1">Nous respectons votre vie privée</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et vous envoyer des notifications pertinentes.
                  Vous pouvez accepter ou personnaliser vos préférences.{" "}
                  <Link href="/politique-cookies" className="text-red-600 hover:underline">En savoir plus</Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4">
              <button
                onClick={acceptAll}
                className="flex-1 sm:flex-none bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-red-700 transition"
              >
                Tout accepter
              </button>
              <button
                onClick={refuseAll}
                className="flex-1 sm:flex-none bg-gray-100 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-gray-200 transition"
              >
                Tout refuser
              </button>
              <button
                onClick={() => setShowPrefs(true)}
                className="flex-1 sm:flex-none border border-gray-200 text-gray-600 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Personnaliser
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            <h3 className="font-bold text-gray-900 text-base mb-4">Gérer mes préférences</h3>
            <div className="space-y-4">
              {/* Essentiels */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Cookies essentiels</p>
                  <p className="text-xs text-gray-500">Authentification, paiement, navigation. Toujours actifs.</p>
                </div>
                <div className="w-10 h-5 bg-red-600 rounded-full relative">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              {/* Analytiques */}
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Cookies analytiques</p>
                  <p className="text-xs text-gray-500">Notifications push (OneSignal), mesure d&apos;audience.</p>
                </div>
                <button
                  onClick={() => setAnalytics(!analytics)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${analytics ? "bg-red-600" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${analytics ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
              {/* Marketing */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Cookies marketing</p>
                  <p className="text-xs text-gray-500">Publicités personnalisées, régies externes (futur).</p>
                </div>
                <button
                  onClick={() => setMarketing(!marketing)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${marketing ? "bg-red-600" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${marketing ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <button
                onClick={savePrefs}
                className="flex-1 bg-red-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-red-700 transition"
              >
                Enregistrer mes choix
              </button>
              <button
                onClick={() => setShowPrefs(false)}
                className="flex-1 border border-gray-200 text-gray-600 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"
              >
                Retour
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
