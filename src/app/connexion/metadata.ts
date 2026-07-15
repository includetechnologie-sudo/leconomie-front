import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace abonné L'Economie.",
  alternates: { canonical: `${SITE_URL}/connexion` },
  robots: { index: false, follow: false },
};
