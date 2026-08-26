"use client";

import { useState, useEffect } from "react";

interface Props {
  slug: string;
  title: string;
  image: string;
  category: string;
  date: string;
}

export default function BookmarkButton({ slug, title, image, category, date }: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/favoris?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.saved !== undefined) setSaved(d.saved);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch("/api/favoris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, image, category, date }),
      });
      const data = await res.json();
      if (data.saved !== undefined) setSaved(data.saved);
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Retirer des favoris" : "Sauvegarder l'article"}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition border ${
        saved
          ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800"
          : "bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
      } ${loading ? "opacity-50" : ""}`}
    >
      <svg
        width="14"
        height="14"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
      {saved ? "Sauvegardé" : "Sauvegarder"}
    </button>
  );
}