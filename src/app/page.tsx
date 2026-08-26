import HeroSlider from "@/components/homepage/HeroSlider";
import NewsTickerBar from "@/components/homepage/NewsTickerBar";
import CategoryGrid from "@/components/homepage/CategoryGrid";
import JournalDuJour from "@/components/homepage/JournalDuJour";
import EspaceVipWidget from "@/components/homepage/EspaceVipWidget";
import AdvertisementSection from "@/components/homepage/AdvertisementSection";
import LeconomieTV from "@/components/homepage/LeconomieTV";
import RegionalMapsSection from "@/components/homepage/RegionalMapsSection";
import MagazinePremium from "@/components/homepage/MagazinePremium";
import PremiumSubscriptionSection from "@/components/homepage/PremiumSubscriptionSection";
import RubriqueSection from "@/components/homepage/RubriqueSection";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

export default function HomePage() {
  return (
    <>
      {/* Hero : article principal + sidebar + plus lus */}
      <HeroSlider />

      {/* Fil d'actualité horodaté */}
      <NewsTickerBar />

      {/* Grille 4 catégories : Économie / Finance / CEMAC / Interview */}
      <CategoryGrid />

      {/* Journal du Jour */}
      <JournalDuJour />

      {/* Espace VIP Widget */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="max-w-xs mx-auto lg:mx-0 lg:ml-auto">
          <EspaceVipWidget />
        </div>
      </section>

      {/* Publicité leaderboard */}
      <AdvertisementSection />

      {/* Rubriques approfondies depuis WordPress */}
      <RubriqueSection title="bourse-marches"   displayTitle="Bourse &amp; Marchés" categorySlug="bourse-marches" />
      <RubriqueSection title="Interview"      displayTitle="Interviews" />
      <RubriqueSection title="Événement"      displayTitle="Événements" />
      <RubriqueSection title="Décideur"          displayTitle="Décideurs" />
      <RubriqueSection title="Opinion"        displayTitle="Opinions & Débats" />
      <RubriqueSection title="Infrastructure"   displayTitle="Infrastructures" />

      {/* Chaîne YouTube / TV */}
      <LeconomieTV />

      {/* Actualités CEMAC + UEMOA — cartes interactives côte à côte */}
      <RegionalMapsSection />

      {/* Magazine Premium */}
      <MagazinePremium />

      {/* Newsletter + Push notifications */}
      <div className="mt-16">
        <NewsletterForm variant="banner" />
      </div>

      {/* Abonnements */}
      <PremiumSubscriptionSection />
    </>
  );
}
