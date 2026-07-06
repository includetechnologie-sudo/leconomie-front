import HeroMain from "./HeroMain";
import HeroSidebar from "./HeroSidebar";
import MostReadWidget from "./MostReadWidget";
import Image from "next/image";
import Link from "next/link";

export default function HeroSlider() {
  return (
    <section className="max-w-[1600px] mx-auto px-4 mt-6">
      {/* Desktop : grille avec pubs latérales */}
      <div className="hidden xl:grid xl:grid-cols-[160px_1fr_160px] gap-3 items-stretch" style={{ height: "460px" }}>

        {/* Pub gauche */}
        <div className="h-full flex items-center justify-center">
          <Link href="/magazine/32502" className="block w-full h-full relative rounded-lg overflow-hidden group bg-[#f5ede8]">
            <Image
              src="https://teal-horse-411567.hostingersite.com/wp-content/uploads/2026/07/Banniere-publicitaire-magazine.jpg"
              alt="L'Économie International N°049"
              fill
              className="object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </Link>
        </div>

        {/* Zone centrale : hero + sidebar + plus lus */}
        <div className="grid grid-cols-12 gap-4 h-full">
          <div className="col-span-7 h-full"><HeroMain /></div>
          <div className="col-span-3 h-full border border-gray-200 rounded-lg overflow-hidden"><HeroSidebar /></div>
          <div className="col-span-2 h-full overflow-y-auto"><MostReadWidget /></div>
        </div>

        {/* Pub droite — à venir */}
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <p className="text-gray-400 text-xs text-center px-2">Espace publicitaire<br/>300×860px</p>
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
