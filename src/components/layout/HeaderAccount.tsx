"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeaderUserMenu from "./HeaderUserMenu";

type User = { name: string; email: string };

// Boutons « Se connecter / S'abonner » ou menu du compte, décidés dans le navigateur (voir /api/me)
export default function HeaderAccount() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  // Pendant le chargement : espace réservé de même taille, pour éviter que l'en-tête ne saute
  if (user === undefined) return <div className="h-9 w-[250px]" aria-hidden="true" />;

  if (user) return <HeaderUserMenu name={user.name} email={user.email} />;

  return (
    <>
      <Link href="/connexion"
        className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Se connecter
      </Link>
      <Link href="/abonnement"
        className="bg-red-600 text-white px-5 py-2 rounded text-sm font-bold hover:bg-red-700 transition flex items-center gap-2">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        S&apos;abonner
      </Link>
    </>
  );
}
