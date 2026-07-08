import HeroMain from "./HeroMain";
import HeroSidebar from "./HeroSidebar";
import MostReadWidget from "./MostReadWidget";
import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_JOURNAUX } from "@/graphql/queries";
import type { JournalWP } from "@/lib/types";

export default async function HeroSlider() {
  let journal: JournalWP | null = null;
  try {
    const data = await graphqlFetch<{ journaux: { nodes: JournalWP[] } }>(GET_JOURNAUX);
    journal = data.journaux.nodes[0] ?? null;
  } catch {}

  const cover = journal?.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg";
  const numero = journal?.numero ? `N°${journal.numero}` : "Édition du jour";
  const datePubli = journal?.datePublication || "";

  return (
    <section className="max-w-[1600px] mx-auto px-4 mt-6">
      {/* Desktop : grille avec pubs latérales */}
      <div className="hidden xl:grid xl:grid-cols-[160px_1fr_160px] gap-3 items-stretch" style={{ height: "460px" }}>

        {/* Pub gauche */}
        <div className="h-full flex items-center justify-center">
          <Link href="/magazine?tab=magazines" className="block w-full h-full relative rounded-lg overflow-hidden group bg-[#f5ede8]">
            <Image
              src="https://teal-horse-411567.hostingersite.com/wp-content/uploads/2026/07/Banniere-publicitaire-magazine.jpg"
              alt="L'Économie International N°049"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
              priority
            />
          </Link>
        </div>

        {/* Zone centrale : hero + sidebar + plus lus */}
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-7 h-full"><HeroMain /></div>
          <div className="col-span-3 h-full border border-gray-200 rounded-lg overflow-hidden"><HeroSidebar /></div>
          <div className="col-span-2 h-full overflow-y-auto"><MostReadWidget /></div>
        </div>

        {/* Journal du jour — colonne droite */}
        <div className="h-full flex flex-col rounded-lg overflow-hidden border border-gray-200 bg-white">
          {/* Couverture */}
          <div className="relative flex-1 bg-gray-50">
            <Image
              src={cover}
              alt={`Couverture ${numero}`}
              fill
              className="object-contain"
              priority
            />
          </div>
          {/* Infos + bouton */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <p className="text-red-600 text-[10px] font-bold uppercase tracking-widest mb-0.5">Journal du jour</p>
            <p className="font-serif font-bold text-sm leading-tight">{numero}</p>
            {datePubli && <p className="text-gray-400 text-[10px] mt-0.5">{datePubli}</p>}
            <Link
              href="/abonnement"
              className="mt-2 block w-full bg-red-600 text-white text-[11px] font-bold py-2 rounded text-center hover:bg-red-700 transition"
            >
              Acheter →
            </Link>
          </div>
        </div>
      </div>

      {/* Écrans lg (sans pubs latérales) */}
      <div className="hidden lg:grid xl:hidden lg:grid-cols-12 gap-4 items-stretch" style={{ height: "460px" }}>
        <div className="lg:col-span-7 h-full"><HeroMain /></div>
        <div className="lg:col-span-3 h-full border border-gray-200 rounded-lg overflow-hidden"><HeroSidebar /></div>
        <div className="lg:col-span-2 h-full overflow-y-auto"><MostReadWidget /></div>
      </div>

      {/* Mobile : empilé */}
      <div className="lg:hidden flex flex-col gap-4">
        <div className="w-full rounded-lg overflow-hidden" style={{ height: "260px" }}><HeroMain /></div>
        <div className="border border-gray-200 rounded-lg overflow-hidden"><HeroSidebar /></div>
        <MostReadWidget />
      </div>
    </section>
  );
}
