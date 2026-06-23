import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_JOURNAUX } from "@/graphql/queries";
import type { JournalWP } from "@/lib/types";

export default async function JournalDuJour() {
  let journal: JournalWP | null = null;
  try {
    const data = await graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX);
    journal = data.journaux.nodes[0] ?? null;
  } catch { /* fallback sur placeholder */ }

  const cover = journal?.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg";
  const numero = journal?.numero ? `N° ${journal.numero}` : "Édition du jour";
  const datePubli = journal?.datePublication || "";

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex flex-col md:grid md:grid-cols-[auto_1fr_auto_auto] gap-0 border border-gray-200 bg-white">

        {/* Colonne 1 — Couverture */}
        <div className="p-4 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200 md:w-[160px]">
          <Image
            src={cover}
            alt={`Couverture ${numero}`}
            width={130}
            height={180}
            className="shadow-lg object-cover"
          />
        </div>

        {/* Colonne 2 — Texte central */}
        <div className="px-6 py-5 flex flex-col justify-center border-r border-gray-200">
          <p className="text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
            Le Journal du Jour
          </p>
          <h2 className="font-serif font-bold text-xl leading-snug mb-1">
            {numero}{datePubli ? ` — ${datePubli}` : ""}
          </h2>
          {journal?.title && (
            <p className="text-gray-700 text-sm font-medium mb-2">{journal.title}</p>
          )}
          <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-sm">
            Accédez à l&apos;intégralité de votre journal en version numérique.
            Analyses, enquêtes, décryptages : tout ce qu&apos;il faut savoir
            sur l&apos;économie de la zone CEMAC.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/abonnement"
              className="inline-block bg-red-600 text-white text-sm font-bold px-5 py-2.5 rounded hover:bg-red-700 transition"
            >
              S&apos;abonner maintenant
            </Link>
            <Link
              href="/connexion"
              className="inline-block border border-gray-300 text-gray-700 text-sm font-bold px-5 py-2.5 rounded hover:bg-gray-50 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* Colonne 3 — Image numérique */}
        <div className="relative border-t md:border-t-0 md:border-r border-gray-200 overflow-hidden h-40 md:h-auto md:w-[200px]">
          <Image
            src="/images/journal-digital.jpg"
            alt="Journal numérique sur tous vos appareils"
            fill
            className="object-cover"
          />
        </div>

        {/* Colonne 4 — Canal WhatsApp */}
        <a
          href="https://whatsapp.com/channel/0029VaUB4BFC1FuBLlYWpF1f"
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center p-4 text-white text-center hover:opacity-90 transition md:w-[200px]"
          style={{ backgroundColor: "#075E54" }}
        >
          <div className="bg-white/10 rounded-full px-3 py-0.5 mb-3 flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
              <span className="text-[#075E54] font-black text-[8px] leading-none">E</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest">L&apos;ÉCONOMIE</span>
          </div>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white" className="mb-2 drop-shadow">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <p className="text-[11px] font-bold uppercase tracking-wide leading-tight mb-1">ON WHATSAPP</p>
          <p className="text-[9px] opacity-80 mb-3 leading-snug">Suivez l&apos;actualité économique en temps réel</p>
          <div className="bg-[#25D366] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            Rejoindre la chaîne
          </div>
        </a>

      </div>
    </section>
  );
}
