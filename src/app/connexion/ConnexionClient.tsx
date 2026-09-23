"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const RAISON_MESSAGES: Record<string, string> = {
  acces_reserve: "Connectez-vous pour accéder à cette page.",
  session_expiree: "Votre session a expiré. Veuillez vous reconnecter.",
  session_invalide: "Session invalide. Veuillez vous reconnecter.",
  lien_invalide: "Ce lien de connexion est invalide.",
  lien_expire: "Ce lien de connexion a expiré ou a déjà été utilisé. Redemandez-en un.",
};

export default function ConnexionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

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
        window.location.href = data.redirect || "/mon-compte";
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

  async function handleMagicLink(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    if (!email) { setError("Entrez votre adresse email."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/lien-magique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setMagicSent(true);
      } else {
        setError("Erreur lors de l'envoi. Veuillez réessayer.");
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
          <p className="text-gray-500 text-sm text-center mb-6">
            Accédez au meilleur de l&apos;information en vous connectant à votre compte
          </p>

          {/* Onglets : lien magique (par défaut) / mot de passe */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode("magic"); setError(""); setMagicSent(false); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition ${mode === "magic" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
            >
              Lien de connexion
            </button>
            <button
              type="button"
              onClick={() => { setMode("password"); setError(""); }}
              className={`flex-1 text-sm font-semibold py-2 rounded-md transition ${mode === "password" ? "bg-white text-red-600 shadow-sm" : "text-gray-500"}`}
            >
              Mot de passe
            </button>
          </div>

          {mode === "magic" ? (
            magicSent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/>
                  </svg>
                </div>
                <p className="font-bold text-gray-900 mb-1">Vérifiez votre boîte mail</p>
                <p className="text-sm text-gray-500">
                  Un lien de connexion a été envoyé à <strong>{email}</strong>. Cliquez dessus pour accéder à votre compte, valable 15 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setMagicSent(false)}
                  className="mt-4 text-sm text-red-600 font-semibold hover:underline"
                >
                  Renvoyer / changer d&apos;email
                </button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Adresse email <span className="text-red-600">*</span>
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse e-mail" autoComplete="email"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                    required />
                  <p className="text-xs text-gray-400 mt-1.5">Sans mot de passe — nous vous envoyons un lien de connexion par email.</p>
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
                      Envoi en cours…
                    </span>
                  ) : "Recevoir mon lien de connexion"}
                </button>
              </form>
            )
          ) : (
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
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe" autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                  required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded" />
                <span className="text-sm text-gray-600">Rester connecté</span>
              </label>
              <Link href="/reset-password" className="text-sm text-gray-500 hover:text-red-600 transition">
                Mot de passe oublié ?
              </Link>
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
          )}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-center text-sm text-gray-600">
            Pas de compte ?{" "}
            <Link href="/inscription" className="font-bold text-red-600 hover:underline">Créer un compte gratuit</Link>
            {" "}·{" "}
            <Link href="/abonnement" className="font-semibold text-gray-500 hover:text-red-600 transition">S&apos;abonner</Link>
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
      <p className="text-center text-xs text-gray-400 pb-6">© Copyright L&apos;Economie 2026. Tous Droits Réservés.</p>
    </div>
  );
}
