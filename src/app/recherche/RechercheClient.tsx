"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Post {
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories: { nodes: { name: string; slug: string }[] };
}

interface SearchResult {
  posts: {
    pageInfo: { hasNextPage: boolean; endCursor: string };
    nodes: Post[];
  };
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

export default function RechercheClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [input, setInput] = useState(initialQ);
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string, after?: string) => {
    if (!q.trim()) return;
    if (after) setLoadingMore(true);
    else { setLoading(true); setResults([]); setSearched(false); }

    try {
      const res = await fetch("/api/recherche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: q.trim(), after: after || null }),
      });
      const data: SearchResult = await res.json();
      const nodes = data.posts?.nodes || [];
      const pageInfo = data.posts?.pageInfo;

      if (after) {
        setResults((prev) => [...prev, ...nodes]);
      } else {
        setResults(nodes);
        setTotal(nodes.length);
      }
      setHasMore(pageInfo?.hasNextPage || false);
      setCursor(pageInfo?.endCursor || null);
      setSearched(true);
    } catch {
      setSearched(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Lance la recherche si ?q= présent dans l'URL à l'arrivée
  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setQuery(input);
    router.replace(`/recherche?q=${encodeURIComponent(input.trim())}`);
    doSearch(input.trim());
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Barre de recherche */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-6 text-center">Recherche</h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              type="search"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Rechercher un article, une rubrique…"
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-red-600 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-red-700 transition disabled:opacity-60 text-sm shrink-0"
          >
            {loading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : "Rechercher"}
          </button>
        </form>
      </div>

      {/* État initial */}
      {!searched && !loading && (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto mb-4 opacity-30" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <p className="text-sm">Saisissez un mot-clé pour rechercher dans toute l&apos;actualité</p>
        </div>
      )}

      {/* Chargement */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <svg className="animate-spin w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <span className="text-sm">Recherche en cours…</span>
        </div>
      )}

      {/* Résultats */}
      {searched && !loading && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">
              {results.length === 0
                ? <>Aucun résultat pour <strong>&ldquo;{query}&rdquo;</strong></>
                : <><strong>{results.length}</strong> résultat{results.length > 1 ? "s" : ""} pour <strong>&ldquo;{query}&rdquo;</strong></>
              }
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500 text-sm mb-4">Aucun article trouvé pour cette recherche.</p>
              <p className="text-xs text-gray-400">Essayez avec d&apos;autres mots-clés</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((post) => (
                <Link key={post.slug} href={`/article/${post.slug}`}
                  className="flex gap-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition p-4 group">
                  {/* Image */}
                  <div className="shrink-0 relative w-28 h-20 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    {post.categories.nodes[0] && (
                      <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                        {post.categories.nodes[0].name}
                      </span>
                    )}
                    <h2 className="font-bold text-gray-900 text-sm leading-snug mt-1 mb-1 line-clamp-2 group-hover:text-red-600 transition">
                      {post.title}
                    </h2>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {stripHtml(post.excerpt)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1.5">{formatDate(post.date)}</p>
                  </div>
                </Link>
              ))}

              {/* Charger plus */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => doSearch(query, cursor!)}
                    disabled={loadingMore}
                    className="border border-red-600 text-red-600 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition text-sm disabled:opacity-60"
                  >
                    {loadingMore ? "Chargement…" : "Voir plus de résultats"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
