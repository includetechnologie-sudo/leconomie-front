import Link from "next/link";
import type { Metadata } from "next";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { isRedactionAuthor } from "@/lib/organization";

export const metadata: Metadata = {
  title: "À propos de L'Economie",
  description: "L'Economie, premier quotidien économique de la zone CEMAC depuis 2010 : notre mission, notre rédaction, nos engagements et comment nous contacter.",
  alternates: { canonical: "/a-propos" },
};

async function getJournalistes(): Promise<{ name: string; slug: string }[]> {
  try {
    const data = await graphqlFetch<{ users: { nodes: { name: string; slug: string }[] } }>(
      `query AProposAuteurs { users(first: 100) { nodes { name slug } } }`
    );
    return data.users.nodes.filter((u) => !isRedactionAuthor(u.slug));
  } catch {
    return [];
  }
}

export default async function APropos() {
  const journalistes = await getJournalistes();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">À propos de L&apos;Economie</h1>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        <p>
          <strong>L&apos;Economie</strong> est le premier quotidien économique de la zone CEMAC. Depuis 2010,
          la rédaction, basée à Yaoundé, décrypte l&apos;actualité économique et financière du Cameroun et de l&apos;Afrique centrale
          (Cameroun, Gabon, Congo, Tchad, République centrafricaine, Guinée équatoriale), avec un regard sur
          l&apos;UEMOA et le reste du continent.
        </p>

        <h2>Ce que nous couvrons</h2>
        <ul>
          <li>Les marchés financiers et la Bourse régionale (BVMAC), les banques et les assurances ;</li>
          <li>les entreprises, les investissements et les infrastructures ;</li>
          <li>les politiques publiques, les finances publiques et la politique monétaire de la BEAC ;</li>
          <li>les décideurs, à travers interviews, portraits et tribunes.</li>
        </ul>

        <h2>Nos formats</h2>
        <p>
          Le site <strong>leconomie.info</strong>, le journal quotidien et le <Link href="/magazine">magazine</Link> en
          version numérique, la newsletter et L&apos;Economie TV. Certains articles d&apos;analyse sont réservés
          aux <Link href="/abonnement">abonnés</Link> : c&apos;est ce qui finance une information indépendante.
        </p>

        {journalistes.length > 0 && (
          <>
            <h2>La rédaction</h2>
            <ul>
              {journalistes.map((j) => (
                <li key={j.slug}><Link href={`/auteur/${j.slug}`}>{j.name}</Link></li>
              ))}
            </ul>
          </>
        )}

        <h2>Nos engagements</h2>
        <p>
          Notre travail suit une <Link href="/politique-editoriale">politique éditoriale</Link> publique :
          vérification des faits, séparation claire entre information et contenus sponsorisés, droit de réponse.
          Les erreurs sont corrigées de façon transparente, selon notre <Link href="/corrections">politique de corrections</Link>.
        </p>

        <h2>Nous contacter</h2>
        <p>
          Siège : Congeni Mvog-Ada, en face de l&apos;entrée de l&apos;hôtel Le Best, Yaoundé (Cameroun)<br />
          Rédaction : <a href="mailto:redaction@leconomie.info">redaction@leconomie.info</a><br />
          Contact général et publicité : <a href="mailto:contact@leconomie.info">contact@leconomie.info</a> — (+237) 693 53 76 90<br />
          Toutes nos coordonnées sont sur la <Link href="/contact">page contact</Link>.
        </p>
      </div>
    </div>
  );
}
