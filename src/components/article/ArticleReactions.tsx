"use client";

import { useState, useEffect } from "react";
import { REACTION_TYPES, REACTION_EMOJI, REACTION_LABEL, ReactionType } from "@/lib/reactions";
import { getVisitorId } from "@/lib/visitor-id";

interface Props {
  slug: string;
}

export default function ArticleReactions({ slug }: Props) {
  const [counts, setCounts] = useState<Record<ReactionType, number> | null>(null);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const visitorId = getVisitorId();
    fetch(`/api/reactions?slug=${encodeURIComponent(slug)}&visitorId=${encodeURIComponent(visitorId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.counts) setCounts(d.counts);
        if (d.myReaction !== undefined) setMyReaction(d.myReaction);
      })
      .catch(() => {});
  }, [slug]);

  async function react(type: ReactionType) {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, type, visitorId: getVisitorId() }),
      });
      const data = await res.json();
      if (data.counts) setCounts(data.counts);
      if (data.myReaction !== undefined) setMyReaction(data.myReaction);
    } catch {}
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-semibold text-gray-600">Réagir :</span>
      {REACTION_TYPES.map((type) => {
        const active = myReaction === type;
        return (
          <button
            key={type}
            onClick={() => react(type)}
            disabled={loading}
            title={REACTION_LABEL[type]}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition border ${
              active
                ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-900/20 dark:border-red-800"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
            } ${loading ? "opacity-50" : ""}`}
          >
            <span className="text-sm">{REACTION_EMOJI[type]}</span>
            <span>{counts ? counts[type] : 0}</span>
          </button>
        );
      })}
    </div>
  );
}
