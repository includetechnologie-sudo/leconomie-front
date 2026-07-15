import { Suspense } from "react";
import RechercheClient from "./RechercheClient";

export const metadata = {
  title: "Recherche — L'Economie",
  description: "Recherchez dans toute l'actualité économique de la zone CEMAC.",
};

export default function RecherchePage() {
  return (
    <Suspense>
      <RechercheClient />
    </Suspense>
  );
}
