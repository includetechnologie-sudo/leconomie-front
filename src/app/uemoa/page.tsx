import Link from "next/link";

const PAYS = [
  { slug: "senegal",       name: "Sénégal",        flag: "🇸🇳", pib: "28 Mds $",  capital: "Dakar" },
  { slug: "cote-d-ivoire", name: "Côte d'Ivoire",   flag: "🇨🇮", pib: "70 Mds $",  capital: "Abidjan" },
  { slug: "mali",          name: "Mali",            flag: "🇲🇱", pib: "22 Mds $",  capital: "Bamako" },
  { slug: "burkina-faso",  name: "Burkina Faso",    flag: "🇧🇫", pib: "19 Mds $",  capital: "Ouagadougou" },
  { slug: "niger",         name: "Niger",           flag: "🇳🇪", pib: "14 Mds $",  capital: "Niamey" },
  { slug: "benin",         name: "Bénin",           flag: "🇧🇯", pib: "17 Mds $",  capital: "Porto-Novo" },
  { slug: "togo",          name: "Togo",            flag: "🇹🇬", pib: "8,9 Mds $", capital: "Lomé" },
  { slug: "guinee-bissau", name: "Guinée-Bissau",   flag: "🇬🇼", pib: "1,6 Mds $", capital: "Bissau" },
];

export default function UemoaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-white transition">Accueil</Link>
            <span>/</span>
            <span className="text-white">UEMOA</span>
          </div>
          <h1 className="font-serif text-3xl font-bold mb-2">Zone UEMOA</h1>
          <p className="text-gray-400">Actualités économiques des 8 pays de l&apos;Union Économique et Monétaire Ouest-Africaine</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PAYS.map((p) => (
            <Link
              key={p.slug}
              href={`/uemoa/${p.slug}`}
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
