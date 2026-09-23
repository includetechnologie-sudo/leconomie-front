"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";

interface PremiumPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

interface Props {
  posts: PremiumPost[];
}

const PER_PAGE = 3;

export default function PremiumArticlesCarouselClient({ posts }: Props) {
  const pages = useMemo(() => {
    const chunks: PremiumPost[][] = [];
    for (let i = 0; i < posts.length; i += PER_PAGE) {
      chunks.push(posts.slice(i, i + PER_PAGE));
    }
    return chunks;
  }, [posts]);

  const [page, setPage] = useState(0);

  const next = useCallback(() => setPage((p) => (p + 1) % pages.length), [pages.length]);
  const prev = useCallback(() => setPage((p) => (p - 1 + pages.length) % pages.length), [pages.length]);

  useEffect(() => {
    if (pages.length <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, pages.length]);

  return (
    <div className="rounded-xl border-2 border-[#c9a84c] overflow-hidden h-full flex flex-col">
      {/* En-tête */}
      <div className="bg-[#c9a84c] px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-serif font-bold text-black text-sm uppercase tracking-widest">Premium</span>
        </div>
        <Link href="/articles-premium" className="text-black text-xs font-bold uppercase tracking-wide hover:underline shrink-0">
          Voir plus →
        </Link>
      </div>

      {/* Cartes */}
      <div className="relative flex-1 bg-white p-4">
        <div className="grid sm:grid-cols-3 gap-3 h-full">
          {(pages[page] || []).map((post) => {
            const category = post.categories?.nodes[0]?.name;
            return (
              <Link
                key={post.slug}
                href={`/article/${post.slug}`}
                className="group flex flex-col rounded-lg overflow-hidden border border-gray-100 hover:border-[#c9a84c] hover:shadow-md transition"
              >
                <div className="relative w-full aspect-[4/3] bg-gray-50 overflow-hidden">
                  <Image
                    src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-[#c9a84c] text-black text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide rounded-sm">
                    Premium
                  </span>
                </div>
                <div className="p-2.5 flex-1 flex flex-col">
                  {category && (
                    <span className="text-[10px] font-bold text-[#c9a84c] uppercase tracking-wide mb-1">{category}</span>
                  )}
                  <p className="text-sm font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#b8943f] transition">
                    {post.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Flèches */}
        {pages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white shadow-md border border-gray-200 hover:border-[#c9a84c] hover:text-[#c9a84c] text-gray-500 rounded-full flex items-center justify-center transition"
              aria-label="Précédent"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white shadow-md border border-gray-200 hover:border-[#c9a84c] hover:text-[#c9a84c] text-gray-500 rounded-full flex items-center justify-center transition"
              aria-label="Suivant"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {pages.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pb-3 bg-white">
          {pages.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="transition-all rounded-full"
              style={{
                width: i === page ? "18px" : "6px",
                height: "6px",
                backgroundColor: i === page ? "#c9a84c" : "#e5e7eb",
              }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
