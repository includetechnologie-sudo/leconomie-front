import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de corrections",
  description: "Comment L'Economie corrige ses erreurs et comment nous signaler une inexactitude.",
  alternates: { canonical: "/corrections" },
};

export default function Corrections() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Politique de corrections</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : septembre 2026</p>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p>
          L&apos;exactitude est au cœur de notre travail. Lorsque nous nous trompons, nous le reconnaissons et
          nous corrigeons l&apos;article rapidement et de façon transparente.
        </p>

        <h2>Signaler une erreur</h2>
        <p>
          Écrivez à <a href="mailto:redaction@leconomie.info">redaction@leconomie.info</a> en précisant le titre ou
          le lien de l&apos;article, l&apos;information en cause et, si possible, une source permettant de la vérifier.
          Chaque signalement est examiné par la rédaction.
        </p>

        <h2>Comment nous corrigeons</h2>
        <ul>
          <li>Une erreur factuelle (chiffre, nom, date, citation) est corrigée dans l&apos;article, et une mention
            en fin d&apos;article indique la nature de la correction et sa date ;</li>
          <li>la date de mise à jour de l&apos;article est actualisée ;</li>
          <li>les fautes de frappe ou d&apos;orthographe sans incidence sur le sens sont corrigées sans mention.</li>
        </ul>

        <h2>Droit de réponse</h2>
        <p>
          Les demandes de droit de réponse sont traitées conformément à notre{" "}
          <Link href="/politique-editoriale">politique éditoriale</Link>.
        </p>
      </div>
    </div>
  );
}
