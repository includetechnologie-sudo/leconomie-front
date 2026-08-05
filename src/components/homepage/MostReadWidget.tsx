import Link from "next/link";
import fs from "fs";
import path from "path";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_POSTS_BY_SLUGS } from "@/graphql/queries";

interface Post {
  title: string;
  slug: string;
}

function getTopSlugs(n: number): { slug: string; views: number }[] {
  try {
    const filePath = path.join(process.cwd(), "data", "article-views.json");
    const views = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Record<string, number>;
    return Object.entries(views)
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([slug, views]) => ({ slug, views }));
  } catch {
    return [];
  }
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 80);
}

export default async function MostReadWidget() {
  let posts: Post[] = [];

  const topEntries = getTopSlugs(5);
  const topSlugs = topEntries.map((e) => e.slug);

  if (topSlugs.length > 0) {
    try {
      const data = await graphqlFetch<{ posts: { nodes: Post[] } }>(
        GET_POSTS_BY_SLUGS,
        { slugs: topSlugs }
      );
      const bySlug = Object.fromEntries(data.posts.nodes.map(p => [p.slug, p]));
      posts = topSlugs.map(s => bySlug[s]).filter(Boolean);
    } catch {
      // GraphQL indisponible — on utilise les slugs comme titres de secours
    }

    // Fallback : si GraphQL n'a pas répondu, on affiche quand même avec les slugs formatés
    if (posts.length === 0) {
      posts = topSlugs.map((slug) => ({ title: slugToTitle(slug), slug }));
    }
  }

  if (posts.length === 0) return null;

  return (
    <div className="bg-white h-full">

      {/* En-tête */}
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-5 bg-red-600 inline-block shrink-0"></span>
        <h2 className="font-bold text-sm uppercase tracking-widest text-gray-900">
          Les plus lus
        </h2>
        <span className="flex-1 h-px bg-red-600"></span>
      </div>

      {/* Liste */}
      <ol className="space-y-0">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              href={`/article/${post.slug}`}
              className="flex items-start gap-3 py-3 border-b border-gray-100 group hover:bg-gray-50 transition px-1"
            >
              <span className="text-red-600 font-bold text-sm w-6 shrink-0 pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="w-px bg-red-600 self-stretch shrink-0 opacity-60"></span>
              <h3 className="text-sm font-medium leading-snug text-gray-800 group-hover:text-red-600 transition line-clamp-3">
                {post.title}
              </h3>
            </Link>
          </li>
        ))}
      </ol>

    </div>
  );
}
