"use client";

import Link from "next/link";

export default function ArticleError() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Article temporairement indisponible</h1>
      <p className="text-gray-500 mb-8">
        Nous ne pouvons pas charger cet article pour le moment. Veuillez réessayer dans quelques instants.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-red-700 transition text-sm"
        >
          Réessayer
        </button>
        <Link href="/" className="border border-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
