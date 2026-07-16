"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CatPost {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function LoadMorePosts({
  categoryName,
  initialCursor,
  initialHasNext,
}: {
  categoryName: string;
  initialCursor: string | null;
  initialHasNext: boolean;
}) {
  const [posts, setPosts] = useState<CatPost[]>([]);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasNext, setHasNext] = useState(initialHasNext);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!hasNext || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/category-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: categoryName, after: cursor }),
      });
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setCursor(data.endCursor);
      setHasNext(data.hasNextPage);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {posts.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/article/${post.slug}`} className="group">
              <div className="relative h-[200px] rounded-lg overflow-hidden mb-4">
                <Image
                  src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                {post.categories?.nodes[0] && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1">
                    {post.categories.nodes[0].name}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-1">{formatDate(post.date)}</p>
              <h2 className="font-bold text-lg leading-snug group-hover:text-red-600 transition line-clamp-2 mb-2">
                {post.title}
              </h2>
              <div
                className="text-sm text-gray-600 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            </Link>
          ))}
        </div>
      )}

      {hasNext && (
        <div className="text-center mt-10">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Chargement...
              </>
            ) : (
              "Voir plus d'articles"
            )}
          </button>
        </div>
      )}
    </>
  );
}
