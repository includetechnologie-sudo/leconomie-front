import { NextResponse } from "next/server";
import { graphqlFetch } from "@/lib/graphql-fetch";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

const GET_RECENT_POSTS = `
  query GetRecentPostsForNewsSitemap {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes {
        title
        slug
        date
        modified
        categories { nodes { name } }
      }
    }
  }
`;

export async function GET() {
  let posts: { title: string; slug: string; date: string; categories?: { nodes: { name: string }[] } }[] = [];

  try {
    const data = await graphqlFetch<{
      posts: { nodes: typeof posts };
    }>(GET_RECENT_POSTS);
    // Google News sitemap : seulement les articles des 2 derniers jours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    posts = data.posts.nodes.filter(p => new Date(p.date) >= twoDaysAgo);
  } catch { /* silence */ }

  const urls = posts.map((post) => {
    const pubDate = new Date(post.date).toISOString();
    const category = post.categories?.nodes[0]?.name || "Actualité";
    return `
  <url>
    <loc>${SITE_URL}/article/${post.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>L'Économie</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${post.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</news:title>
      <news:keywords>${category}</news:keywords>
    </news:news>
  </url>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
