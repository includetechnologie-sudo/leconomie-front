import Link from "next/link";

const PAYS = [
  { slug: "cameroun",          name: "Cameroun",              flag: "🇨🇲", pib: "44 Mds $",  capital: "Yaoundé" },
  { slug: "tchad",             name: "Tchad",                 flag: "🇹🇩", pib: "11 Mds $",  capital: "N'Djaména" },
  { slug: "rca",               name: "Rép. Centrafricaine",   flag: "🇨🇫", pib: "2,4 Mds $", capital: "Bangui" },
  { slug: "congo",             name: "Congo",                 flag: "🇨🇬", pib: "9,2 Mds $", capital: "Brazzaville" },
  { slug: "gabon",             name: "Gabon",                 flag: "🇬🇦", pib: "16,6 Mds $",capital: "Libreville" },
  { slug: "guinee-equatoriale",name: "Guinée Équatoriale",    flag: "🇬🇶", pib: "10,3 Mds $",capital: "Malabo" },
];

export default function CemacPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Accueil</Link>
            <span>/</span>
            <span className="text-white">CEMAC</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">Zone CEMAC</h1>
          <p className="text-gray-400">Actualités économiques des 6 pays de la Communauté Économique et Monétaire de l&apos;Afrique Centrale</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PAYS.map((p) => (
            <Link
              key={p.slug}
              href={`/cemac/${p.slug}`}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{p.flag}</span>
                <div>
                  <h2 className="font-bold text-gray-900 group-hover:text-red-600 transition">{p.name}</h2>
                  <p className="text-xs text-gray-400">{p.capital}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm border-t pt-3">
                <span className="text-gray-500">PIB estimé</span>
                <span className="font-bold text-gray-800">{p.pib}</span>
              </div>
              <span className="text-xs text-red-600 font-semibold group-hover:underline">
                Voir les actualités →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
