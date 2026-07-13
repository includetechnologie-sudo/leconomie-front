import Link from "next/link";

interface Props {
  content: string;
}

function getPreview(html: string): string {
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  const nonEmpty = paragraphs.filter((p) => p.replace(/<[^>]+>/g, "").trim().length > 0);
  // 1er paragraphe = chapô, puis on tronque le 2e à ~6 lignes (~400 caractères)
  const chapo = nonEmpty[0] || "";
  const second = nonEmpty[1] || "";
  const truncated = second.length > 400
    ? second.replace(/<\/p>$/, "").slice(0, 400).trimEnd() + "…</p>"
    : second;
  return [chapo, truncated].filter(Boolean).join("\n");
}

export default function PremiumWall({ content }: Props) {
  const preview = getPreview(content);

  return (
    <div className="relative">

      {/* Aperçu — 3 premiers paragraphes */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-red-600 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: preview }}
      />

      {/* Zone floutée courte */}
      <div className="relative mt-2 overflow-hidden" style={{ maxHeight: "80px" }}>
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold select-none pointer-events-none"
          style={{ filter: "blur(4px)", opacity: 0.4 }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 0%, white 60%)" }} />
      </div>

      {/* Bloc d'accès premium */}
      <div className="mt-6 rounded-2xl overflow-hidden shadow-lg border border-red-100">

        {/* Bandeau supérieur */}
        <div className="bg-red-600 px-8 py-4 flex items-center gap-3">
          <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <p className="text-white font-bold text-sm uppercase tracking-widest">
            Contenu réservé aux abonnés Premium
          </p>
        </div>

        <div className="bg-white px-8 py-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Lisez la suite de cet article
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Rejoignez les abonnés de <strong>L&apos;Économie</strong> et accédez à l&apos;intégralité des articles, analyses exclusives, archives et magazines numériques.
          </p>

          {/* Avantages */}
          <div className="flex flex-wrap justify-center gap-4 mb-7 text-xs text-gray-600">
            {["Tous les articles premium", "Archives complètes", "Journal & Magazine PDF", "Accès immédiat"].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <svg width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {item}
              </span>
            ))}
          </div>

          {/* Offres */}
          <div className="grid sm:grid-cols-2 gap-3 max-w-sm mx-auto mb-6">
            <Link
              href="/abonnement?offre=mensuel"
              className="border-2 border-red-600 rounded-xl px-4 py-3 hover:bg-red-50 transition"
            >
              <p className="text-xs text-gray-500 mb-0.5">Mensuel</p>
              <p className="text-lg font-bold text-red-600">5 000 FCFA<span className="text-xs font-normal text-gray-400">/mois</span></p>
            </Link>
            <Link
              href="/abonnement?offre=annuel"
              className="bg-red-600 text-white rounded-xl px-4 py-3 hover:bg-red-700 transition relative overflow-hidden"
            >
              <span className="absolute top-1.5 right-2 text-[10px] bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded">-30%</span>
              <p className="text-xs text-red-200 mb-0.5">Annuel</p>
              <p className="text-lg font-bold">50 000 FCFA<span className="text-xs font-normal text-red-200">/an</span></p>
            </Link>
          </div>

          <Link
            href="/abonnement"
            className="inline-block bg-red-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-red-700 transition text-sm w-full sm:w-auto"
          >
            S&apos;abonner pour accéder →
          </Link>

          <p className="mt-4 text-sm text-gray-500">
            Déjà abonné ?{" "}
            <Link href="/connexion" className="font-bold text-red-600 hover:underline">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
