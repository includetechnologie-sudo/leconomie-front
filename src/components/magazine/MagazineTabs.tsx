"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Quotidien {
  id: string;
  num: string;
  date: string;
  titre: string;
  description: string;
  extrait: string;
  cover: string;
  prix: number;
}

interface Magazine {
  id: string;
  num: string;
  date: string;
  titre: string;
  description: string;
  extrait: string;
  sommaire: string[];
  cover: string;
  prix: number;
}

interface Props {
  quotidiens: Quotidien[];
  magazines: Magazine[];
  isConnected: boolean;
  userEmail: string;
}

function formatDate(d: string) {
  if (!d) return "";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return d;
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatPrice(p: number) {
  return p.toLocaleString("fr-FR") + " FCFA";
}

function ExtraitModal({ text, titre, onClose }: { text: string; titre: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-2">Extrait</p>
        <h2 className="font-serif text-xl font-bold mb-4 leading-snug">{titre}</h2>
        <div className="text-gray-700 text-sm leading-relaxed border-l-4 border-red-200 pl-4 mb-6 italic">
          {text}
          <span className="text-gray-400"> [...] </span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold text-gray-800 mb-3">Lire l&apos;intégralité de cette édition</p>
          <Link href="/connexion" onClick={onClose}
            className="block w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition text-sm mb-2">
            Se connecter pour lire
          </Link>
          <Link href="/abonnement" onClick={onClose}
            className="block w-full border border-red-600 text-red-600 font-bold py-2.5 rounded-lg hover:bg-red-50 transition text-sm">
            S&apos;abonner
          </Link>
        </div>
      </div>
    </div>
  );
}

function AchatModal({ magazine, onClose }: { magazine: Magazine; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAchat() {
    if (!email || !name || !phone) { setError("Veuillez remplir tous les champs."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/achat/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, name, phone,
          id: Number(magazine.id),
          type: "magazine",
          titre: magazine.titre,
          amount: magazine.prix,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || "Erreur lors de l'initiation du paiement.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Achat numérique</p>
        <h2 className="font-serif text-lg font-bold mb-1">{magazine.titre}</h2>
        <p className="text-sm text-gray-500 mb-4">{magazine.num} · {formatDate(magazine.date)}</p>
        <div className="text-2xl font-bold text-red-600 mb-4">{formatPrice(magazine.prix)}</div>
        <div className="space-y-3 mb-4">
          <input type="text" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
          <input type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
          <input type="tel" placeholder="Numéro Mobile Money (6XXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
        </div>
        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}
        <button onClick={handleAchat} disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-60 mb-2">
          {loading ? "Redirection…" : `Acheter — ${formatPrice(magazine.prix)}`}
        </button>
        <p className="text-xs text-gray-400 text-center">Paiement sécurisé via MyCoolPay · Mobile Money</p>
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

function getYears(items: { date: string; num: string }[]): string[] {
  const years = new Set<string>();
  items.forEach((i) => {
    const y = new Date(i.date).getFullYear();
    if (!isNaN(y)) years.add(String(y));
    // date format "17-Mars-2026" — extrait l'année
    const m = i.date.match(/\d{4}/);
    if (m) years.add(m[0]);
  });
  return Array.from(years).sort((a, b) => Number(b) - Number(a));
}

export default function MagazineTabs({ quotidiens, magazines, isConnected }: Props) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "magazines" ? "magazine" : "quotidien";
  const [tab, setTab] = useState<"quotidien" | "magazine">(initialTab);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "magazines") setTab("magazine");
    else if (t === "quotidien") setTab("quotidien");
  }, [searchParams]);
  const [extraitData, setExtraitData] = useState<{ text: string; titre: string } | null>(null);
  const [achatMag, setAchatMag] = useState<Magazine | null>(null);
  const [achatJournal, setAchatJournal] = useState<Quotidien | null>(null);

  // Recherche + filtre journaux
  const [searchJ, setSearchJ] = useState("");
  const [yearJ, setYearJ] = useState("all");
  const [pageJ, setPageJ] = useState(1);

  // Recherche + filtre magazines
  const [searchM, setSearchM] = useState("");
  const [yearM, setYearM] = useState("all");
  const [pageM, setPageM] = useState(1);

  const latest = quotidiens[0] ?? null;
  const archives = quotidiens.slice(1);
  const latestMag = magazines[0] ?? null;
  const archivesMag = magazines.slice(1);

  // Filtrage journaux
  const filteredJ = archives.filter((q) => {
    const matchSearch = searchJ === "" ||
      q.titre.toLowerCase().includes(searchJ.toLowerCase()) ||
      q.num.toLowerCase().includes(searchJ.toLowerCase()) ||
      q.date.toLowerCase().includes(searchJ.toLowerCase());
    const matchYear = yearJ === "all" || q.date.includes(yearJ) ||
      (!isNaN(new Date(q.date).getFullYear()) && String(new Date(q.date).getFullYear()) === yearJ);
    return matchSearch && matchYear;
  });
  const totalPagesJ = Math.ceil(filteredJ.length / PAGE_SIZE);
  const pagedJ = filteredJ.slice((pageJ - 1) * PAGE_SIZE, pageJ * PAGE_SIZE);
  const yearsJ = getYears(archives);

  // Filtrage magazines
  const filteredM = archivesMag.filter((m) => {
    const matchSearch = searchM === "" ||
      m.titre.toLowerCase().includes(searchM.toLowerCase()) ||
      m.num.toLowerCase().includes(searchM.toLowerCase()) ||
      m.date.toLowerCase().includes(searchM.toLowerCase());
    const matchYear = yearM === "all" || m.date.includes(yearM) ||
      (!isNaN(new Date(m.date).getFullYear()) && String(new Date(m.date).getFullYear()) === yearM);
    return matchSearch && matchYear;
  });
  const totalPagesM = Math.ceil(filteredM.length / PAGE_SIZE);
  const pagedM = filteredM.slice((pageM - 1) * PAGE_SIZE, pageM * PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Onglets */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab("quotidien")}
          className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide border-b-2 -mb-px transition
            ${tab === "quotidien" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          Quotidien
        </button>
        <button
          onClick={() => setTab("magazine")}
          className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide border-b-2 -mb-px transition
            ${tab === "magazine" ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}
        >
          Magazine
        </button>
      </div>

      {/* ── ONGLET QUOTIDIEN ── */}
      {tab === "quotidien" && (
        <div>
          {!latest ? (
            <p className="text-center text-gray-500 py-12">Aucun journal disponible pour le moment.</p>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-10">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="shrink-0 mx-auto md:mx-0">
                    <div className="relative shadow-xl rounded-lg overflow-hidden" style={{ width: 160, height: 220 }}>
                      <Image src={latest.cover} alt={latest.titre} fill className="object-cover" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {latest.num}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(latest.date)}</span>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                        Édition du jour
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold leading-snug mb-3">{latest.titre}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{latest.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setExtraitData({ text: latest.extrait, titre: latest.titre })}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-red-600 hover:text-red-600 transition"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Lire un extrait
                      </button>
                      <button
                        onClick={() => setAchatJournal(latest)}
                        className="flex items-center gap-2 border border-red-600 text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                        </svg>
                        Acheter — {formatPrice(latest.prix)}
                      </button>
                      {isConnected ? (
                        <Link href="/mon-compte#journaux"
                          className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
                            <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
                          </svg>
                          Lire l&apos;intégralité
                        </Link>
                      ) : (
                        <Link href="/connexion"
                          className="flex items-center gap-2 bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-900 transition">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          Se connecter pour lire
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {archives.length > 0 && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2 shrink-0">
                      <span className="w-1 h-5 bg-red-600 inline-block rounded" />
                      Éditions précédentes
                      <span className="text-sm font-normal text-gray-400">({archives.length})</span>
                    </h3>
                    <div className="flex gap-2 ml-auto flex-wrap">
                      {/* Filtre année */}
                      {yearsJ.length > 0 && (
                        <select
                          value={yearJ}
                          onChange={(e) => { setYearJ(e.target.value); setPageJ(1); }}
                          className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-red-500 bg-white"
                        >
                          <option value="all">Toutes les années</option>
                          {yearsJ.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      )}
                      {/* Recherche */}
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Rechercher un numéro…"
                          value={searchJ}
                          onChange={(e) => { setSearchJ(e.target.value); setPageJ(1); }}
                          className="border border-gray-200 rounded-lg text-sm pl-8 pr-3 py-2 w-48 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredJ.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">Aucune édition trouvée pour &quot;{searchJ}&quot;.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                        {pagedJ.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => setAchatJournal(q)}
                            className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition text-left"
                          >
                            <div className="relative w-full bg-gray-100" style={{ aspectRatio: "3/4" }}>
                              <Image src={q.cover} alt={q.titre} fill className="object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Acheter</span>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-red-600">{q.num}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatDate(q.date)}</p>
                              <p className="text-xs font-semibold text-gray-700 mt-1">{formatPrice(q.prix)}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Pagination journaux */}
                      {totalPagesJ > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                          <button
                            onClick={() => setPageJ((p) => Math.max(1, p - 1))}
                            disabled={pageJ === 1}
                            className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
                          >← Préc.</button>
                          {Array.from({ length: totalPagesJ }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPageJ(p)}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition ${pageJ === p ? "bg-red-600 text-white" : "border hover:bg-gray-50 text-gray-700"}`}
                            >{p}</button>
                          ))}
                          <button
                            onClick={() => setPageJ((p) => Math.min(totalPagesJ, p + 1))}
                            disabled={pageJ === totalPagesJ}
                            className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
                          >Suiv. →</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ONGLET MAGAZINE ── */}
      {tab === "magazine" && (
        <div>
          {!latestMag ? (
            <p className="text-center text-gray-500 py-12">Aucun magazine disponible pour le moment.</p>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-10">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="shrink-0 mx-auto md:mx-0">
                    <div className="relative shadow-xl rounded-lg overflow-hidden" style={{ width: 160, height: 220 }}>
                      <Image src={latestMag.cover} alt={latestMag.titre} fill className="object-cover" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                        {latestMag.num}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(latestMag.date)}</span>
                    </div>
                    <h2 className="font-serif text-2xl font-bold leading-snug mb-2">{latestMag.titre}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{latestMag.description}</p>
                    {latestMag.sommaire.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                          Principaux titres de ce magazine :
                        </p>
                        <ul className="space-y-1">
                          {latestMag.sommaire.map((item) => (
                            <li key={item} className="text-sm text-gray-700 flex items-start gap-1.5">
                              <span className="text-red-600 mt-0.5">—</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setExtraitData({ text: latestMag.extrait, titre: latestMag.titre })}
                        className="flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-red-600 hover:text-red-600 transition"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Lire un extrait
                      </button>
                      <button
                        onClick={() => setAchatMag(latestMag)}
                        className="flex items-center gap-2 border border-red-600 text-red-600 text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                        </svg>
                        Acheter — {formatPrice(latestMag.prix)}
                      </button>
                      {isConnected ? (
                        <Link href="/mon-compte#magazines"
                          className="flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-red-700 transition">
                          Lire l&apos;intégralité
                        </Link>
                      ) : (
                        <Link href="/connexion"
                          className="flex items-center gap-2 bg-gray-800 text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-900 transition">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                          </svg>
                          Se connecter
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {archivesMag.length > 0 && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
                    <h3 className="font-serif text-xl font-bold flex items-center gap-2 shrink-0">
                      <span className="w-1 h-5 bg-red-600 inline-block rounded" />
                      Numéros précédents
                      <span className="text-sm font-normal text-gray-400">({archivesMag.length})</span>
                    </h3>
                    <div className="flex gap-2 ml-auto flex-wrap">
                      {getYears(archivesMag).length > 0 && (
                        <select
                          value={yearM}
                          onChange={(e) => { setYearM(e.target.value); setPageM(1); }}
                          className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-red-500 bg-white"
                        >
                          <option value="all">Toutes les années</option>
                          {getYears(archivesMag).map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      )}
                      <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input
                          type="text"
                          placeholder="Rechercher un numéro…"
                          value={searchM}
                          onChange={(e) => { setSearchM(e.target.value); setPageM(1); }}
                          className="border border-gray-200 rounded-lg text-sm pl-8 pr-3 py-2 w-48 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredM.length === 0 ? (
                    <p className="text-center text-gray-400 py-10">Aucun numéro trouvé pour &quot;{searchM}&quot;.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                        {pagedM.map((mag) => (
                          <button
                            key={mag.id}
                            onClick={() => setAchatMag(mag)}
                            className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition text-left"
                          >
                            <div className="relative w-full bg-gray-100" style={{ aspectRatio: "3/4" }}>
                              <Image src={mag.cover} alt={mag.titre} fill className="object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Voir</span>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-bold text-red-600">{mag.num}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatDate(mag.date)}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      {totalPagesM > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                          <button
                            onClick={() => setPageM((p) => Math.max(1, p - 1))}
                            disabled={pageM === 1}
                            className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
                          >← Préc.</button>
                          {Array.from({ length: totalPagesM }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPageM(p)}
                              className={`w-9 h-9 rounded-lg text-sm font-bold transition ${pageM === p ? "bg-red-600 text-white" : "border hover:bg-gray-50 text-gray-700"}`}
                            >{p}</button>
                          ))}
                          <button
                            onClick={() => setPageM((p) => Math.min(totalPagesM, p + 1))}
                            disabled={pageM === totalPagesM}
                            className="px-3 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition"
                          >Suiv. →</button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Modales */}
      {extraitData && (
        <ExtraitModal
          text={extraitData.text}
          titre={extraitData.titre}
          onClose={() => setExtraitData(null)}
        />
      )}
      {achatMag && (
        <AchatModal
          magazine={achatMag}
          onClose={() => setAchatMag(null)}
        />
      )}
      {achatJournal && (
        <AchatJournalModal
          journal={achatJournal}
          onClose={() => setAchatJournal(null)}
        />
      )}
    </div>
  );
}

function AchatJournalModal({ journal, onClose }: { journal: Quotidien; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAchat() {
    if (!email || !name || !phone) { setError("Veuillez remplir tous les champs."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/achat/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, name, phone,
          id: Number(journal.id),
          type: "journal",
          titre: journal.titre,
          amount: journal.prix,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || "Erreur lors de l'initiation du paiement.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1">Achat numérique</p>
        <h2 className="font-serif text-lg font-bold mb-1 leading-snug">{journal.titre}</h2>
        <p className="text-sm text-gray-500 mb-4">{journal.num} · {formatDate(journal.date)}</p>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Prix à l&apos;unité</p>
            <p className="text-2xl font-bold text-red-600">{formatPrice(journal.prix)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Accès immédiat</p>
            <p className="text-xs font-semibold text-green-600">✓ PDF sécurisé</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <input type="text" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
          <input type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
          <input type="tel" placeholder="Numéro Mobile Money (6XXXXXXXX)" value={phone} onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500" />
        </div>

        {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

        <button onClick={handleAchat} disabled={loading}
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-60 mb-3">
          {loading ? "Redirection…" : `Acheter — ${formatPrice(journal.prix)}`}
        </button>

        <div className="border-t pt-3 text-center">
          <p className="text-xs text-gray-400 mb-1">Accès illimité à tous les numéros ?</p>
          <a href="/abonnement" className="text-xs font-bold text-red-600 hover:underline">
            Découvrir nos abonnements →
          </a>
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">Paiement sécurisé via MyCoolPay · Mobile Money</p>
      </div>
    </div>
  );
}
