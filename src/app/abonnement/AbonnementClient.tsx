"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PaymentMethodSelector, { MOBILE_MONEY_COUNTRIES, type PaymentMethod, type CountryOption } from "@/components/payment/PaymentMethodSelector";

const FEATURES_BASE = [
  "Articles gratuits",
  "Newsletters (Quotidiennes, Spéciales)",
  "Alertes infos",
  "Articles Prémiums",
  "Bihedomadaires numériques",
  "Magazine numériques",
  "Hors-séries numériques",
  "Bihedomadaires numériques en avant première",
  "Magazine numériques en avant première",
  "Hors-séries numériques en avant première",
  "Articles magazine",
];

interface Plan {
  id: string;
  label: string;
  price: number;
  priceDisplay: string;
  currency: string;
  period: string;
  featured: boolean;
  badge?: string;
  cta: string;
  activeFeatures: number;
  renewable?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "gratuit",
    label: "Gratuit",
    price: 0,
    priceDisplay: "0",
    currency: "FCFA",
    period: "",
    featured: false,
    cta: "Créer un compte",
    activeFeatures: 3,
    renewable: false,
  },
  {
    id: "mensuel",
    label: "Mensuel",
    price: 5000,
    priceDisplay: "5 000",
    currency: "FCFA",
    period: "/ mois",
    featured: true,
    badge: "LE PLUS POPULAIRE",
    cta: "Sélectionner",
    activeFeatures: FEATURES_BASE.length,
    renewable: true,
  },
  {
    id: "annuel",
    label: "Annuel",
    price: 50000,
    priceDisplay: "50 000",
    currency: "FCFA",
    period: "/ an",
    featured: false,
    cta: "Sélectionner",
    activeFeatures: FEATURES_BASE.length,
    renewable: true,
  },
];

export default function AbonnementClient() {
  const router = useRouter();
  const [step, setStep] = useState<"plans" | "checkout">("plans");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mobile");
  const [country, setCountry] = useState<CountryOption>(MOBILE_MONEY_COUNTRIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!email || !name) { setError("Veuillez remplir tous les champs."); return; }
    if (method === "mobile" && !phone) { setError("Veuillez renseigner votre numéro."); return; }
    if (!selectedPlan) return;
    setError("");
    setLoading(true);
    try {
      const fullPhone = method === "mobile" ? `${country.dial}${phone}` : "";
      const res = await fetch("/api/mycoolpay/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, name, phone: fullPhone,
          plan: selectedPlan.id,
          amount: selectedPlan.price,
          paymentMethod: method,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setError(data.error || "Erreur lors de l'initiation du paiement.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "checkout" && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-lg mx-auto px-4">
          <button
            onClick={() => setStep("plans")}
            className="text-sm text-gray-500 hover:text-red-600 transition mb-8 flex items-center gap-1"
          >
            ← Retour aux abonnements
          </button>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="text-center mb-6">
              <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                Plan {selectedPlan.label}
              </span>
              <div className="text-4xl font-bold text-red-600">
                {selectedPlan.priceDisplay} <span className="text-xl font-medium text-gray-500">{selectedPlan.currency}</span>
              </div>
              {selectedPlan.period && (
                <p className="text-gray-500 text-sm mt-1">{selectedPlan.period}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@exemple.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Méthode de paiement</label>
                <PaymentMethodSelector
                  method={method}
                  onMethodChange={setMethod}
                  country={country}
                  onCountryChange={setCountry}
                  phone={phone}
                  onPhoneChange={setPhone}
                />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2"
              >
                {loading ? "Redirection en cours…" : `Payer ${selectedPlan.priceDisplay} ${selectedPlan.currency}`}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              Paiement sécurisé via MyCoolPay · Mobile Money · Carte bancaire
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-red-600 transition inline-block mb-4">
            ← Retour à l&apos;accueil
          </Link>
          <h1 className="font-serif text-4xl font-bold mb-2">Nos Abonnements</h1>
          <div className="w-16 h-1 bg-red-600 mx-auto mb-4 rounded" />
          <button className="text-sm text-red-600 hover:underline flex items-center gap-1 mx-auto">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
            </svg>
            Pourquoi s&apos;abonner ?
          </button>
        </div>
      </div>

      {/* Grille plans */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl flex flex-col overflow-hidden transition
                ${plan.featured
                  ? "border-2 border-red-600 shadow-xl"
                  : "border border-gray-200 shadow-sm"
                }`}
            >
              {/* Badge MOST POPULAR */}
              {plan.badge && (
                <div className="bg-red-600 text-white text-xs font-bold text-center py-2 uppercase tracking-widest">
                  {plan.badge}
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Titre + prix */}
                <h2 className="font-serif text-2xl font-bold mb-1">{plan.label}</h2>
                <div className={`text-4xl font-bold mt-2 ${plan.featured ? "text-red-600" : "text-red-600"}`}>
                  {plan.priceDisplay} <span className="text-lg font-semibold text-gray-500">{plan.currency}</span>
                </div>
                {plan.period && <p className="text-gray-400 text-sm mb-1">{plan.period}</p>}

                {/* Liste features */}
                <ul className="mt-6 space-y-2.5 flex-1">
                  {FEATURES_BASE.map((feature, i) => {
                    const active = i < plan.activeFeatures;
                    return (
                      <li key={feature} className={`flex items-start gap-2.5 text-sm ${active ? "text-gray-700" : "text-gray-300 line-through"}`}>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24"
                          fill="none" stroke={active ? "#dc2626" : "#d1d5db"}
                          strokeWidth="2.5" className="shrink-0 mt-0.5"
                        >
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="9 12 11 14 15 10"/>
                        </svg>
                        {feature}
                      </li>
                    );
                  })}
                </ul>

                {/* Renewable note */}
                {plan.renewable !== undefined && (
                  <p className="text-xs text-gray-400 text-center mt-5">
                    {plan.renewable ? "✓ Renouvelable · Sans engagement" : ""}
                  </p>
                )}

                {/* CTA */}
                <button
                  onClick={() => {
                    if (plan.id === "gratuit") { router.push("/inscription"); return; }
                    setSelectedPlan(plan);
                    setStep("checkout");
                  }}
                  className={`w-full mt-4 py-3 rounded-lg font-bold text-sm transition
                    ${plan.featured
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : plan.id === "gratuit"
                        ? "border border-red-600 text-red-600 hover:bg-red-50"
                        : "border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
                    }`}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bannière Entreprise */}
        <div className="mt-8 border border-red-200 rounded-2xl bg-white p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <svg width="24" height="24" fill="none" stroke="#dc2626" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="16"/>
              <line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-lg">Entreprise</h3>
            <p className="text-gray-500 text-sm mt-0.5">
              Ne mettez pas votre entreprise dans une boîte. Contactez-nous pour un plan tarifaire personnalisé qui correspond le mieux à vos besoins.
            </p>
          </div>
          <Link
            href="/abonnement/entreprise"
            className="shrink-0 border border-red-600 text-red-600 font-bold px-6 py-2.5 rounded-lg hover:bg-red-600 hover:text-white transition text-sm whitespace-nowrap"
          >
            Voir les offres
          </Link>
        </div>

        {/* Liens bas */}
        <div className="flex justify-center gap-6 mt-8 text-sm text-gray-400">
          <Link href="/connexion" className="hover:text-red-600 transition">J&apos;ai déjà un compte</Link>
          <Link href="/lecture" className="hover:text-red-600 transition">Accéder à mon espace</Link>
        </div>
      </div>
    </div>
  );
}
