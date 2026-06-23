"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

// IDs Natural Earth (ISO numeric) des 6 pays CEMAC + voisins pour contexte
const CEMAC_IDS: Record<number, string> = {
  120: "cameroun",
  148: "tchad",
  140: "rca",
  178: "congo",
  266: "gabon",
  226: "guinee",
};

type CountryInfo = {
  id: string;
  name: string;
  slug: string;
  articles: number;
  capital: string;
  capitalCoords: [number, number]; // [lon, lat]
  pib: string;
  flag: string;
  description: string;
  color: string;
};

const COUNTRIES: Record<string, CountryInfo> = {
  cameroun: {
    id: "cameroun", name: "Cameroun", slug: "/cemac/cameroun",
    articles: 145, capital: "Yaoundé", capitalCoords: [11.516, 3.848],
    pib: "44 Mds $", flag: "🇨🇲",
    description: "Leader économique de la CEMAC avec une forte activité industrielle, agricole et commerciale.",
    color: "#2563eb",
  },
  tchad: {
    id: "tchad", name: "Tchad", slug: "/cemac/tchad",
    articles: 39, capital: "N'Djaména", capitalCoords: [15.044, 12.107],
    pib: "11 Mds $", flag: "🇹🇩",
    description: "Économie en croissance soutenue par les secteurs pétrolier et agricole.",
    color: "#16a34a",
  },
  rca: {
    id: "rca", name: "Rép. Centrafricaine", slug: "/cemac/rca",
    articles: 25, capital: "Bangui", capitalCoords: [18.555, 4.361],
    pib: "2,4 Mds $", flag: "🇨🇫",
    description: "Développement des infrastructures et du secteur minier au cœur de la sous-région.",
    color: "#b91c1c",
  },
  congo: {
    id: "congo", name: "Congo", slug: "/cemac/congo",
    articles: 54, capital: "Brazzaville", capitalCoords: [15.283, -4.269],
    pib: "9,2 Mds $", flag: "🇨🇬",
    description: "Développement industriel soutenu par d'importants investissements énergétiques.",
    color: "#92400e",
  },
  gabon: {
    id: "gabon", name: "Gabon", slug: "/cemac/gabon",
    articles: 62, capital: "Libreville", capitalCoords: [9.452, 0.39],
    pib: "16,6 Mds $", flag: "🇬🇦",
    description: "Économie portée par le pétrole, le manganèse et la forêt équatoriale.",
    color: "#0f766e",
  },
  guinee: {
    id: "guinee", name: "Guinée Équatoriale", slug: "/cemac/guinee-equatoriale",
    articles: 18, capital: "Malabo", capitalCoords: [8.782, 3.75],
    pib: "10,3 Mds $", flag: "🇬🇶",
    description: "Secteur pétrolier dominant et diversification économique en cours.",
    color: "#7c3aed",
  },
};

export default function CemacMapSvg() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<CountryInfo>(COUNTRIES.cameroun);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const W = 500, H = 520;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Projection centrée sur la CEMAC
    const projection = d3.geoMercator()
      .center([17, 5])
      .scale(560)
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
            return !CEMAC_IDS[id] && isNeighbour(id);
          }))
          .join("path")
          .attr("d", path as never)
          .attr("fill", "#d1d5db")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5);

        // Pays CEMAC
        const cemacFeatures = (countries as GeoJSON.FeatureCollection).features.filter(
          f => CEMAC_IDS[Number(f.id)]
        );

        const cemacGroup = svg.append("g");

        cemacGroup.selectAll("path")
          .data(cemacFeatures)
          .join("path")
          .attr("d", path as never)
          .attr("fill", f => {
            const key = CEMAC_IDS[Number(f.id)];
            return key === selected.id ? d3.color(COUNTRIES[key].color)!.darker(0.3).toString() : COUNTRIES[key].color;
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .attr("stroke-linejoin", "round")
          .style("cursor", "pointer")
          .style("transition", "filter 0.15s")
          .attr("data-key", f => CEMAC_IDS[Number(f.id)])
          .on("mouseenter", function() {
            d3.select(this).attr("filter", "brightness(1.15)");
          })
          .on("mouseleave", function() {
            d3.select(this).attr("filter", null);
          })
          .on("click", (_, f) => {
            const key = CEMAC_IDS[Number(f.id)];
            setSelected(COUNTRIES[key]);
          });

        // Contours CEMAC (bordures plus épaisses)
        cemacGroup.selectAll("path.border")
          .data(cemacFeatures)
          .join("path")
          .attr("d", path as never)
          .attr("fill", "none")
          .attr("stroke", "rgba(255,255,255,0.8)")
          .attr("stroke-width", 1.5)
          .style("pointer-events", "none");

        // Labels pays
        cemacFeatures.forEach(f => {
          const key = CEMAC_IDS[Number(f.id)];
          const centroid = path.centroid(f as never);
          if (!centroid || isNaN(centroid[0])) return;

          // Ajustements manuels des labels
          const offsets: Record<string, [number, number]> = {
            tchad: [0, -10],
            cameroun: [-5, 5],
            rca: [5, 0],
            congo: [5, 10],
            gabon: [0, 5],
            guinee: [0, -8],
          };
          const [ox, oy] = offsets[key] ?? [0, 0];

          svg.append("text")
            .attr("x", centroid[0] + ox)
            .attr("y", centroid[1] + oy)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("font-size", key === "guinee" ? 7 : key === "rca" ? 8.5 : 9.5)
            .attr("font-weight", "700")
            .attr("fill", "#fff")
            .attr("font-family", "sans-serif")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 3px rgba(0,0,0,0.7)")
            .text(key === "guinee" ? "G.ÉQ." : key === "rca" ? "RCA" : COUNTRIES[key].name.toUpperCase());
        });

        // Points capitales
        Object.values(COUNTRIES).forEach(c => {
          const [cx, cy] = projection(c.capitalCoords) ?? [0, 0];
          if (!cx) return;

          // Halo blanc
          svg.append("circle")
            .attr("cx", cx).attr("cy", cy).attr("r", 5)
            .attr("fill", "white").attr("opacity", 0.4)
            .style("pointer-events", "none");

          // Point
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
          .text("Zone CEMAC — cliquez sur un pays");

        setReady(true);
      })
      .catch(err => {
        console.error("Map load error:", err);
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

  return (
    <section className="max-w-7xl mx-auto px-4 mt-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-red-600 inline-block" />
          <h2 className="font-serif text-2xl font-bold uppercase tracking-wide">Actualités CEMAC</h2>
        </div>
        <Link href="/cemac" className="text-red-600 text-sm font-semibold hover:underline">
          Voir toutes les actualités →
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">

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

          {/* En-tête pays sélectionné */}
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
    </section>
  );
}

// Pays voisins à afficher pour le contexte géographique (ISO numeric)
function isNeighbour(id: number): boolean {
  const neighbours = new Set([
    566, // Nigeria
    180, // RDC
    728, // Soudan du Sud
    736, // Soudan
    894, // Zambie
    24,  // Angola
    854, // Burkina Faso
    288, // Ghana
    384, // Côte d'Ivoire
    562, // Niger
    204, // Bénin
    768, // Togo
    800, // Ouganda
    646, // Rwanda
    108, // Burundi
    404, // Kenya
    834, // Tanzanie
  ]);
  return neighbours.has(id);
}
