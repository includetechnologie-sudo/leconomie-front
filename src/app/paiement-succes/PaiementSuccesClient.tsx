"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import CreatePasswordForm from "./CreatePasswordForm";

type State = "loading" | "new" | "existing" | "error";

export default function PaiementSuccesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [info, setInfo] = useState({ email: "", plan: "", ref: "", planLabel: "" });

  useEffect(() => {
    const ref   = searchParams.get("app_transaction_ref") || searchParams.get("ref") || searchParams.get("transaction_ref") || "";
    const email = searchParams.get("customer_email") || searchParams.get("email") || "";
    const name  = searchParams.get("customer_name") || searchParams.get("name") || "";

    if (!ref || !email) {
      setState("error");
      return;
    }

    // Détecter achat unitaire : leco-achat-{id}-{type}-{timestamp}
    const isAchatUnitaire = ref.startsWith("leco-achat-");
    if (isAchatUnitaire) {
      // leco-achat-3512-journal-1234567890
      const parts = ref.split("-"); // ["leco","achat","{id}","{type}","{ts}"]
      const id = Number(parts[2] || 0);
      const type = (parts[3] || "journal") as "journal" | "magazine";
      const titre = searchParams.get("titre") || `Numéro ${id}`;

      setInfo({ email, plan: "achat", ref, planLabel: titre });

      fetch("/api/achat/confirmer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, id, type, titre, ref }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setState("existing");
          } else {
            setState("error");
          }
        })
        .catch(() => setState("error"));
      return;
    }

    // Abonnement classique
    const rawPlan = searchParams.get("plan") || ref.split("-")[1] || "mensuel";
    const plan = ["mensuel", "annuel"].includes(rawPlan) ? rawPlan : "mensuel";
    const planLabel = plan === "annuel" ? "Annuel — 50 000 FCFA/an" : "Mensuel — 5 000 FCFA/mois";

    setInfo({ email, plan, ref, planLabel });

    fetch("/api/abonnement/confirmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, plan, ref }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.hasPassword) {
          setState("existing");
        } else {
          setState("new");
        }
      })
      .catch(() => setState("error"));
  }, [searchParams]);

  // Abonné existant : redirige automatiquement vers l'espace après 3 s
  useEffect(() => {
    if (state !== "existing") return;
    const t = setTimeout(() => router.push("/mon-compte"), 3000);
    return () => clearTimeout(t);
  }, [state, router]);

  if (state === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Confirmation du paiement…</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border shadow-lg p-10">
          <p className="text-gray-600 mb-4">Paiement reçu. Connectez-vous pour accéder à votre espace.</p>
          <Link href="/connexion" className="block w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">

        {/* Confirmation */}
        <div className="text-center bg-white rounded-2xl border shadow-lg p-8 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Paiement confirmé !</h1>
          <p className="text-gray-500 text-sm mb-4">
            {info.plan === "achat" ? "Votre numéro est disponible dans votre espace." : "Bienvenue dans L’Économie Premium."}
          </p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
            <p className="text-sm font-bold text-red-600">{info.planLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {info.plan === "achat" ? "Achat à l'unité" : info.plan === "annuel" ? "Accès valable 12 mois" : "Accès valable 1 mois"}
            </p>
          </div>
          {info.email && <p className="text-sm text-gray-500 mb-1">Confirmation envoyée à <strong>{info.email}</strong></p>}
          {info.ref   && <p className="text-xs text-gray-400">Référence : {info.ref}</p>}
        </div>

        {/* Compte existant */}
        {state === "existing" ? (
          <div className="bg-white rounded-2xl border shadow-sm p-6 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">Abonnement mis à jour</p>
            <p className="text-sm text-gray-500 mb-2">Redirection vers votre espace…</p>
            <p className="text-xs text-gray-400 mb-4">Vous serez redirigé automatiquement dans quelques secondes.</p>
            <Link href="/mon-compte"
              className="block w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm">
              Accéder à mon espace →
            </Link>
          </div>
        ) : (
          /* Nouveau compte → créer mot de passe */
          <div className="bg-white rounded-2xl border shadow-lg p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center shrink-0">
                <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">Créez votre mot de passe</h2>
                <p className="text-xs text-gray-500">Pour accéder à votre espace abonné</p>
              </div>
            </div>
            <CreatePasswordForm email={info.email} token={info.ref} />
          </div>
        )}

        <div className="flex flex-col gap-2 mt-4">
          <Link href="/lecture"
            className="block w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition text-center text-sm">
            Accéder au journal maintenant
          </Link>
          <Link href="/"
            className="block w-full text-gray-400 hover:text-red-600 transition text-center text-xs py-1">
            Retour à l&apos;accueil
          </Link>
        </div>

      </div>
    </div>
  );
}
