import Link from "next/link";
import type { Metadata } from "next";
import { getBvmacSessions, nomUsuel, paysValeur, formatSeance, joursDepuisSeance, type BvmacAction } from "@/lib/bvmac";
import { ORGANIZATION_ID } from "@/lib/organization";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

// Relit data/bvmac.json régulièrement : le cron y ajoute la séance du jour
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const [last] = getBvmacSessions();
  const quand = last ? ` — séance du ${formatSeance(last.date, { day: "numeric", month: "long", year: "numeric" })}` : "";
  return {
    title: `Bourse BVMAC : cours des actions du jour${quand}`,
    description: last
      ? `Cours officiels de la BVMAC (Douala) : indice BVMAC All Share à ${fmt(last.indice.valeur, 2)} points, cours et variations de SOCAPALM, SEMC, SAFACAM, BGFI Holding, BANGE, SCG-Ré et La Régionale.`
      : "Cours officiels des actions cotées à la Bourse des Valeurs Mobilières de l'Afrique Centrale (BVMAC).",
    alternates: { canonical: `${SITE_URL}/marches` },
  };
}

function fmt(n: number | null | undefined, decimals = 0): string {
  if (n == null) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function Variation({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-gray-400">—</span>;
  const cls = pct > 0 ? "text-green-600 bg-green-50" : pct < 0 ? "text-red-600 bg-red-50" : "text-gray-500 bg-gray-50";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-sm font-semibold tabular-nums ${cls} dark:bg-transparent`}>
      {pct > 0 ? "+" : ""}{fmt(pct, 2)} %
    </span>
  );
}

export default function MarchesPage() {
  const sessions = getBvmacSessions();
  const last = sessions[0];

  if (!last) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Bourse BVMAC : cours du jour</h1>
        <p className="text-gray-500">Les cours officiels seront disponibles après la prochaine séance.</p>
      </div>
    );
  }

  const actions = [...last.actions].sort((a, b) => (b.valeur - a.valeur) || nomUsuel(a).localeCompare(nomUsuel(b)));
  const movers = last.actions.filter((a) => a.variationPct);
  const hausse = movers.filter((a) => (a.variationPct ?? 0) > 0).sort((a, b) => (b.variationPct ?? 0) - (a.variationPct ?? 0))[0];
  const baisse = movers.filter((a) => (a.variationPct ?? 0) < 0).sort((a, b) => (a.variationPct ?? 0) - (b.variationPct ?? 0))[0];
  const historique = sessions.slice(0, 10);
  const ageJours = joursDepuisSeance(last.date);
  const oldest = sessions[sessions.length - 1];

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "Cours des actions cotées à la BVMAC",
    "description": "Cours de clôture, variations et volumes quotidiens des actions cotées à la Bourse des Valeurs Mobilières de l'Afrique Centrale (BVMAC), et indice BVMAC All Share, repris du Bulletin officiel de la cote.",
    "url": `${SITE_URL}/marches`,
    "inLanguage": "fr",
    "isAccessibleForFree": true,
    "dateModified": last.date,
    "temporalCoverage": `${oldest.date}/${last.date}`,
    "spatialCoverage": "Communauté économique et monétaire de l'Afrique centrale (CEMAC)",
    "creator": { "@type": "Organization", "name": "Bourse des Valeurs Mobilières de l'Afrique Centrale (BVMAC)", "url": "https://www.bvm-ac.org" },
    "publisher": { "@id": ORGANIZATION_ID },
    "isBasedOn": last.pdfUrl,
    "variableMeasured": ["Indice BVMAC All Share", "Cours de clôture (FCFA)", "Variation du jour (%)", "Volume transigé", "Valeur transigée (FCFA)"],
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": `${SITE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Bourse & Marchés", "item": `${SITE_URL}/bourse-marches` },
      { "@type": "ListItem", "position": 3, "name": "Cours BVMAC", "item": `${SITE_URL}/marches` },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([datasetJsonLd, breadcrumbJsonLd]) }} />

      <nav className="text-sm text-gray-500 mb-3 flex items-center gap-2">
        <Link href="/" className="hover:text-red-600 transition">Accueil</Link>
        <span>›</span>
        <Link href="/bourse-marches" className="hover:text-red-600 transition">Bourse &amp; Marchés</Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-slate-200 font-medium">Cours BVMAC</span>
      </nav>

      <header className="border-b-4 border-red-600 pb-4 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Bourse BVMAC : cours des actions du jour</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">
          Séance du <strong>{formatSeance(last.date)}</strong> · Bulletin officiel de la cote n° {last.numero}
        </p>
        {ageJours > 5 && (
          <p className="mt-2 text-sm text-amber-700">
            Aucun nouveau bulletin publié depuis cette séance. Les cours affichés sont les derniers disponibles.
          </p>
        )}
      </header>

      {/* Indice + synthèse */}
      <section className="grid md:grid-cols-4 gap-4 mb-10">
        <div className="md:col-span-2 rounded-xl bg-gray-900 text-white p-5">
          <p className="text-sm text-gray-400">{last.indice.nom} ({last.indice.code})</p>
          <p className="text-4xl font-bold tabular-nums mt-1">{fmt(last.indice.valeur, 2)}</p>
          <p className={`mt-1 font-semibold ${ (last.indice.variationPct ?? 0) > 0 ? "text-green-400" : (last.indice.variationPct ?? 0) < 0 ? "text-red-400" : "text-gray-400"}`}>
            {(last.indice.variationPct ?? 0) > 0 ? "▲ +" : (last.indice.variationPct ?? 0) < 0 ? "▼ " : ""}{fmt(last.indice.variationPct, 2)} % sur la séance
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <p className="text-sm text-gray-500">Valeur échangée (actions)</p>
          <p className="text-2xl font-bold tabular-nums mt-1">{fmt(last.synthese?.valeur)} <span className="text-base font-normal">FCFA</span></p>
          <p className="text-sm text-gray-500 mt-1">{fmt(last.synthese?.volume)} titres · {fmt(last.synthese?.transactions)} transaction(s)</p>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5 text-sm space-y-2">
          <p className="text-gray-500">Plus forte hausse</p>
          <p className="font-bold">{hausse ? <>{nomUsuel(hausse)} <Variation pct={hausse.variationPct} /></> : "Aucune"}</p>
          <p className="text-gray-500">Plus forte baisse</p>
          <p className="font-bold">{baisse ? <>{nomUsuel(baisse)} <Variation pct={baisse.variationPct} /></> : "Aucune"}</p>
        </div>
      </section>

      {/* Tableau des actions */}
      <section className="mb-10">
        <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Marché des actions</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Société</th>
                <th className="px-4 py-3 text-right">Cours (FCFA)</th>
                <th className="px-4 py-3 text-right">Variation</th>
                <th className="px-4 py-3 text-right">Volume</th>
                <th className="px-4 py-3 text-right">Valeur (FCFA)</th>
                <th className="px-4 py-3 text-right">Depuis janvier</th>
                <th className="px-4 py-3 text-right">Plus haut / bas de l&apos;année</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {actions.map((a: BvmacAction) => (
                <tr key={a.isin}>
                  <td className="px-4 py-3">
                    <p className="font-bold">{nomUsuel(a)}</p>
                    <p className="text-xs text-gray-500">{a.nom} · {paysValeur(a)}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{fmt(a.cours)}</td>
                  <td className="px-4 py-3 text-right"><Variation pct={a.variationPct} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(a.volume)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmt(a.valeur)}</td>
                  <td className="px-4 py-3 text-right"><Variation pct={a.variationAnneePct} /></td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-600 dark:text-slate-400">{fmt(a.plusHautAnnee)} / {fmt(a.plusBasAnnee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historique de l'indice */}
      {historique.length > 1 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Indice BVMAC All Share : dernières séances</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Séance</th>
                  <th className="px-4 py-3 text-right">Indice</th>
                  <th className="px-4 py-3 text-right">Variation</th>
                  <th className="px-4 py-3 text-right">Valeur échangée (FCFA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {historique.map((s) => (
                  <tr key={s.date}>
                    <td className="px-4 py-2.5">{formatSeance(s.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{fmt(s.indice.valeur, 2)}</td>
                    <td className="px-4 py-2.5 text-right"><Variation pct={s.indice.variationPct} /></td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(s.synthese?.valeur)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="rounded-xl bg-gray-50 dark:bg-slate-800 p-5 text-sm text-gray-600 dark:text-slate-400 space-y-2">
        <p>
          <strong>Source :</strong> Bourse des Valeurs Mobilières de l&apos;Afrique Centrale (BVMAC),{" "}
          <a href={last.pdfUrl} target="_blank" rel="noopener" className="text-red-600 hover:underline">
            Bulletin officiel de la cote n° {last.numero} du {formatSeance(last.date, { day: "2-digit", month: "2-digit", year: "numeric" })}
          </a>. Cours en francs CFA (FCFA). La variation du jour est calculée par la BVMAC sur le cours de référence de la séance.
        </p>
        <p>
          Données reprises chaque jour de séance par L&apos;Economie. Retrouvez nos analyses dans la rubrique{" "}
          <Link href="/bourse-marches" className="text-red-600 hover:underline">Bourse &amp; Marchés</Link>.
        </p>
      </footer>
    </div>
  );
}
