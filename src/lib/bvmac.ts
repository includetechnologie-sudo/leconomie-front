import fs from "fs";
import path from "path";

// Cours officiels de la BVMAC, alimentés chaque jour de séance par scripts/bvmac-sync.mjs (cron du VPS)

export interface BvmacAction {
  isin: string;
  mnemo: string;
  nom: string;
  cours: number | null;
  coursPrecedent: number | null;
  variationPct: number | null;
  ouverture: number | null;
  volume: number;
  valeur: number;
  transactions: number;
  statut: string | null;
  plusHautAnnee: number | null;
  plusBasAnnee: number | null;
  variationAnneePct: number | null;
}

export interface BvmacSession {
  date: string; // AAAA-MM-JJ
  numero: number;
  pdfUrl: string;
  indice: { nom: string; code: string; valeur: number; variationPct: number | null };
  synthese: { volume: number; valeur: number; transactions: number; emetteurs: number | null } | null;
  actions: BvmacAction[];
}

// Noms usuels des valeurs cotées (le bulletin donne des raisons sociales longues et des mnémoniques tronqués)
const VALEURS: Record<string, { nom: string; pays: string }> = {
  CM0000010009: { nom: "SEMC", pays: "Cameroun" },
  CM0000010017: { nom: "SAFACAM", pays: "Cameroun" },
  CM0000010025: { nom: "SOCAPALM", pays: "Cameroun" },
  CM0000010041: { nom: "La Régionale", pays: "Cameroun" },
  GQ0000010050: { nom: "BANGE", pays: "Guinée équatoriale" },
  GA0000010066: { nom: "SCG-Ré", pays: "Gabon" },
  GA0000010074: { nom: "BGFI Holding", pays: "Gabon" },
};

const PAYS_ISIN: Record<string, string> = {
  CM: "Cameroun", GA: "Gabon", GQ: "Guinée équatoriale", CG: "Congo", TD: "Tchad", CF: "Centrafrique",
};

export function nomUsuel(a: BvmacAction): string {
  return VALEURS[a.isin]?.nom ?? a.mnemo;
}

export function paysValeur(a: BvmacAction): string {
  return VALEURS[a.isin]?.pays ?? PAYS_ISIN[a.isin.slice(0, 2)] ?? "";
}

/** Toutes les séances, la plus récente en premier ; [] si le fichier n'existe pas encore */
export function getBvmacSessions(): BvmacSession[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "data", "bvmac.json"), "utf8");
    const sessions = (JSON.parse(raw).sessions ?? []) as BvmacSession[];
    return sessions.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}

/** "2026-09-29" → "lundi 29 septembre 2026" */
export function formatSeance(date: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", { ...options, timeZone: "UTC" });
}

/** Nombre de jours écoulés depuis une séance (pour signaler des cours anciens) */
export function joursDepuisSeance(date: string): number {
  return (Date.now() - new Date(`${date}T12:00:00Z`).getTime()) / 86_400_000;
}
