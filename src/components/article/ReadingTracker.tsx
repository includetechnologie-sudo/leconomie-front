"use client";

import { useEffect } from "react";

interface Props {
  slug: string;
  title: string;
  category?: string;
  categorySlug?: string;
  minutes: number;
}

// Enregistre la lecture d'un article pour l'abonné connecté (historique de lecture réel,
// utilisé par le futur tableau de bord de l'espace compte). Ne fait rien pour un visiteur anonyme.
export default function ReadingTracker({ slug, title, category, categorySlug, minutes }: Props) {
  useEffect(() => {
    fetch("/api/lecture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, category, categorySlug, minutes }),
    }).catch(() => {});
  }, [slug, title, category, categorySlug, minutes]);

  return null;
}
