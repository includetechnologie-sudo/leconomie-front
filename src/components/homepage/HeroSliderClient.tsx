"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

interface SliderPost {
  title: string;
  excerpt: string;
  date: string;
  slug: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string }[] };
  tags?: { nodes: { name: string }[] };
}

interface Props {
  posts: SliderPost[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function HeroSliderClient({ posts }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  }, [animating]);

  const prev = useCallback(() => goTo((current - 1 + posts.length) % posts.length), [current, goTo, posts.length]);
  const next = useCallback(() => goTo((current + 1) % posts.length), [current, goTo, posts.length]);

  // Auto-avance toutes les 6 secondes
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (!posts.length || !posts[current]) return (
    <div className="relative h-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center min-h-[400px]">
      <div className="text-center text-gray-400">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto mb-3 opacity-30">
          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
        </svg>
        <p className="text-sm font-medium">Actualités en cours de chargement…</p>
      </div>
    </div>
  );

  const post = posts[current];
  const image = post.featuredImage?.node?.sourceUrl || "/images/hero.jpg";
  const category = post.categories?.nodes[0]?.name || "Actualité";
  const isPremium = post.tags?.nodes?.some(t => t.name.toLowerCase() === "premium") ?? false;

  return (
    <div className="relative h-full rounded-lg overflow-hidden group">
      {/* Image avec transition */}
      <div
        style={{
          opacity: animating ? 0 : 1,
          transition: "opacity 0.3s ease",
          position: "absolute", inset: 0,
        }}
      >
        <Image
          src={image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Dégradé */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Badges haut gauche */}
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
          À la une
        </span>
        {isPremium && (
          <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
            Premium
          </span>
        )}
      </div>

      {/* Contenu bas */}
      <div
        style={{
          opacity: animating ? 0 : 1,
          transition: "opacity 0.3s ease",
          position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 28px 24px",
        }}
      >
        <Link href={`/article/${post.slug}`}>
          <span className="inline-block bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 mb-3 uppercase tracking-wider">
            {category}
          </span>
          <h2
            className="text-white font-serif leading-snug hover:text-red-200 transition"
            style={{ fontSize: "clamp(18px, 2.4vw, 28px)", fontWeight: 700, marginBottom: "10px" }}
          >
            {post.title}
          </h2>
        </Link>
        <div
          className="text-gray-300 line-clamp-2"
          style={{ fontSize: "13px" }}
          dangerouslySetInnerHTML={{ __html: post.excerpt }}
        />
        <p className="text-gray-400 text-xs mt-2">{formatDate(post.date)} · {category}</p>
      </div>

      {/* Flèches */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        aria-label="Précédent"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
        aria-label="Suivant"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="transition-all rounded-full"
            style={{
              width: i === current ? "20px" : "6px",
              height: "6px",
              backgroundColor: i === current ? "#dc2626" : "rgba(255,255,255,0.5)",
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
