"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PubMagazineSidebar() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/magazine/32502"
      className="block group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      style={{ width: "300px" }}
    >
      {/* Image principale */}
      <div className="relative w-full" style={{ aspectRatio: "300/400" }}>
        <Image
          src="https://teal-horse-411567.hostingersite.com/wp-content/uploads/2026/07/pub-magazine-international.jpg"
          alt="L'Économie International N°049"
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay dégradé bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badge NOUVEAU */}
        <div className="absolute top-3 right-3">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full text-white"
            style={{
              backgroundColor: "#dc2626",
              boxShadow: pulse ? "0 0 12px 4px rgba(220,38,38,0.7)" : "0 0 0px 0px rgba(220,38,38,0)",
              transition: "box-shadow 0.6s ease-in-out",
            }}
          >
            Nouveau
          </span>
        </div>

        {/* Texte bas */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-1">Magazine</p>
          <p className="text-white font-black text-lg leading-tight mb-1">
            L&apos;ÉCONOMIE<br />
            <span className="text-red-400 font-black">International</span>
          </p>
          <p className="text-white/80 text-xs mb-3">N°049 — Déjà disponible en kiosque</p>

          {/* Bouton animé */}
          <div
            className="w-full text-center py-2.5 rounded-lg text-white text-xs font-black uppercase tracking-wide transition-all duration-300 group-hover:scale-105"
            style={{ backgroundColor: "#dc2626" }}
          >
            Acheter ce numéro →
          </div>
        </div>
      </div>
    </Link>
  );
}
