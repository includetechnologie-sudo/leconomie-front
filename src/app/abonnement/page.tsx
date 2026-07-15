import type { Metadata } from "next";
import AbonnementClient from "./AbonnementClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const metadata: Metadata = {
  title: "Abonnements",
  description: "Abonnez-vous à L'Economie dès 5 000 FCFA/mois. Accès illimité au journal, magazine et articles premium.",
  alternates: { canonical: `${SITE_URL}/abonnement` },
  openGraph: {
    title: "Abonnements — L'Economie",
    description: "Accès illimité au journal quotidien, magazine mensuel et articles premium.",
    images: [{ url: `${SITE_URL}/images/og-default.jpg` }],
  },
};

export default function AbonnementPage() {
  return <AbonnementClient />;
}
