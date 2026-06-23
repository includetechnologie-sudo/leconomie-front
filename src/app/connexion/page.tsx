import { Suspense } from "react";
import type { Metadata } from "next";
import ConnexionClient from "./ConnexionClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace abonné L'Économie.",
  alternates: { canonical: `${SITE_URL}/connexion` },
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionClient />
    </Suspense>
  );
}
