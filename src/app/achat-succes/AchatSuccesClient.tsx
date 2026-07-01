"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type State = "loading" | "ok" | "error";

export default function AchatSuccesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [info, setInfo] = useState({ titre: "", id: 0, type: "" });

  useEffect(() => {
    const ref   = searchParams.get("app_transaction_ref") || searchParams.get("ref") || "";
    const email = searchParams.get("customer_email") || searchParams.get("email") || "";
    const name  = searchParams.get("customer_name") || searchParams.get("name") || "";
    const id    = Number(searchParams.get("item_id") || 0);
    const type  = (searchParams.get("item_type") || "journal") as "journal" | "magazine";
    const titre = searchParams.get("item_titre") || searchParams.get("titre") || "";

    if (!ref || !email || !id) {
      setState("error");
      return;
    }

    setInfo({ titre, id, type });

    fetch("/api/achat/confirmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, id, type, titre, ref }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setState("ok");
        } else {
          setState("error");
        }
      })
      .catch(() => setState("error"));
  }, [searchParams]);

  // Redirige vers /mon-compte après 4s
  useEffect(() => {
    if (state !== "ok") return;
    const t = setTimeout(() => router.push("/mon-compte#achats"), 4000);
    return () => clearTimeout(t);
  }, [state, router]);

  if (state === "loading") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Confirmation de l&apos;achat…</p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border shadow-lg p-10">
          <p className="text-gray-600 mb-4">Achat reçu. Connectez-vous pour accéder à votre numéro.</p>
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

        <div className="text-center bg-white rounded-2xl border shadow-lg p-8 mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Achat confirmé !</h1>
          <p className="text-gray-500 text-sm mb-4">Votre numéro est disponible dans votre espace.</p>
          {info.titre && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <p className="text-sm font-bold text-red-600">{info.titre}</p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">{info.type}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 mb-1">Redirection vers votre espace dans quelques secondes…</p>
        </div>

        <div className="flex flex-col gap-2">
          {info.id > 0 && (
            <Link href={`/lecture/${info.id}`}
              className="block w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-center text-sm">
              Lire maintenant →
            </Link>
          )}
          <Link href="/mon-compte#achats"
            className="block w-full border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition text-center text-sm">
            Voir mes achats
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
