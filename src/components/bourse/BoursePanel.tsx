"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// Dernière séance officielle de la BVMAC (voir /api/bvmac et scripts/bvmac-sync.mjs)
interface Session {
  date: string;
  numero: number;
  pdfUrl: string;
  indice: { nom: string; code: string; valeur: number; variationPct: number | null };
  actions: { isin: string; nom: string; pays: string; cours: number | null; variationPct: number | null }[];
}

function fmt(n: number | null, decimals = 0) {
  if (n == null) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default function BoursePanel({ onClose }: { onClose: () => void }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/bvmac")
      .then((r) => r.json())
      .then((d) => {
        setSession(d.session);
        setStatus(d.session ? "ok" : "empty");
      })
      .catch(() => setStatus("empty"));
  }, []);

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const actions = session?.actions ?? [];
  const hausse = actions.filter((a) => (a.variationPct ?? 0) > 0).length;
  const baisse = actions.filter((a) => (a.variationPct ?? 0) < 0).length;
  const varIndice = session?.indice.variationPct ?? 0;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[150] overflow-hidden"
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      {/* En-tête */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
          <span className="font-bold text-sm">Bourse CEMAC (BVMAC)</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition" aria-label="Fermer">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {status === "loading" && <p className="px-4 py-6 text-xs text-gray-500 text-center">Chargement des cours…</p>}
      {status === "empty" && <p className="px-4 py-6 text-xs text-gray-500 text-center">Cours officiels bientôt disponibles.</p>}

      {session && (
        <>
          {/* Indice */}
          <div className="bg-gray-800 px-4 py-2.5 flex gap-4 text-xs">
            <div>
              <span className="text-gray-400">{session.indice.code}</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-white font-bold">{fmt(session.indice.valeur, 2)}</span>
                <span className={`font-semibold ${varIndice > 0 ? "text-green-400" : varIndice < 0 ? "text-red-400" : "text-gray-400"}`}>
                  {varIndice > 0 ? "▲" : varIndice < 0 ? "▼" : ""} {fmt(Math.abs(varIndice), 2)}%
                </span>
              </div>
            </div>
            <div className="self-stretch w-px bg-gray-700" />
            <div>
              <span className="text-gray-400">Hausse</span>
              <div className="text-green-400 font-bold mt-0.5">{hausse} titre{hausse > 1 ? "s" : ""}</div>
            </div>
            <div>
              <span className="text-gray-400">Baisse</span>
              <div className="text-red-400 font-bold mt-0.5">{baisse} titre{baisse > 1 ? "s" : ""}</div>
            </div>
          </div>

          {/* Liste des actions */}
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              <span>Titre</span>
              <span className="text-right">Cours (FCFA)</span>
              <span className="text-right w-16">Var.</span>
            </div>
            {actions.map((a) => (
              <div key={a.isin} className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 hover:bg-gray-50 transition items-center">
                <div>
                  <p className="text-xs font-bold text-gray-900">{a.nom}</p>
                  <p className="text-[10px] text-gray-400">{a.pays}</p>
                </div>
                <p className="text-right text-xs font-semibold text-gray-900 tabular-nums">{fmt(a.cours)}</p>
                <div className={`w-16 text-xs font-bold rounded px-1.5 py-0.5 text-center
                  ${(a.variationPct ?? 0) > 0 ? "bg-green-50 text-green-600" : (a.variationPct ?? 0) < 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}>
                  {(a.variationPct ?? 0) > 0 ? "+" : ""}{fmt(a.variationPct ?? 0, 2)}%
                </div>
              </div>
            ))}
          </div>

          {/* Pied : source officielle + page complète */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center space-y-1">
            <p className="text-[10px] text-gray-500">
              Séance du {formatDate(session.date)} · Source :{" "}
              <a href={session.pdfUrl} target="_blank" rel="noopener" className="hover:underline">BVMAC, bulletin n° {session.numero}</a>
            </p>
            <Link href="/marches" onClick={onClose} className="text-xs text-red-600 hover:underline font-semibold">
              Tous les cours et l&apos;historique →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
