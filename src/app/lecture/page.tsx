import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LecturePage() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("abonne_access");

  if (!accessCookie) {
    redirect("/abonnement?raison=acces_reserve");
  }

  let access: { email: string; plan: string; ref: string } | null = null;
  try {
    access = JSON.parse(accessCookie.value);
  } catch {
    redirect("/abonnement?raison=session_invalide");
  }

  const PLAN_LABELS: Record<string, string> = {
    mensuel: "Mensuel",
    annuel: "Annuel",
    entreprise: "Entreprise",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* En-tête abonné */}
      <div className="bg-red-600 text-white rounded-xl p-6 mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm opacity-80">Connecté en tant qu'abonné</p>
          <p className="font-bold text-lg">{access?.email}</p>
          <p className="text-sm opacity-80">Plan {PLAN_LABELS[access?.plan || ""] || access?.plan}</p>
        </div>
        <Link href="/"
          className="bg-white text-red-600 font-bold px-4 py-2 rounded hover:bg-gray-100 transition text-sm">
          ← Accueil
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Espace Abonnés — Journal du Jour</h1>

      {/* Grille éditions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { num: "N° 2548", date: "22 mai 2024", titre: "Intégration économique CEMAC en marche" },
          { num: "N° 2547", date: "21 mai 2024", titre: "BEAC : les taux directeurs maintenus" },
          { num: "N° 2546", date: "20 mai 2024", titre: "Gabon : réforme du secteur pétrolier" },
          { num: "N° 2545", date: "19 mai 2024", titre: "Cameroun : investissements dans l'agro" },
          { num: "N° 2544", date: "18 mai 2024", titre: "Congo : plan de diversification 2024" },
          { num: "N° 2543", date: "17 mai 2024", titre: "Tchad : reprise économique confirmée" },
        ].map((edition) => (
          <div key={edition.num}
            className="border rounded-xl p-6 hover:shadow-lg transition bg-white group cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">{edition.num}</span>
              <span className="text-xs text-gray-400">{edition.date}</span>
            </div>
            <h3 className="font-bold text-lg leading-snug group-hover:text-red-600 transition mb-4">
              {edition.titre}
            </h3>
            <button className="text-sm font-bold text-red-600 hover:underline flex items-center gap-1">
              Lire cette édition →
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-12">
        L'accès au journal PDF complet sera disponible prochainement.
      </p>
    </div>
  );
}
