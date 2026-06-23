import HeroSlider from "@/components/homepage/HeroSlider";
import NewsTickerBar from "@/components/homepage/NewsTickerBar";
import CategoryGrid from "@/components/homepage/CategoryGrid";
import JournalDuJour from "@/components/homepage/JournalDuJour";
import AdvertisementSection from "@/components/homepage/AdvertisementSection";
import LeconomieTV from "@/components/homepage/LeconomieTV";
import CemacMapSvg from "@/components/homepage/CemacMapSvg";
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

      {/* Publicité leaderboard */}
      <AdvertisementSection />

      {/* Rubriques approfondies depuis WordPress */}
      <RubriqueSection title="Opinion"        displayTitle="Opinions & Débats" />
      <RubriqueSection title="Interview"      displayTitle="Interviews" />
      <RubriqueSection title="Événement"      displayTitle="Événements" />
      <RubriqueSection title="Décideur"       displayTitle="Décideurs" />
      <RubriqueSection title="Infrastructure" displayTitle="Infrastructures" />

      {/* Chaîne YouTube / TV */}
      <LeconomieTV />

      {/* Actualités CEMAC + carte interactive */}
      <CemacMapSvg />

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
