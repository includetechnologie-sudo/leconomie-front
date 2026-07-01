"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InscriptionClient() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) { setError("Veuillez remplir tous les champs."); return; }
    if (password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/compte/inscrire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/mon-compte";
      } else {
        setError(data.error || "Erreur lors de l'inscription.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-start justify-center px-4 pb-12 pt-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Badge gratuit */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Compte gratuit
            </span>
          </div>

          <h1 className="font-serif text-2xl font-bold text-center mb-1">Créer un compte</h1>
          <p className="text-gray-500 text-sm text-center mb-7">
            Accédez aux articles gratuits et aux newsletters de L&apos;Économie
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nom complet <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                autoComplete="name"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Adresse email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jean@exemple.com"
                autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Confirmer le mot de passe <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Création en cours…
                </span>
              ) : "Créer mon compte"}
            </button>
          </form>

          {/* Upgrade */}
          <div className="mt-6 bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-gray-800 mb-1">Accédez au journal complet</p>
            <p className="text-xs text-gray-500 mb-3">Abonnez-vous à partir de 5 000 FCFA/mois</p>
            <Link
              href="/abonnement"
              className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Voir les abonnements →
            </Link>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="font-bold text-red-600 hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 pb-6">© Copyright L&apos;Économie 2026. Tous Droits Réservés.</p>
    </div>
  );
}
