"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Favori {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
  savedAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MesFavorisPage() {
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/favoris")
      .then((r) => {
        if (r.status === 401) throw new Error("auth");
        return r.json();
      })
      .then((d) => setFavoris(d.favoris || []))
      .catch((e) => {
        if (e.message === "auth") setError("auth");
        else setError("network");
      })
      .finally(() => setLoading(false));
  }, []);

  async function remove(slug: string) {
    setFavoris((prev) => prev.filter((f) => f.slug !== slug));
    await fetch("/api/favoris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "remove" }),
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto text-gray-300 mb-4">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        <h1 className="text-2xl font-bold mb-2">Mes articles sauvegardés</h1>
        <p className="text-gray-500 mb-6">Connectez-vous pour accéder à vos favoris.</p>
        <Link href="/connexion" className="inline-block bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-red-600">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
        <h1 className="text-2xl font-bold">Mes articles sauvegardés</h1>
        <span className="text-sm text-gray-400 ml-auto">{favoris.length} article{favoris.length !== 1 ? "s" : ""}</span>
      </div>

      {favoris.length === 0 ? (
        <div className="text-center py-16">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto text-gray-300 mb-4">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <p className="text-gray-500 mb-2">Aucun article sauvegardé</p>
          <p className="text-sm text-gray-400">Cliquez sur le bouton &quot;Sauvegarder&quot; sur un article pour le retrouver ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoris.map((f) => (
            <div key={f.slug} className="flex gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:shadow-md transition group">
              <Link href={`/article/${f.slug}`} className="shrink-0">
                <div className="relative w-28 h-20 rounded-lg overflow-hidden">
                  <Image
                    src={f.image || "/images/hero.jpg"}
                    alt={f.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                {f.category && (
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide">{f.category}</span>
                )}
                <Link href={`/article/${f.slug}`}>
                  <h2 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-red-600 transition">
                    {f.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  {f.date && <span>{formatDate(f.date)}</span>}
                  <span>Sauvegardé le {formatDate(f.savedAt)}</span>
                </div>
              </div>
              <button
                onClick={() => remove(f.slug)}
                className="shrink-0 self-center p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Retirer des favoris"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}