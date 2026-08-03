"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ArchiveItem {
  id: string;
  num: string;
  date: string;
  titre: string;
  cover: string;
  prix: number;
}

interface Props {
  items: ArchiveItem[];
  type: "journal" | "magazine";
  isConnected: boolean;
  hasAccess: boolean;
  purchasedIds?: string[];
  onBuy?: (item: ArchiveItem) => void;
}

const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
  }
  const match = dateStr.match(/(\d{1,2})[/-](\w+)[/-](\d{4})/);
  if (match) return `${match[3]}-${match[2]}`;
  const yearMatch = dateStr.match(/(\d{4})/);
  return yearMatch ? `${yearMatch[1]}-00` : "0000-00";
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const m = parseInt(month, 10);
  if (isNaN(m) || m < 0 || m > 11) return year;
  return `${MOIS_FR[m]} ${year}`;
}

function groupByMonth(items: ArchiveItem[]): Map<string, ArchiveItem[]> {
  const map = new Map<string, ArchiveItem[]>();
  items.forEach((item) => {
    const key = getMonthKey(item.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  const sorted = new Map([...map.entries()].sort((a, b) => b[0].localeCompare(a[0])));
  return sorted;
}

export default function ArchivesSection({ items, type, isConnected, hasAccess, purchasedIds = [], onBuy }: Props) {
  const [openMonth, setOpenMonth] = useState<string | null>(null);
  const grouped = groupByMonth(items);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h3 className="font-serif text-xl font-bold flex items-center gap-2 mb-6">
        <span className="w-1 h-5 bg-red-600 inline-block rounded" />
        Archives
        <span className="text-sm font-normal text-gray-400">({items.length} {type === "journal" ? "numéros" : "magazines"})</span>
      </h3>

      {!isConnected ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Archives réservées</p>
          <p className="text-xs text-gray-500 mb-4">Connectez-vous pour accéder aux archives. Les abonnés ont accès à tous les numéros.</p>
          <div className="flex justify-center gap-3">
            <Link href="/connexion" className="bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
              Se connecter
            </Link>
            <Link href="/abonnement" className="border border-red-600 text-red-600 text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-50 transition">
              S&apos;abonner
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...grouped.entries()].map(([monthKey, monthItems]) => (
            <div key={monthKey}>
              <button
                onClick={() => setOpenMonth(openMonth === monthKey ? null : monthKey)}
                className={`w-full bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition text-center group ${
                  openMonth === monthKey ? "border-red-300 ring-2 ring-red-100" : "border-gray-200"
                }`}
              >
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-red-100 transition">
                  <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800">{getMonthLabel(monthKey)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{monthItems.length} {type === "journal" ? "numéro" : "magazine"}{monthItems.length > 1 ? "s" : ""}</p>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contenu du mois ouvert */}
      {openMonth && grouped.has(openMonth) && (
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              {getMonthLabel(openMonth)}
            </h4>
            <button onClick={() => setOpenMonth(null)} className="text-gray-400 hover:text-red-600 transition">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {grouped.get(openMonth)!.map((item) => (
              <div key={item.id} className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="relative w-full bg-gray-100" style={{ aspectRatio: "3/4" }}>
                  <Image src={item.cover} alt={item.titre} fill className="object-cover" />
                  {!hasAccess && !purchasedIds.includes(item.id) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-bold text-red-600">{item.num}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                  {(hasAccess || purchasedIds.includes(item.id)) ? (
                    <Link
                      href={`/lecture/${item.id}`}
                      className="mt-2 block text-center bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-red-700 transition"
                    >
                      Lire
                    </Link>
                  ) : (
                    <button
                      onClick={() => onBuy?.(item)}
                      className="mt-2 w-full text-center border border-red-600 text-red-600 text-xs font-bold py-1.5 rounded-lg hover:bg-red-50 transition"
                    >
                      Acheter — {item.prix.toLocaleString("fr-FR")} FCFA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
