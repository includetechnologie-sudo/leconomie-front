import type { Metadata } from "next";
import InscriptionClient from "./InscriptionClient";

export const metadata: Metadata = {
  title: "Créer un compte — L'Économie",
  description: "Créez votre compte gratuit et accédez aux articles de L'Économie.",
  robots: { index: false, follow: false },
};

export default function InscriptionPage() {
  return <InscriptionClient />;
}
