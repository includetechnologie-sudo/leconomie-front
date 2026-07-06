"use client";

import { useState } from "react";
import Link from "next/link";

const OFFRES = [
  {
    id: "5users",
    label: "Équipe",
    users: "5 utilisateurs",
    price: "20 000",
    priceSub: "FCFA / mois",
    saving: "Économisez 5 000 FCFA/mois vs individuel",
    features: [
      "5 comptes premium individuels",
      "Accès illimité articles & magazines",
      "Bihedomadaires & hors-séries numériques",
      "Newsletter quotidienne & spéciale",
      "Alertes infos personnalisées",
      "Tableau de bord administrateur",
      "Facturation mensuelle ou annuelle",
    ],
    featured: false,
  },
  {
    id: "10users",
    label: "Entreprise",
    users: "10 utilisateurs",
    price: "35 000",
    priceSub: "FCFA / mois",
    saving: "Économisez 15 000 FCFA/mois vs individuel",
    features: [
      "10 comptes premium individuels",
      "Accès illimité articles & magazines",
      "Bihedomadaires & hors-séries numériques",
      "Newsletter quotidienne & spéciale",
      "Alertes infos personnalisées",
      "Tableau de bord administrateur",
      "Support dédié prioritaire",
      "Facturation mensuelle ou annuelle",
      "Rapport mensuel de consultation",
    ],
    featured: true,
    badge: "LE PLUS AVANTAGEUX",
  },
  {
    id: "sur-mesure",
    label: "Sur-mesure",
    users: "+ de 10 utilisateurs",
    price: "Sur devis",
    priceSub: "",
    saving: "Tarif négocié selon vos besoins",
    features: [
      "Nombre d'utilisateurs illimité",
      "Toutes les fonctionnalités Entreprise",
      "Intégration intranet possible",
      "Account manager dédié",
      "Formation à la prise en main",
      "Contrat personnalisé",
    ],
    featured: false,
  },
];

export default function EntreprisePage() {
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    nom: "", email: "", telephone: "", entreprise: "", poste: "", effectif: "", message: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function selectOffer(id: string) {
    setSelectedOffer(id);
    const effectifMap: Record<string, string> = {
      "5users": "5 utilisateurs",
      "10users": "10 utilisateurs",
      "sur-mesure": "Plus de 10 utilisateurs",
    };
    setForm(prev => ({ ...prev, effectif: effectifMap[id] || "" }));
    document.getElementById("formulaire-devis")?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/abonnement" className="text-sm text-gray-400 hover:text-red-600 transition inline-block mb-4">
            ← Retour aux abonnements
          </Link>
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            </svg>
            Offre Entreprise
          </div>
          <h1 className="font-serif text-4xl font-bold mb-3">Abonnements multi-utilisateurs</h1>
          <div className="w-16 h-1 bg-red-600 mx-auto mb-4 rounded" />
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Donnez à toute votre équipe un accès à l&apos;information économique de référence en Afrique centrale.
            Choisissez l&apos;offre adaptée et recevez un devis personnalisé.
          </p>
        </div>
      </div>

      {/* Offres */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {OFFRES.map((offre) => (
            <div
              key={offre.id}
              className={`relative bg-white rounded-2xl flex flex-col overflow-hidden transition
                ${offre.featured ? "border-2 border-red-600 shadow-xl" : "border border-gray-200 shadow-sm"}
                ${selectedOffer === offre.id ? "ring-2 ring-red-400 ring-offset-2" : ""}
              `}
            >
              {offre.badge && (
                <div className="bg-red-600 text-white text-xs font-bold text-center py-2 uppercase tracking-widest">
                  {offre.badge}
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="mb-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{offre.users}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">{offre.label}</h2>
                <div className="text-4xl font-bold text-red-600 mt-1">
                  {offre.price}
                  {offre.priceSub && (
                    <span className="text-lg font-medium text-gray-400 ml-1">{offre.priceSub}</span>
                  )}
                </div>
                <p className="text-xs text-green-600 font-semibold mt-1 mb-4">{offre.saving}</p>

                <ul className="space-y-2.5 flex-1">
                  {offre.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" className="shrink-0 mt-0.5">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="9 12 11 14 15 10"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectOffer(offre.id)}
                  className={`w-full mt-6 py-3 rounded-lg font-bold text-sm transition
                    ${offre.featured
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    }
                    ${selectedOffer === offre.id ? "opacity-70 cursor-default" : ""}
                  `}
                >
                  {selectedOffer === offre.id ? "Sélectionné ✓" : "Demander un devis"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulaire devis */}
        <div id="formulaire-devis" className="mt-14 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="font-serif text-2xl font-bold mb-1">Demande de devis</h2>
          <p className="text-gray-500 text-sm mb-6">
            Remplissez ce formulaire et notre équipe commerciale vous répond sous 24h.
          </p>

          {status === "success" ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2">Demande envoyée !</h3>
              <p className="text-gray-500 text-sm">Notre équipe commerciale vous contactera dans les 24h.</p>
              <Link href="/abonnement" className="inline-block mt-6 text-sm text-red-600 hover:underline">
                ← Retour aux abonnements
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet *</label>
                <input
                  name="nom" value={form.nom} onChange={handleChange} required
                  placeholder="Jean Dupont"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email professionnel *</label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange} required
                  placeholder="jean@entreprise.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Entreprise *</label>
                <input
                  name="entreprise" value={form.entreprise} onChange={handleChange} required
                  placeholder="Nom de votre entreprise"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Poste / Fonction</label>
                <input
                  name="poste" value={form.poste} onChange={handleChange}
                  placeholder="Directeur Général, DRH…"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  name="telephone" type="tel" value={form.telephone} onChange={handleChange}
                  placeholder="+237 6XX XXX XXX"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre d&apos;utilisateurs *</label>
                <select
                  name="effectif" value={form.effectif} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 bg-white"
                >
                  <option value="">Sélectionner…</option>
                  <option value="5 utilisateurs">5 utilisateurs</option>
                  <option value="10 utilisateurs">10 utilisateurs</option>
                  <option value="Plus de 10 utilisateurs">Plus de 10 utilisateurs</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message (optionnel)</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange} rows={3}
                  placeholder="Précisez vos besoins, contraintes budgétaires, délais…"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200 resize-none"
                />
              </div>

              {status === "error" && (
                <div className="sm:col-span-2">
                  <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    Une erreur est survenue. Veuillez réessayer ou nous écrire à leconomieinfo@gmail.com
                  </p>
                </div>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {status === "loading" ? "Envoi en cours…" : "Envoyer ma demande de devis"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Liens bas */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-gray-400">
          <Link href="/abonnement" className="hover:text-red-600 transition">Abonnement individuel</Link>
          <Link href="/contact" className="hover:text-red-600 transition">Nous contacter</Link>
        </div>
      </div>
    </div>
  );
}
