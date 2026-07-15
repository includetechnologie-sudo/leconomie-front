import Image from "next/image";
import Link from "next/link";
import { graphqlFetch } from "@/lib/graphql-fetch";
import { GET_MAGAZINES } from "@/graphql/queries";
import type { MagazineWP } from "@/lib/types";

export default async function MagazinePremium() {
  let magazine: MagazineWP | null = null;
  try {
    const data = await graphqlFetch<{ magazines: { nodes: MagazineWP[] } }>(GET_MAGAZINES);
    magazine = data.magazines.nodes[0] ?? null;
  } catch { /* fallback sur placeholder */ }

  const cover = magazine?.featuredImage?.node?.sourceUrl || "/images/magazine-cover.jpg";
  const numero = magazine?.numero ? `N° ${magazine.numero}` : "";
  const datePubli = magazine?.datePublication || "";

  return (
    <section className="max-w-[1600px] mx-auto px-6 mt-20">

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-red-600">MAGAZINE PREMIUM</h2>
        <div className="w-24 h-1 bg-red-600" />
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-2 gap-10 items-center p-10">

          {/* Couverture — se met à jour automatiquement depuis WordPress */}
          <div className="flex justify-center">
            <Image
              src={cover}
              alt="Magazine L'Economie International"
              width={350}
              height={500}
              className="rounded-xl shadow-2xl hover:scale-105 transition"
            />
          </div>

          {/* Contenu */}
          <div className="text-white">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="bg-red-600 px-4 py-1.5 rounded font-semibold text-sm">
                Trimestriel Premium
              </span>
              {(numero || datePubli) && (
                <span className="text-gray-400 text-sm">
                  {[numero, datePubli].filter(Boolean).join(" · ")}
                </span>
              )}
            </div>

            <h3 className="text-4xl font-bold mt-4 leading-tight">
              Votre nouvelle édition est disponible&nbsp;!
            </h3>

            <p className="mt-4 text-gray-300 leading-relaxed text-lg">
              Analyses exclusives, classements, interviews de dirigeants
              et enquêtes économiques approfondies sur la zone CEMAC.
              Ne manquez pas cette édition.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/magazine?tab=magazines"
                className="bg-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Découvrir le magazine
              </Link>
              <Link
                href="/abonnement"
                className="border border-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition"
              >
                S&apos;abonner
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10">
              <div>
                <div className="text-4xl font-bold text-red-500">100+</div>
                <p className="text-sm text-gray-300 mt-1">Entreprises</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-500">25+</div>
                <p className="text-sm text-gray-300 mt-1">Interviews</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-red-500">6</div>
                <p className="text-sm text-gray-300 mt-1">Pays CEMAC</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
