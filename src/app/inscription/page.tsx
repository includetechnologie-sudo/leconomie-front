import type { Metadata } from "next";
import InscriptionClient from "./InscriptionClient";

export const metadata: Metadata = {
  title: "Créer un compte — L'Economie",
  description: "Créez votre compte gratuit et accédez aux articles de L'Economie.",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return <InscriptionClient />;
}
