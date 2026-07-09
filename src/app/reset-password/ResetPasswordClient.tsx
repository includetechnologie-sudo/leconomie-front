"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type Step = "request" | "sent" | "reset" | "done" | "error";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [step, setStep] = useState<Step>(token ? "reset" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) setStep("reset");
  }, [token]);

  async function handleRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await fetch("/api/compte/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStep("sent");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (password.length < 6) { setError("Minimum 6 caractères."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/compte/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep("done");
        setTimeout(() => router.push("/connexion"), 3000);
      } else {
        setError(data.error || "Erreur. Refaites une demande.");
        if (res.status === 410 || res.status === 404) setStep("error");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
        </div>

        {/* Étape 1 : Demande */}
        {step === "request" && (
          <form onSubmit={handleRequest} className="space-y-4">
            <p className="text-gray-500 text-sm text-center mb-4">
              Entrez votre adresse email. Nous vous enverrons un lien pour créer un nouveau mot de passe.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="votre@email.com" autoComplete="email"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60 text-sm">
              {loading ? "Envoi en cours…" : "Envoyer le lien de réinitialisation"}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/connexion" className="text-red-600 hover:underline font-semibold">← Retour à la connexion</Link>
            </p>
          </form>
        )}

        {/* Étape 2 : Email envoyé */}
        {step === "sent" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Email envoyé !</h2>
            <p className="text-gray-500 text-sm">
              Si un compte existe avec l&apos;adresse <strong>{email}</strong>, vous recevrez un email avec un lien de réinitialisation valable <strong>1 heure</strong>.
            </p>
            <p className="text-gray-400 text-xs">Vérifiez aussi votre dossier spam.</p>
            <Link href="/connexion" className="block w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition text-sm text-center">
              Retour à la connexion
            </Link>
          </div>
        )}

        {/* Étape 3 : Nouveau mot de passe */}
        {step === "reset" && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-gray-500 text-sm text-center mb-2">Choisissez un nouveau mot de passe.</p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nouveau mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                placeholder="Minimum 6 caractères" autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                placeholder="Répétez votre mot de passe" autoComplete="new-password"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" />
            </div>
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60 text-sm">
              {loading ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        )}

        {/* Étape 4 : Succès */}
        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Mot de passe créé !</h2>
            <p className="text-gray-500 text-sm">Redirection vers la page de connexion…</p>
            <Link href="/connexion" className="block w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm text-center">
              Se connecter →
            </Link>
          </div>
        )}

        {/* Erreur token expiré */}
        {step === "error" && (
          <div className="text-center space-y-4">
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-3 rounded-lg">{error}</p>
            <button onClick={() => setStep("request")}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition text-sm">
              Faire une nouvelle demande
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
