"use client";

import Link from "next/link";
import Image from "next/image";

interface Post { title: string; slug: string; }

const FALLBACK = [
  "CEMAC : la croissance régionale projetée à 2,6 % en 2025 selon la BEAC",
  "Cameroun : inflation en baisse à 2,4 %",
  "Gabon : le FMI approuve la deuxième revue du programme économique",
  "Congo : nouveau plan de diversification économique",
  "Tchad : hausse des investissements étrangers dans le secteur pétrolier",
];

export default function BreakingNewsTicker({ posts }: { posts: Post[] }) {
  const items = posts.length > 0 ? posts : FALLBACK.map((t) => ({ title: t, slug: "" }));
  const looped = [...items, ...items, ...items];
  // ×4 plus rapide qu'avant (÷4 la durée)
  const duration = Math.max(2.5, (items.length * 2.5) / 4);

  return (
    <div className="flex items-center overflow-hidden h-9 bg-red-600 text-white text-[13px]">

      {/* Badge fixe */}
      <span className="shrink-0 bg-black text-white font-bold text-[11px] uppercase tracking-wide px-3 h-full flex items-center whitespace-nowrap mr-3">
        Actualité en continu
      </span>

      {/* Zone défilante */}
      <div className="overflow-hidden flex-1">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: `ticker-scroll ${duration}s linear infinite` }}
        >
          {looped.map((item, i) => (
            <span key={i} className="pr-14 shrink-0">
              <span className="text-yellow-300 mr-2">◆</span>
              {item.slug ? (
                <Link href={`/article/${item.slug}`} className="hover:underline">
                  {item.title}
                </Link>
              ) : (
                item.title
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Logo L'Économie Business Summit — bouton cliquable */}
      <a
        href="https://leconomiebusinesssummit.fr/"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 mx-1 flex items-center transition-all duration-200 hover:scale-105 hover:brightness-110"
        title="L'Économie Business Summit 2026 — 4e Édition"
      >
        <Image
          src="/images/summit-logo.png"
          alt="L'Économie Business Summit 2026"
          width={32}
          height={32}
          className="rounded-full object-contain"
          style={{ background: "white" }}
        />
      </a>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}
