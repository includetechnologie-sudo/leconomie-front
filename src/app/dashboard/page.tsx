"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Achat { id: number; type: string; titre: string; ref: string; acheteLe: number; email?: string; name?: string; }
interface Abonne { email?: string; name?: string; plan?: string; createdAt?: number; expiresAt?: number; achats?: Achat[]; }
interface Paiement { email?: string; plan?: string; amount?: number; date?: string; type?: string; titre?: string; reference?: string; note?: string; }
interface Subscriber { email?: string; token?: string; createdAt?: number; }

interface Stats {
  newsletter: { total: number; list: (string | Subscriber)[] };
  paiements: {
    total: number; revenus: number; mensuel: number; annuel: number;
    achatsJournal: number; achatsMagazine: number;
    recent: Paiement[];
    recentAbonnements: Paiement[]; recentJournal: Paiement[]; recentMagazine: Paiement[];
    listeAchatsJournal: Achat[]; listeAchatsMagazine: Achat[];
  };
  abonnes: { total: number; list: Abonne[] };
  devis: { total: number; recent: { nom?: string; entreprise?: string; effectif?: string; email?: string; date?: string }[] };
  articles: { total: number; recent: { title: string; date: string; slug: string }[] };
  visits: { total: number; today: number; last7: { date: string; count: number }[]; online: number };
  topArticles: { slug: string; views: number }[];
}

type Tab = "overview" | "newsletter" | "abonnements" | "gerer-abonnes" | "achats-journal" | "achats-magazine" | "devis" | "articles" | "visiteurs" | "top-articles" | "settings";

function fmt(n: number) { return n.toLocaleString("fr-FR") + " FCFA"; }
function fmtDate(iso?: string | number) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function BarChart({ data, color = "#3b82f6" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[10px] text-gray-500">{d.value || ""}</span>
          <div className="w-full rounded-t transition-all" style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%`, backgroundColor: d.value > 0 ? color : "#374151" }} />
          <span className="text-[9px] text-gray-600 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color = "red" }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) {
  const colors: Record<string, string> = { red: "bg-red-600", blue: "bg-blue-600", green: "bg-green-600", yellow: "bg-yellow-500", purple: "bg-purple-600", teal: "bg-teal-600" };
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 ${colors[color] || colors.red} rounded-lg flex items-center justify-center text-lg shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white leading-tight">{value}</div>
        <div className="text-gray-400 text-xs mt-0.5">{label}</div>
        {sub && <div className="text-gray-600 text-[10px] mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const c: Record<string, string> = {
    blue: "bg-blue-600/20 text-blue-400 border border-blue-600/30",
    yellow: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/30",
    green: "bg-green-600/20 text-green-400 border border-green-600/30",
    red: "bg-red-600/20 text-red-400 border border-red-600/30",
    gray: "bg-gray-700 text-gray-300 border border-gray-600",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c[color] || c.gray}`}>{children}</span>;
}

