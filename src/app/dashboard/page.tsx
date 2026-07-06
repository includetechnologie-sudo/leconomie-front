"use client";

import { useState, useEffect, useCallback } from "react";

interface Stats {
  newsletter: { total: number; list: string[] };
  paiements: { total: number; revenus: number; mensuel: number; annuel: number; recent: { email?: string; plan?: string; amount?: number; date?: string }[] };
  devis: { total: number; recent: { nom?: string; entreprise?: string; effectif?: string; email?: string; date?: string }[] };
  articles: { total: number; recent: { title: string; date: string; slug: string }[] };
}

export default function DashboardPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "newsletter" | "paiements" | "devis" | "articles">("overview");

  const fetchStats = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/stats", {
        headers: { "x-dashboard-token": t },
      });
      if (res.status === 401) { setError("Mot de passe incorrect"); setToken(""); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("dashboard_token");
    if (saved) { setToken(saved); fetchStats(saved); }
  }, [fetchStats]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("dashboard_token", password);
    setToken(password);
    await fetchStats(password);
  }

  function handleLogout() {
    sessionStorage.removeItem("dashboard_token");
    setToken(""); setStats(null); setPassword("");
  }

  function formatDate(iso?: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatAmount(n: number) {
    return n.toLocaleString("fr-FR") + " FCFA";
  }

  if (!token || !stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <h1 className="text-white font-bold text-xl">Dashboard Admin</h1>
            <p className="text-gray-500 text-sm mt-1">L&apos;Économie</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500"
              required
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "newsletter", label: `Newsletter (${stats.newsletter.total})` },
    { id: "paiements", label: `Paiements (${stats.paiements.total})` },
    { id: "devis", label: `Devis (${stats.devis.total})` },
    { id: "articles", label: `Articles (${stats.articles.total})` },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">É</span>
          </div>
          <span className="font-bold text-white">Dashboard Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => fetchStats(token)} className="text-gray-400 hover:text-white text-sm transition">
            ↺ Actualiser
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm transition">
            Déconnexion
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition
                ${activeTab === tab.id ? "border-red-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* VUE D'ENSEMBLE */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-lg font-bold mb-6">Vue d&apos;ensemble</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Abonnés newsletter", value: stats.newsletter.total, icon: "📧" },
                { label: "Paiements reçus", value: stats.paiements.total, icon: "💳" },
                { label: "Revenus totaux", value: formatAmount(stats.paiements.revenus), icon: "💰" },
                { label: "Demandes de devis", value: stats.devis.total, icon: "🏢" },
              ].map(card => (
                <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{card.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-widest">Abonnements par plan</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Mensuel</span>
                    <span className="font-bold text-white">{stats.paiements.mensuel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Annuel</span>
                    <span className="font-bold text-white">{stats.paiements.annuel}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-widest">Derniers articles</h3>
                <div className="space-y-2">
                  {stats.articles.recent.length === 0 && <p className="text-gray-600 text-sm">Aucun article</p>}
                  {stats.articles.recent.map((a, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <p className="text-sm text-gray-300 line-clamp-1 flex-1">{a.title}</p>
                      <span className="text-xs text-gray-600 shrink-0">{formatDate(a.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NEWSLETTER */}
        {activeTab === "newsletter" && (
          <div>
            <h2 className="text-lg font-bold mb-6">Abonnés newsletter — {stats.newsletter.total} inscrits</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.newsletter.list.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun abonné</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">#</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.newsletter.list.map((email, i) => (
                      <tr key={email} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-3 text-gray-500 text-sm">{i + 1}</td>
                        <td className="px-6 py-3 text-sm text-white">{email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* PAIEMENTS */}
        {activeTab === "paiements" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Paiements — {stats.paiements.total} transactions</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">{formatAmount(stats.paiements.revenus)}</div>
                <div className="text-xs text-gray-500">Revenus totaux</div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.paiements.recent.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun paiement enregistré</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Email</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Plan</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Montant</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.paiements.recent.map((p, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-3 text-sm text-white">{p.email || "—"}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.plan === "annuel" ? "bg-yellow-600 text-white" : "bg-blue-600 text-white"}`}>
                            {p.plan || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-green-400 font-mono">{p.amount ? formatAmount(p.amount) : "—"}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(p.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* DEVIS */}
        {activeTab === "devis" && (
          <div>
            <h2 className="text-lg font-bold mb-6">Demandes de devis — {stats.devis.total} demandes</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.devis.recent.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucune demande de devis</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Entreprise</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Contact</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Effectif</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.devis.recent.map((d, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-3 text-sm font-semibold text-white">{d.entreprise || "—"}</td>
                        <td className="px-6 py-3 text-sm text-gray-300">
                          <div>{d.nom}</div>
                          <div className="text-xs text-gray-500">{d.email}</div>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">{d.effectif || "—"}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(d.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ARTICLES */}
        {activeTab === "articles" && (
          <div>
            <h2 className="text-lg font-bold mb-6">Articles publiés — {stats.articles.total} articles</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.articles.recent.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun article</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Titre</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Date</th>
                      <th className="text-left px-6 py-3 text-xs text-gray-500 uppercase">Lien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.articles.recent.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-6 py-3 text-sm text-white">{a.title}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(a.date)}</td>
                        <td className="px-6 py-3 text-sm">
                          <a href={`https://leconomie.info/${a.slug}`} target="_blank" rel="noreferrer"
                            className="text-red-400 hover:underline text-xs">
                            Voir →
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
