"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

// IDs Natural Earth (ISO numeric) des 8 pays UEMOA
const UEMOA_IDS: Record<number, string> = {
  204: "benin",
  854: "burkina",
  384: "cotedivoire",
  624: "guineebissau",
  466: "mali",
  562: "niger",
  686: "senegal",
  768: "togo",
};

type CountryInfo = {
  id: string;
  name: string;
  slug: string;
  articles: number;
  capital: string;
  capitalCoords: [number, number];
  pib: string;
  flag: string;
  description: string;
  color: string;
};

const COUNTRIES: Record<string, CountryInfo> = {
  benin: {
    id: "benin", name: "Bénin", slug: "/uemoa/benin",
    articles: 28, capital: "Porto-Novo", capitalCoords: [2.617, 6.365],
    pib: "17 Mds $", flag: "🇧🇯",
    description: "Économie en croissance portée par le commerce, l'agriculture et les services.",
    color: "#16a34a",
  },
  burkina: {
    id: "burkina", name: "Burkina Faso", slug: "/uemoa/burkina-faso",
    articles: 32, capital: "Ouagadougou", capitalCoords: [-1.516, 12.366],
    pib: "19 Mds $", flag: "🇧🇫",
    description: "Secteur agricole dominant et développement du secteur minier aurifère.",
    color: "#b91c1c",
  },
  cotedivoire: {
    id: "cotedivoire", name: "Côte d'Ivoire", slug: "/uemoa/cote-d-ivoire",
    articles: 87, capital: "Abidjan", capitalCoords: [-4.008, 5.354],
    pib: "70 Mds $", flag: "🇨🇮",
    description: "Première économie de l'UEMOA, leader du cacao et hub financier régional.",
    color: "#f97316",
  },
  guineebissau: {
    id: "guineebissau", name: "Guinée-Bissau", slug: "/uemoa/guinee-bissau",
    articles: 8, capital: "Bissau", capitalCoords: [-15.597, 11.863],
    pib: "1,6 Mds $", flag: "🇬🇼",
    description: "Économie fragile en cours de diversification, principalement agricole.",
    color: "#7c3aed",
  },
  mali: {
    id: "mali", name: "Mali", slug: "/uemoa/mali",
    articles: 45, capital: "Bamako", capitalCoords: [-8.0, 12.65],
    pib: "22 Mds $", flag: "🇲🇱",
    description: "Vaste territoire riche en or et coton, carrefour historique de l'Afrique de l'Ouest.",
    color: "#0f766e",
  },
  niger: {
    id: "niger", name: "Niger", slug: "/uemoa/niger",
    articles: 31, capital: "Niamey", capitalCoords: [2.114, 13.515],
    pib: "14 Mds $", flag: "🇳🇪",
    description: "Potentiel énergétique (uranium, pétrole) et développement agricole en cours.",
    color: "#ca8a04",
  },
  senegal: {
    id: "senegal", name: "Sénégal", slug: "/uemoa/senegal",
    articles: 74, capital: "Dakar", capitalCoords: [-17.444, 14.693],
    pib: "28 Mds $", flag: "🇸🇳",
    description: "Hub économique et financier ouest-africain, en forte croissance grâce au pétrole et gaz.",
    color: "#2563eb",
  },
  togo: {
    id: "togo", name: "Togo", slug: "/uemoa/togo",
    articles: 22, capital: "Lomé", capitalCoords: [1.221, 6.137],
    pib: "8,9 Mds $", flag: "🇹🇬",
    description: "Plateforme logistique régionale avec le port de Lomé, 1er port en eau profonde.",
    color: "#0891b2",
  },
};

