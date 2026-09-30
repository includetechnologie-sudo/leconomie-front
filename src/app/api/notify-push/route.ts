import { NextResponse } from "next/server";

// Ancienne cible du déclencheur WP Webhooks « Post created ». Ce déclencheur part à la création des
// brouillons et des médias, jamais à la publication : aucune notification n'est jamais partie par ici.
// Les publications sont désormais détectées par scripts/publish-watch.mjs (→ /api/internal/on-publish).
// On accuse réception sans rien faire ni journaliser, pour ne plus remplir les logs d'erreurs.
export async function POST() {
  return NextResponse.json({ skipped: true, reason: "géré par publish-watch" });
}
