"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
  token: string;
}

export default function CreatePasswordForm({ email, token }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Minimum 6 caractères."); return; }
    if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/compte/creer-mot-de-passe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, token }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/mon-compte"), 2000);
      } else {
        setError(data.error || "Erreur lors de la création du mot de passe.");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <p className="font-bold text-gray-900 mb-1">Mot de passe créé !</p>
        <p className="text-sm text-gray-500">Redirection vers votre espace…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-500 mb-4">
          Email : <strong className="text-gray-800">{email}</strong>
        </p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Mot de passe <span className="text-red-600">*</span>
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 caractères"
          autoComplete="new-password"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Confirmer le mot de passe <span className="text-red-600">*</span>
        </label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Répétez votre mot de passe"
          autoComplete="new-password"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-200"
          required
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60 text-sm"
      >
        {loading ? "Enregistrement…" : "Créer mon mot de passe"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Vous pourrez vous connecter avec cet email et ce mot de passe à tout moment.
      </p>
    </form>
  );
}
