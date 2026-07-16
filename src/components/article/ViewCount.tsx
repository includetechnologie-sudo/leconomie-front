"use client";

import { useEffect, useState } from "react";

export default function ViewCount({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/track?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => setViews(d.views))
      .catch(() => {});
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="flex items-center gap-1 text-gray-400 text-xs">
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      {views.toLocaleString("fr-FR")} vue{views > 1 ? "s" : ""}
    </span>
  );
}
