"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import BoursePanel from "@/components/bourse/BoursePanel";

type MenuItem = {
  label: string;
  href: string;
  highlight?: boolean;
  premium?: boolean;
  children?: { label: string; href: string }[];
};

const menuItems: MenuItem[] = [
  { label: "Accueil",           href: "/",                    highlight: true },
  {
    label: "CEMAC", href: "/cemac",
    children: [
      { label: "🇨🇲 Cameroun",            href: "/cemac/cameroun" },
      { label: "🇹🇩 Tchad",               href: "/cemac/tchad" },
      { label: "🇬🇦 Gabon",               href: "/cemac/gabon" },
      { label: "🇨🇬 Congo",               href: "/cemac/congo" },
      { label: "🇬🇶 Guinée Équatoriale",  href: "/cemac/guinee-equatoriale" },
      { label: "🇨🇫 Rép. Centrafricaine", href: "/cemac/rca" },
    ],
  },
  { label: "Économie",          href: "/economie" },
  { label: "Politiques publiques", href: "/politiques-publiques" },
  { label: "Entreprises",       href: "/entreprises" },
  { label: "Assurances",        href: "/assurances" },
  { label: "Banques",           href: "/banques" },
  { label: "Bourse & Marchés",  href: "/bourse-marches" },
  { label: "Infrastructures",   href: "/infrastructure" },
  { label: "Télécoms",          href: "/telecoms" },
  { label: "Start-ups",         href: "/start-ups" },
  { label: "Mines",             href: "/mines" },
  { label: "Décideurs",         href: "/decideur" },
  { label: "Opinions & Débats", href: "/opinion" },
  { label: "Interviews",        href: "/interview" },
  { label: "Événements",        href: "/evenement" },
  { label: "Publi-Info",        href: "/publi-info" },
  { label: "Magazine",          href: "/magazine", premium: true },
];

export default function MainMenu() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [bourseOpen, setBourseOpen] = useState(false);
  const scrollRef = useRef<HTMLUListElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  }

  function toggleExpand(key: string) {
    setExpanded((prev) => (prev === key ? null : key));
  }

  return (
    <>
      {/* ── Barre desktop ── */}
      <nav className="border-b bg-white sticky top-0 z-[100] shadow-md">
        <div className="max-w-7xl mx-auto px-0">
          <div className="hidden lg:flex items-center">

            {/* Flèche gauche */}
            <button
              onClick={() => scroll("left")}
              className="shrink-0 px-2 h-12 text-gray-400 hover:text-red-600 transition bg-white border-r border-gray-100 hover:bg-red-50"
              aria-label="Défiler à gauche"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>

            {/* Liste scrollable */}
            <ul
              ref={scrollRef}
              className="flex items-center overflow-x-auto scrollbar-none flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {menuItems.map((item) => (
                <li key={item.href} className="relative group shrink-0">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 h-12 text-[13px] font-semibold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap
                      ${item.highlight
                        ? "text-red-600 border-red-600"
                        : item.premium
                          ? "text-red-600 border-transparent hover:border-red-600"
                          : "text-gray-700 border-transparent hover:text-red-600 hover:border-red-600"
                      }`}
                  >
                    {item.highlight && (
                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" className="shrink-0">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    )}
                    {item.label}
                    {item.premium && (
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                        <rect x="3" y="11" width="18" height="11" rx="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    )}
                    {item.children && (
                      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && (
                    <ul className="absolute top-full left-0 bg-white border border-gray-200 shadow-lg min-w-[200px] z-[110] hidden group-hover:block rounded-b-lg overflow-hidden">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link href={child.href}
                            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition border-b border-gray-100 last:border-0">
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}

            </ul>

            {/* Bouton Bourse — hors du container overflow pour éviter le clipping */}
            <div className="shrink-0 relative border-l border-gray-100">
              <button
                onClick={() => setBourseOpen((v) => !v)}
                className={`px-3 h-12 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide transition border-b-2
                  ${bourseOpen ? "text-green-600 border-green-500" : "text-gray-600 border-transparent hover:text-green-600 hover:border-green-500"}`}
                aria-label="Bourse"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
                Bourse
              </button>
              {bourseOpen && <BoursePanel onClose={() => setBourseOpen(false)} />}
            </div>

            {/* Flèche droite */}
            <button
              onClick={() => scroll("right")}
              className="shrink-0 px-2 h-12 text-gray-400 hover:text-red-600 transition bg-white border-l border-gray-100 hover:bg-red-50"
              aria-label="Défiler à droite"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

          </div>

          {/* ── Barre mobile ── */}
          <div className="lg:hidden flex items-center justify-between py-3 px-4">
            <button onClick={() => setMobileOpen(true)} className="text-gray-700 hover:text-red-600 transition p-1" aria-label="Ouvrir le menu">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <Image src="/images/logo.png" alt="L'Économie" width={130} height={34} priority />
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/connexion" className="text-gray-700 hover:text-red-600 transition" aria-label="Mon compte">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              <Link href="/recherche" className="text-gray-700 hover:text-red-600 transition" aria-label="Rechercher">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Drawer mobile ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl overflow-y-auto">

            {/* En-tête */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-red-600 transition p-1" aria-label="Fermer">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <Link href="/" onClick={() => setMobileOpen(false)}>
                <Image src="/images/logo.png" alt="L'Économie" width={120} height={30} />
              </Link>
              <Link href="/connexion" onClick={() => setMobileOpen(false)} aria-label="Mon compte" className="text-gray-600 hover:text-red-600 transition">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
            </div>

            {/* Items menu */}
            <ul className="flex-1 py-2">
              {menuItems.map((item) => (
                <li key={item.href} className="border-b border-gray-50 last:border-0">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold uppercase tracking-wide text-gray-800 hover:text-red-600 transition"
                      >
                        {item.label}
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                          className={`transition-transform duration-200 ${expanded === item.label ? "rotate-180" : ""}`}>
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                      {expanded === item.label && (
                        <ul className="bg-gray-50 border-t border-gray-100">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link href={child.href} onClick={() => setMobileOpen(false)}
                                className="block px-8 py-3 text-sm text-gray-600 hover:text-red-600 transition border-b border-gray-100 last:border-0">
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link href={item.href} onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 px-5 py-4 text-sm font-bold uppercase tracking-wide transition
                        ${item.highlight ? "text-red-600" : item.premium ? "text-red-600" : "text-gray-800 hover:text-red-600"}`}>
                      {item.highlight && (
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                          <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                      )}
                      {item.label}
                      {item.premium && (
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="11" width="18" height="11" rx="2"/>
                          <path d="M7 11V7a5 5 0 0110 0v4"/>
                        </svg>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* Pied */}
            <div className="px-4 py-5 border-t border-gray-100 bg-gray-50 space-y-3">
              <Link href="/abonnement" onClick={() => setMobileOpen(false)}
                className="block w-full bg-red-600 text-white text-center font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm">
                S&apos;abonner
              </Link>
              <Link href="/connexion" onClick={() => setMobileOpen(false)}
                className="block w-full border border-gray-300 text-gray-700 text-center font-semibold py-3 rounded-lg hover:border-red-600 hover:text-red-600 transition text-sm">
                Se connecter
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
