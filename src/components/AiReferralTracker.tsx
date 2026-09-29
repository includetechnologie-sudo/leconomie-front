"use client";

import { useEffect } from "react";
import { classifyAiSource } from "@/lib/ai-sources";

// Compte les lecteurs arrivés depuis un assistant IA (ChatGPT, Gemini, Perplexity, Claude…).
// Une seule mesure par session, et seulement si l'origine est une IA : aucune requête sinon.
export default function AiReferralTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("ai_ref_done")) return;
      sessionStorage.setItem("ai_ref_done", "1");
    } catch { /* stockage indisponible : on mesure quand même */ }

    const source = classifyAiSource(document.referrer, new URLSearchParams(window.location.search).get("utm_source"));
    if (!source) return;

    fetch("/api/track-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
