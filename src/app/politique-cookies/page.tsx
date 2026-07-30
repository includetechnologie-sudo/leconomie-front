import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de cookies | L'Économie",
  description: "Découvrez comment L'Économie utilise les cookies pour améliorer votre expérience de navigation.",
};

export default function PolitiqueCookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Politique de cookies</h1>
        <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : Juillet 2026</p>

        <div className="prose prose-gray max-w-none text-sm leading-relaxed space-y-6">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
            <p className="text-gray-600">
              Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) lorsque vous visitez un site web.
              Les cookies permettent au site de mémoriser vos préférences et d&apos;améliorer votre expérience de navigation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">2. Les cookies que nous utilisons</h2>

            <h3 className="font-semibold text-gray-800 mt-5 mb-2">a) Cookies essentiels (toujours actifs)</h3>
            <p className="text-gray-600 mb-3">Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Cookie</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Finalité</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono">leconomie_session</td>
                    <td className="px-3 py-2">Authentification et session utilisateur</td>
                    <td className="px-3 py-2">7 jours / 30 jours</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono">leconomie_cookie_consent</td>
                    <td className="px-3 py-2">Mémoriser vos préférences de cookies</td>
                    <td className="px-3 py-2">6 mois</td>
                  </tr>
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono">next-*</td>
                    <td className="px-3 py-2">Fonctionnement du framework (cache, routage)</td>
                    <td className="px-3 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-800 mt-5 mb-2">b) Cookies analytiques</h3>
            <p className="text-gray-600 mb-3">Ces cookies nous aident à comprendre comment les visiteurs utilisent le site.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Service</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Finalité</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-700">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-t border-gray-100">
                    <td className="px-3 py-2 font-mono">OneSignal</td>
                    <td className="px-3 py-2">Notifications push, mesure d&apos;engagement</td>
                    <td className="px-3 py-2">Persistant</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-800 mt-5 mb-2">c) Cookies marketing</h3>
            <p className="text-gray-600">
              Ces cookies sont utilisés pour afficher des publicités pertinentes. Actuellement, L&apos;Économie n&apos;utilise pas de cookies marketing.
              Cette catégorie est prévue pour une utilisation future avec des régies publicitaires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">3. Comment gérer vos cookies ?</h2>
            <p className="text-gray-600">
              Lors de votre première visite, un bandeau vous permet de choisir quels cookies accepter.
              Vous pouvez modifier vos préférences à tout moment en supprimant vos données de navigation
              dans les paramètres de votre navigateur, ce qui réaffichera le bandeau de consentement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">4. Vos droits</h2>
            <p className="text-gray-600">
              Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification
              et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous à l&apos;adresse :
            </p>
            <p className="text-gray-800 font-semibold mt-2">contact@leconomie.info</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mt-8 mb-3">5. Modifications</h2>
            <p className="text-gray-600">
              Nous nous réservons le droit de modifier cette politique de cookies à tout moment.
              Les modifications entrent en vigueur dès leur publication sur cette page.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100">
          <Link href="/" className="text-red-600 hover:underline text-sm font-semibold">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </article>
    </div>
  );
}
