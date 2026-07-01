"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { JournalWP, MagazineWP } from "@/lib/types";
import { PLAN_LABELS, PLAN_RIGHTS, daysUntilExpiry } from "@/lib/subscription";
import type { Plan } from "@/lib/subscription";

interface Props {
  user: { name: string; email: string; roles: string[]; plan?: string; ref?: string; expiresAt?: number };
  journaux: JournalWP[];
  magazines: MagazineWP[];
}

const NAV = [
  {
    id: "journaux",
    label: "Mes journaux",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
  },
  {
    id: "magazines",
    label: "Mes magazines",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    id: "abonnement",
    label: "Mon abonnement",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: "profil",
    label: "Mon profil",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function MonCompteClient({ user, journaux, magazines }: Props) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/deconnexion", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isAdmin = user.roles.includes("administrator");
  const plan = (user.plan || "gratuit") as Plan;
  const planLabel = PLAN_LABELS[plan] || plan;
  const rights = PLAN_RIGHTS[plan];
  const daysLeft = daysUntilExpiry(user.expiresAt);
  const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header compte */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-10 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm text-gray-400">Bonjour,</p>
              <h1 className="text-xl font-bold">{user.name || "Abonné"}</h1>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <a
                href="https://leconomie.info/wp-admin"
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition"
              >
                WP Admin
              </a>
            )}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-[220px_1fr] gap-8">

        {/* Sidebar navigation */}
        <aside className="space-y-1">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm transition"
            >
              <span className="text-gray-400">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </aside>

        {/* Contenu principal */}
        <main className="space-y-8">

          {/* Mes journaux */}
          <section id="journaux">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 inline-block rounded" />
              Mes journaux
            </h2>
            {!rights?.journal ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">Accès réservé aux abonnés</p>
                <p className="text-xs text-gray-500 mb-4">Abonnez-vous pour accéder à toutes les éditions du journal.</p>
                <Link href="/abonnement" className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
                  Voir les abonnements →
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {journaux.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    Aucun journal disponible pour le moment.
                  </div>
                ) : journaux.map((j, i) => (
                  <div key={j.id} className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== 0 ? "border-t border-gray-50" : ""} hover:bg-gray-50 transition`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 rounded-lg p-2.5">
                        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-600">{j.numero}</span>
                        <p className="text-sm font-medium text-gray-900 leading-snug">{j.title}</p>
                        <p className="text-xs text-gray-400">{j.datePublication}</p>
                      </div>
                    </div>
                    <Link
                      href={`/lecture/${j.databaseId}`}
                      className="shrink-0 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Lire
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mes magazines */}
          <section id="magazines">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 inline-block rounded" />
              Mes magazines
            </h2>
            {!rights?.magazine ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-1">Accès réservé aux abonnés</p>
                <p className="text-xs text-gray-500 mb-4">Abonnez-vous pour accéder à toutes les éditions du magazine.</p>
                <Link href="/abonnement" className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
                  Voir les abonnements →
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {magazines.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    Aucun magazine disponible pour le moment.
                  </div>
                ) : magazines.map((m, i) => (
                  <div key={m.id} className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== 0 ? "border-t border-gray-50" : ""} hover:bg-gray-50 transition`}>
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 rounded-lg p-2.5">
                        <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-600">{m.numero}</span>
                        <p className="text-sm font-medium text-gray-900 leading-snug">{m.title}</p>
                        <p className="text-xs text-gray-400">{m.datePublication}</p>
                      </div>
                    </div>
                    <Link
                      href={`/lecture/${m.databaseId}`}
                      className="shrink-0 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      Lire
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Mon abonnement */}
          <section id="abonnement">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 inline-block rounded" />
              Mon abonnement
            </h2>

            {/* Alerte expiration proche */}
            {isExpiringSoon && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                <svg width="18" height="18" fill="none" stroke="#ea580c" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div>
                  <p className="text-sm font-bold text-orange-700">Abonnement expirant dans {daysLeft} jour{daysLeft! > 1 ? "s" : ""}</p>
                  <p className="text-xs text-orange-600 mt-0.5">Renouvelez maintenant pour ne pas perdre votre accès.</p>
                </div>
              </div>
            )}

            {/* Alerte expiré */}
            {isExpired && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <div>
                  <p className="text-sm font-bold text-red-700">Votre abonnement a expiré</p>
                  <p className="text-xs text-red-600 mt-0.5">Renouvelez pour retrouver l&apos;accès au journal et aux magazines.</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
              {/* Statut + plan */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Statut</p>
                    {plan === "gratuit" || isExpired ? (
                      <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        Compte gratuit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Abonné actif
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Plan</p>
                    <p className="text-sm font-bold text-gray-900">{planLabel}</p>
                  </div>
                  {user.expiresAt && user.expiresAt > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Échéance</p>
                      <p className={`text-sm font-semibold ${isExpiringSoon ? "text-orange-600" : isExpired ? "text-red-600" : "text-gray-700"}`}>
                        {new Date(user.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        {daysLeft !== null && daysLeft > 0 && (
                          <span className="text-xs text-gray-400 font-normal ml-1">({daysLeft}j restants)</span>
                        )}
                      </p>
                    </div>
                  )}
                  {user.ref && <p className="text-xs text-gray-400">Réf : {user.ref}</p>}
                </div>

                <Link href={`/abonnement?upgrade=${encodeURIComponent(user.email)}`}
                  className="shrink-0 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  {isExpired || plan === "gratuit" ? "S'abonner" : "Renouveler / Upgrader"}
                </Link>
              </div>

              {/* Droits d'accès */}
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Vos accès inclus</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Articles premium", ok: rights?.premium },
                    { label: "Journal PDF", ok: rights?.journal },
                    { label: "Magazine PDF", ok: rights?.magazine },
                  ].map(({ label, ok }) => (
                    <div key={label} className={`rounded-lg p-3 text-center border ${ok ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
                      <div className={`text-lg mb-1 ${ok ? "text-green-600" : "text-gray-300"}`}>
                        {ok ? "✓" : "✕"}
                      </div>
                      <p className={`text-[11px] font-medium ${ok ? "text-green-700" : "text-gray-400"}`}>{label}</p>
                    </div>
                  ))}
                </div>
                {plan === "mensuel" && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Passez à l&apos;annuel pour économiser 30% →{" "}
                    <Link href="/abonnement" className="text-red-600 font-semibold hover:underline">50 000 FCFA/an</Link>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Mon profil */}
          <section id="profil">
            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-600 inline-block rounded" />
              Mon profil
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Nom</p>
                  <p className="text-sm font-medium text-gray-900">{user.name || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <a
                  href="https://leconomie.info/wp-login.php?action=lostpassword"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-red-600 hover:underline"
                >
                  Changer mon mot de passe →
                </a>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
