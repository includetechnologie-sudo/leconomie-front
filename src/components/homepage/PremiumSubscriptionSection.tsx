import Link from "next/link";

export default function PremiumSubscriptionSection() {
  return (
    <section className="max-w-7xl mx-auto mt-20 px-4">

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold">Abonnements Premium</h2>
        <p className="text-gray-600 mt-4">
          Accédez à l&apos;intégralité du contenu exclusif de Leconomie.info
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">

        {/* Mensuel */}
        <div className="border rounded-xl p-8 flex flex-col">
          <h3 className="text-2xl font-bold">Mensuel</h3>
          <div className="text-4xl font-bold mt-4">5 000 FCFA</div>
          <p className="text-gray-500">par mois</p>
          <ul className="mt-6 space-y-3 flex-1">
            <li>✓ Journal quotidien</li>
            <li>✓ Articles Premium</li>
            <li>✓ Archives</li>
            <li>✓ Magazine</li>
          </ul>
          <Link
            href="/abonnement?plan=mensuel"
            className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg text-center font-bold hover:bg-red-700 transition block"
          >
            S&apos;abonner
          </Link>
        </div>

        {/* Annuel */}
        <div className="border-2 border-red-600 rounded-xl p-8 flex flex-col">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm self-start">
            Recommandé
          </span>
          <h3 className="text-2xl font-bold mt-4">Annuel</h3>
          <div className="text-4xl font-bold mt-4">50 000 FCFA</div>
          <p className="text-gray-500">par an</p>
          <ul className="mt-6 space-y-3 flex-1">
            <li>✓ Journal quotidien</li>
            <li>✓ Articles Premium</li>
            <li>✓ Archives complètes</li>
            <li>✓ Magazine Premium</li>
            <li>✓ Accès anticipé</li>
          </ul>
          <Link
            href="/abonnement?plan=annuel"
            className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg text-center font-bold hover:bg-red-700 transition block"
          >
            S&apos;abonner
          </Link>
        </div>

        {/* Entreprise */}
        <div className="border rounded-xl p-8 flex flex-col">
          <h3 className="text-2xl font-bold">Entreprise</h3>
          <div className="text-2xl font-bold mt-4">180 000 FCFA</div>
          <p className="text-gray-500">5 utilisateurs</p>
          <div className="text-xl font-bold mt-4">450 000 FCFA</div>
          <p className="text-gray-500">10 utilisateurs</p>
          <ul className="mt-6 space-y-3 flex-1">
            <li>✓ Tout le plan Annuel</li>
            <li>✓ Comptes simultanés</li>
            <li>✓ Facturation entreprise</li>
            <li>✓ Support dédié</li>
          </ul>
          <Link
            href="/abonnement?plan=entreprise"
            className="w-full mt-8 bg-red-600 text-white py-3 rounded-lg text-center font-bold hover:bg-red-700 transition block"
          >
            Demander une offre
          </Link>
        </div>

      </div>

    </section>
  );
}