export default function DashboardPage() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [online, setOnline] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const uidRef = useRef<string>("");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [recapStatus, setRecapStatus] = useState<string>("");

  // Gérer abonnés
  const [gAbEmail, setGAbEmail] = useState("");
  const [gAbName, setGAbName] = useState("");
  const [gAbPlan, setGAbPlan] = useState<"annuel" | "mensuel">("annuel");
  const [gAbMsg, setGAbMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [gAbLoading, setGAbLoading] = useState(false);
  const [gAbSearch, setGAbSearch] = useState("");

  const fetchStats = useCallback(async (t: string) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/dashboard/stats", { headers: { "x-dashboard-token": t } });
      if (res.status === 401) { setError("Mot de passe incorrect"); setToken(""); return; }
      const data = await res.json();
      setStats(data);
      setOnline(data.visits?.online || 0);
    } catch { setError("Erreur de connexion"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    uidRef.current = Math.random().toString(36).slice(2);
    const saved = sessionStorage.getItem("dashboard_token");
    if (saved) { setToken(saved); fetchStats(saved); }
  }, [fetchStats]);

  // Heartbeat visiteur + refresh online toutes les 15s
  useEffect(() => {
    if (!token) return;
    const beat = async () => {
      try {
        const r = await fetch("/api/online", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: uidRef.current }) });
        const d = await r.json();
        setOnline(d.online || 0);
      } catch {}
    };
    beat();
    const iv = setInterval(beat, 15000);
    return () => clearInterval(iv);
  }, [token]);

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pwNew !== pwConfirm) { setPwMsg({ type: "err", text: "Les deux nouveaux mots de passe ne correspondent pas" }); return; }
    if (pwNew.length < 6) { setPwMsg({ type: "err", text: "Mot de passe trop court (minimum 6 caractères)" }); return; }
    setPwLoading(true); setPwMsg(null);
    try {
      const res = await fetch("/api/dashboard/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-dashboard-token": token },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      });
      const data = await res.json();
      if (!res.ok) { setPwMsg({ type: "err", text: data.error || "Erreur" }); return; }
      setPwMsg({ type: "ok", text: "Mot de passe modifié avec succès !" });
      sessionStorage.setItem("dashboard_token", pwNew);
      setToken(pwNew);
      setPwCurrent(""); setPwNew(""); setPwConfirm("");
    } catch { setPwMsg({ type: "err", text: "Erreur réseau" }); }
    finally { setPwLoading(false); }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    sessionStorage.setItem("dashboard_token", password);
    setToken(password);
    await fetchStats(password);
  }

  function handleLogout() {
    sessionStorage.removeItem("dashboard_token");
    setToken(""); setStats(null); setPassword("");
  }

  if (!token || !stats) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-2xl">E</span>
            </div>
            <h1 className="text-white font-bold text-xl">Dashboard Admin</h1>
            <p className="text-gray-500 text-sm mt-1">L&apos;Economie</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe" required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-red-500" />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-60">
              {loading ? "Connexion…" : "Accéder au dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Vue d'ensemble" },
    { id: "abonnements", label: "Abonnements", count: stats.paiements.mensuel + stats.paiements.annuel },
    { id: "achats-journal", label: "Achats Journal", count: stats.paiements.achatsJournal },
    { id: "achats-magazine", label: "Achats Magazine", count: stats.paiements.achatsMagazine },
    { id: "newsletter", label: "Newsletter", count: stats.newsletter.total },
    { id: "visiteurs", label: "Visiteurs", count: stats.visits.today },
    { id: "top-articles", label: "Top Articles" },
    { id: "articles", label: "Articles", count: stats.articles.total },
    { id: "devis", label: "Devis", count: stats.devis.total },
    { id: "gerer-abonnes", label: "Gérer Abonnés" },
    { id: "settings", label: "⚙ Paramètres" },
  ];

  const totalAbonnes = stats.paiements.mensuel + stats.paiements.annuel;
  const totalAchats = stats.paiements.achatsJournal + stats.paiements.achatsMagazine;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">E</span>
          </div>
          <span className="font-bold text-white text-sm">Dashboard Admin</span>
          <span className="hidden sm:flex items-center gap-1.5 bg-green-600/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-600/30">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {online} en ligne
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchStats(token)} className="text-gray-400 hover:text-white text-xs transition flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
            Actualiser
          </button>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 text-xs transition">Déconnexion</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 px-6">
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition flex items-center gap-1.5
                ${activeTab === tab.id ? "border-red-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── VUE D'ENSEMBLE ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Vue d&apos;ensemble</h2>
              <span className="text-gray-500 text-xs">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="👥" label="Abonnés actifs" value={totalAbonnes} sub={`${stats.paiements.mensuel} mensuel · ${stats.paiements.annuel} annuel`} color="red" />
              <StatCard icon="🛒" label="Achats à l'unité" value={totalAchats} sub={`${stats.paiements.achatsJournal} journaux · ${stats.paiements.achatsMagazine} magazines`} color="blue" />
              <StatCard icon="💰" label="Revenus totaux" value={fmt(stats.paiements.revenus)} color="green" />
              <StatCard icon="🟢" label="En ligne maintenant" value={online} sub="visiteurs actifs" color="teal" />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="📧" label="Abonnés newsletter" value={stats.newsletter.total} color="purple" />
              <StatCard icon="👁️" label="Visiteurs aujourd'hui" value={stats.visits.today} sub={`${stats.visits.total} au total`} color="blue" />
              <StatCard icon="📰" label="Articles publiés" value={stats.articles.total} color="yellow" />
              <StatCard icon="🏢" label="Demandes de devis" value={stats.devis.total} color="purple" />
            </div>

            {/* Bouton récap newsletter */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-300">Newsletter récapitulative</h3>
                <p className="text-gray-500 text-xs mt-1">Envoyer les 5 derniers articles à tous les abonnés + newsletter</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm("Envoyer le récapitulatif des derniers articles à TOUS les abonnés et inscrits newsletter ?")) return;
                  setRecapStatus("loading");
                  try {
                    const res = await fetch("/api/newsletter/recap", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "x-dashboard-token": token },
                      body: JSON.stringify({ broadcast: true }),
                    });
                    const data = await res.json();
                    if (res.ok) setRecapStatus(`ok:${data.total}`);
                    else setRecapStatus(`err:${data.error}`);
                  } catch { setRecapStatus("err:Erreur réseau"); }
                }}
                disabled={recapStatus === "loading"}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition whitespace-nowrap"
              >
                {recapStatus === "loading" ? "Envoi en cours..." : "Envoyer le récap"}
              </button>
            </div>
            {recapStatus && recapStatus !== "loading" && (
              <p className={`text-sm ${recapStatus.startsWith("ok") ? "text-green-400" : "text-red-400"}`}>
                {recapStatus.startsWith("ok") ? `Envoi lancé à ${recapStatus.split(":")[1]} destinataires (arrière-plan)` : recapStatus.split(":")[1]}
              </p>
            )}

            {/* Graphique visiteurs */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-gray-300">Visiteurs — 7 derniers jours</h3>
                <span className="text-blue-400 font-bold text-lg">{stats.visits.today} auj.</span>
              </div>
              <BarChart color="#3b82f6" data={stats.visits.last7.map(d => ({
                label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
                value: d.count,
              }))} />
            </div>

            {/* Répartition revenus */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Abonnements</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                      <span className="text-sm text-gray-300">Mensuel</span>
                    </div>
                    <span className="font-bold text-white text-lg">{stats.paiements.mensuel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                      <span className="text-sm text-gray-300">Annuel</span>
                    </div>
                    <span className="font-bold text-white text-lg">{stats.paiements.annuel}</span>
                  </div>
                  {/* Barre de progression */}
                  {totalAbonnes > 0 && (
                    <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(stats.paiements.mensuel / totalAbonnes) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Achats unitaires</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                      <span className="text-sm text-gray-300">Journal</span>
                    </div>
                    <span className="font-bold text-white text-lg">{stats.paiements.achatsJournal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                      <span className="text-sm text-gray-300">Magazine</span>
                    </div>
                    <span className="font-bold text-white text-lg">{stats.paiements.achatsMagazine}</span>
                  </div>
                  {totalAchats > 0 && (
                    <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.paiements.achatsJournal / totalAchats) * 100}%` }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Derniers articles</h3>
                <div className="space-y-2">
                  {stats.articles.recent.length === 0 && <p className="text-gray-600 text-sm">Aucun article</p>}
                  {stats.articles.recent.map((a, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-gray-700 text-xs mt-0.5 shrink-0">{i + 1}.</span>
                      <p className="text-xs text-gray-300 line-clamp-2 flex-1">{a.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top articles mini */}
            {stats.topArticles.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Top 5 articles les plus lus</h3>
                <div className="space-y-3">
                  {stats.topArticles.slice(0, 5).map((a, i) => {
                    const maxViews = stats.topArticles[0].views;
                    return (
                      <div key={a.slug} className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs font-bold w-4 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-300 truncate">{a.slug.replace(/-/g, " ")}</p>
                          <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 rounded-full" style={{ width: `${(a.views / maxViews) * 100}%` }} />
                          </div>
                        </div>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">{a.views}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABONNEMENTS ── */}
        {activeTab === "abonnements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Abonnements</h2>
              <div className="flex gap-3">
                <div className="text-center"><div className="text-2xl font-bold text-blue-400">{stats.paiements.mensuel}</div><div className="text-xs text-gray-500">Mensuel</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-yellow-400">{stats.paiements.annuel}</div><div className="text-xs text-gray-500">Annuel</div></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.abonnes.list.filter(a => a.plan === "mensuel" || a.plan === "annuel").length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun abonné payant pour le moment</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Abonné</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Plan</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Depuis</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Expiration</th>
                  </tr></thead>
                  <tbody>
                    {stats.abonnes.list.filter(a => a.plan === "mensuel" || a.plan === "annuel").map((a, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3">
                          <div className="text-sm text-white font-medium">{a.name || "—"}</div>
                          <div className="text-xs text-gray-500">{a.email}</div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge color={a.plan === "annuel" ? "yellow" : "blue"}>{a.plan}</Badge>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(a.createdAt)}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(a.expiresAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ACHATS JOURNAL ── */}
        {activeTab === "achats-journal" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Achats Journal à l&apos;unité</h2>
              <span className="text-2xl font-bold text-red-400">{stats.paiements.achatsJournal}</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.paiements.listeAchatsJournal.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun achat journal pour le moment</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Client</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Journal</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Moyen</th>
                  </tr></thead>
                  <tbody>
                    {stats.paiements.listeAchatsJournal.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3">
                          <div className="text-sm text-white">{a.name || "—"}</div>
                          <div className="text-xs text-gray-500">{a.email}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-300">{a.titre}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(a.acheteLe)}</td>
                        <td className="px-5 py-3"><Badge color="gray">Mobile Money</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ACHATS MAGAZINE ── */}
        {activeTab === "achats-magazine" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Achats Magazine à l&apos;unité</h2>
              <span className="text-2xl font-bold text-purple-400">{stats.paiements.achatsMagazine}</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.paiements.listeAchatsMagazine.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun achat magazine pour le moment</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Client</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Magazine</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Moyen</th>
                  </tr></thead>
                  <tbody>
                    {stats.paiements.listeAchatsMagazine.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3">
                          <div className="text-sm text-white">{a.name || "—"}</div>
                          <div className="text-xs text-gray-500">{a.email}</div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-300">{a.titre}</td>
                        <td className="px-5 py-3 text-sm text-gray-400">{fmtDate(a.acheteLe)}</td>
                        <td className="px-5 py-3"><Badge color="gray">Mobile Money</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        {activeTab === "newsletter" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Newsletter — {stats.newsletter.total} inscrits</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.newsletter.list.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucun abonné</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">#</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Inscrit le</th>
                  </tr></thead>
                  <tbody>
                    {stats.newsletter.list.map((item, i) => {
                      const email = typeof item === "string" ? item : (item as Subscriber).email || "—";
                      const date = typeof item === "object" && (item as Subscriber).createdAt ? fmtDate((item as Subscriber).createdAt) : "—";
                      return (
                        <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="px-5 py-3 text-gray-600 text-sm">{i + 1}</td>
                          <td className="px-5 py-3 text-sm text-white">{email}</td>
                          <td className="px-5 py-3 text-sm text-gray-500">{date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── VISITEURS ── */}
        {activeTab === "visiteurs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Visiteurs</h2>
              <div className="flex gap-4">
                <div className="text-center"><div className="text-2xl font-bold text-green-400 flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block" />{online}</div><div className="text-xs text-gray-500">En ligne</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-blue-400">{stats.visits.today}</div><div className="text-xs text-gray-500">Aujourd&apos;hui</div></div>
                <div className="text-center"><div className="text-2xl font-bold text-white">{stats.visits.total}</div><div className="text-xs text-gray-500">Total</div></div>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Visites — 7 derniers jours</h3>
              <BarChart color="#3b82f6" data={stats.visits.last7.map(d => ({
                label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
                value: d.count,
              }))} />
            </div>
          </div>
        )}

        {/* ── TOP ARTICLES ── */}
        {activeTab === "top-articles" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Articles les plus lus</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.topArticles.length === 0 ? (
                <p className="text-gray-500 text-sm p-6">Aucune donnée encore.</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">#</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Article</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Vues</th>
                  </tr></thead>
                  <tbody>
                    {stats.topArticles.map((a, i) => (
                      <tr key={a.slug} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3 text-gray-500 text-sm font-bold">{i + 1}</td>
                        <td className="px-5 py-3">
                          <a href={`https://leconomie.info/article/${a.slug}`} target="_blank" rel="noreferrer"
                            className="text-sm text-white hover:text-red-400 transition line-clamp-1">
                            {a.slug.replace(/-/g, " ")}
                          </a>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden max-w-[80px]">
                              <div className="h-full bg-red-600 rounded-full" style={{ width: `${(a.views / (stats.topArticles[0]?.views || 1)) * 100}%` }} />
                            </div>
                            <Badge color="blue">{a.views}</Badge>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── ARTICLES ── */}
        {activeTab === "articles" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Articles publiés — {stats.articles.total}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.articles.recent.length === 0 ? <p className="text-gray-500 text-sm p-6">Aucun article</p> : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Titre</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Lien</th>
                  </tr></thead>
                  <tbody>
                    {stats.articles.recent.map((a, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3 text-sm text-white">{a.title}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{fmtDate(a.date)}</td>
                        <td className="px-5 py-3">
                          <a href={`https://leconomie.info/article/${a.slug}`} target="_blank" rel="noreferrer" className="text-red-400 hover:underline text-xs">Voir →</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── DEVIS ── */}
        {activeTab === "devis" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Demandes de devis — {stats.devis.total}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {stats.devis.recent.length === 0 ? <p className="text-gray-500 text-sm p-6">Aucune demande</p> : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Entreprise</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Contact</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Effectif</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 uppercase">Date</th>
                  </tr></thead>
                  <tbody>
                    {stats.devis.recent.map((d, i) => (
                      <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="px-5 py-3 text-sm font-semibold text-white">{d.entreprise || "—"}</td>
                        <td className="px-5 py-3"><div className="text-sm text-gray-300">{d.nom}</div><div className="text-xs text-gray-500">{d.email}</div></td>
                        <td className="px-5 py-3"><Badge color="purple">{d.effectif || "—"}</Badge></td>
                        <td className="px-5 py-3 text-sm text-gray-500">{fmtDate(d.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── GERER ABONNES ── */}
        {activeTab === "gerer-abonnes" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Gérer les Abonnés</h2>

            {/* Formulaire ajout */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-xl">
              <h3 className="text-sm font-bold text-gray-300 mb-4">Ajouter un abonné</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!gAbEmail) return;
                setGAbLoading(true); setGAbMsg(null);
                try {
                  const res = await fetch("/api/dashboard/abonnes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "x-dashboard-token": token },
                    body: JSON.stringify({ email: gAbEmail, name: gAbName, plan: gAbPlan }),
                  });
                  const data = await res.json();
                  if (!res.ok) { setGAbMsg({ type: "err", text: data.error || "Erreur" }); return; }
                  setGAbMsg({ type: "ok", text: data.action === "upgraded" ? `${gAbEmail} mis à jour` : `${gAbEmail} ajouté — email envoyé${data.emailSent ? "" : " (échec email)"}` });
                  setGAbEmail(""); setGAbName("");
                  // Refresh la liste
                  const r2 = await fetch("/api/dashboard/stats", { headers: { "x-dashboard-token": token } });
                  if (r2.ok) { const d = await r2.json(); setStats(d); }
                } catch { setGAbMsg({ type: "err", text: "Erreur réseau" }); }
                finally { setGAbLoading(false); }
              }} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Email *</label>
                  <input type="email" required value={gAbEmail} onChange={e => setGAbEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nom</label>
                  <input type="text" value={gAbName} onChange={e => setGAbName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" placeholder="Nom complet" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Plan *</label>
                  <select value={gAbPlan} onChange={e => setGAbPlan(e.target.value as "annuel" | "mensuel")}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none">
                    <option value="annuel">Annuel (365 jours)</option>
                    <option value="mensuel">Mensuel (31 jours)</option>
                  </select>
                </div>
                <button type="submit" disabled={gAbLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition">
                  {gAbLoading ? "En cours..." : "Ajouter et envoyer l'email"}
                </button>
                {gAbMsg && (
                  <p className={`text-sm ${gAbMsg.type === "ok" ? "text-green-400" : "text-red-400"}`}>{gAbMsg.text}</p>
                )}
              </form>
            </div>

            {/* Liste des abonnés */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-300">Liste des abonnés ({stats?.abonnes?.list?.length || 0})</h3>
                <input type="text" value={gAbSearch} onChange={e => setGAbSearch(e.target.value)}
                  placeholder="Rechercher..." className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs w-48 focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-900">
                    <tr className="text-gray-500 border-b border-gray-800">
                      <th className="text-left py-2 px-2">Email</th>
                      <th className="text-left py-2 px-2">Nom</th>
                      <th className="text-left py-2 px-2">Plan</th>
                      <th className="text-left py-2 px-2">Expire le</th>
                      <th className="text-right py-2 px-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.abonnes?.list || [])
                      .filter(a => {
                        if (!gAbSearch) return true;
                        const s = gAbSearch.toLowerCase();
                        return (a.email || "").toLowerCase().includes(s) || (a.name || "").toLowerCase().includes(s);
                      })
                      .map((a, i) => (
                        <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-2 px-2 text-gray-300">{a.email}</td>
                          <td className="py-2 px-2 text-gray-400">{a.name || "—"}</td>
                          <td className="py-2 px-2">
                            <Badge color={a.plan === "annuel" ? "blue" : a.plan === "mensuel" ? "green" : "gray"}>
                              {a.plan || "gratuit"}
                            </Badge>
                          </td>
                          <td className="py-2 px-2 text-gray-400">{fmtDate(a.expiresAt)}</td>
                          <td className="py-2 px-2 text-right">
                            <button onClick={async () => {
                              if (!confirm(`Supprimer ${a.email} ?`)) return;
                              const res = await fetch("/api/dashboard/abonnes", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json", "x-dashboard-token": token },
                                body: JSON.stringify({ email: a.email }),
                              });
                              if (res.ok) {
                                const r2 = await fetch("/api/dashboard/stats", { headers: { "x-dashboard-token": token } });
                                if (r2.ok) { const d = await r2.json(); setStats(d); }
                              }
                            }} className="text-red-400 hover:text-red-300 font-bold transition">
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PARAMÈTRES ── */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-xl">
            <h2 className="text-lg font-bold">Paramètres</h2>

            {/* Changer le mot de passe */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-1">Changer le mot de passe</h3>
              <p className="text-gray-500 text-xs mb-5">Le nouveau mot de passe prend effet immédiatement.</p>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Mot de passe actuel</label>
                  <input type="password" value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Nouveau mot de passe</label>
                  <input type="password" value={pwNew} onChange={e => setPwNew(e.target.value)} required minLength={6}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Confirmer le nouveau mot de passe</label>
                  <input type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} required
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500" />
                </div>
                {pwMsg && (
                  <div className={`text-sm px-4 py-3 rounded-lg ${pwMsg.type === "ok" ? "bg-green-600/20 text-green-400 border border-green-600/30" : "bg-red-600/20 text-red-400 border border-red-600/30"}`}>
                    {pwMsg.text}
                  </div>
                )}
                <button type="submit" disabled={pwLoading}
                  className="bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60 text-sm">
                  {pwLoading ? "Enregistrement…" : "Changer le mot de passe"}
                </button>
              </form>
            </div>

            {/* Réinitialisation d'urgence */}
            <div className="bg-gray-900 border border-yellow-600/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-yellow-500 text-xl">⚠</span>
                <div>
                  <h3 className="text-sm font-bold text-yellow-400 mb-2">Réinitialisation d&apos;urgence (mot de passe perdu)</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3">
                    Si tu as perdu ton mot de passe et ne peux plus te connecter, connecte-toi au VPS via SSH et exécute ces commandes :
                  </p>
                  <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 select-all">
                    <p>ssh root@187.127.11.239</p>
                    <p>cd /var/www/leconomie-front</p>
                    <p>{`echo '{"password":"NOUVEAU_MOT_DE_PASSE"}' > data/dashboard-config.json`}</p>
                    <p>pm2 restart leconomie-front</p>
                  </div>
                  <p className="text-gray-600 text-xs mt-3">
                    Remplace <span className="text-gray-400">NOUVEAU_MOT_DE_PASSE</span> par le mot de passe souhaité. Aucun redéploiement nécessaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Info session */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Session</h3>
              <p className="text-gray-500 text-xs">La session est stockée dans <code className="text-gray-300">sessionStorage</code> — elle se termine automatiquement à la fermeture de l&apos;onglet.</p>
              <button onClick={handleLogout} className="mt-4 text-red-400 hover:text-red-300 text-sm font-semibold transition">
                Se déconnecter maintenant →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
