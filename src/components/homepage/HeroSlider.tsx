import HeroMain from "./HeroMain";
import HeroSidebar from "./HeroSidebar";
import MostReadWidget from "./MostReadWidget";

export default function HeroSlider() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      {/* Desktop : grille 3 colonnes fixe */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-stretch" style={{ height: "460px" }}>
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
