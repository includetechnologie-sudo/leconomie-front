"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const RAISON_MESSAGES: Record<string, string> = {
  acces_reserve: "Connectez-vous pour accéder à cette page.",
  session_expiree: "Votre session a expiré. Veuillez vous reconnecter.",
  session_invalide: "Session invalide. Veuillez vous reconnecter.",
};

export default function ConnexionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raison = searchParams.get("raison");
    if (raison && RAISON_MESSAGES[raison]) {
      setError(RAISON_MESSAGES[raison]);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.refresh();
        router.push(data.redirect || "/mon-compte");
      } else if (data.redirect_to_subscribe) {
        router.push("/abonnement?raison=pas_de_compte");
      } else {
        setError(data.error || "Identifiants incorrects.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="font-serif text-2xl font-bold text-center mb-1">Connexion</h1>
          <p className="text-gray-500 text-sm text-center mb-7">
            Accédez au meilleur de l&apos;information en vous connectant à votre compte
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse email <span className="text-red-600">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail" autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe <span className="text-red-600">*</span>
              </label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe" autoComplete="current-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded" />
                <span className="text-sm text-gray-600">Rester connecté</span>
              </label>
              <button type="button" className="text-sm text-gray-500 hover:text-red-600 transition">
                Mot de passe oublié ?
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Connexion en cours…
                </span>
              ) : "Connectez-vous"}
            </button>
          </form>
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Pas de compte ?{" "}
            <Link href="/abonnement" className="font-bold text-red-600 hover:underline">Inscrivez-vous</Link>
          </p>
        </div>
      </div>
      <div className="text-center pb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-red-600 transition flex items-center justify-center gap-1.5">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Retourner à la page d&apos;accueil
        </Link>
      </div>
      <p className="text-center text-xs text-gray-400 pb-6">© Copyright L&apos;Économie 2026. Tous Droits Réservés.</p>
    </div>
  );
}
