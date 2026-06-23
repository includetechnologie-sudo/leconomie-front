"use client";

import { useState, useEffect, useRef } from "react";

interface Action {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  market?: string;
}

// Données statiques BVMAC/BGFI Elite en attendant l'API
const BVMAC_STATIC: Action[] = [
  { symbol: "BGFI",   name: "BGFI Bank",           price: 42500, change: 500,   changePercent: 1.19,  market: "BVMAC" },
  { symbol: "PRSC",   name: "Société Financière",  price: 4740,  change: 330,   changePercent: 7.48,  market: "BVMAC" },
  { symbol: "ETIT",   name: "Ecobank Togo",        price: 34,    change: 2,     changePercent: 6.25,  market: "BRVM"  },
  { symbol: "CIEC",   name: "CIE Côte d'Ivoire",   price: 4995,  change: 240,   changePercent: 5.05,  market: "BRVM"  },
  { symbol: "NEIC",   name: "NEI-CEDA",            price: 2300,  change: -85,   changePercent: -3.56, market: "BRVM"  },
  { symbol: "FTSC",   name: "FILTISAC",            price: 2100,  change: -75,   changePercent: -3.45, market: "BRVM"  },
  { symbol: "ONTBF",  name: "ONATEL Burkina",      price: 2750,  change: -90,   changePercent: -3.17, market: "BRVM"  },
  { symbol: "SNTS",   name: "Sonatel",             price: 15800, change: 200,   changePercent: 1.28,  market: "BRVM"  },
  { symbol: "SIBC",   name: "SIB Côte d'Ivoire",   price: 5200,  change: 100,   changePercent: 1.96,  market: "BRVM"  },
  { symbol: "BICB",   name: "BIC Burkina",         price: 8750,  change: -50,   changePercent: -0.57, market: "BRVM"  },
  { symbol: "SGBC",   name: "Société Générale CI",  price: 12500, change: 150,   changePercent: 1.21,  market: "BRVM"  },
  { symbol: "BOAB",   name: "BOA Bénin",           price: 4500,  change: -30,   changePercent: -0.66, market: "BRVM"  },
  { symbol: "ECOBC",  name: "Ecobank CI",          price: 3750,  change: 80,    changePercent: 2.18,  market: "BRVM"  },
  { symbol: "SAFC",   name: "SAFCA",               price: 1650,  change: 25,    changePercent: 1.54,  market: "BRVM"  },
  { symbol: "TTLC",   name: "Total Côte d'Ivoire", price: 2190,  change: -15,   changePercent: -0.68, market: "BRVM"  },
];

function formatPrice(p: number) {
  return p.toLocaleString("fr-FR");
}

export default function BoursePanel({ onClose }: { onClose: () => void }) {
  const [actions] = useState<Action[]>(BVMAC_STATIC);
  const [filter, setFilter] = useState<"all" | "BVMAC" | "BRVM">("all");
  const panelRef = useRef<HTMLDivElement>(null);

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

  const filtered = filter === "all" ? actions : actions.filter((a) => a.market === filter);
  const hausse = actions.filter((a) => a.changePercent > 0);
  const baisse = actions.filter((a) => a.changePercent < 0);
  const brvm = 438.68;
  const brvmChange = 0.50;

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
          <span className="font-bold text-sm">Bourse CEMAC</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Indices */}
      <div className="bg-gray-800 px-4 py-2.5 flex gap-4 text-xs">
        <div>
          <span className="text-gray-400">BRVM COMP</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-white font-bold">{brvm}</span>
            <span className={`font-semibold ${brvmChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              {brvmChange >= 0 ? "▲" : "▼"} {Math.abs(brvmChange)}%
            </span>
          </div>
        </div>
        <div className="text-gray-600 self-stretch w-px bg-gray-700" />
        <div>
          <span className="text-gray-400">Hausse</span>
          <div className="text-green-400 font-bold mt-0.5">{hausse.length} titres</div>
        </div>
        <div>
          <span className="text-gray-400">Baisse</span>
          <div className="text-red-400 font-bold mt-0.5">{baisse.length} titres</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex border-b border-gray-100">
        {(["all", "BRVM", "BVMAC"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-1 text-xs font-bold py-2 transition ${filter === f ? "text-red-600 border-b-2 border-red-600" : "text-gray-500 hover:text-gray-800"}`}>
            {f === "all" ? "Tous" : f}
          </button>
        ))}
      </div>

      {/* Liste des actions */}
      <div className="divide-y divide-gray-50">
        {/* Header colonnes */}
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          <span>Titre</span>
          <span className="text-right">Prix (FCFA)</span>
          <span className="text-right w-16">Var.</span>
        </div>

        {filtered.map((action) => (
          <div key={action.symbol}
            className="grid grid-cols-[1fr_auto_auto] gap-2 px-4 py-2.5 hover:bg-gray-50 transition items-center">
            <div>
              <p className="text-xs font-bold text-gray-900">{action.symbol}</p>
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">{action.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-900">{formatPrice(action.price)}</p>
              <p className="text-[10px] text-gray-400">{action.market}</p>
            </div>
            <div className={`text-right w-16 text-xs font-bold rounded px-1.5 py-0.5 text-center
              ${action.changePercent > 0 ? "bg-green-50 text-green-600" : action.changePercent < 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}>
              {action.changePercent > 0 ? "+" : ""}{action.changePercent.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-[10px] text-gray-400">Données indicatives · BRVM & BVMAC</p>
        <a href="https://www.sika.finance" target="_blank" rel="noreferrer"
          className="text-[10px] text-red-600 hover:underline font-semibold">
          Données complètes sur Sika Finance →
        </a>
      </div>
    </div>
  );
}
