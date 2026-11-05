"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { JournalWP, MagazineWP } from "@/lib/types";
import { PLAN_LABELS, PLAN_RIGHTS, daysUntilExpiry, isPast } from "@/lib/subscription";
import type { Plan } from "@/lib/subscription";
import type { Achat } from "@/lib/abonnes";

interface Props {
  user: { name: string; email: string; roles: string[]; plan?: string; ref?: string; expiresAt?: number };
  journaux: JournalWP[];
  magazines: MagazineWP[];
  achats: Achat[];
}

type SectionId = "achats" | "journaux" | "magazines" | "abonnement" | "profil";

const NAV: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  {
    id: "achats",
    label: "Mes achats",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.77l1.59-10.23H6"/>
      </svg>
    ),
  },
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
    label: "Mes informations",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const LINKS = [
  {
    href: "/espace-vip",
    label: "Contenu premium",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
  },
  {
    href: "/mes-favoris",
    label: "Mes favoris",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
    ),
  },
  {
    href: "/contact",
    label: "Aide",
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 2-3 4"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

const SECTION_TITLES: Record<SectionId, string> = {
  achats: "Mes achats",
  journaux: "Mes journaux",
  magazines: "Mes magazines",
  abonnement: "Mon abonnement",
  profil: "Mes informations",
};

export default function MonCompteClient({ user, journaux, magazines, achats }: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionId>("achats");

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
  const isPremium = plan !== "gratuit" && !isExpired;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-[260px_1fr] gap-6">

        {/* ── Colonne gauche : profil + navigation ── */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Carte profil */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
              {user.name?.[0]?.toUpperCase() || "A"}
            </div>
            <h1 className="text-sm font-bold text-gray-900 leading-snug">{user.name || "Abonné"}</h1>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{user.email}</p>
            <div className="mt-3">
              {isPremium ? (
                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-[11px] font-bold px-3 py-1 rounded-full">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  Abonné {planLabel.split(" —")[0]}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full">
                  Compte gratuit
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
            {NAV.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    active ? "bg-red-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className={active ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}

            <div className="my-2 border-t border-gray-100" />

            {LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-gray-100" />

            {isAdmin && (
              <a
                href="https://leconomie.info/wp-admin"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                WP Admin
              </a>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Se déconnecter
            </button>
          </nav>
        </aside>

        {/* ── Colonne droite : contenu ── */}
        <main className="space-y-6 min-w-0">

          {/* Bandeau abonnement — visible sur la section "achats", équivalent de l'espace premium */}
          {activeSection === "achats" && (
            <div className="bg-gradient-to-r from-gray-900 to-red-700 rounded-2xl p-6 text-white flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-bold">
                    {isPremium ? `Espace Abonné ${planLabel.split(" —")[0]}` : "Espace Abonné"}
                  </h2>
                  <p className="text-xs text-white/70 mt-0.5">
                    {isPremium ? "Accédez à votre journal, vos magazines et vos achats, en un seul endroit." : "Abonnez-vous pour débloquer le journal et les magazines en illimité."}
                  </p>
                </div>
              </div>
              {isPremium ? (
                <div className="bg-white/10 rounded-xl px-4 py-2.5 text-right shrink-0">
                  <p className="text-xs font-bold">Merci de votre confiance !</p>
                  <p className="text-[11px] text-white/70">
                    {daysLeft !== null && daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}` : "Accès actif"}
                  </p>
                </div>
              ) : (
                <Link href="/abonnement" className="shrink-0 bg-white text-red-700 text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition">
                  S&apos;abonner →
                </Link>
              )}
            </div>
          )}

          {activeSection !== "achats" && (
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{SECTION_TITLES[activeSection]}</h2>
            </div>
          )}

          {/* ── Mes achats ── */}
          {activeSection === "achats" && (
            <section>
              {achats.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.77l1.59-10.23H6"/>
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">Aucun achat pour le moment</p>
                  <p className="text-xs text-gray-500 mb-4">Achetez un numéro à l&apos;unité pour le retrouver ici.</p>
                  <Link href="/abonnement" className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
                    Voir les offres →
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achats.map((achat) => {
                    const isArticle = achat.type === "article";
                    const isExpiredArticle = isArticle && isPast(achat.expiresAt);
                    const key = isArticle ? `article-${achat.slug}-${achat.ref}` : `${achat.type}-${achat.id}`;
                    const href = isArticle ? `/article/${achat.slug}` : `/lecture/${achat.id}`;
                    return (
                      <div key={key} className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col">
                        <div className="relative bg-red-50 flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            {achat.type}
                          </span>
                          {isArticle && (
                            <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded ${isExpiredArticle ? "bg-gray-500/80 text-white" : "bg-black/60 text-white"}`}>
                              {isExpiredArticle ? "Expiré" : "Actif"}
                            </span>
                          )}
                          {achat.type === "journal" ? (
                            <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          ) : achat.type === "magazine" ? (
                            <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                          ) : (
                            <svg width="32" height="32" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 flex-1">{achat.titre}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Acheté le {new Date(achat.acheteLe).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          {isArticle && !isExpiredArticle && (
                            <p className="text-xs mt-0.5 font-semibold text-orange-600">
                              Expire le {new Date(achat.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                          <div className="mt-3">
                            {isExpiredArticle ? (
                              <span className="block text-center text-xs font-bold text-gray-400 py-2">Accès expiré</span>
                            ) : (
                              <Link
                                href={href}
                                className="flex items-center justify-center gap-1.5 bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition"
                              >
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                                Lire
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ── Mes journaux ── */}
          {activeSection === "journaux" && (
            <section>
              {!rights?.journal ? (
                <AccessRestreint message="Abonnez-vous pour accéder à toutes les éditions du journal." />
              ) : (
                <MonthGroupedList items={journaux} type="journal" />
              )}
            </section>
          )}

          {/* ── Mes magazines ── */}
          {activeSection === "magazines" && (
            <section>
              {!rights?.magazine ? (
                <AccessRestreint message="Abonnez-vous pour accéder à toutes les éditions du magazine." />
              ) : (
                <MonthGroupedList items={magazines} type="magazine" />
              )}
            </section>
          )}

          {/* ── Mon abonnement ── */}
          {activeSection === "abonnement" && (
            <section className="space-y-4">
              {isExpiringSoon && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <svg width="18" height="18" fill="none" stroke="#ea580c" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-orange-700">Abonnement expirant dans {daysLeft} jour{daysLeft! > 1 ? "s" : ""}</p>
                    <p className="text-xs text-orange-600 mt-0.5">Renouvelez maintenant pour ne pas perdre votre accès.</p>
                  </div>
                </div>
              )}

              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <svg width="18" height="18" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-red-700">Votre abonnement a expiré</p>
                    <p className="text-xs text-red-600 mt-0.5">Renouvelez pour retrouver l&apos;accès au journal et aux magazines.</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
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
                  {(plan === "mensuel" || plan === "trimestriel" || plan === "semestriel") && (
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      Passez à l&apos;annuel pour le meilleur tarif →{" "}
                      <Link href="/abonnement" className="text-red-600 font-semibold hover:underline">50 000 FCFA/an</Link>
                    </p>
                  )}
                </div>
              </div>

              {/* Avantages de l'abonnement — repris de l'offre réelle du site */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: "Articles exclusifs", ok: rights?.premium },
                    { label: "Journal & magazine PDF", ok: rights?.journal || rights?.magazine },
                    { label: "Sans publicité", ok: isPremium },
                  ].map(({ label, ok }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ok ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-300"}`}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/>
                        </svg>
                      </div>
                      <span className="text-[11px] font-medium text-gray-500">{label}</span>
                    </div>
                  ))}
                </div>
                <Link href="/abonnement" className="shrink-0 bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
                  {isExpired || plan === "gratuit" ? "Gérer mon abonnement →" : "Gérer mon abonnement →"}
                </Link>
              </div>
            </section>
          )}

          {/* ── Mes informations ── */}
          {activeSection === "profil" && (
            <section>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
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
          )}

        </main>
      </div>
    </div>
  );
}

function AccessRestreint({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg width="22" height="22" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-800 mb-1">Accès réservé aux abonnés</p>
      <p className="text-xs text-gray-500 mb-4">{message}</p>
      <Link href="/abonnement" className="inline-block bg-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-red-700 transition">
        Voir les abonnements →
      </Link>
    </div>
  );
}

// Sous-composant : journaux/magazines regroupés par mois
const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
  const yearMatch = dateStr.match(/(\d{4})/);
  return yearMatch ? `${yearMatch[1]}-00` : "0000-00";
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split("-");
  const m = parseInt(month, 10);
  if (isNaN(m) || m < 0 || m > 11) return year;
  return `${MOIS_FR[m]} ${year}`;
}

// Pluriel irrégulier : un journal → des journaux (pas "journals")
function pluralLabel(type: "journal" | "magazine", count: number): string {
  if (count <= 1) return type;
  return type === "journal" ? "journaux" : "magazines";
}

function MonthGroupedList({ items, type }: { items: (JournalWP | MagazineWP)[]; type: "journal" | "magazine" }) {
  const [openMonth, setOpenMonth] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center text-sm text-gray-500">
        Aucun {type} disponible pour le moment.
      </div>
    );
  }

  const grouped = new Map<string, typeof items>();
  items.forEach((item) => {
    const key = getMonthKey(item.datePublication || "");
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  });
  const sortedKeys = [...grouped.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-3">
      {/* Dossiers par mois */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedKeys.map((key) => {
          const monthItems = grouped.get(key)!;
          const isOpen = openMonth === key;
          return (
            <button
              key={key}
              onClick={() => setOpenMonth(isOpen ? null : key)}
              className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition text-center ${
                isOpen ? "border-red-300 ring-2 ring-red-100" : "border-gray-100"
              }`}
            >
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-800">{getMonthLabel(key)}</p>
              <p className="text-xs text-gray-400">{monthItems.length} {pluralLabel(type, monthItems.length)}</p>
            </button>
          );
        })}
      </div>

      {/* Contenu du mois ouvert */}
      {openMonth && grouped.has(openMonth) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              {getMonthLabel(openMonth)}
            </span>
            <button onClick={() => setOpenMonth(null)} className="text-gray-400 hover:text-red-600 transition">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {grouped.get(openMonth)!.map((item, i) => (
            <div key={item.id} className={`flex items-center justify-between px-5 py-4 gap-4 ${i !== 0 ? "border-t border-gray-50" : ""} hover:bg-gray-50 transition`}>
              <div className="flex items-center gap-4">
                <div className="bg-red-50 rounded-lg p-2.5">
                  {type === "journal" ? (
                    <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-red-600">{(item as JournalWP).numero || ""}</span>
                  <p className="text-sm font-medium text-gray-900 leading-snug">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.datePublication}</p>
                </div>
              </div>
              <Link
                href={`/lecture/${item.databaseId}`}
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
    </div>
  );
}