export default function UemoaMapSvg({ noWrapper = false }: { noWrapper?: boolean } = {}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<CountryInfo>(COUNTRIES.cotedivoire);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const W = 500, H = 520;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Projection centrée sur l'UEMOA (Afrique de l'Ouest)
    const projection = d3.geoMercator()
      .center([-3, 12])
      .scale(540)
      .translate([W / 2, H / 2]);

    const path = d3.geoPath().projection(projection);

    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then((world: Topology) => {
        const countries = topojson.feature(
          world,
          world.objects.countries as GeometryCollection
        );

        // Fond océan
        svg.append("rect").attr("width", W).attr("height", H).attr("fill", "#cfe8f5");

        // Pays voisins (contexte gris)
        svg.append("g")
          .selectAll("path")
          .data((countries as GeoJSON.FeatureCollection).features.filter(f => {
            const id = Number(f.id);
            return !UEMOA_IDS[id] && isNeighbour(id);
          }))
          .join("path")
          .attr("d", path as never)
          .attr("fill", "#d1d5db")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);

        // Pays UEMOA
        const uemoaFeatures = (countries as GeoJSON.FeatureCollection).features.filter(
          f => UEMOA_IDS[Number(f.id)]
        );

        const uemoaGroup = svg.append("g");

        uemoaGroup.selectAll("path")
          .data(uemoaFeatures)
          .join("path")
          .attr("d", path as never)
          .attr("fill", f => {
            const key = UEMOA_IDS[Number(f.id)];
            return key === selected.id ? d3.color(COUNTRIES[key].color)!.darker(0.3).toString() : COUNTRIES[key].color;
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("stroke-linejoin", "round")
          .style("cursor", "pointer")
          .style("transition", "filter 0.15s")
          .attr("data-key", f => UEMOA_IDS[Number(f.id)])
          .on("mouseenter", function() {
            d3.select(this).attr("filter", "brightness(1.15)");
          })
          .on("mouseleave", function() {
            d3.select(this).attr("filter", null);
          })
          .on("click", (_, f) => {
            const key = UEMOA_IDS[Number(f.id)];
            setSelected(COUNTRIES[key]);
          });

        // Contours UEMOA
        uemoaGroup.selectAll("path.border")
          .data(uemoaFeatures)
          .join("path")
          .attr("d", path as never)
          .attr("fill", "none")
          .attr("stroke", "rgba(255,255,255,0.8)")
          .attr("stroke-width", 1.5)
          .style("pointer-events", "none");

        // Labels pays
        uemoaFeatures.forEach(f => {
          const key = UEMOA_IDS[Number(f.id)];
          const centroid = path.centroid(f as never);
          if (!centroid || isNaN(centroid[0])) return;

          const offsets: Record<string, [number, number]> = {
            mali: [0, -15],
            niger: [10, 5],
            burkina: [0, 0],
            senegal: [-5, 0],
            cotedivoire: [0, 5],
            benin: [0, 0],
            togo: [0, 0],
            guineebissau: [-5, 0],
          };
          const [ox, oy] = offsets[key] ?? [0, 0];

          const labelMap: Record<string, string> = {
            cotedivoire: "C.D'IVOIRE",
            guineebissau: "G-BISSAU",
            burkina: "BURKINA",
          };

          svg.append("text")
            .attr("x", centroid[0] + ox)
            .attr("y", centroid[1] + oy)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", key === "guineebissau" ? 6.5 : key === "togo" || key === "benin" ? 7.5 : 9)
            .attr("font-weight", "700")
            .attr("fill", "#fff")
            .attr("font-family", "sans-serif")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.7)")
            .text(labelMap[key] ?? COUNTRIES[key].name.toUpperCase());
        });

        // Points capitales
        Object.values(COUNTRIES).forEach(c => {
          const [cx, cy] = projection(c.capitalCoords) ?? [0, 0];
          if (!cx) return;

          svg.append("circle")
            .attr("cx", cx).attr("cy", cy).attr("r", 5)
            .attr("fill", "white").attr("opacity", 0.4)
            .style("pointer-events", "none");

          svg.append("circle")
            .attr("cx", cx).attr("cy", cy).attr("r", 3)
            .attr("fill", "white")
            .attr("stroke", c.color)
            .attr("stroke-width", 1.5)
            .style("pointer-events", "none");
        });

        // Label légende
        svg.append("text")
          .attr("x", W / 2).attr("y", H - 6)
          .attr("text-anchor", "middle")
          .attr("font-size", 9)
          .attr("fill", "rgba(255,255,255,0.5)")
          .attr("font-family", "sans-serif")
          .text("Zone UEMOA — cliquez sur un pays");

        setReady(true);
      })
      .catch(err => {
        console.error("UEMOA Map load error:", err);
        setReady(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-colorier quand la sélection change
  useEffect(() => {
    if (!svgRef.current || !ready) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll<SVGPathElement, GeoJSON.Feature>("path[data-key]").attr("fill", function() {
      const key = this.getAttribute("data-key");
      if (!key) return "#d1d5db";
      const c = COUNTRIES[key];
      return key === selected.id ? d3.color(c.color)!.darker(0.3).toString() : c.color;
    });
  }, [selected, ready]);

  const inner = (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-red-600 inline-block" />
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wide">Actualités UEMOA</h2>
        </div>
        <Link href="/uemoa" className="text-red-600 text-sm font-semibold hover:underline">
          Voir toutes les actualités →
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4">

        {/* ── Carte D3 ── */}
        <div className="bg-[#0d4f8c] rounded-xl border border-blue-900 shadow-lg overflow-hidden flex items-center justify-center min-h-[420px] relative">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
          <svg
            ref={svgRef}
            viewBox="0 0 500 520"
            className="w-full h-auto"
            style={{ display: ready ? "block" : "none" }}
          />
        </div>

        {/* ── Panneau infos ── */}
        <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col">

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-3 h-12 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                {selected.flag} Pays sélectionné
              </span>
              <h3 className="font-serif text-[22px] font-bold leading-tight">{selected.name}</h3>
            </div>
          </div>

          <p className="text-gray-500 text-sm mb-5 leading-relaxed">{selected.description}</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-600">{selected.articles}</div>
              <div className="text-xs text-gray-500 mt-0.5">Articles</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-gray-800 leading-tight">{selected.capital}</div>
              <div className="text-xs text-gray-500 mt-0.5">Capitale</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-gray-800">{selected.pib}</div>
              <div className="text-xs text-gray-500 mt-0.5">PIB estimé</div>
            </div>
          </div>

          {/* Légende couleurs */}
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.values(COUNTRIES).map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all"
                style={{
                  backgroundColor: selected.id === c.id ? c.color : "#f9fafb",
                  color:           selected.id === c.id ? "#fff"   : "#374151",
                  borderColor:     selected.id === c.id ? c.color  : "#e5e7eb",
                  fontWeight:      selected.id === c.id ? 700      : 400,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: selected.id === c.id ? "#fff" : c.color }}
                />
                {c.flag} {c.name}
              </button>
            ))}
          </div>

          <Link
            href={selected.slug}
            className="mt-auto block w-full text-white text-center py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition"
            style={{ backgroundColor: selected.color }}
          >
            Actualités {selected.name} →
          </Link>
        </div>

      </div>
    </div>
  );

  if (noWrapper) return inner;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      {inner}
    </section>
  );
}

// Pays voisins à afficher pour le contexte géographique
function isNeighbour(id: number): boolean {
  const neighbours = new Set([
    288,  // Ghana
    566,  // Nigeria
    324,  // Guinée
    694,  // Sierra Leone
    430,  // Liberia
    466,  // Mauritanie (si pas UEMOA)
    504,  // Maroc
    12,   // Algérie
    434,  // Libye
    729,  // Soudan
    120,  // Cameroun
    204,  // Bénin (déjà UEMOA mais au cas où)
    706,  // Somalie
  ]);
  return neighbours.has(id);
}
