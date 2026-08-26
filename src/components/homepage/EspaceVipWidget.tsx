"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EspaceVipWidget() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cookie = document.cookie.split(";").find((c) => c.trim().startsWith("abonne_access="));
    setConnected(!!cookie);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/espace-vip";
      } else {
        setError(data.error || "Identifiants incorrects.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  if (connected === null) return null;

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-[#c9a84c] shadow-lg">
      {/* En-tête doré */}
      <div className="bg-[#c9a84c] px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <svg width="20" height="20" fill="none" stroke="#000" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="font-serif font-bold text-black text-sm uppercase tracking-widest">Espace VIP</span>
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#fdf8ec] to-white p-5">
        {connected ? (
          /* Cas B — Connecté */
          <div className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
              <svg width="28" height="28" fill="none" stroke="#c9a84c" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Bienvenue dans votre espace exclusif
            </p>
            <Link
              href="/espace-vip"
              className="block w-full bg-[#c9a84c] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#b8943f] transition text-center shadow-md"
            >
              Accédez à l&apos;espace VIP
            </Link>
          </div>
        ) : (
          /* Cas A — Non connecté */
          <form onSubmit={handleLogin} className="space-y-3">
            {/* Icône utilisateur */}
            <div className="flex justify-center mb-1">
              <div className="w-12 h-12 rounded-full bg-[#c9a84c]/15 flex items-center justify-center border-2 border-[#c9a84c]/40">
                <svg width="24" height="24" fill="none" stroke="#c9a84c" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                User
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full border border-[#c9a84c]/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/30 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                MDP
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full border border-[#c9a84c]/40 rounded-lg px-3 py-2 pr-9 text-sm focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c]/30 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#c9a84c]"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a84c] text-black font-bold py-2.5 rounded-xl text-sm hover:bg-[#b8943f] transition disabled:opacity-60 shadow-md"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <div className="flex justify-between text-[10px] pt-1">
              <Link href="/inscription" className="text-[#c9a84c] hover:underline font-semibold">
                Créer un compte
              </Link>
              <Link href="/reset-password" className="text-gray-400 hover:text-[#c9a84c]">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}