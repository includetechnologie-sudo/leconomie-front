import { NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql-fetch";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

const GET_RSS_POSTS = `
  query GetRssPosts {
    posts(first: 30) {
      nodes {
        title
        slug
        excerpt
        dateGmt
        author { node { name } }
        categories { nodes { name } }
        featuredImage { node { sourceUrl mimeType } }
      }
    }
  }
`;

interface RssPost {
  title: string;
  slug: string;
  excerpt: string | null;
  dateGmt: string;
  author?: { node?: { name?: string } };
  categories?: { nodes: { name: string }[] };
  featuredImage?: { node?: { sourceUrl?: string; mimeType?: string } };
}

// WordPress renvoie des entités HTML (&nbsp;, &rsquo;, &#8217;…) : on les convertit en caractères
const NAMED: Record<string, string> = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", eacute: "é", egrave: "è", agrave: "à", ccedil: "ç" };
const decode = (s: string) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);

// Les titres WordPress contiennent des entités HTML (&rsquo;…) invalides en XML : on les protège en CDATA
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Flux RSS 2.0 des derniers articles (agrégateurs, applications de veille, assistants IA)
export async function GET() {
  let posts: RssPost[] = [];
  try {
    const data = await graphqlFetch<{ posts: { nodes: RssPost[] } }>(GET_RSS_POSTS);
    posts = data.posts.nodes;
  } catch {
    return new NextResponse("Flux momentanément indisponible", { status: 503 });
  }

  const items = posts.map((p) => {
    const url = `${SITE_URL}/article/${p.slug}`;
    const description = decode((p.excerpt ?? "").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    const image = p.featuredImage?.node?.sourceUrl;
    return `    <item>
      <title>${cdata(decode(p.title))}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${p.dateGmt}Z`).toUTCString()}</pubDate>
      ${p.author?.node?.name ? `<dc:creator>${cdata(p.author.node.name)}</dc:creator>` : ""}
      ${(p.categories?.nodes ?? []).map((c) => `<category>${cdata(c.name)}</category>`).join("")}
      <description>${cdata(description)}</description>
      ${image ? `<media:content url="${escapeAttr(image)}" medium="image"${p.featuredImage?.node?.mimeType ? ` type="${escapeAttr(p.featuredImage.node.mimeType)}"` : ""} />` : ""}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>L'Economie — Le premier quotidien économique de la zone CEMAC</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Actualités économiques, financières et des marchés au Cameroun et dans la zone CEMAC.</description>
    <language>fr</language>
    <copyright>© L'Economie</copyright>
    <image>
      <url>${SITE_URL}/images/logo.png</url>
      <title>L'Economie</title>
      <link>${SITE_URL}/</link>
    </image>
    ${posts[0] ? `<lastBuildDate>${new Date(`${posts[0].dateGmt}Z`).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600",
    },
  });
}
