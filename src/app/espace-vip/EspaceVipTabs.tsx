"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface PremiumPost {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: { node?: { sourceUrl?: string } };
  categories?: { nodes: { name: string; slug: string }[] };
}

interface JournalWP {
  id: string;
  databaseId: number;
  title: string;
  numero: string;
  datePublication: string;
  pdfUrl: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}

interface MagazineWP {
  id: string;
  databaseId: number;
  title: string;
  numero?: string;
  datePublication?: string;
  pdfUrl?: string;
  sommaire?: string;
  featuredImage?: { node?: { sourceUrl?: string; altText?: string } };
}

interface Props {
  premiumPosts: PremiumPost[];
  journaux: JournalWP[];
  magazines: MagazineWP[];
}

type Tab = "articles" | "journal" | "magazine";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EspaceVipTabs({ premiumPosts, journaux, magazines }: Props) {
  const [tab, setTab] = useState<Tab>("articles");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "articles",
      label: "Articles VIP",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      key: "journal",
      label: "Journal",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      key: "magazine",
      label: "Magazine",
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition ${
              tab === t.key
                ? "bg-[#c9a84c] text-black shadow-md"
                : "text-gray-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Articles VIP */}
      {tab === "articles" && (
        <div>
          {premiumPosts.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucun article premium disponible pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/article/${post.slug}`}
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={post.featuredImage?.node?.sourceUrl || "/images/hero.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#c9a84c] text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                      Premium
                    </span>
                    {post.categories?.nodes[0] && (
                      <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        {post.categories.nodes[0].name}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#c9a84c] transition mb-2">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400">{formatDate(post.date)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Journal */}
      {tab === "journal" && (
        <div>
          {journaux.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucun journal disponible.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {journaux.slice(0, 20).map((j) => (
                <Link
                  key={j.id}
                  href={`/lecture/${j.databaseId}`}
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative bg-gray-50 dark:bg-slate-700" style={{ aspectRatio: "3/4" }}>
                    <Image
                      src={j.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg"}
                      alt={j.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest">Journal</p>
                    <p className="font-bold text-sm">{j.numero ? `N° ${j.numero}` : j.title}</p>
                    {j.datePublication && (
                      <p className="text-xs text-gray-400 mt-0.5">{j.datePublication}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Magazine */}
      {tab === "magazine" && (
        <div>
          {magazines.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Aucun magazine disponible.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {magazines.slice(0, 20).map((m) => (
                <Link
                  key={m.id}
                  href={`/lecture/${m.databaseId}`}
                  className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative bg-gray-50 dark:bg-slate-700" style={{ aspectRatio: "3/4" }}>
                    <Image
                      src={m.featuredImage?.node?.sourceUrl || "/images/journal-cover.jpg"}
                      alt={m.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest">Magazine</p>
                    <p className="font-bold text-sm">{m.numero ? `N° ${m.numero}` : m.title}</p>
                    {m.datePublication && (
                      <p className="text-xs text-gray-400 mt-0.5">{m.datePublication}</p>
                    )}
                    {m.sommaire && (
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{m.sommaire}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}