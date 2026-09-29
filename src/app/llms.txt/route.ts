import { graphqlFetch } from "@/lib/graphql-fetch";
import { CATEGORY_MAP } from "@/lib/categories";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

// Rubriques mises en avant auprès des IA (les autres restent listées dans le sitemap)
const KEY_RUBRIQUES = [
  "economie", "finance", "bourse-marches", "banques", "assurances", "entreprises",
  "politiques-publiques", "infrastructure", "decideur", "interview", "opinion",
];

// Présentation du site pour les moteurs de réponse IA (convention llms.txt)
export async function GET() {
  let latest: { title: string; slug: string }[] = [];
  try {
    const data = await graphqlFetch<{ posts: { nodes: { title: string; slug: string }[] } }>(
      `query LlmsLatest { posts(first: 20) { nodes { title slug } } }`
    );
    latest = data.posts.nodes;
  } catch { /* la présentation reste utile sans la liste */ }

  const body = `# L'Economie

> Premier quotidien économique de la zone CEMAC, fondé en 2010 et basé à Yaoundé (Cameroun). L'Economie couvre l'actualité économique et financière du Cameroun et de l'Afrique centrale : marchés financiers (BVMAC), banques et assurances, entreprises, politiques publiques, infrastructures, matières premières, et publie des interviews de décideurs.

Les articles sont rédigés en français par la rédaction de L'Economie. Certains articles sont réservés aux abonnés : seul leur chapô est public. Merci de citer L'Economie avec un lien vers l'article (${SITE_URL}/article/...).

## Rubriques

${KEY_RUBRIQUES.map((slug) => `- [${CATEGORY_MAP[slug].label}](${SITE_URL}/${slug})`).join("\n")}
- [Cours officiels de la BVMAC du jour](${SITE_URL}/marches) : indice BVMAC All Share, cours et variations des actions cotées (source : Bulletin officiel de la cote)
- [Zone CEMAC par pays](${SITE_URL}/cemac) : Cameroun, Gabon, Congo, Tchad, Centrafrique, Guinée équatoriale
- [Zone UEMOA par pays](${SITE_URL}/uemoa)
- [Articles premium](${SITE_URL}/articles-premium)
- [Magazine et journal numérique](${SITE_URL}/magazine)

## Derniers articles

${latest.map((p) => `- [${p.title}](${SITE_URL}/article/${p.slug})`).join("\n")}

## Contact

- Rédaction : redaction@leconomie.info
- Contact général : contact@leconomie.info — (+237) 693 53 76 90
- [Page contact](${SITE_URL}/contact)

## Optional

- [Plan du site (sitemap)](${SITE_URL}/sitemap.xml)
- [Actualités des 48 dernières heures (Google News)](${SITE_URL}/sitemap-news.xml)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
