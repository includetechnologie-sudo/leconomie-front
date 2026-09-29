import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique éditoriale",
  description: "Les principes qui guident la rédaction de L'Economie : indépendance, vérification des faits, séparation entre information et publicité, droit de réponse.",
  alternates: { canonical: "/politique-editoriale" },
};

export default function PolitiqueEditoriale() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Politique éditoriale</h1>
      <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : septembre 2026</p>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <h2>1. Indépendance</h2>
        <p>
          Les choix éditoriaux de L&apos;Economie relèvent de la seule rédaction. Aucun annonceur, partenaire ou
          actionnaire ne peut imposer, modifier ou empêcher la publication d&apos;un article d&apos;information.
        </p>

        <h2>2. Vérification des faits</h2>
        <p>
          Les informations publiées sont vérifiées et, autant que possible, recoupées auprès de plusieurs sources.
          Les chiffres sont attribués à leur source (institution, entreprise, rapport, étude). Les faits sont
          distingués des analyses et des opinions, publiées dans les rubriques dédiées
          (<Link href="/opinion">Opinion</Link>, <Link href="/interview">Interview</Link>).
        </p>

        <h2>3. Sources</h2>
        <p>
          Nous citons nos sources chaque fois que c&apos;est possible. La protection des sources qui demandent
          l&apos;anonymat est garantie ; l&apos;anonymat n&apos;est accordé que lorsque l&apos;information est
          d&apos;intérêt public et ne peut être obtenue autrement.
        </p>

        <h2>4. Information et contenus sponsorisés</h2>
        <p>
          Les contenus payés par un annonceur sont publiés dans la rubrique <Link href="/publi-info">Publi-Info</Link> et
          signalés comme tels. Ils ne sont jamais présentés comme des articles de la rédaction.
        </p>

        <h2>5. Signature des articles</h2>
        <p>
          Les articles sont signés par leur auteur, dont la page présente les publications, ou par « La Rédaction »
          lorsqu&apos;ils sont le fruit d&apos;un travail collectif.
        </p>

        <h2>6. Droit de réponse et corrections</h2>
        <p>
          Toute personne mise en cause dans un article peut exercer son droit de réponse en écrivant à{" "}
          <a href="mailto:redaction@leconomie.info">redaction@leconomie.info</a>. Les erreurs sont corrigées
          selon notre <Link href="/corrections">politique de corrections</Link>.
        </p>
      </div>
    </div>
  );
}
