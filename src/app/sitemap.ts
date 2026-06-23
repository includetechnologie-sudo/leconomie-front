import type { MetadataRoute } from "next";
import { graphqlFetch } from "@/lib/graphql-fetch";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://leconomie.info";

const GET_ALL_POSTS_FOR_SITEMAP = `
  query GetAllPostsForSitemap {
    posts(first: 1000, where: { status: PUBLISH }) {
      nodes {
        slug
        modified
        categories { nodes { slug } }
      }
    }
  }
`;

const GET_ALL_CATEGORIES_FOR_SITEMAP = `
  query GetAllCategories {
    categories(first: 100) {
      nodes { slug }
    }
  }
`;

const STATIC_PAGES = [
  { path: "/", priority: 1.0, changeFrequency: "hourly" as const },
  { path: "/abonnement", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/connexion", priority: 0.5, changeFrequency: "yearly" as const },
  { path: "/magazine", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/recherche", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/cemac", priority: 0.7, changeFrequency: "daily" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // Articles
  try {
    const data = await graphqlFetch<{
      posts: { nodes: { slug: string; modified: string }[] };
    }>(GET_ALL_POSTS_FOR_SITEMAP);

    for (const post of data.posts.nodes) {
      entries.push({
        url: `${SITE_URL}/article/${post.slug}`,
        lastModified: new Date(post.modified),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch { /* silence */ }

  // Catégories
  try {
    const data = await graphqlFetch<{
      categories: { nodes: { slug: string }[] };
    }>(GET_ALL_CATEGORIES_FOR_SITEMAP);

    for (const cat of data.categories.nodes) {
      if (cat.slug === "uncategorized") continue;
      entries.push({
        url: `${SITE_URL}/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  } catch { /* silence */ }

  return entries;
}
